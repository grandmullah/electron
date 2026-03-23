import { useState, useCallback } from 'react';
import { useAppSelector } from '../store/hooks';
import { pendingPayoutsService, PendingPayout } from '../services/pendingPayoutsService';
import { payoutService, PayoutValidationRequest } from '../services/payoutService';

export const usePayoutData = () => {
      const { user } = useAppSelector((state) => state.auth);

      const [allPayouts, setAllPayouts] = useState<PendingPayout[]>([]);
      const [pendingPayouts, setPendingPayouts] = useState<PendingPayout[]>([]);
      const [completedPayouts, setCompletedPayouts] = useState<PendingPayout[]>([]);
      const [totalPayouts, setTotalPayouts] = useState<number>(0);
      const [payoutSummary, setPayoutSummary] = useState<{
            total: number;
            pending: { count: number; totalAmount: number };
            completed: { count: number; totalAmount: number };
      }>({
            total: 0,
            pending: { count: 0, totalAmount: 0 },
            completed: { count: 0, totalAmount: 0 },
      });
      const [isLoadingPayouts, setIsLoadingPayouts] = useState(false);
      const [payoutError, setPayoutError] = useState<string | null>(null);
      const [validatingPayouts, setValidatingPayouts] = useState<Set<string>>(new Set());
      const [payoutValidationResults, setPayoutValidationResults] = useState<Map<string, boolean>>(new Map());
      const [isExportingPayouts, setIsExportingPayouts] = useState(false);
      const [completingPayouts, setCompletingPayouts] = useState<Set<string>>(new Set());
      const [pagination, setPagination] = useState({
            limit: 10,
            offset: 0,
            hasMore: false,
      });
      const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('all');

      const loadPendingPayouts = useCallback(async (options?: {
            limit?: number;
            offset?: number;
            status?: 'all' | 'pending' | 'completed';
      }) => {
            if (!user?.id) return;

            setIsLoadingPayouts(true);
            setPayoutError(null);

            try {
                  const limit = options?.limit ?? pagination.limit;
                  const offset = options?.offset ?? pagination.offset;
                  const status = options?.status ?? statusFilter;
                  const response = await pendingPayoutsService.getAllPayoutsPaginated({
                        limit,
                        offset,
                        status,
                  });

                  if (response.success && response.data) {
                        setAllPayouts(response.data.payouts);
                        setPendingPayouts(response.data.pendingPayouts);
                        setCompletedPayouts(response.data.completedPayouts);
                        setTotalPayouts(response.data.summary.total);
                        setPayoutSummary(response.data.summary);
                        setPagination(response.data.pagination);
                        setStatusFilter(status);
                        console.log("✅ All payouts loaded:", {
                              total: response.data.summary.total,
                              pending: response.data.summary.pending,
                              completed: response.data.summary.completed,
                        });
                  } else {
                        setAllPayouts([]);
                        setPendingPayouts([]);
                        setCompletedPayouts([]);
                        setTotalPayouts(0);
                  }
            } catch (error: any) {
                  console.error("❌ Error loading payouts:", error);
                  setPayoutError(error.message || "Failed to load payouts");
                  setAllPayouts([]);
                  setPendingPayouts([]);
                  setCompletedPayouts([]);
                  setTotalPayouts(0);
            } finally {
                  setIsLoadingPayouts(false);
            }
      }, [user?.id, pagination.limit, pagination.offset, statusFilter]);

      const validatePayoutForBet = useCallback(
            async (payout: PendingPayout) => {
                  const payoutId = payout.id;

                  setValidatingPayouts((prev) => new Set(prev).add(payoutId));

                  try {
                        const validationRequest: PayoutValidationRequest = {
                              ticketId: payout.ticketId,
                              betId: payout.betId,
                              userId: payout.userId,
                              amount: payout.amount,
                              currency: payout.currency,
                              paymentMethod: payout.paymentMethod,
                              reference: payout.reference,
                              notes: payout.notes,
                        };

                        console.log("🔄 Validating payout:", payoutId);
                        const validationResult = await payoutService.validatePayout(validationRequest);

                        console.log("✅ Payout validation result:", validationResult);

                        setPayoutValidationResults((prev) => {
                              const newMap = new Map(prev);
                              newMap.set(payoutId, validationResult.data?.isValid || false);
                              return newMap;
                        });

                        return validationResult.data?.isValid || false;
                  } catch (error: any) {
                        console.error("❌ Error validating payout:", error);
                        setPayoutValidationResults((prev) => {
                              const newMap = new Map(prev);
                              newMap.set(payoutId, false);
                              return newMap;
                        });
                        return false;
                  } finally {
                        setValidatingPayouts((prev) => {
                              const newSet = new Set(prev);
                              newSet.delete(payoutId);
                              return newSet;
                        });
                  }
            },
            [user?.id]
      );

      const validateAllPayouts = useCallback(async () => {
            if (pendingPayouts.length === 0) return;

            console.log("🔄 Validating all payouts...");

            for (const payout of pendingPayouts) {
                  await validatePayoutForBet(payout);
            }
      }, [pendingPayouts, validatePayoutForBet]);

      const completePayout = useCallback(
            async (payoutId: string, notes?: string) => {
                  setCompletingPayouts((prev) => new Set(prev).add(payoutId));

                  try {
                        console.log("🔄 Completing payout:", payoutId);
                        const response = await payoutService.completePayout(payoutId, notes);

                        console.log("✅ Payout completed successfully:", response);

                        // Remove the completed payout from the pending list
                        setPendingPayouts((prev) => prev.filter((payout) => payout.id !== payoutId));
                        setCompletedPayouts((prev) => {
                              const moved = pendingPayouts.find((p) => p.id === payoutId);
                              return moved ? [{ ...moved, status: 'completed' }, ...prev] : prev;
                        });
                        setAllPayouts((prev) => prev.map((p) => (p.id === payoutId ? { ...p, status: 'completed' } : p)));
                        setPayoutSummary((prev) => ({
                              total: prev.total,
                              pending: {
                                    count: Math.max(0, prev.pending.count - 1),
                                    totalAmount: Math.max(0, prev.pending.totalAmount - (pendingPayouts.find((p) => p.id === payoutId)?.amount || 0)),
                              },
                              completed: {
                                    count: prev.completed.count + 1,
                                    totalAmount: prev.completed.totalAmount + (pendingPayouts.find((p) => p.id === payoutId)?.amount || 0),
                              },
                        }));

                        return response;
                  } catch (error: any) {
                        console.error("❌ Error completing payout:", error);
                        throw error;
                  } finally {
                        setCompletingPayouts((prev) => {
                              const newSet = new Set(prev);
                              newSet.delete(payoutId);
                              return newSet;
                        });
                  }
            },
            [pendingPayouts]
      );

      const exportPayoutsToExcel = useCallback(async () => {
            if (pendingPayouts.length === 0) {
                  alert("No payouts to export");
                  return;
            }

            setIsExportingPayouts(true);
            try {
                  // Prepare data for Excel export
                  const exportData = pendingPayouts.map((payout, index) => ({
                        "S/N": index + 1,
                        "Payout ID": payout.id,
                        "Ticket ID": payout.ticketId,
                        "Bet ID": payout.betId,
                        "User ID": payout.userId,
                        "Amount": payout.amount,
                        "Currency": payout.currency,
                        "Payment Method": payout.paymentMethod,
                        "Reference": payout.reference,
                        "Status": payout.status,
                        "Notes": payout.notes,
                        "Created At": new Date(payout.createdAt).toLocaleDateString(),
                        "Updated At": new Date(payout.updatedAt).toLocaleDateString(),
                  }));

                  // Create CSV content
                  const headers = Object.keys(exportData[0] as Record<string, any>);
                  const csvContent = [
                        headers.join(","),
                        ...exportData.map((row) =>
                              headers
                                    .map((header) => {
                                          const value = (row as Record<string, any>)[header];
                                          // Escape commas and quotes in values
                                          if (
                                                typeof value === "string" &&
                                                (value.includes(",") || value.includes('"'))
                                          ) {
                                                return `"${value.replace(/"/g, '""')}"`;
                                          }
                                          return value;
                                    })
                                    .join(",")
                        ),
                  ].join("\n");

                  // Create and download file
                  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
                  const link = document.createElement("a");
                  const url = URL.createObjectURL(blob);
                  link.setAttribute("href", url);
                  link.setAttribute(
                        "download",
                        `pending_payouts_${new Date().toISOString().split("T")[0]}.csv`
                  );
                  link.style.visibility = "hidden";
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);

                  console.log("✅ Payouts exported successfully");
            } catch (error: any) {
                  console.error("❌ Error exporting payouts:", error);
                  alert(`Failed to export payouts: ${error.message}`);
            } finally {
                  setIsExportingPayouts(false);
            }
      }, [pendingPayouts]);

      return {
            allPayouts,
            pendingPayouts,
            completedPayouts,
            totalPayouts,
            payoutSummary,
            isLoadingPayouts,
            payoutError,
            validatingPayouts,
            payoutValidationResults,
            isExportingPayouts,
            completingPayouts,
            loadPendingPayouts,
            validatePayoutForBet,
            validateAllPayouts,
            completePayout,
            exportPayoutsToExcel,
            pagination,
            statusFilter,
            setStatusFilter,
      };
};

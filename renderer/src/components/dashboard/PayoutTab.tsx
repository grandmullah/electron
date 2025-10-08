import React from "react";
import { LoadingState } from "./shared/LoadingState";
import { ErrorState } from "./shared/ErrorState";
import { EmptyState } from "./shared/EmptyState";
import { CompletePayoutModal } from "./shared/CompletePayoutModal";
import { PendingPayout } from "../../services/pendingPayoutsService";
import {
  Paper,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
} from "@mui/material";
import {
  AttachMoney as MoneyIcon,
  FileDownload as ExportIcon,
  CheckCircle as CheckIcon,
  Visibility as ViewIcon,
  Print as PrintIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from "@mui/icons-material";

interface PayoutTabProps {
  allPayouts: PendingPayout[];
  pendingPayouts: PendingPayout[];
  completedPayouts: PendingPayout[];
  totalPayouts: number;
  payoutSummary: {
    total: number;
    pending: { count: number; totalAmount: number };
    completed: { count: number; totalAmount: number };
  };
  isLoadingPayouts: boolean;
  payoutError: string | null;
  validatingPayouts: Set<string>;
  payoutValidationResults: Map<string, boolean>;
  isExportingPayouts: boolean;
  completingPayouts: Set<string>;
  onLoadPendingPayouts: () => void;
  onValidatePayoutForBet: (payout: PendingPayout) => void;
  onCompletePayout: (payoutId: string, notes?: string) => Promise<any>;
  onExportPayoutsToExcel: () => void;
  onNavigate: (
    page: "home" | "dashboard" | "settings" | "games" | "agent" | "history"
  ) => void;
}

export const PayoutTab: React.FC<PayoutTabProps> = ({
  allPayouts,
  pendingPayouts,
  completedPayouts,
  totalPayouts,
  payoutSummary: payoutCounts,
  isLoadingPayouts,
  payoutError,
  validatingPayouts,
  payoutValidationResults,
  isExportingPayouts,
  completingPayouts,
  onLoadPendingPayouts,
  onValidatePayoutForBet,
  onCompletePayout,
  onExportPayoutsToExcel,
  onNavigate,
}) => {
  // Modal state
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedPayout, setSelectedPayout] =
    React.useState<PendingPayout | null>(null);

  // Filter state
  const [statusFilter, setStatusFilter] = React.useState<
    "all" | "pending" | "completed"
  >("all");

  // Get filtered payouts based on status
  const getFilteredPayouts = () => {
    switch (statusFilter) {
      case "pending":
        return pendingPayouts;
      case "completed":
        return completedPayouts;
      default:
        return allPayouts;
    }
  };

  const filteredPayouts = getFilteredPayouts();

  // Pagination state
  const [currentPage, setCurrentPage] = React.useState(1);
  const [itemsPerPage, setItemsPerPage] = React.useState(10);

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPayouts = filteredPayouts.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredPayouts.length / itemsPerPage);

  // Pagination handlers
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  // Reset to page 1 when payouts or filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filteredPayouts.length, statusFilter]);

  // Handle complete payout
  const handleCompletePayout = (payout: PendingPayout) => {
    setSelectedPayout(payout);
    setIsModalOpen(true);
  };

  // Handle modal confirmation
  const handleModalConfirm = async (notes: string) => {
    if (!selectedPayout) return;

    try {
      await onCompletePayout(selectedPayout.id, notes);
      setIsModalOpen(false);
      setSelectedPayout(null);
    } catch (error: any) {
      console.error("Failed to complete payout:", error);
      // Error handling is done in the hook
    }
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedPayout(null);
  };
  if (isLoadingPayouts) {
    return <LoadingState message="Loading pending payouts..." />;
  }

  if (payoutError) {
    return (
      <ErrorState
        title="Error Loading Payouts"
        message={payoutError}
        onRetry={onLoadPendingPayouts}
      />
    );
  }

  if (totalPayouts === 0) {
    return (
      <EmptyState
        icon="💰"
        title="No Payouts Available"
        message="No pending payouts are currently available."
      />
    );
  }

  const totalPayoutAmount = pendingPayouts.reduce(
    (sum, payout) => sum + payout.amount,
    0
  );

  return (
    <Box>
      {/* Status Filter Tabs */}
      <Paper
        sx={{
          p: 2,
          mb: 2,
          background:
            "linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: "12px",
        }}
      >
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          justifyContent="space-between"
          flexWrap="wrap"
        >
          <Stack direction="row" spacing={1}>
            <Button
              variant={statusFilter === "all" ? "contained" : "outlined"}
              onClick={() => setStatusFilter("all")}
              sx={{
                borderRadius: "8px",
                textTransform: "none",
                fontWeight: 600,
                ...(statusFilter === "all"
                  ? {
                      background:
                        "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
                      color: "white",
                      border: "1px solid rgba(25, 118, 210, 0.3)",
                      boxShadow: "0 2px 8px rgba(25, 118, 210, 0.4)",
                    }
                  : {
                      color: "rgba(255, 255, 255, 0.7)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      "&:hover": {
                        bgcolor: "rgba(255, 255, 255, 0.1)",
                        borderColor: "rgba(255, 255, 255, 0.3)",
                      },
                    }),
              }}
            >
              All ({allPayouts.length})
            </Button>
            <Button
              variant={statusFilter === "pending" ? "contained" : "outlined"}
              onClick={() => setStatusFilter("pending")}
              sx={{
                borderRadius: "8px",
                textTransform: "none",
                fontWeight: 600,
                ...(statusFilter === "pending"
                  ? {
                      background:
                        "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                      color: "white",
                      border: "1px solid rgba(245, 158, 11, 0.3)",
                      boxShadow: "0 2px 8px rgba(245, 158, 11, 0.4)",
                    }
                  : {
                      color: "rgba(255, 255, 255, 0.7)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      "&:hover": {
                        bgcolor: "rgba(255, 255, 255, 0.1)",
                        borderColor: "rgba(255, 255, 255, 0.3)",
                      },
                    }),
              }}
            >
              Pending ({pendingPayouts.length})
            </Button>
            <Button
              variant={statusFilter === "completed" ? "contained" : "outlined"}
              onClick={() => setStatusFilter("completed")}
              sx={{
                borderRadius: "8px",
                textTransform: "none",
                fontWeight: 600,
                ...(statusFilter === "completed"
                  ? {
                      background:
                        "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                      color: "white",
                      border: "1px solid rgba(16, 185, 129, 0.3)",
                      boxShadow: "0 2px 8px rgba(16, 185, 129, 0.4)",
                    }
                  : {
                      color: "rgba(255, 255, 255, 0.7)",
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      "&:hover": {
                        bgcolor: "rgba(255, 255, 255, 0.1)",
                        borderColor: "rgba(255, 255, 255, 0.3)",
                      },
                    }),
              }}
            >
              Completed ({completedPayouts.length})
            </Button>
          </Stack>
          <Chip
            label={`Showing: ${currentPayouts.length} of ${filteredPayouts.length} payouts`}
            sx={{
              bgcolor: "rgba(25, 118, 210, 0.1)",
              color: "#42a5f5",
              border: "1px solid rgba(25, 118, 210, 0.2)",
              fontWeight: 600,
            }}
          />
        </Stack>
      </Paper>

      {/* Payouts Table */}
      <Paper
        sx={{
          borderRadius: 4,
          overflow: "hidden",
          background: "rgba(255, 255, 255, 0.05)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow:
            "0 12px 40px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
          position: "relative",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "1px",
            background:
              "linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.2) 50%, transparent 100%)",
          },
        }}
      >
        <TableContainer>
          <Table
            sx={{
              tableLayout: "fixed",
              width: "100%",
              "& .MuiTableCell-root": {
                color: "rgba(255,255,255,0.8)",
                borderColor: "rgba(255,255,255,0.1)",
                padding: "12px 16px",
              },
            }}
          >
            <TableHead>
              <TableRow
                sx={{
                  background:
                    "linear-gradient(135deg, rgba(25, 118, 210, 0.15) 0%, rgba(66, 165, 245, 0.08) 100%)",
                  borderBottom: "2px solid rgba(25, 118, 210, 0.3)",
                }}
              >
                <TableCell
                  width="12%"
                  sx={{
                    color: "#42a5f5",
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                  }}
                >
                  ID
                </TableCell>
                <TableCell
                  width="10%"
                  sx={{
                    color: "#42a5f5",
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                  }}
                >
                  Ticket
                </TableCell>
                <TableCell
                  width="12%"
                  sx={{
                    color: "#42a5f5",
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                  }}
                >
                  Bet ID
                </TableCell>
                <TableCell
                  width="12%"
                  sx={{
                    color: "#42a5f5",
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                  }}
                >
                  Amount
                </TableCell>
                <TableCell
                  width="12%"
                  sx={{
                    color: "#42a5f5",
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                  }}
                >
                  Payment
                </TableCell>
                <TableCell
                  width="10%"
                  sx={{
                    color: "#42a5f5",
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                  }}
                >
                  Ref
                </TableCell>
                <TableCell
                  width="10%"
                  sx={{
                    color: "#42a5f5",
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                  }}
                >
                  Status
                </TableCell>
                <TableCell
                  width="10%"
                  sx={{
                    color: "#42a5f5",
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                  }}
                >
                  Date
                </TableCell>
                <TableCell
                  width="12%"
                  sx={{
                    color: "#42a5f5",
                    fontWeight: 700,
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                  }}
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentPayouts.map((payout) => {
                const payoutId = payout.id;
                const isValidating = validatingPayouts.has(payoutId);
                const validationResult = payoutValidationResults.get(payoutId);

                return (
                  <TableRow
                    key={payoutId}
                    sx={{
                      backgroundColor: "rgba(255,255,255,0.02)",
                      transition: "background-color 0.2s ease",
                      "&:hover": {
                        backgroundColor: "rgba(25, 118, 210, 0.1)",
                      },
                      "&:nth-of-type(even)": {
                        backgroundColor: "rgba(255,255,255,0.04)",
                      },
                    }}
                  >
                    <TableCell
                      sx={{
                        color: "rgba(255,255,255,0.9)",
                        fontSize: "0.85rem",
                      }}
                    >
                      {payoutId.substring(0, 10)}
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "rgba(255,255,255,0.9)",
                        fontSize: "0.85rem",
                      }}
                    >
                      {payout.ticketId}
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "rgba(255,255,255,0.9)",
                        fontSize: "0.85rem",
                      }}
                    >
                      {payout.betId.substring(0, 10)}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`${payout.currency} ${payout.amount.toFixed(2)}`}
                        size="small"
                        sx={{
                          background:
                            "linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.1) 100%)",
                          color: "#4ade80",
                          fontWeight: 700,
                          fontSize: "0.85rem",
                          border: "1px solid rgba(16, 185, 129, 0.3)",
                        }}
                      />
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "rgba(255,255,255,0.9)",
                        fontSize: "0.85rem",
                      }}
                    >
                      {payout.paymentMethod}
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "rgba(255,255,255,0.9)",
                        fontSize: "0.85rem",
                      }}
                    >
                      {payout.reference}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={payout.status}
                        size="small"
                        sx={{
                          background:
                            payout.status === "pending"
                              ? "rgba(255, 152, 0, 0.2)"
                              : payout.status === "completed"
                                ? "rgba(76, 175, 80, 0.2)"
                                : payout.status === "cancelled"
                                  ? "rgba(158, 158, 158, 0.2)"
                                  : "rgba(244, 67, 54, 0.2)",
                          backdropFilter: "blur(10px)",
                          color:
                            payout.status === "pending"
                              ? "#ff9800"
                              : payout.status === "completed"
                                ? "#4caf50"
                                : payout.status === "cancelled"
                                  ? "#9e9e9e"
                                  : "#f44336",
                          border:
                            payout.status === "pending"
                              ? "1px solid rgba(255, 152, 0, 0.3)"
                              : payout.status === "completed"
                                ? "1px solid rgba(76, 175, 80, 0.3)"
                                : payout.status === "cancelled"
                                  ? "1px solid rgba(158, 158, 158, 0.3)"
                                  : "1px solid rgba(244, 67, 54, 0.3)",
                          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                          fontWeight: 500,
                        }}
                        icon={
                          payout.status === "pending" ? (
                            <span>⏳</span>
                          ) : payout.status === "completed" ? (
                            <span>✅</span>
                          ) : payout.status === "cancelled" ? (
                            <span>❌</span>
                          ) : (
                            <span>⚠️</span>
                          )
                        }
                      />
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "rgba(255,255,255,0.9)",
                        fontSize: "0.85rem",
                      }}
                    >
                      {new Date(payout.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Box display="flex" gap={1}>
                        {isValidating ? (
                          <Button
                            size="small"
                            variant="outlined"
                            disabled
                            startIcon={<CircularProgress size={16} />}
                            sx={{
                              color: "rgba(255,255,255,0.6)",
                              border: "1px solid rgba(255, 255, 255, 0.2)",
                              background: "rgba(255, 255, 255, 0.05)",
                            }}
                          >
                            Validating...
                          </Button>
                        ) : validationResult === true ? (
                          <>
                            <Button
                              size="small"
                              variant="contained"
                              onClick={() => handleCompletePayout(payout)}
                              disabled={completingPayouts.has(payoutId)}
                              startIcon={
                                completingPayouts.has(payoutId) ? (
                                  <CircularProgress size={16} />
                                ) : (
                                  <CheckIcon />
                                )
                              }
                              sx={{
                                background:
                                  "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                                backdropFilter: "blur(10px)",
                                border: "1px solid rgba(16, 185, 129, 0.3)",
                                color: "white",
                                fontWeight: 600,
                                boxShadow: "0 2px 8px rgba(16, 185, 129, 0.3)",
                                "&:hover": {
                                  background:
                                    "linear-gradient(135deg, #059669 0%, #047857 100%)",
                                  transform: "translateY(-2px)",
                                  boxShadow:
                                    "0 4px 12px rgba(16, 185, 129, 0.5)",
                                },
                                transition: "all 0.3s ease",
                              }}
                            >
                              {completingPayouts.has(payoutId)
                                ? "Completing..."
                                : "Complete"}
                            </Button>
                            <Tooltip title="View in History">
                              <IconButton
                                size="small"
                                onClick={() => onNavigate("history")}
                                sx={{
                                  color: "#42a5f5",
                                  border: "1px solid rgba(25, 118, 210, 0.2)",
                                  bgcolor: "rgba(25, 118, 210, 0.05)",
                                  transition: "all 0.3s ease",
                                  "&:hover": {
                                    bgcolor: "rgba(25, 118, 210, 0.15)",
                                    borderColor: "rgba(25, 118, 210, 0.4)",
                                    transform: "scale(1.1)",
                                  },
                                }}
                              >
                                <ViewIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </>
                        ) : validationResult === false ? (
                          <Button
                            size="small"
                            variant="outlined"
                            disabled
                            sx={{
                              color: "rgba(244, 67, 54, 0.6)",
                              border: "1px solid rgba(244, 67, 54, 0.2)",
                              background: "rgba(244, 67, 54, 0.05)",
                            }}
                          >
                            Cannot Process
                          </Button>
                        ) : (
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => onValidatePayoutForBet(payout)}
                            sx={{
                              background:
                                "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                              color: "white",
                              fontWeight: 600,
                              border: "1px solid rgba(245, 158, 11, 0.3)",
                              boxShadow: "0 2px 8px rgba(245, 158, 11, 0.3)",
                              transition: "all 0.3s ease",
                              "&:hover": {
                                background:
                                  "linear-gradient(135deg, #d97706 0%, #b45309 100%)",
                                transform: "translateY(-2px)",
                                boxShadow: "0 4px 12px rgba(245, 158, 11, 0.5)",
                              },
                            }}
                          >
                            Validate
                          </Button>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Pagination */}
      {pendingPayouts.length > 0 && (
        <Paper
          sx={{
            p: 3,
            mt: 3,
            background:
              "linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "16px",
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.3)",
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            flexWrap="wrap"
            gap={2}
          >
            {/* Items per page selector */}
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel
                sx={{
                  color: "rgba(255,255,255,0.7)",
                  "&.Mui-focused": {
                    color: "#42a5f5",
                  },
                }}
              >
                Items per page
              </InputLabel>
              <Select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                label="Items per page"
                sx={{
                  color: "white",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(255, 255, 255, 0.2)",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(25, 118, 210, 0.5)",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#42a5f5",
                  },
                  "& .MuiSvgIcon-root": {
                    color: "rgba(255, 255, 255, 0.7)",
                  },
                }}
              >
                <MenuItem value={5}>5 per page</MenuItem>
                <MenuItem value={10}>10 per page</MenuItem>
                <MenuItem value={25}>25 per page</MenuItem>
                <MenuItem value={50}>50 per page</MenuItem>
              </Select>
            </FormControl>

            {/* Page info */}
            <Chip
              label={`Showing ${indexOfFirstItem + 1}-${Math.min(indexOfLastItem, pendingPayouts.length)} of ${pendingPayouts.length}`}
              sx={{
                bgcolor: "rgba(25, 118, 210, 0.1)",
                color: "#42a5f5",
                border: "1px solid rgba(25, 118, 210, 0.2)",
                fontWeight: 600,
              }}
            />

            {/* Pagination controls */}
            <Stack direction="row" alignItems="center" spacing={2}>
              <IconButton
                onClick={goToPrevPage}
                disabled={currentPage === 1}
                size="small"
                sx={{
                  color:
                    currentPage === 1 ? "rgba(255,255,255,0.3)" : "#42a5f5",
                  border: "1px solid",
                  borderColor:
                    currentPage === 1
                      ? "rgba(255,255,255,0.1)"
                      : "rgba(25, 118, 210, 0.2)",
                  "&:hover": {
                    bgcolor: "rgba(25, 118, 210, 0.1)",
                    borderColor: "rgba(25, 118, 210, 0.4)",
                  },
                }}
              >
                <ChevronLeftIcon />
              </IconButton>

              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={(event, page) => goToPage(page)}
                color="primary"
                size="small"
                showFirstButton
                showLastButton
                siblingCount={1}
                boundaryCount={1}
                sx={{
                  "& .MuiPaginationItem-root": {
                    color: "rgba(255,255,255,0.8)",
                    borderColor: "rgba(255,255,255,0.2)",
                    "&:hover": {
                      backgroundColor: "rgba(25, 118, 210, 0.1)",
                      borderColor: "rgba(25, 118, 210, 0.3)",
                    },
                    "&.Mui-selected": {
                      background:
                        "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
                      color: "white",
                      fontWeight: 600,
                      border: "1px solid rgba(25, 118, 210, 0.3)",
                      "&:hover": {
                        background:
                          "linear-gradient(135deg, #1565c0 0%, #1976d2 100%)",
                      },
                    },
                  },
                }}
              />

              <IconButton
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                size="small"
                sx={{
                  color:
                    currentPage === totalPages
                      ? "rgba(255,255,255,0.3)"
                      : "#42a5f5",
                  border: "1px solid",
                  borderColor:
                    currentPage === totalPages
                      ? "rgba(255,255,255,0.1)"
                      : "rgba(25, 118, 210, 0.2)",
                  "&:hover": {
                    bgcolor: "rgba(25, 118, 210, 0.1)",
                    borderColor: "rgba(25, 118, 210, 0.4)",
                  },
                }}
              >
                <ChevronRightIcon />
              </IconButton>
            </Stack>
          </Stack>

          {/* Additional page info */}
          <Box mt={2} textAlign="center">
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)" }}>
              Page {currentPage} of {totalPages}
            </Typography>
          </Box>
        </Paper>
      )}

      {/* Complete Payout Modal */}
      {selectedPayout && (
        <CompletePayoutModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onConfirm={handleModalConfirm}
          payoutId={selectedPayout.id}
          ticketId={selectedPayout.ticketId}
          amount={selectedPayout.amount}
          currency={selectedPayout.currency}
          isCompleting={completingPayouts.has(selectedPayout.id)}
        />
      )}
    </Box>
  );
};

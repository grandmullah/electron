import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  Stack,
  Paper,
  Divider,
  Alert,
  CircularProgress,
  Chip,
} from "@mui/material";
import {
  AttachMoney as MoneyIcon,
  CheckCircle as CheckIcon,
  Close as CloseIcon,
  Warning as WarningIcon,
  Assessment as AssessmentIcon,
} from "@mui/icons-material";
import { DisplayBet } from "../../types/history";
import { payoutService } from "../../services/payoutService";

interface PayoutModalProps {
  open: boolean;
  onClose: () => void;
  bet: DisplayBet | null;
  onPayoutComplete: () => void;
  onNavigateToDashboard?: () => void;
}

export const PayoutModal: React.FC<PayoutModalProps> = ({
  open,
  onClose,
  bet,
  onPayoutComplete,
  onNavigateToDashboard,
}) => {
  const [notes, setNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    if (!isProcessing) {
      setNotes("");
      setError(null);
      onClose();
    }
  };

  const handleCompletePayout = async () => {
    if (!bet) return;

    setIsProcessing(true);
    setError(null);

    try {
      // Use the payoutId from payment status if available, otherwise use bet ID
      const payoutId = bet.paymentStatus?.payoutId || bet.id;
      const response = await payoutService.completePayout(payoutId, notes);

      if (response.success) {
        onPayoutComplete();
        handleClose();
      } else {
        setError(response.message || "Failed to complete payout");
      }
    } catch (err: any) {
      console.error("Error completing payout:", err);
      setError(err.message || "Failed to complete payout");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!bet) return null;

  // Calculate the actual payout amount - prioritize actual winnings, then net winnings, then potential winnings
  const totalWinnings =
    bet.actualWinnings || bet.netWinnings || bet.potentialWinnings;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          background: "rgba(255, 255, 255, 0.05)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow:
            "0 20px 60px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
          position: "relative",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "1px",
            background:
              "linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%)",
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          background: "rgba(76, 175, 80, 0.2)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(76, 175, 80, 0.3)",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          py: 2,
          position: "relative",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "1px",
            background:
              "linear-gradient(90deg, transparent 0%, rgba(76, 175, 80, 0.5) 50%, transparent 100%)",
          },
        }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <MoneyIcon sx={{ fontSize: 28 }} />
          <Box>
            <Typography variant="h6" fontWeight="bold">
              Complete Payout
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Process winning bet payout
            </Typography>
          </Box>
        </Box>
        <Button
          onClick={handleClose}
          disabled={isProcessing}
          sx={{
            color: "white",
            minWidth: "auto",
            p: 1,
            "&:hover": {
              bgcolor: "rgba(255,255,255,0.1)",
            },
          }}
        >
          <CloseIcon />
        </Button>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {/* Bet Information */}
        <Paper
          sx={{
            p: 3,
            m: 3,
            background: "rgba(76, 175, 80, 0.08)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(76, 175, 80, 0.2)",
            borderRadius: 3,
            boxShadow:
              "0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(76, 175, 80, 0.1)",
            color: "white",
          }}
        >
          <Typography
            variant="h6"
            fontWeight="bold"
            sx={{ color: "rgba(76, 175, 80, 0.9)" }}
            gutterBottom
          >
            Bet Details
          </Typography>
          <Stack spacing={2}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography
                variant="body2"
                sx={{ color: "rgba(255,255,255,0.7)" }}
              >
                Bet ID:
              </Typography>
              <Typography
                variant="body2"
                fontWeight="bold"
                fontFamily="monospace"
                sx={{ color: "rgba(255,255,255,0.9)" }}
              >
                {bet.id}
              </Typography>
            </Box>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography
                variant="body2"
                sx={{ color: "rgba(255,255,255,0.7)" }}
              >
                Bet Type:
              </Typography>
              <Chip
                label={bet.betType}
                size="small"
                variant="outlined"
                sx={{
                  background:
                    bet.betType === "single"
                      ? "rgba(102, 126, 234, 0.2)"
                      : "rgba(156, 39, 176, 0.2)",
                  backdropFilter: "blur(10px)",
                  color: bet.betType === "single" ? "#667eea" : "#9c27b0",
                  border:
                    bet.betType === "single"
                      ? "1px solid rgba(102, 126, 234, 0.3)"
                      : "1px solid rgba(156, 39, 176, 0.3)",
                }}
              />
            </Box>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography
                variant="body2"
                sx={{ color: "rgba(255,255,255,0.7)" }}
              >
                Total Stake:
              </Typography>
              <Typography
                variant="body2"
                fontWeight="bold"
                sx={{ color: "rgba(255,255,255,0.9)" }}
              >
                ${bet.totalStake.toFixed(2)}
              </Typography>
            </Box>
            {bet.betType === "multibet" && bet.selections.length > 1 && (
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(255,255,255,0.7)" }}
                >
                  Combined Odds:
                </Typography>
                <Typography
                  variant="body2"
                  fontWeight="bold"
                  sx={{ color: "#667eea" }}
                >
                  {bet.combinedOdds?.toFixed(2) || "N/A"}x
                </Typography>
              </Box>
            )}
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography
                variant="body2"
                sx={{ color: "rgba(255,255,255,0.7)" }}
              >
                Gross Winnings:
              </Typography>
              <Typography
                variant="body2"
                fontWeight="bold"
                sx={{ color: "#2196f3" }}
              >
                ${bet.potentialWinnings.toFixed(2)}
              </Typography>
            </Box>
            {bet.taxAmount && bet.taxAmount > 0 && (
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(255,255,255,0.7)" }}
                >
                  Tax ({bet.taxPercentage || 0}%):
                </Typography>
                <Typography
                  variant="body2"
                  fontWeight="bold"
                  sx={{ color: "#ff9800" }}
                >
                  -${bet.taxAmount.toFixed(2)}
                </Typography>
              </Box>
            )}
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              sx={{
                borderTop: "1px solid rgba(0,0,0,0.1)",
                pt: 1,
                mt: 1,
              }}
            >
              <Typography
                variant="body2"
                fontWeight="bold"
                sx={{ color: "rgba(255,255,255,0.9)" }}
              >
                Net Winnings:
              </Typography>
              <Typography
                variant="body2"
                fontWeight="bold"
                sx={{ color: "#4caf50", fontSize: "1.1rem" }}
              >
                $
                {(
                  bet.netWinnings ||
                  bet.actualWinnings ||
                  bet.potentialWinnings
                ).toFixed(2)}
              </Typography>
            </Box>
            {bet.paymentStatus?.payoutId && (
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography
                  variant="body2"
                  sx={{ color: "rgba(255,255,255,0.7)" }}
                >
                  Payout ID:
                </Typography>
                <Typography
                  variant="body2"
                  fontWeight="bold"
                  fontFamily="monospace"
                  sx={{ color: "#667eea" }}
                >
                  {bet.paymentStatus.payoutId}
                </Typography>
              </Box>
            )}
          </Stack>
        </Paper>

        {/* Financial Breakdown */}
        <Paper
          sx={{
            p: 3,
            m: 3,
            background: "rgba(255, 152, 0, 0.08)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 152, 0, 0.2)",
            borderRadius: 3,
            boxShadow:
              "0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 152, 0, 0.1)",
            color: "white",
          }}
        >
          <Typography
            variant="h6"
            fontWeight="bold"
            sx={{ color: "rgba(255, 152, 0, 0.9)" }}
            gutterBottom
          >
            Financial Breakdown
          </Typography>
          <Stack spacing={1.5}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="body2" color="text.secondary">
                Gross Winnings:
              </Typography>
              <Typography variant="body2" fontWeight="bold" color="info.main">
                ${bet.potentialWinnings.toFixed(2)}
              </Typography>
            </Box>
            {bet.taxAmount && bet.taxAmount > 0 ? (
              <>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="body2" color="text.secondary">
                    Tax ({bet.taxPercentage || 0}%):
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight="bold"
                    color="warning.main"
                  >
                    -${bet.taxAmount.toFixed(2)}
                  </Typography>
                </Box>
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{
                    borderTop: "1px solid rgba(0,0,0,0.1)",
                    pt: 1,
                    mt: 1,
                  }}
                >
                  <Typography
                    variant="body2"
                    fontWeight="bold"
                    color="text.primary"
                  >
                    Net Winnings:
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight="bold"
                    color="success.main"
                    sx={{ fontSize: "1.1rem" }}
                  >
                    $
                    {(
                      bet.netWinnings ||
                      bet.actualWinnings ||
                      bet.potentialWinnings
                    ).toFixed(2)}
                  </Typography>
                </Box>
              </>
            ) : (
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                sx={{
                  borderTop: "1px solid rgba(0,0,0,0.1)",
                  pt: 1,
                  mt: 1,
                }}
              >
                <Typography
                  variant="body2"
                  fontWeight="bold"
                  color="text.primary"
                >
                  Net Winnings (No Tax):
                </Typography>
                <Typography
                  variant="body2"
                  fontWeight="bold"
                  color="success.main"
                  sx={{ fontSize: "1.1rem" }}
                >
                  ${bet.potentialWinnings.toFixed(2)}
                </Typography>
              </Box>
            )}
          </Stack>
        </Paper>

        {/* Payout Amount */}
        <Paper
          sx={{
            p: 3,
            m: 3,
            background: "rgba(76, 175, 80, 0.1)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(76, 175, 80, 0.3)",
            borderRadius: 3,
            boxShadow:
              "0 8px 32px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(76, 175, 80, 0.1)",
            color: "white",
          }}
        >
          <Typography
            variant="h6"
            fontWeight="bold"
            sx={{ color: "rgba(76, 175, 80, 0.9)" }}
            gutterBottom
          >
            Payout Amount
          </Typography>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            py={2}
          >
            <Typography
              variant="h3"
              fontWeight="bold"
              sx={{
                color: "#4caf50",
                textShadow: "0 2px 4px rgba(0,0,0,0.3)",
              }}
            >
              ${totalWinnings.toFixed(2)}
            </Typography>
          </Box>
          <Box textAlign="center">
            <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)" }}>
              {bet.netWinnings
                ? "Net Winnings (after tax)"
                : bet.actualWinnings
                  ? "Actual Winnings"
                  : "Gross Winnings"}
            </Typography>
            {bet.taxAmount && bet.taxAmount > 0 && (
              <Typography
                variant="caption"
                sx={{ color: "#ff9800" }}
                display="block"
              >
                Tax of ${bet.taxAmount.toFixed(2)} deducted from gross
              </Typography>
            )}
          </Box>
        </Paper>

        {/* Notes Section */}
        <Box sx={{ p: 3 }}>
          <Typography
            variant="h6"
            fontWeight="bold"
            sx={{ color: "rgba(255,255,255,0.9)" }}
            gutterBottom
          >
            Payout Notes (Optional)
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any notes about this payout..."
            disabled={isProcessing}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                background: "rgba(255, 255, 255, 0.05)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "rgba(255,255,255,0.9)",
                "& fieldset": {
                  border: "none",
                },
                "&:hover fieldset": {
                  border: "none",
                },
                "&.Mui-focused fieldset": {
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                },
              },
              "& .MuiInputBase-input": {
                color: "rgba(255,255,255,0.9)",
                "&::placeholder": {
                  color: "rgba(255,255,255,0.5)",
                  opacity: 1,
                },
              },
            }}
          />
        </Box>

        {/* Error Display */}
        {error && (
          <Box sx={{ p: 3, pt: 0 }}>
            <Alert
              severity="error"
              icon={<WarningIcon />}
              sx={{
                borderRadius: 2,
              }}
            >
              {error}
            </Alert>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, gap: 2 }}>
        <Button
          onClick={handleClose}
          disabled={isProcessing}
          variant="outlined"
          startIcon={<CloseIcon />}
          sx={{
            color: "rgba(255,255,255,0.8)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            background: "rgba(255, 255, 255, 0.05)",
            backdropFilter: "blur(10px)",
            "&:hover": {
              backgroundColor: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
            },
          }}
        >
          Cancel
        </Button>
        {onNavigateToDashboard && (
          <Button
            onClick={onNavigateToDashboard}
            disabled={isProcessing}
            variant="outlined"
            startIcon={<AssessmentIcon />}
            sx={{
              color: "rgba(33, 150, 243, 0.9)",
              border: "1px solid rgba(33, 150, 243, 0.3)",
              background: "rgba(33, 150, 243, 0.05)",
              backdropFilter: "blur(10px)",
              "&:hover": {
                backgroundColor: "rgba(33, 150, 243, 0.1)",
                border: "1px solid rgba(33, 150, 243, 0.5)",
                transform: "translateY(-1px)",
                boxShadow: "0 4px 12px rgba(33, 150, 243, 0.3)",
              },
              minWidth: 140,
              transition: "all 0.3s ease",
            }}
          >
            Go to Dashboard
          </Button>
        )}
        <Button
          onClick={handleCompletePayout}
          disabled={isProcessing}
          variant="contained"
          startIcon={
            isProcessing ? <CircularProgress size={20} /> : <CheckIcon />
          }
          sx={{
            background: "rgba(76, 175, 80, 0.8)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(76, 175, 80, 0.3)",
            color: "white",
            "&:hover": {
              backgroundColor: "rgba(76, 175, 80, 0.9)",
              transform: "translateY(-1px)",
              boxShadow: "0 4px 12px rgba(76, 175, 80, 0.4)",
            },
            minWidth: 140,
            transition: "all 0.3s ease",
          }}
        >
          {isProcessing ? "Processing..." : "Complete Payout"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

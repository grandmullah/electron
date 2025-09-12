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
} from "@mui/icons-material";
import { DisplayBet } from "../../types/history";
import { payoutService } from "../../services/payoutService";

interface PayoutModalProps {
  open: boolean;
  onClose: () => void;
  bet: DisplayBet | null;
  onPayoutComplete: () => void;
}

export const PayoutModal: React.FC<PayoutModalProps> = ({
  open,
  onClose,
  bet,
  onPayoutComplete,
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
          borderRadius: 3,
          background: "linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
        },
      }}
    >
      <DialogTitle
        sx={{
          background: "linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          py: 2,
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
            background: "linear-gradient(135deg, #E8F5E8 0%, #F1F8E9 100%)",
            border: "1px solid #C8E6C9",
          }}
        >
          <Typography
            variant="h6"
            fontWeight="bold"
            color="success.main"
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
              <Typography variant="body2" color="text.secondary">
                Bet ID:
              </Typography>
              <Typography
                variant="body2"
                fontWeight="bold"
                fontFamily="monospace"
              >
                {bet.id}
              </Typography>
            </Box>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="body2" color="text.secondary">
                Bet Type:
              </Typography>
              <Chip
                label={bet.betType}
                color={bet.betType === "single" ? "primary" : "secondary"}
                size="small"
                variant="outlined"
              />
            </Box>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="body2" color="text.secondary">
                Total Stake:
              </Typography>
              <Typography variant="body2" fontWeight="bold">
                ${bet.totalStake.toFixed(2)}
              </Typography>
            </Box>
            {bet.betType === "multibet" && bet.selections.length > 1 && (
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="body2" color="text.secondary">
                  Combined Odds:
                </Typography>
                <Typography
                  variant="body2"
                  fontWeight="bold"
                  color="primary.main"
                >
                  {bet.selections
                    .reduce((acc, selection) => acc * selection.odds, 1)
                    .toFixed(2)}
                  x
                </Typography>
              </Box>
            )}
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
            {bet.taxAmount && bet.taxAmount > 0 && (
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
            {bet.paymentStatus?.payoutId && (
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="body2" color="text.secondary">
                  Payout ID:
                </Typography>
                <Typography
                  variant="body2"
                  fontWeight="bold"
                  fontFamily="monospace"
                  color="primary.main"
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
            background: "linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%)",
            border: "1px solid #FFB74D",
          }}
        >
          <Typography
            variant="h6"
            fontWeight="bold"
            color="warning.main"
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
            background: "linear-gradient(135deg, #E8F5E8 0%, #C8E6C9 100%)",
            border: "1px solid #4CAF50",
          }}
        >
          <Typography
            variant="h6"
            fontWeight="bold"
            color="success.main"
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
              color="success.main"
              sx={{
                textShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              ${totalWinnings.toFixed(2)}
            </Typography>
          </Box>
          <Box textAlign="center">
            <Typography variant="body2" color="text.secondary">
              {bet.netWinnings
                ? "Net Winnings (after tax)"
                : bet.actualWinnings
                  ? "Actual Winnings"
                  : "Gross Winnings"}
            </Typography>
            {bet.taxAmount && bet.taxAmount > 0 && (
              <Typography
                variant="caption"
                color="warning.main"
                display="block"
              >
                Tax of ${bet.taxAmount.toFixed(2)} deducted from gross
              </Typography>
            )}
          </Box>
        </Paper>

        {/* Notes Section */}
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
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
          color="inherit"
          startIcon={<CloseIcon />}
        >
          Cancel
        </Button>
        <Button
          onClick={handleCompletePayout}
          disabled={isProcessing}
          variant="contained"
          color="success"
          startIcon={
            isProcessing ? <CircularProgress size={20} /> : <CheckIcon />
          }
          sx={{
            background: "linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)",
            "&:hover": {
              background: "linear-gradient(135deg, #45a049 0%, #2e7d32 100%)",
            },
            minWidth: 140,
          }}
        >
          {isProcessing ? "Processing..." : "Complete Payout"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

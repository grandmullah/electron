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
      // For now, we'll use the bet ID as the payout ID
      // In a real implementation, you might need to create a payout first
      const response = await payoutService.completePayout(bet.id, notes);

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

  const totalWinnings = bet.actualWinnings || bet.potentialWinnings;

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
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="body2" color="text.secondary">
                Potential Winnings:
              </Typography>
              <Typography
                variant="body2"
                fontWeight="bold"
                color="success.main"
              >
                ${bet.potentialWinnings.toFixed(2)}
              </Typography>
            </Box>
            {bet.actualWinnings && bet.actualWinnings > 0 && (
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="body2" color="text.secondary">
                  Actual Winnings:
                </Typography>
                <Typography
                  variant="body2"
                  fontWeight="bold"
                  color="success.main"
                >
                  ${bet.actualWinnings.toFixed(2)}
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
            background: "linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)",
            border: "1px solid #90CAF9",
          }}
        >
          <Typography
            variant="h6"
            fontWeight="bold"
            color="primary.main"
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
              color="primary.main"
              sx={{
                textShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              ${totalWinnings.toFixed(2)}
            </Typography>
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

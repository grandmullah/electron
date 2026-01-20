import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  CircularProgress,
  Alert,
  InputAdornment,
  Stack,
} from "@mui/material";
import {
  AccountBalanceWallet as WalletIcon,
  AttachMoney as MoneyIcon,
} from "@mui/icons-material";
import AgentService from "../services/agentService";
import { useAppSelector } from "../store/hooks";
import { ManagedAgent } from "../store/agentSlice";

interface MintBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (agentId: string, newBalance: number) => void;
  agent: ManagedAgent | null;
}

export const MintBalanceModal: React.FC<MintBalanceModalProps> = ({
  isOpen,
  onClose,
  agent,
  onSuccess,
}) => {
  const { user } = useAppSelector((state) => state.auth);
  const [amount, setAmount] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!agent) return;

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError("Please enter a valid amount greater than 0");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await AgentService.mintBalanceToAgent(agent.id, {
        amount: amountNum,
        notes: notes || undefined,
      });

      if (result.success) {
        onSuccess(agent.id, result.data.newBalance);
        handleClose();
      } else {
        setError("Failed to mint balance");
      }
    } catch (err: any) {
      console.error("Mint balance error:", err);
      setError(err.message || "Failed to mint balance");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setAmount("");
    setNotes("");
    setError(null);
    onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          background:
            "linear-gradient(135deg, rgba(30, 30, 30, 0.98) 0%, rgba(20, 20, 20, 0.98) 100%)",
          border: "1px solid rgba(76, 175, 80, 0.3)",
        },
      }}
    >
      <DialogTitle
        sx={{
          color: "white",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <WalletIcon color="success" />
          <Typography variant="h6">Mint Balance to Agent</Typography>
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ mt: 2 }}>
          <Stack spacing={3}>
            {error && (
              <Alert severity="error" onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            {agent && (
              <Box
                sx={{
                  p: 2,
                  background: "rgba(76, 175, 80, 0.1)",
                  borderRadius: 1,
                  border: "1px solid rgba(76, 175, 80, 0.3)",
                }}
              >
                <Typography variant="caption" color="rgba(255,255,255,0.7)">
                  Agent:
                </Typography>
                <Typography variant="h6" color="white" fontWeight="bold">
                  {agent.phone_number}
                </Typography>
                <Typography variant="caption" color="rgba(255,255,255,0.7)">
                  Current Balance: {user?.currency} {agent.balance.toFixed(2)}
                </Typography>
              </Box>
            )}

            <TextField
              label="Amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              fullWidth
              autoFocus
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <MoneyIcon sx={{ color: "rgba(255,255,255,0.7)" }} />
                  </InputAdornment>
                ),
                sx: {
                  color: "white",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(255,255,255,0.3)",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(255,255,255,0.5)",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#4caf50",
                  },
                },
              }}
              InputLabelProps={{
                sx: { color: "rgba(255,255,255,0.7)" },
              }}
              inputProps={{
                min: 0,
                step: "0.01",
              }}
            />

            <TextField
              label="Notes (Optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              fullWidth
              multiline
              rows={3}
              placeholder="Add a note about this transaction..."
              InputProps={{
                sx: {
                  color: "white",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(255,255,255,0.3)",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(255,255,255,0.5)",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#4caf50",
                  },
                },
              }}
              InputLabelProps={{
                sx: { color: "rgba(255,255,255,0.7)" },
              }}
            />
          </Stack>
        </DialogContent>

        <DialogActions
          sx={{
            borderTop: "1px solid rgba(255,255,255,0.1)",
            p: 2,
          }}
        >
          <Button
            onClick={handleClose}
            disabled={isLoading}
            sx={{ color: "rgba(255,255,255,0.7)" }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading || !amount}
            startIcon={
              isLoading ? <CircularProgress size={20} /> : <WalletIcon />
            }
            sx={{
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
              },
              "&:disabled": {
                background: "rgba(255,255,255,0.1)",
              },
            }}
          >
            {isLoading ? "Minting..." : "Mint Balance"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};


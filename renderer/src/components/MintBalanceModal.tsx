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
          bgcolor: "background.paper",
          border: 1,
          borderColor: "divider",
        },
      }}
    >
      <DialogTitle
        sx={{
          color: "text.primary",
          borderBottom: 1,
          borderColor: "divider",
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
                  bgcolor: "action.hover",
                  borderRadius: 1,
                  border: 1,
                  borderColor: "divider",
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  Agent:
                </Typography>
                <Typography variant="h6" color="text.primary" fontWeight="bold">
                  {agent.phone_number}
                </Typography>
                <Typography variant="caption" color="text.secondary">
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
                    <MoneyIcon sx={{ color: "text.secondary" }} />
                  </InputAdornment>
                ),
                sx: {
                  color: "text.primary",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "divider",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "text.primary",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "success.main",
                  },
                },
              }}
              InputLabelProps={{
                sx: { color: "text.secondary" },
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
                  color: "text.primary",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "divider",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "text.primary",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "success.main",
                  },
                },
              }}
              InputLabelProps={{
                sx: { color: "text.secondary" },
              }}
            />
          </Stack>
        </DialogContent>

        <DialogActions
          sx={{
            borderTop: 1,
            borderColor: "divider",
            p: 2,
          }}
        >
          <Button
            onClick={handleClose}
            disabled={isLoading}
            sx={{ color: "text.secondary" }}
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
            color="success"
          >
            {isLoading ? "Minting..." : "Mint Balance"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};


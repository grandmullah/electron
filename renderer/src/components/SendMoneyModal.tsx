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
  Send as SendIcon,
  Phone as PhoneIcon,
  AttachMoney as MoneyIcon,
} from "@mui/icons-material";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import AgentService from "../services/agentService";
import { useAppSelector } from "../store/hooks";

interface SendMoneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newBalance: number) => void;
}

export const SendMoneyModal: React.FC<SendMoneyModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAppSelector((state) => state.auth);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const minAmount = 1;
  const maxAmount = user?.balance || 1000000;
  const currency = user?.currency || "SSP";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Validation
    if (!phoneNumber || phoneNumber.length < 7) {
      setError("Please enter a valid phone number");
      return;
    }

    const amountNum = Number(amount);
    if (!amountNum || amountNum <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (amountNum < minAmount) {
      setError(`Minimum amount is ${currency} ${minAmount}`);
      return;
    }

    if (amountNum > maxAmount) {
      setError(
        `Amount exceeds your balance of ${currency} ${maxAmount.toFixed(2)}`
      );
      return;
    }

    try {
      setIsSending(true);

      // PhoneInput already includes country code with + prefix
      const formattedPhone = phoneNumber.startsWith("+")
        ? phoneNumber
        : `+${phoneNumber}`;

      const response = await AgentService.sendMoneyToUser(
        formattedPhone,
        amountNum,
        description || undefined
      );

      if (response.success) {
        setSuccess(true);
        onSuccess(response.transaction.agentBalance);

        // Reset form after a short delay
        setTimeout(() => {
          setPhoneNumber("");
          setAmount("");
          setDescription("");
          setSuccess(false);
          onClose();
        }, 2000);
      } else {
        throw new Error(response.message || "Transfer failed");
      }
    } catch (err: any) {
      console.error("Send money error:", err);
      setError(err.message || "Failed to send money. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = () => {
    if (!isSending) {
      setPhoneNumber("");
      setAmount("");
      setDescription("");
      setError("");
      setSuccess(false);
      onClose();
    }
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
            "linear-gradient(135deg, rgba(26, 26, 46, 0.95) 0%, rgba(22, 33, 62, 0.95) 100%)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(25, 118, 210, 0.2)",
          borderRadius: "16px",
          boxShadow:
            "0 20px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(25, 118, 210, 0.1)",
        },
      }}
    >
      <DialogTitle
        sx={{
          background:
            "linear-gradient(135deg, rgba(25, 118, 210, 0.2) 0%, rgba(66, 165, 245, 0.15) 100%)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(25, 118, 210, 0.3)",
          borderBottom: "2px solid rgba(25, 118, 210, 0.4)",
          color: "white",
          borderRadius: "16px 16px 0 0",
        }}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <SendIcon sx={{ fontSize: 28 }} />
          <Typography variant="h5" fontWeight="bold">
            Send Money
          </Typography>
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ p: 3 }}>
          <Stack spacing={3}>
            {error && <Alert severity="error">{error}</Alert>}
            {success && (
              <Alert severity="success">Money sent successfully! 🎉</Alert>
            )}

            <Box>
              <Typography
                variant="body2"
                sx={{ color: "rgba(255,255,255,0.7)", mb: 1 }}
              >
                Your Balance: {currency} {user?.balance.toFixed(2) || "0.00"}
              </Typography>
            </Box>

            <Box>
              <Typography
                variant="body2"
                sx={{
                  color: "rgba(255,255,255,0.7)",
                  mb: 1.5,
                  fontSize: "0.875rem",
                  fontWeight: 500,
                }}
              >
                Recipient Phone Number
              </Typography>
              <Box
                sx={{
                  position: "relative",
                  "& .PhoneInput": {
                    display: "flex",
                    alignItems: "stretch",
                    gap: 0,
                    borderRadius: "8px",
                    border: "1px solid rgba(255,255,255,0.2)",
                    backgroundColor: "rgba(255,255,255,0.05)",
                    overflow: "hidden",
                    transition: "all 0.2s",
                    "&:hover": {
                      borderColor: "rgba(25, 118, 210, 0.5)",
                    },
                    "&:focus-within": {
                      borderColor: "#42a5f5",
                      boxShadow: "0 0 0 2px rgba(66, 165, 245, 0.2)",
                    },
                  },
                  "& .PhoneInputCountry": {
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "0 8px",
                    backgroundColor: "rgba(255,255,255,0.08)",
                    borderRight: "1px solid rgba(255,255,255,0.15)",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    minWidth: "65px",
                    flexShrink: 0,
                    position: "relative",
                    "&:hover": {
                      backgroundColor: "rgba(255,255,255,0.12)",
                    },
                  },
                  "& .PhoneInputCountryIcon": {
                    width: "22px",
                    height: "16px",
                    borderRadius: "2px",
                    objectFit: "cover",
                    flexShrink: 0,
                    pointerEvents: "none",
                  },
                  "& .PhoneInputCountrySelect": {
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    opacity: 0,
                    cursor: "pointer",
                    zIndex: 2,
                  },
                  "& .PhoneInputCountrySelectArrow": {
                    display: "none",
                  },
                  "& .PhoneInputInput": {
                    flex: 1,
                    padding: "14px 16px",
                    border: "none",
                    backgroundColor: "transparent",
                    color: "rgba(255,255,255,0.9)",
                    fontSize: "1rem",
                    fontFamily: "inherit",
                    outline: "none",
                    "&::placeholder": {
                      color: "rgba(255,255,255,0.4)",
                    },
                    "&:disabled": {
                      opacity: 0.5,
                      cursor: "not-allowed",
                    },
                  },
                }}
              >
                <PhoneInput
                  international
                  defaultCountry="SS"
                  value={phoneNumber}
                  onChange={(value) => setPhoneNumber(value || "")}
                  disabled={isSending}
                  placeholder="Enter phone number"
                />
              </Box>
            </Box>

            <TextField
              fullWidth
              label="Amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              disabled={isSending}
              inputProps={{
                min: minAmount,
                max: maxAmount,
                step: "0.01",
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <MoneyIcon sx={{ color: "rgba(255,255,255,0.6)" }} />
                    <Typography
                      sx={{ color: "rgba(255,255,255,0.7)", ml: 0.5 }}
                    >
                      {currency}
                    </Typography>
                  </InputAdornment>
                ),
              }}
              helperText={`Min: ${currency} ${minAmount} | Max: ${currency} ${maxAmount.toFixed(2)}`}
              sx={{
                "& .MuiInputLabel-root": {
                  color: "rgba(255,255,255,0.7)",
                },
                "& .MuiOutlinedInput-root": {
                  color: "rgba(255,255,255,0.9)",
                  "& fieldset": {
                    borderColor: "rgba(255,255,255,0.2)",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(25, 118, 210, 0.5)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#42a5f5",
                  },
                },
                "& .MuiFormHelperText-root": {
                  color: "rgba(255,255,255,0.6)",
                },
              }}
            />

            <TextField
              fullWidth
              label="Description (Optional)"
              placeholder="e.g., Top-up for betting"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSending}
              multiline
              rows={2}
              sx={{
                "& .MuiInputLabel-root": {
                  color: "rgba(255,255,255,0.7)",
                },
                "& .MuiOutlinedInput-root": {
                  color: "rgba(255,255,255,0.9)",
                  "& fieldset": {
                    borderColor: "rgba(255,255,255,0.2)",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(25, 118, 210, 0.5)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#42a5f5",
                  },
                },
              }}
            />
          </Stack>
        </DialogContent>

        <DialogActions
          sx={{
            p: 3,
            background: "rgba(0, 0, 0, 0.2)",
            borderTop: "1px solid rgba(25, 118, 210, 0.2)",
          }}
        >
          <Button
            onClick={handleClose}
            disabled={isSending}
            sx={{
              color: "rgba(255,255,255,0.8)",
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.1)",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSending || success}
            startIcon={
              isSending ? <CircularProgress size={20} /> : <SendIcon />
            }
            sx={{
              background: "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
              color: "white",
              fontWeight: 600,
              boxShadow: "0 4px 12px rgba(25, 118, 210, 0.4)",
              "&:hover": {
                background: "linear-gradient(135deg, #1565c0 0%, #1976d2 100%)",
                boxShadow: "0 6px 16px rgba(25, 118, 210, 0.5)",
              },
              "&:disabled": {
                background: "rgba(255,255,255,0.1)",
                color: "rgba(255,255,255,0.3)",
              },
            }}
          >
            {isSending ? "Sending..." : "Send Money"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

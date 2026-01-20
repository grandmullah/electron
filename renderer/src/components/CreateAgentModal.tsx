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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  PersonAdd as PersonAddIcon,
  Phone as PhoneIcon,
  Lock as LockIcon,
  Public as PublicIcon,
} from "@mui/icons-material";
import AgentService from "../services/agentService";
import { ManagedAgent } from "../store/agentSlice";

interface CreateAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (agent: ManagedAgent) => void;
}

const countryCodes = [
  { code: "+211", name: "South Sudan", flag: "🇸🇸" },
  { code: "+254", name: "Kenya", flag: "🇰🇪" },
  { code: "+256", name: "Uganda", flag: "🇺🇬" },
  { code: "+255", name: "Tanzania", flag: "🇹🇿" },
  { code: "+250", name: "Rwanda", flag: "🇷🇼" },
  { code: "+257", name: "Burundi", flag: "🇧🇮" },
  { code: "+251", name: "Ethiopia", flag: "🇪🇹" },
  { code: "+252", name: "Somalia", flag: "🇸🇴" },
];

export const CreateAgentModal: React.FC<CreateAgentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [countryCode, setCountryCode] = useState<string>("+211");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phoneNumber || !password) {
      setError("Please fill in all required fields");
      return;
    }

    if (phoneNumber.length < 6) {
      setError("Please enter a valid phone number");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const agent = await AgentService.createAgent({
        phone_number: phoneNumber,
        password: password,
        country_code: countryCode,
      });

      onSuccess(agent);
      handleClose();
    } catch (err: any) {
      console.error("Create agent error:", err);
      setError(err.message || "Failed to create agent");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setPhoneNumber("");
    setPassword("");
    setCountryCode("+211");
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
          border: "1px solid rgba(66, 165, 245, 0.3)",
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
          <PersonAddIcon color="primary" />
          <Typography variant="h6">Create New Agent</Typography>
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

            <Alert severity="info">
              Create a new agent account. The agent will be able to log in with
              the phone number and password you provide.
            </Alert>

            <FormControl fullWidth>
              <InputLabel
                sx={{ color: "rgba(255,255,255,0.7)" }}
              >
                Country Code
              </InputLabel>
              <Select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                label="Country Code"
                startAdornment={
                  <InputAdornment position="start">
                    <PublicIcon sx={{ color: "rgba(255,255,255,0.7)" }} />
                  </InputAdornment>
                }
                sx={{
                  color: "white",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(255,255,255,0.3)",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(255,255,255,0.5)",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#42a5f5",
                  },
                }}
              >
                {countryCodes.map((country) => (
                  <MenuItem key={country.code} value={country.code}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <span>{country.flag}</span>
                      <span>{country.code}</span>
                      <span style={{ fontSize: "0.875rem", opacity: 0.7 }}>
                        {country.name}
                      </span>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Phone Number"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
              required
              fullWidth
              placeholder="912345678"
              helperText={`Full number: ${countryCode}${phoneNumber}`}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIcon sx={{ color: "rgba(255,255,255,0.7)" }} />
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
                    borderColor: "#42a5f5",
                  },
                },
              }}
              InputLabelProps={{
                sx: { color: "rgba(255,255,255,0.7)" },
              }}
              FormHelperTextProps={{
                sx: { color: "rgba(255,255,255,0.5)" },
              }}
            />

            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
              placeholder="Min. 6 characters"
              helperText="Agent will use this password to log in"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: "rgba(255,255,255,0.7)" }} />
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
                    borderColor: "#42a5f5",
                  },
                },
              }}
              InputLabelProps={{
                sx: { color: "rgba(255,255,255,0.7)" },
              }}
              FormHelperTextProps={{
                sx: { color: "rgba(255,255,255,0.5)" },
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
            disabled={isLoading || !phoneNumber || !password}
            startIcon={
              isLoading ? <CircularProgress size={20} /> : <PersonAddIcon />
            }
            sx={{
              background: "linear-gradient(135deg, #42a5f5 0%, #1976d2 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #1976d2 0%, #1565c0 100%)",
              },
              "&:disabled": {
                background: "rgba(255,255,255,0.1)",
              },
            }}
          >
            {isLoading ? "Creating..." : "Create Agent"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};


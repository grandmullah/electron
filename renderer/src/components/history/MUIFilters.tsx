import React, { useState, useEffect } from "react";
import {
  Paper,
  Box,
  TextField,
  Select,
  MenuItem,
  Button,
  Stack,
  Grid,
  Chip,
  IconButton,
  Typography,
  FormControl,
  InputLabel,
  InputAdornment,
  Badge,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import {
  Search as IconSearch,
  FilterList as IconFilter,
  CalendarToday as IconCalendar,
  Refresh as IconRefresh,
  Clear as IconX,
  Tune as IconTune,
  TrendingUp as IconTrendingUp,
  SportsEsports as IconSports,
  AttachMoney as IconMoney,
  CheckCircle as IconCheckCircle,
  Pending as IconPending,
  Cancel as IconCancel,
  Error as IconError,
} from "@mui/icons-material";
import dayjs from "dayjs";

interface MUIFiltersProps {
  betStatusFilter: string;
  setBetStatusFilter: (value: string) => void;
  betTypeFilter: string;
  setBetTypeFilter: (value: string) => void;
  paymentStatusFilter: string;
  setPaymentStatusFilter: (value: string) => void;
  dateFrom: Date | null;
  setDateFrom: (date: Date | null) => void;
  dateTo: Date | null;
  setDateTo: (date: Date | null) => void;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  onClearFilters: () => void;
  onApplyFilters: () => void;
  totalBets: number;
  filteredBets: number;
}

const statusOptions = [
  { value: "all", label: "All Status" },
  { value: "pending", label: "Pending" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" },
  { value: "cancelled", label: "Cancelled" },
];

const typeOptions = [
  { value: "all", label: "All Types" },
  { value: "single", label: "Single" },
  { value: "multibet", label: "Multibet" },
];

const paymentStatusOptions = [
  { value: "all", label: "All Payments" },
  { value: "paid", label: "Paid" },
  { value: "pending", label: "Pending" },
  { value: "no_payout", label: "No Payout" },
  { value: "no_payment_needed", label: "No Payment Needed" },
  { value: "failed", label: "Failed" },
  { value: "cancelled", label: "Cancelled" },
];

export const MUIFilters: React.FC<MUIFiltersProps> = ({
  betStatusFilter,
  setBetStatusFilter,
  betTypeFilter,
  setBetTypeFilter,
  paymentStatusFilter,
  setPaymentStatusFilter,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  searchTerm,
  setSearchTerm,
  onClearFilters,
  onApplyFilters,
  totalBets,
  filteredBets,
}) => {
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  useEffect(() => {
    let count = 0;
    if (searchTerm) count++;
    if (betStatusFilter !== "all") count++;
    if (betTypeFilter !== "all") count++;
    if (paymentStatusFilter !== "all") count++;
    if (dateFrom) count++;
    if (dateTo) count++;
    setActiveFiltersCount(count);
  }, [
    searchTerm,
    betStatusFilter,
    betTypeFilter,
    paymentStatusFilter,
    dateFrom,
    dateTo,
  ]);

  const hasActiveFilters = activeFiltersCount > 0;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Paper
        sx={{
          p: 3,
          mb: 3,
          background:
            "linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)",
          boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
          borderRadius: "16px",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(20px)",
        }}
      >
        {/* Enhanced Header */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Box display="flex" alignItems="center" gap={2}>
            <Box
              sx={{
                p: 1.5,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
                color: "white",
                boxShadow: "0 2px 8px rgba(25, 118, 210, 0.4)",
              }}
            >
              <IconFilter />
            </Box>
            <Box>
              <Typography
                variant="h5"
                fontWeight="bold"
                sx={{ color: "rgba(255,255,255,0.9)" }}
              >
                Smart Filters
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "rgba(255,255,255,0.6)" }}
              >
                Find your bets quickly and easily
              </Typography>
            </Box>
            <Badge badgeContent={activeFiltersCount} color="primary">
              <Chip
                label={`${filteredBets} of ${totalBets} bets`}
                color="primary"
                variant="outlined"
                size="small"
                sx={{
                  ml: 2,
                  backgroundColor: "rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.8)",
                  borderColor: "rgba(255,255,255,0.2)",
                }}
              />
            </Badge>
          </Box>
          <Box display="flex" gap={1}>
            <Button
              variant="contained"
              startIcon={<IconRefresh />}
              onClick={onApplyFilters}
              size="small"
              sx={{
                background: "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
                fontWeight: 600,
                boxShadow: "0 4px 12px rgba(25, 118, 210, 0.4)",
                transition: "all 0.3s ease",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #1565c0 0%, #1976d2 100%)",
                  transform: "translateY(-2px)",
                  boxShadow: "0 6px 16px rgba(25, 118, 210, 0.5)",
                },
              }}
            >
              Apply
            </Button>
            {hasActiveFilters && (
              <Button
                variant="outlined"
                startIcon={<IconX />}
                onClick={onClearFilters}
                size="small"
                color="error"
              >
                Clear All
              </Button>
            )}
          </Box>
        </Box>

        {/* Search and Advanced Filters in One Row */}
        <Grid container spacing={2} alignItems="center">
          {/* Search Field */}
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Search by team, selection, or bet ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconSearch sx={{ color: "#667eea" }} />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setSearchTerm("")}
                      edge="end"
                      sx={{ color: "rgba(255,255,255,0.6)" }}
                    >
                      <IconX />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiInputLabel-root": {
                  color: "rgba(255,255,255,0.7)",
                },
                "& .MuiOutlinedInput-root": {
                  color: "rgba(255,255,255,0.8)",
                  borderRadius: 2,
                  "& fieldset": {
                    borderColor: "rgba(255,255,255,0.2)",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(255,255,255,0.4)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#667eea",
                  },
                },
              }}
              placeholder="Type team name or bet ID (UUID)..."
              helperText="Enter bet ID for direct API lookup"
              size="small"
            />
          </Grid>

          {/* Status Filter */}
          <Grid item xs={6} md={1.5}>
            <FormControl
              fullWidth
              size="small"
              sx={{
                "& .MuiInputLabel-root": {
                  color: "rgba(255,255,255,0.7)",
                },
                "& .MuiOutlinedInput-root": {
                  color: "rgba(255,255,255,0.8)",
                  "& fieldset": {
                    borderColor: "rgba(255,255,255,0.2)",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(255,255,255,0.4)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#667eea",
                  },
                },
              }}
            >
              <InputLabel>Status</InputLabel>
              <Select
                value={betStatusFilter}
                onChange={(e) => setBetStatusFilter(e.target.value)}
                label="Status"
                sx={{
                  borderRadius: 2,
                }}
              >
                {statusOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    <Box display="flex" alignItems="center" gap={1}>
                      {option.value === "won" ? (
                        <IconTrendingUp color="success" fontSize="small" />
                      ) : option.value === "lost" ? (
                        <IconX color="error" fontSize="small" />
                      ) : option.value === "pending" ? (
                        <IconRefresh color="warning" fontSize="small" />
                      ) : (
                        <IconSports color="primary" fontSize="small" />
                      )}
                      {option.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Bet Type Filter */}
          <Grid item xs={6} md={1.5}>
            <FormControl
              fullWidth
              size="small"
              sx={{
                "& .MuiInputLabel-root": {
                  color: "rgba(255,255,255,0.7)",
                },
                "& .MuiOutlinedInput-root": {
                  color: "rgba(255,255,255,0.8)",
                  "& fieldset": {
                    borderColor: "rgba(255,255,255,0.2)",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(255,255,255,0.4)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#667eea",
                  },
                },
              }}
            >
              <InputLabel>Type</InputLabel>
              <Select
                value={betTypeFilter}
                onChange={(e) => setBetTypeFilter(e.target.value)}
                label="Type"
                sx={{
                  borderRadius: 2,
                }}
              >
                {typeOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    <Box display="flex" alignItems="center" gap={1}>
                      {option.value === "single" ? (
                        <IconSports color="primary" fontSize="small" />
                      ) : (
                        <IconMoney color="secondary" fontSize="small" />
                      )}
                      {option.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Payment Status Filter */}
          <Grid item xs={6} md={1.5}>
            <FormControl
              fullWidth
              size="small"
              sx={{
                "& .MuiInputLabel-root": {
                  color: "rgba(255,255,255,0.7)",
                },
                "& .MuiOutlinedInput-root": {
                  color: "rgba(255,255,255,0.8)",
                  "& fieldset": {
                    borderColor: "rgba(255,255,255,0.2)",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(255,255,255,0.4)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#667eea",
                  },
                },
              }}
            >
              <InputLabel>Payment</InputLabel>
              <Select
                value={paymentStatusFilter}
                onChange={(e) => setPaymentStatusFilter(e.target.value)}
                label="Payment"
                sx={{
                  borderRadius: 2,
                }}
              >
                {paymentStatusOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    <Box display="flex" alignItems="center" gap={1}>
                      {option.value === "paid" ? (
                        <IconCheckCircle color="success" fontSize="small" />
                      ) : option.value === "pending" ? (
                        <IconPending color="warning" fontSize="small" />
                      ) : option.value === "no_payout" ? (
                        <IconCancel color="action" fontSize="small" />
                      ) : option.value === "no_payment_needed" ? (
                        <IconCancel color="action" fontSize="small" />
                      ) : option.value === "failed" ? (
                        <IconError color="error" fontSize="small" />
                      ) : option.value === "cancelled" ? (
                        <IconCancel color="error" fontSize="small" />
                      ) : (
                        <IconMoney color="primary" fontSize="small" />
                      )}
                      {option.label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* From Date */}
          <Grid item xs={6} md={1.5}>
            <DatePicker
              label="From Date"
              value={dateFrom ? dayjs(dateFrom) : null}
              onChange={(newValue) =>
                setDateFrom(newValue ? newValue.toDate() : null)
              }
              slotProps={{
                textField: {
                  size: "small",
                  fullWidth: true,
                  sx: {
                    borderRadius: 2,
                    "& .MuiInputLabel-root": {
                      color: "rgba(255,255,255,0.7)",
                    },
                    "& .MuiOutlinedInput-root": {
                      color: "rgba(255,255,255,0.8)",
                      "& fieldset": {
                        borderColor: "rgba(255,255,255,0.2)",
                      },
                      "&:hover fieldset": {
                        borderColor: "rgba(255,255,255,0.4)",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#667eea",
                      },
                    },
                  },
                  InputProps: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <IconCalendar sx={{ color: "#667eea" }} />
                      </InputAdornment>
                    ),
                  },
                },
              }}
            />
          </Grid>

          {/* To Date */}
          <Grid item xs={6} md={1.5}>
            <DatePicker
              label="To Date"
              value={dateTo ? dayjs(dateTo) : null}
              onChange={(newValue) =>
                setDateTo(newValue ? newValue.toDate() : null)
              }
              slotProps={{
                textField: {
                  size: "small",
                  fullWidth: true,
                  sx: {
                    borderRadius: 2,
                    "& .MuiInputLabel-root": {
                      color: "rgba(255,255,255,0.7)",
                    },
                    "& .MuiOutlinedInput-root": {
                      color: "rgba(255,255,255,0.8)",
                      "& fieldset": {
                        borderColor: "rgba(255,255,255,0.2)",
                      },
                      "&:hover fieldset": {
                        borderColor: "rgba(255,255,255,0.4)",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "#667eea",
                      },
                    },
                  },
                  InputProps: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <IconCalendar sx={{ color: "#667eea" }} />
                      </InputAdornment>
                    ),
                  },
                },
              }}
            />
          </Grid>
        </Grid>
      </Paper>
    </LocalizationProvider>
  );
};

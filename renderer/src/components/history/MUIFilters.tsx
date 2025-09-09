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
} from "@mui/icons-material";
import dayjs from "dayjs";

interface MUIFiltersProps {
  betStatusFilter: string;
  setBetStatusFilter: (value: string) => void;
  betTypeFilter: string;
  setBetTypeFilter: (value: string) => void;
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

export const MUIFilters: React.FC<MUIFiltersProps> = ({
  betStatusFilter,
  setBetStatusFilter,
  betTypeFilter,
  setBetTypeFilter,
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
    if (dateFrom) count++;
    if (dateTo) count++;
    setActiveFiltersCount(count);
  }, [searchTerm, betStatusFilter, betTypeFilter, dateFrom, dateTo]);

  const hasActiveFilters = activeFiltersCount > 0;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Paper
        sx={{
          p: 3,
          mb: 3,
          background: "linear-gradient(145deg, #0e1220 0%, #1a1d29 100%)",
          boxShadow:
            "0 20px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)",
          borderRadius: "16px",
          border: "1px solid #2a2d3a",
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
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
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
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)",
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
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Search bets (first 3 characters match)..."
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
              placeholder="Type first 3 characters to match..."
              size="small"
            />
          </Grid>

          {/* Status Filter */}
          <Grid item xs={6} md={2}>
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
          <Grid item xs={6} md={2}>
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

          {/* From Date */}
          <Grid item xs={6} md={2}>
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
          <Grid item xs={6} md={2}>
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

        {/* Quick Filter Chips */}
        <Box mt={2}>
          <Typography
            variant="subtitle2"
            sx={{ color: "rgba(255,255,255,0.6)" }}
            gutterBottom
          >
            Quick Filters
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
            {statusOptions.slice(1).map((option) => (
              <Chip
                key={option.value}
                label={option.label}
                clickable
                color={betStatusFilter === option.value ? "primary" : "default"}
                variant={
                  betStatusFilter === option.value ? "filled" : "outlined"
                }
                onClick={() => setBetStatusFilter(option.value)}
                icon={
                  option.value === "won" ? (
                    <IconTrendingUp
                      sx={{
                        color:
                          betStatusFilter === option.value
                            ? "white"
                            : "#4caf50",
                      }}
                    />
                  ) : option.value === "lost" ? (
                    <IconX
                      sx={{
                        color:
                          betStatusFilter === option.value
                            ? "white"
                            : "#f44336",
                      }}
                    />
                  ) : option.value === "pending" ? (
                    <IconRefresh
                      sx={{
                        color:
                          betStatusFilter === option.value
                            ? "white"
                            : "#ff9800",
                      }}
                    />
                  ) : (
                    <IconSports
                      sx={{
                        color:
                          betStatusFilter === option.value
                            ? "white"
                            : "#667eea",
                      }}
                    />
                  )
                }
                size="small"
                sx={{
                  backgroundColor:
                    betStatusFilter === option.value
                      ? "#667eea"
                      : "rgba(255,255,255,0.1)",
                  color:
                    betStatusFilter === option.value
                      ? "white"
                      : "rgba(255,255,255,0.8)",
                  borderColor:
                    betStatusFilter === option.value
                      ? "#667eea"
                      : "rgba(255,255,255,0.2)",
                  "&:hover": {
                    backgroundColor:
                      betStatusFilter === option.value
                        ? "#5a6fd8"
                        : "rgba(255,255,255,0.2)",
                  },
                }}
              />
            ))}
            {typeOptions.slice(1).map((option) => (
              <Chip
                key={option.value}
                label={option.label}
                clickable
                color={betTypeFilter === option.value ? "secondary" : "default"}
                variant={betTypeFilter === option.value ? "filled" : "outlined"}
                onClick={() => setBetTypeFilter(option.value)}
                icon={
                  option.value === "single" ? (
                    <IconSports
                      sx={{
                        color:
                          betTypeFilter === option.value ? "white" : "#667eea",
                      }}
                    />
                  ) : (
                    <IconMoney
                      sx={{
                        color:
                          betTypeFilter === option.value ? "white" : "#9c27b0",
                      }}
                    />
                  )
                }
                size="small"
                sx={{
                  backgroundColor:
                    betTypeFilter === option.value
                      ? "#9c27b0"
                      : "rgba(255,255,255,0.1)",
                  color:
                    betTypeFilter === option.value
                      ? "white"
                      : "rgba(255,255,255,0.8)",
                  borderColor:
                    betTypeFilter === option.value
                      ? "#9c27b0"
                      : "rgba(255,255,255,0.2)",
                  "&:hover": {
                    backgroundColor:
                      betTypeFilter === option.value
                        ? "#8e24aa"
                        : "rgba(255,255,255,0.2)",
                  },
                }}
              />
            ))}
          </Stack>
        </Box>
      </Paper>
    </LocalizationProvider>
  );
};

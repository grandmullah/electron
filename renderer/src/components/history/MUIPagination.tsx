import React from "react";
import {
  Paper,
  Box,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Stack,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  ChevronLeft as IconChevronLeft,
  ChevronRight as IconChevronRight,
  Info as IconInfoCircle,
} from "@mui/icons-material";

interface MUIPaginationProps {
  startIndex: number;
  endIndex: number;
  total: number;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  setItemsPerPage: (value: number) => void;
  goToPrevPage: () => void;
  goToNextPage: () => void;
  goToPage: (page: number) => void;
}

const itemsPerPageOptions = [
  { value: 5, label: "5 per page" },
  { value: 10, label: "10 per page" },
  { value: 25, label: "25 per page" },
  { value: 50, label: "50 per page" },
];

export const MUIPagination: React.FC<MUIPaginationProps> = ({
  startIndex,
  endIndex,
  total,
  currentPage,
  totalPages,
  itemsPerPage,
  setItemsPerPage,
  goToPrevPage,
  goToNextPage,
  goToPage,
}) => {
  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    page: number
  ) => {
    goToPage(page);
  };

  return (
    <Paper
      sx={{
        p: 3,
        mt: 3,
        background: "linear-gradient(145deg, #0e1220 0%, #1a1d29 100%)",
        border: "1px solid #2a2d3a",
        borderRadius: "16px",
        boxShadow:
          "0 20px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)",
      }}
    >
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        flexWrap="wrap"
        gap={2}
      >
        {/* Pagination Info */}
        <Box display="flex" alignItems="center" gap={2}>
          <Chip
            icon={<IconInfoCircle sx={{ color: "rgba(255,255,255,0.8)" }} />}
            label={`Showing ${startIndex + 1}-${endIndex} of ${total} bets`}
            color="primary"
            variant="outlined"
            size="small"
            sx={{
              backgroundColor: "rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.8)",
              borderColor: "rgba(255,255,255,0.2)",
            }}
          />
        </Box>

        {/* Pagination Controls */}
        <Box display="flex" alignItems="center" gap={2}>
          {/* Items per page selector */}
          <FormControl
            size="small"
            sx={{
              minWidth: 120,
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
            <InputLabel>Per page</InputLabel>
            <Select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              label="Per page"
            >
              {itemsPerPageOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Previous/Next buttons */}
          <Box display="flex" gap={1}>
            <Tooltip title="Previous page">
              <IconButton
                onClick={goToPrevPage}
                disabled={currentPage === 1}
                size="small"
                sx={{ color: "rgba(255,255,255,0.8)" }}
              >
                <IconChevronLeft />
              </IconButton>
            </Tooltip>

            <Tooltip title="Next page">
              <IconButton
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                size="small"
                sx={{ color: "rgba(255,255,255,0.8)" }}
              >
                <IconChevronRight />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Page numbers */}
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
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
                  backgroundColor: "rgba(255,255,255,0.1)",
                },
                "&.Mui-selected": {
                  backgroundColor: "#667eea",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "#5a6fd8",
                  },
                },
              },
            }}
          />
        </Box>
      </Box>

      {/* Page info */}
      <Box mt={2} textAlign="center">
        <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.6)" }}>
          Page {currentPage} of {totalPages}
        </Typography>
      </Box>
    </Paper>
  );
};

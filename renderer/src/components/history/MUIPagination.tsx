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
    <Paper sx={{ p: 3, mt: 3 }}>
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
            icon={<IconInfoCircle />}
            label={`Showing ${startIndex + 1}-${endIndex} of ${total} bets`}
            color="primary"
            variant="outlined"
            size="small"
          />
        </Box>

        {/* Pagination Controls */}
        <Box display="flex" alignItems="center" gap={2}>
          {/* Items per page selector */}
          <FormControl size="small" sx={{ minWidth: 120 }}>
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
              >
                <IconChevronLeft />
              </IconButton>
            </Tooltip>

            <Tooltip title="Next page">
              <IconButton
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                size="small"
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
          />
        </Box>
      </Box>

      {/* Page info */}
      <Box mt={2} textAlign="center">
        <Typography variant="body2" color="text.secondary">
          Page {currentPage} of {totalPages}
        </Typography>
      </Box>
    </Paper>
  );
};

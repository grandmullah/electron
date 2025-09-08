import React from "react";
import {
  Pagination,
  Group,
  Text as MantineText,
  Select,
  Stack,
  Paper,
  ThemeIcon,
  Badge,
} from "@mantine/core";
import "../../styles/mantine/pagination.css";
import {
  IconChevronLeft,
  IconChevronRight,
  IconInfoCircle,
} from "@tabler/icons-react";

interface MantinePaginationProps {
  startIndex: number;
  endIndex: number;
  total: number;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  setItemsPerPage: (n: number) => void;
  goToPrevPage: () => void;
  goToNextPage: () => void;
  goToPage: (page: number) => void;
}

export const MantinePagination: React.FC<MantinePaginationProps> = ({
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
  return (
    <Paper
      p="lg"
      radius="md"
      shadow="sm"
      style={{
        background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
        border: "1px solid #e2e8f0",
      }}
    >
      <Stack gap="md">
        {/* Info Section */}
        <Group justify="space-between" align="center">
          <Group gap="xs" align="center">
            <ThemeIcon size="sm" variant="light" color="blue">
              <IconInfoCircle size={14} />
            </ThemeIcon>
            <MantineText size="sm" fw={500} c="dimmed">
              Showing {startIndex + 1}-{endIndex} of {total} bets
            </MantineText>
            <Badge size="sm" variant="light" color="blue">
              Page {currentPage} of {totalPages}
            </Badge>
          </Group>

          {/* Items per page selector */}
          <Group gap="xs" align="center">
            <MantineText size="sm" fw={500} c="dimmed">
              Show:
            </MantineText>
            <Select
              value={itemsPerPage.toString()}
              onChange={(value) => setItemsPerPage(Number(value))}
              data={[
                { value: "5", label: "5 per page" },
                { value: "10", label: "10 per page" },
                { value: "20", label: "20 per page" },
                { value: "50", label: "50 per page" },
                { value: "100", label: "100 per page" },
              ]}
              size="sm"
              w={120}
              radius="md"
            />
          </Group>
        </Group>

        {/* Pagination Controls */}
        <Group justify="center">
          <Pagination
            total={totalPages}
            value={currentPage}
            onChange={goToPage}
            size="md"
            radius="md"
            withEdges
            siblings={1}
            boundaries={1}
            previousIcon={IconChevronLeft}
            nextIcon={IconChevronRight}
            styles={{
              control: {
                "&[data-active]": {
                  background: "var(--mantine-color-blue-6)",
                  borderColor: "var(--mantine-color-blue-6)",
                },
                "&:hover": {
                  background: "var(--mantine-color-blue-1)",
                  borderColor: "var(--mantine-color-blue-3)",
                },
              },
            }}
          />
        </Group>
      </Stack>
    </Paper>
  );
};

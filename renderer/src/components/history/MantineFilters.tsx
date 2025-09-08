import React from "react";
import {
  Paper,
  Group,
  TextInput,
  Select,
  Button,
  Stack,
  Grid,
  Badge,
  ActionIcon,
  Tooltip,
  Flex,
  Text as MantineText,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import "../../styles/mantine/filters.css";
import {
  IconSearch,
  IconFilter,
  IconCalendar,
  IconRefresh,
  IconX,
} from "@tabler/icons-react";

interface MantineFiltersProps {
  betStatusFilter: string;
  setBetStatusFilter: (value: string) => void;
  betTypeFilter: string;
  setBetTypeFilter: (value: string) => void;
  dateFrom: string;
  setDateFrom: (value: string) => void;
  dateTo: string;
  setDateTo: (value: string) => void;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  onClearFilters: () => void;
  onApplyFilters: () => void;
  totalBets: number;
  filteredBets: number;
}

export const MantineFilters: React.FC<MantineFiltersProps> = ({
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
  const hasActiveFilters =
    betStatusFilter !== "all" ||
    betTypeFilter !== "all" ||
    dateFrom !== "" ||
    dateTo !== "" ||
    searchTerm !== "";

  return (
    <Paper p="lg" radius="md" shadow="sm" mb="lg">
      <Stack gap="md">
        {/* Header */}
        <Flex justify="space-between" align="center">
          <Group gap="xs">
            <IconFilter size={20} />
            <MantineText fw={600} size="lg">
              Filters & Search
            </MantineText>
            {hasActiveFilters && (
              <Badge size="sm" variant="light" color="blue">
                {filteredBets} of {totalBets} bets
              </Badge>
            )}
          </Group>

          <Group gap="xs">
            {hasActiveFilters && (
              <Button
                variant="light"
                color="gray"
                size="sm"
                leftSection={<IconX size={14} />}
                onClick={onClearFilters}
              >
                Clear Filters
              </Button>
            )}
            <Button
              variant="filled"
              color="blue"
              size="sm"
              leftSection={<IconRefresh size={14} />}
              onClick={onApplyFilters}
            >
              Apply Filters
            </Button>
          </Group>
        </Flex>

        {/* Filter Controls */}
        <Grid>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Stack gap="xs">
              <MantineText size="sm" fw={500} c="dimmed">
                Status
              </MantineText>
              <Select
                value={betStatusFilter}
                onChange={(value) => setBetStatusFilter(value || "all")}
                data={[
                  { value: "all", label: "All Statuses" },
                  { value: "pending", label: "Pending" },
                  { value: "accepted", label: "Accepted" },
                  { value: "rejected", label: "Rejected" },
                  { value: "settled", label: "Settled" },
                  { value: "won", label: "Won" },
                  { value: "lost", label: "Lost" },
                  { value: "cancelled", label: "Cancelled" },
                ]}
                leftSection={<IconFilter size={16} />}
                placeholder="Select status"
                clearable
                radius="md"
              />
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Stack gap="xs">
              <MantineText size="sm" fw={500} c="dimmed">
                Type
              </MantineText>
              <Select
                value={betTypeFilter}
                onChange={(value) => setBetTypeFilter(value || "all")}
                data={[
                  { value: "all", label: "All Types" },
                  { value: "single", label: "Single Bet" },
                  { value: "multibet", label: "Multibet" },
                ]}
                leftSection={<IconFilter size={16} />}
                placeholder="Select type"
                clearable
                radius="md"
              />
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Stack gap="xs">
              <MantineText size="sm" fw={500} c="dimmed">
                From Date
              </MantineText>
              <DateInput
                value={dateFrom ? new Date(dateFrom) : null}
                onChange={(date) =>
                  setDateFrom(date ? date.toISOString().split("T")[0] : "")
                }
                leftSection={<IconCalendar size={16} />}
                placeholder="dd/mm/yyyy"
                valueFormat="DD/MM/YYYY"
                clearable
                radius="md"
              />
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Stack gap="xs">
              <MantineText size="sm" fw={500} c="dimmed">
                To Date
              </MantineText>
              <DateInput
                value={dateTo ? new Date(dateTo) : null}
                onChange={(date) =>
                  setDateTo(date ? date.toISOString().split("T")[0] : "")
                }
                leftSection={<IconCalendar size={16} />}
                placeholder="dd/mm/yyyy"
                valueFormat="DD/MM/YYYY"
                clearable
                radius="md"
              />
            </Stack>
          </Grid.Col>
        </Grid>

        {/* Search */}
        <TextInput
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.currentTarget.value)}
          placeholder="Search teams, selections, or bet ID..."
          leftSection={<IconSearch size={16} />}
          rightSection={
            searchTerm && (
              <Tooltip label="Clear search">
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  size="sm"
                  onClick={() => setSearchTerm("")}
                >
                  <IconX size={14} />
                </ActionIcon>
              </Tooltip>
            )
          }
          radius="md"
          size="md"
        />
      </Stack>
    </Paper>
  );
};

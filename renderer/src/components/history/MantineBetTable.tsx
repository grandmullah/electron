import React from "react";
import {
  Table,
  Badge,
  Group,
  Text as MantineText,
  ActionIcon,
  Tooltip,
  Box,
  Stack,
  ThemeIcon,
  Avatar,
  Flex,
  Divider,
} from "@mantine/core";
import "../../styles/mantine/table.css";
import {
  IconEye,
  IconPrinter,
  IconMoneybag,
  IconTrophy,
  IconCalendar,
  IconId,
  IconTarget,
  IconCoins,
  IconTrendingUp,
} from "@tabler/icons-react";
import { DisplayBet } from "../../types/history";

interface MantineBetTableProps {
  bets: DisplayBet[];
  onView: (bet: DisplayBet) => void;
  onPrint: (bet: DisplayBet) => void;
  onPayout: (bet: DisplayBet) => void;
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => string;
}

export const MantineBetTable: React.FC<MantineBetTableProps> = ({
  bets,
  onView,
  onPrint,
  onPayout,
  getStatusColor,
  getStatusIcon,
}) => {
  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "won":
        return "filled";
      case "lost":
        return "outline";
      case "pending":
        return "light";
      case "cancelled":
        return "dot";
      default:
        return "light";
    }
  };

  const getStatusColorScheme = (status: string) => {
    switch (status.toLowerCase()) {
      case "won":
        return "success";
      case "lost":
        return "error";
      case "pending":
        return "warning";
      case "cancelled":
        return "gray";
      default:
        return "blue";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "SSP",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const rows = bets.map((bet) => {
    const firstSelection = bet.selections[0];
    const isEligibleForPayout = bet.status === "won";

    return (
      <Table.Tr key={bet.id}>
        {/* Bet ID */}
        <Table.Td>
          <Group gap="xs" align="center">
            <ThemeIcon size="sm" variant="light" color="blue">
              <IconId size={14} />
            </ThemeIcon>
            <MantineText size="sm" fw={600} ff="monospace" c="dimmed">
              {bet.id.substring(0, 8)}...
            </MantineText>
          </Group>
        </Table.Td>

        {/* Game */}
        <Table.Td>
          <Stack gap="xs">
            <Badge
              size="sm"
              variant="light"
              color="blue"
              leftSection={<IconTrophy size={12} />}
            >
              {bet.betType === "single" ? "Single Bet" : "Multibet"}
            </Badge>
            {firstSelection && (
              <MantineText size="sm" fw={500} lineClamp={2}>
                {firstSelection.homeTeam} vs {firstSelection.awayTeam}
              </MantineText>
            )}
            {bet.shop && (
              <MantineText size="xs" c="dimmed">
                🏪 {bet.shop.shopName}
              </MantineText>
            )}
          </Stack>
        </Table.Td>

        {/* Selection */}
        <Table.Td>
          {firstSelection && (
            <Stack gap="xs">
              <MantineText size="sm" fw={600} lineClamp={2}>
                {firstSelection.selection}
              </MantineText>
              <Badge
                size="sm"
                variant="outline"
                color="success"
                leftSection={<IconTarget size={12} />}
              >
                {firstSelection.odds}x
              </Badge>
            </Stack>
          )}
        </Table.Td>

        {/* Stake */}
        <Table.Td>
          <Group gap="xs" align="center">
            <ThemeIcon size="sm" variant="light" color="warning">
              <IconCoins size={14} />
            </ThemeIcon>
            <MantineText size="sm" fw={700} c="dark">
              {formatCurrency(bet.totalStake)}
            </MantineText>
          </Group>
        </Table.Td>

        {/* Potential */}
        <Table.Td>
          <Group gap="xs" align="center">
            <ThemeIcon size="sm" variant="light" color="success">
              <IconTrendingUp size={14} />
            </ThemeIcon>
            <MantineText size="sm" fw={700} c="success">
              {formatCurrency(bet.potentialWinnings)}
            </MantineText>
          </Group>
        </Table.Td>

        {/* Status */}
        <Table.Td>
          <Badge
            variant={getStatusVariant(bet.status)}
            color={getStatusColorScheme(bet.status)}
            size="md"
            leftSection={getStatusIcon(bet.status)}
          >
            {bet.status.toUpperCase()}
          </Badge>
        </Table.Td>

        {/* Date */}
        <Table.Td>
          <Group gap="xs" align="center">
            <ThemeIcon size="sm" variant="light" color="gray">
              <IconCalendar size={14} />
            </ThemeIcon>
            <MantineText size="sm" c="dimmed">
              {formatDate(bet.createdAt)}
            </MantineText>
          </Group>
        </Table.Td>

        {/* Actions */}
        <Table.Td>
          <Group gap="xs" justify="center">
            {isEligibleForPayout ? (
              <Tooltip label="Process Payout">
                <ActionIcon
                  variant="light"
                  color="success"
                  size="md"
                  onClick={() => onPayout(bet)}
                >
                  <IconMoneybag size={16} />
                </ActionIcon>
              </Tooltip>
            ) : (
              <>
                <Tooltip label="Print Ticket">
                  <ActionIcon
                    variant="light"
                    color="blue"
                    size="md"
                    onClick={() => onPrint(bet)}
                  >
                    <IconPrinter size={16} />
                  </ActionIcon>
                </Tooltip>
                <Tooltip label="View Details">
                  <ActionIcon
                    variant="light"
                    color="gray"
                    size="md"
                    onClick={() => onView(bet)}
                  >
                    <IconEye size={16} />
                  </ActionIcon>
                </Tooltip>
              </>
            )}
          </Group>
        </Table.Td>
      </Table.Tr>
    );
  });

  return (
    <Box>
      <Table
        striped
        highlightOnHover
        withTableBorder
        withColumnBorders
        verticalSpacing="md"
        horizontalSpacing="lg"
        stickyHeader
        stickyHeaderOffset={60}
      >
        <Table.Thead>
          <Table.Tr>
            <Table.Th>
              <Group gap="xs" align="center">
                <IconId size={16} />
                <MantineText fw={600} size="sm" tt="uppercase" c="dimmed">
                  Bet ID
                </MantineText>
              </Group>
            </Table.Th>
            <Table.Th>
              <Group gap="xs" align="center">
                <IconTrophy size={16} />
                <MantineText fw={600} size="sm" tt="uppercase" c="dimmed">
                  Game
                </MantineText>
              </Group>
            </Table.Th>
            <Table.Th>
              <Group gap="xs" align="center">
                <IconTarget size={16} />
                <MantineText fw={600} size="sm" tt="uppercase" c="dimmed">
                  Selection
                </MantineText>
              </Group>
            </Table.Th>
            <Table.Th>
              <Group gap="xs" align="center">
                <IconCoins size={16} />
                <MantineText fw={600} size="sm" tt="uppercase" c="dimmed">
                  Stake
                </MantineText>
              </Group>
            </Table.Th>
            <Table.Th>
              <Group gap="xs" align="center">
                <IconTrendingUp size={16} />
                <MantineText fw={600} size="sm" tt="uppercase" c="dimmed">
                  Potential
                </MantineText>
              </Group>
            </Table.Th>
            <Table.Th>
              <MantineText fw={600} size="sm" tt="uppercase" c="dimmed">
                Status
              </MantineText>
            </Table.Th>
            <Table.Th>
              <Group gap="xs" align="center">
                <IconCalendar size={16} />
                <MantineText fw={600} size="sm" tt="uppercase" c="dimmed">
                  Date
                </MantineText>
              </Group>
            </Table.Th>
            <Table.Th>
              <MantineText
                fw={600}
                size="sm"
                tt="uppercase"
                c="dimmed"
                ta="center"
              >
                Actions
              </MantineText>
            </Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </Box>
  );
};

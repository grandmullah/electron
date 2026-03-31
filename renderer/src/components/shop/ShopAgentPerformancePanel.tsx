import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Chip,
  IconButton,
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Card,
  CardContent,
  Avatar,
  Tooltip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Stack,
  Grid,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Person as PersonIcon,
  TrendingUp as TrendingUpIcon,
  AccountBalance as BalanceIcon,
  SportsSoccer as BetsIcon,
  AttachMoney as MoneyIcon,
  Percent as PercentIcon,
  ArrowUpward as ArrowUpIcon,
  ArrowDownward as ArrowDownIcon,
  Visibility as ViewIcon,
  Send as SendIcon,
  AccountBalanceWallet as WalletIcon,
} from '@mui/icons-material';
import { useShopAgentPerformance } from '../../hooks/useShopAgentPerformance';
import type { AgentPerformanceSort } from '../../types/shopAgents';
import type { Shop } from '../../types/shops';

// Agent with performance metrics (matches hook return type)
interface ShopAgentWithPerf {
  id: string;
  phone_number: string;
  role: 'agent' | 'super_agent' | string;
  balance: number;
  is_active: boolean;
  created_at: string;
  shop_id?: string;
  shop_name?: string;
  performance: {
    totalBets: number;
    totalStake: number;
    totalWinnings: number;
    netProfit: number;
    winRate: number;
    pendingBets: number;
    settledBets: number;
    averageStake: number;
  };
  lastActive?: string;
}

interface ShopAgentPerformancePanelProps {
  shop: Shop;
  onSendMoney?: (agent: ShopAgentWithPerf) => void;
  onViewDetails?: (agent: ShopAgentWithPerf) => void;
  currency?: string;
}

export const ShopAgentPerformancePanel: React.FC<ShopAgentPerformancePanelProps> = ({
  shop,
  onSendMoney,
  onViewDetails,
  currency = 'SSP',
}) => {
  const {
    agents,
    summary,
    isLoading,
    error,
    refresh,
    filters,
    setFilters,
    sort,
    setSort,
  } = useShopAgentPerformance(shop.id);

  const [selectedAgent, setSelectedAgent] = useState<ShopAgentWithPerf | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const handleSort = (field: AgentPerformanceSort['field']) => {
    setSort({
      field,
      direction: sort.field === field && sort.direction === 'desc' ? 'asc' : 'desc',
    });
  };

  const handleViewDetails = (agent: ShopAgentWithPerf) => {
    setSelectedAgent(agent);
    setDetailsOpen(true);
    if (onViewDetails) {
      onViewDetails(agent);
    }
  };

  const formatCurrency = (amount: number) => {
    return `${currency} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  const getTrendIcon = (value: number, positive = true) => {
    const isPositive = positive ? value >= 0 : value < 0;
    return isPositive ? (
      <ArrowUpIcon sx={{ color: 'success.main', fontSize: 16 }} />
    ) : (
      <ArrowDownIcon sx={{ color: 'error.main', fontSize: 16 }} />
    );
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert 
        severity="error" 
        sx={{ mb: 2 }}
        action={
          <Button color="inherit" size="small" onClick={refresh}>
            Retry
          </Button>
        }
      >
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      {/* Summary Cards */}
      {summary && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Total Agents
                    </Typography>
                    <Typography variant="h5" fontWeight="bold">
                      {summary.totalAgents}
                    </Typography>
                    <Typography variant="caption" color="success.main">
                      {summary.activeAgents} active
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <PersonIcon />
                  </Avatar>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Total Balance
                    </Typography>
                    <Typography variant="h5" fontWeight="bold">
                      {formatCurrency(summary.totalBalance)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      combined agent balance
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'success.main' }}>
                    <BalanceIcon />
                  </Avatar>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Total Bets
                    </Typography>
                    <Typography variant="h5" fontWeight="bold">
                      {summary.totalBets.toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      all time
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'info.main' }}>
                    <BetsIcon />
                  </Avatar>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card variant="outlined">
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Net Profit
                    </Typography>
                    <Typography variant="h5" fontWeight="bold" color={summary.totalNetProfit >= 0 ? 'success.main' : 'error.main'}>
                      {formatCurrency(summary.totalNetProfit)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      shop earnings
                    </Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: summary.totalNetProfit >= 0 ? 'success.main' : 'error.main' }}>
                    <MoneyIcon />
                  </Avatar>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Filters */}
      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={filters.status || 'all'}
              label="Status"
              onChange={(e) => setFilters({ ...filters, status: e.target.value as any })}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
            </Select>
          </FormControl>

          <TextField
            size="small"
            label="Min Balance"
            type="number"
            value={filters.minBalance || ''}
            onChange={(e) => setFilters({ 
              ...filters, 
              minBalance: e.target.value ? Number(e.target.value) : undefined 
            })}
            sx={{ width: 120 }}
          />

          <TextField
            size="small"
            label="Max Balance"
            type="number"
            value={filters.maxBalance || ''}
            onChange={(e) => setFilters({ 
              ...filters, 
              maxBalance: e.target.value ? Number(e.target.value) : undefined 
            })}
            sx={{ width: 120 }}
          />

          <Box flexGrow={1} />

          <Button
            startIcon={<RefreshIcon />}
            onClick={refresh}
            variant="outlined"
            size="small"
          >
            Refresh
          </Button>
        </Stack>
      </Paper>

      {/* Agents Table */}
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Agent</TableCell>
              <TableCell>
                <TableSortLabel
                  active={sort.field === 'balance'}
                  direction={sort.direction}
                  onClick={() => handleSort('balance')}
                >
                  Balance
                </TableSortLabel>
              </TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell>
                <TableSortLabel
                  active={sort.field === 'totalBets'}
                  direction={sort.direction}
                  onClick={() => handleSort('totalBets')}
                >
                  Bets
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sort.field === 'totalStake'}
                  direction={sort.direction}
                  onClick={() => handleSort('totalStake')}
                >
                  Total Stake
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sort.field === 'netProfit'}
                  direction={sort.direction}
                  onClick={() => handleSort('netProfit')}
                >
                  Net Profit
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sort.field === 'winRate'}
                  direction={sort.direction}
                  onClick={() => handleSort('winRate')}
                >
                  Win Rate
                </TableSortLabel>
              </TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {agents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    No agents found for this shop
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              agents.map((agent) => (
                <TableRow 
                  key={agent.id}
                  hover
                  sx={{ '&:hover': { bgcolor: 'action.hover' } }}
                >
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                        <PersonIcon sx={{ fontSize: 18 }} />
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {agent.phone_number}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {agent.role === 'super_agent' ? 'Super Agent' : 'Agent'}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {formatCurrency(agent.balance)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      size="small"
                      label={agent.is_active ? 'Active' : 'Inactive'}
                      color={agent.is_active ? 'success' : 'default'}
                      variant={agent.is_active ? 'filled' : 'outlined'}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {agent.performance.totalBets}
                    </Typography>
                    {agent.performance.pendingBets > 0 && (
                      <Typography variant="caption" color="warning.main">
                        {agent.performance.pendingBets} pending
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatCurrency(agent.performance.totalStake)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      {getTrendIcon(agent.performance.netProfit)}
                      <Typography 
                        variant="body2" 
                        color={agent.performance.netProfit >= 0 ? 'success.main' : 'error.main'}
                      >
                        {formatCurrency(Math.abs(agent.performance.netProfit))}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <PercentIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                      <Typography variant="body2">
                        {formatPercent(agent.performance.winRate)}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={0.5} justifyContent="center">
                      <Tooltip title="View Details">
                        <IconButton 
                          size="small" 
                          onClick={() => handleViewDetails(agent)}
                        >
                          <ViewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {onSendMoney && (
                        <Tooltip title="Send Money">
                          <IconButton 
                            size="small"
                            onClick={() => onSendMoney(agent)}
                            color="success"
                          >
                            <SendIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Agent Details Dialog */}
      <Dialog 
        open={detailsOpen} 
        onClose={() => setDetailsOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              <PersonIcon />
            </Avatar>
            <Box>
              <Typography variant="h6">
                {selectedAgent?.phone_number}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {selectedAgent?.role === 'super_agent' ? 'Super Agent' : 'Agent'}
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          {selectedAgent && (
            <Stack spacing={3}>
              {/* Status */}
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Status
                </Typography>
                <Chip
                  label={selectedAgent.is_active ? 'Active' : 'Inactive'}
                  color={selectedAgent.is_active ? 'success' : 'default'}
                  size="small"
                />
              </Box>

              <Divider />

              {/* Balance Section */}
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Current Balance
                </Typography>
                <Typography variant="h4" color="primary.main" fontWeight="bold">
                  {formatCurrency(selectedAgent.balance)}
                </Typography>
              </Box>

              <Divider />

              {/* Performance Metrics */}
              <Typography variant="subtitle2" gutterBottom>
                Performance Metrics
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Card variant="outlined">
                    <CardContent sx={{ py: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Total Bets
                      </Typography>
                      <Typography variant="h6">
                        {selectedAgent.performance.totalBets}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card variant="outlined">
                    <CardContent sx={{ py: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Win Rate
                      </Typography>
                      <Typography variant="h6">
                        {formatPercent(selectedAgent.performance.winRate)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card variant="outlined">
                    <CardContent sx={{ py: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Total Stake
                      </Typography>
                      <Typography variant="h6">
                        {formatCurrency(selectedAgent.performance.totalStake)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card variant="outlined">
                    <CardContent sx={{ py: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Total Winnings
                      </Typography>
                      <Typography variant="h6" color="success.main">
                        {formatCurrency(selectedAgent.performance.totalWinnings)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Net Profit */}
              <Card 
                variant="outlined" 
                sx={{ 
                  bgcolor: selectedAgent.performance.netProfit >= 0 
                    ? 'success.light' 
                    : 'error.light',
                  borderColor: selectedAgent.performance.netProfit >= 0 
                    ? 'success.main' 
                    : 'error.main',
                }}
              >
                <CardContent>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle1" fontWeight="medium">
                      Net Profit (Shop)
                    </Typography>
                    <Typography variant="h5" fontWeight="bold">
                      {formatCurrency(selectedAgent.performance.netProfit)}
                    </Typography>
                  </Stack>
                  <Typography variant="caption">
                    Positive = Shop profit | Negative = Shop loss
                  </Typography>
                </CardContent>
              </Card>

              {/* Pending Bets */}
              {selectedAgent.performance.pendingBets > 0 && (
                <Alert severity="warning" icon={<BetsIcon />}>
                  <Typography variant="body2">
                    {selectedAgent.performance.pendingBets} pending bets
                  </Typography>
                </Alert>
              )}

              <Divider />

              {/* Created Date */}
              <Typography variant="caption" color="text.secondary">
                Agent since: {new Date(selectedAgent.created_at).toLocaleDateString()}
              </Typography>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>
            Close
          </Button>
          {onSendMoney && selectedAgent && (
            <Button 
              variant="contained" 
              startIcon={<SendIcon />}
              onClick={() => {
                setDetailsOpen(false);
                onSendMoney(selectedAgent);
              }}
              color="success"
            >
              Send Money
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

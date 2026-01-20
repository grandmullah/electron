import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Stack,
  Divider,
} from '@mui/material';
import {
  Store as ShopIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Person as PersonIcon,
  AttachMoney as MoneyIcon,
  CheckCircle as ActiveIcon,
  TrendingUp as CommissionIcon,
  SportsBaseball as BetsIcon,
} from '@mui/icons-material';
import ShopService, { Shop } from '../services/shopService';

/**
 * Shop Selector Component
 * Displays all active shops from the API with full details
 * Useful for testing and selecting shops in admin interfaces
 */
export const ShopSelector: React.FC<{
  onShopSelect?: (shop: Shop) => void;
  selectedShopCode?: string;
}> = ({ onShopSelect, selectedShopCode }) => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedShop, setSelectedShop] = useState<string | null>(
    selectedShopCode || null
  );

  useEffect(() => {
    loadShops();
  }, []);

  const loadShops = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Fetching shops from API...');
      const response = await ShopService.getActiveShops();
      console.log('✅ Shop API Response:', response);

      if (response.success && response.data) {
        console.log(`✅ Loaded ${response.data.length} shops:`, response.data);
        setShops(response.data);

        // Auto-select first shop if none selected
        if (!selectedShop && response.data.length > 0) {
          const defaultShop =
            response.data.find((s) => s.shop_code === 'jebel') ||
            response.data[0];
          setSelectedShop(defaultShop.shop_code);
          onShopSelect?.(defaultShop);
        }
      } else {
        throw new Error('Failed to load shops');
      }
    } catch (err: any) {
      console.error('❌ Shop API Error:', err);
      setError(err.message || 'Failed to load shops');
    } finally {
      setLoading(false);
    }
  };

  const handleShopClick = (shop: Shop) => {
    setSelectedShop(shop.shop_code);
    onShopSelect?.(shop);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={4}>
        <CircularProgress />
        <Typography ml={2}>Loading shops...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" action={
        <Button color="inherit" size="small" onClick={loadShops}>
          Retry
        </Button>
      }>
        {error}
      </Alert>
    );
  }

  if (shops.length === 0) {
    return (
      <Alert severity="info">
        No active shops found. Please contact support.
      </Alert>
    );
  }

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h6" display="flex" alignItems="center" gap={1}>
          <ShopIcon />
          Active Shops ({shops.length})
        </Typography>
        <Button size="small" onClick={loadShops}>
          Refresh
        </Button>
      </Box>

      <Grid container spacing={2}>
        {shops.map((shop) => (
          <Grid item xs={12} md={6} key={shop.id}>
            <Card
              sx={{
                cursor: 'pointer',
                border: 2,
                borderColor:
                  selectedShop === shop.shop_code
                    ? 'primary.main'
                    : 'transparent',
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6,
                },
              }}
              onClick={() => handleShopClick(shop)}
            >
              <CardContent>
                <Stack spacing={2}>
                  {/* Header */}
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Typography variant="h6" fontWeight="bold">
                      {shop.shop_name}
                    </Typography>
                    {shop.is_active && (
                      <Chip
                        icon={<ActiveIcon />}
                        label="Active"
                        color="success"
                        size="small"
                      />
                    )}
                  </Box>

                  {/* Shop Code */}
                  <Chip
                    label={shop.shop_code.toUpperCase()}
                    color="primary"
                    size="small"
                    sx={{ width: 'fit-content' }}
                  />

                  <Divider />

                  {/* Contact Info */}
                  <Stack spacing={1}>
                    {shop.contact_person && (
                      <Box display="flex" alignItems="center" gap={1}>
                        <PersonIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          {shop.contact_person}
                        </Typography>
                      </Box>
                    )}

                    {shop.shop_phone && (
                      <Box display="flex" alignItems="center" gap={1}>
                        <PhoneIcon fontSize="small" color="action" />
                        <Typography variant="body2">{shop.shop_phone}</Typography>
                      </Box>
                    )}

                    {shop.shop_email && (
                      <Box display="flex" alignItems="center" gap={1}>
                        <EmailIcon fontSize="small" color="action" />
                        <Typography variant="body2">{shop.shop_email}</Typography>
                      </Box>
                    )}

                    {shop.shop_address && (
                      <Typography variant="body2" color="text.secondary">
                        📍 {shop.shop_address}
                      </Typography>
                    )}
                  </Stack>

                  <Divider />

                  {/* Business Info */}
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <MoneyIcon fontSize="small" color="action" />
                        <Typography variant="caption" color="text.secondary">
                          Currency:
                        </Typography>
                      </Box>
                      <Typography variant="body2" fontWeight="bold">
                        {shop.default_currency}
                      </Typography>
                    </Grid>

                    <Grid item xs={6}>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <CommissionIcon fontSize="small" color="action" />
                        <Typography variant="caption" color="text.secondary">
                          Commission:
                        </Typography>
                      </Box>
                      <Typography variant="body2" fontWeight="bold">
                        {shop.commission_rate}%
                      </Typography>
                    </Grid>

                    <Grid item xs={6}>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <BetsIcon fontSize="small" color="action" />
                        <Typography variant="caption" color="text.secondary">
                          Max Daily Bets:
                        </Typography>
                      </Box>
                      <Typography variant="body2" fontWeight="bold">
                        {shop.max_daily_bets.toLocaleString()}
                      </Typography>
                    </Grid>

                    <Grid item xs={6}>
                      <Box display="flex" alignItems="center" gap={0.5}>
                        <MoneyIcon fontSize="small" color="action" />
                        <Typography variant="caption" color="text.secondary">
                          Max Bet Amount:
                        </Typography>
                      </Box>
                      <Typography variant="body2" fontWeight="bold">
                        {shop.default_currency}{' '}
                        {shop.max_bet_amount.toLocaleString()}
                      </Typography>
                    </Grid>
                  </Grid>

                  {/* Metadata */}
                  <Typography variant="caption" color="text.secondary">
                    Created: {new Date(shop.created_at).toLocaleDateString()}
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ShopSelector;


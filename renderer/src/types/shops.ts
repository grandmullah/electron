export interface Shop {
  id: string;
  shop_name: string;
  shop_code: string;
  shop_address: string;
  shop_phone?: string | null;
  shop_email?: string | null;
  contact_person?: string | null;
  is_active: boolean;
  default_currency: string;
  commission_rate: number;
  max_daily_bets: number;
  max_bet_amount: number;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ShopsListResponse {
  success: boolean;
  data: Shop[];
  count: number;
}

export interface ShopResponse {
  success: boolean;
  data: Shop;
  message?: string;
}

export interface ShopStats {
  totalShops: number;
  activeShops: number;
  inactiveShops: number;
  totalMaxBetAmount: number;
  averageMaxBetAmount: number;
}

export interface ShopStatsResponse {
  success: boolean;
  data: ShopStats;
}


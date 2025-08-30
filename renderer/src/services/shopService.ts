import { API_BASE_URL } from './apiConfig';

export interface Shop {
      id: string;
      shop_name: string;
      shop_code: string;
      shop_address?: string;
      shop_phone?: string;
      shop_email?: string;
      contact_person?: string;
      is_active: boolean;
      default_currency: string;
      commission_rate: number;
      max_daily_bets: number;
      max_bet_amount: number;
      created_at: string;
      updated_at: string;
}

export interface ShopResponse {
      success: boolean;
      data?: Shop[];  // Backend returns shops in 'data' field
      shops?: Shop[]; // Keep for compatibility
      shop?: Shop;
      error?: string;
      count?: number;
}

class ShopService {
      static async getActiveShops(): Promise<ShopResponse> {
            try {
                  const response = await fetch(`${API_BASE_URL}/shops/active`, {
                        method: 'GET',
                        headers: {
                              'Content-Type': 'application/json',
                        },
                  });

                  if (!response.ok) {
                        let errorMessage = 'Failed to fetch shops';
                        try {
                              const errorData = await response.json();
                              errorMessage = errorData.message || errorData.error || errorMessage;
                        } catch (parseError) {
                              if (response.status >= 500) {
                                    errorMessage = 'Server error. Please try again later';
                              }
                        }
                        throw new Error(errorMessage);
                  }

                  const data: ShopResponse = await response.json();
                  return data;
            } catch (error: any) {
                  console.error('Fetch shops error:', error);
                  if (error.name === 'TypeError' && (error.message.includes('fetch') || error.message.includes('Failed to fetch'))) {
                        throw new Error('Unable to connect to server. Please ensure the backend server is running on http://localhost:8000');
                  }
                  throw new Error(error.message || 'Failed to fetch shops');
            }
      }

      static async getShopByCode(shopCode: string): Promise<ShopResponse> {
            try {
                  const response = await fetch(`${API_BASE_URL}/shops/code/${shopCode}`, {
                        method: 'GET',
                        headers: {
                              'Content-Type': 'application/json',
                        },
                  });

                  if (!response.ok) {
                        let errorMessage = 'Failed to fetch shop';
                        try {
                              const errorData = await response.json();
                              errorMessage = errorData.message || errorData.error || errorMessage;
                        } catch (parseError) {
                              if (response.status === 404) {
                                    errorMessage = 'Shop not found';
                              } else if (response.status >= 500) {
                                    errorMessage = 'Server error. Please try again later';
                              }
                        }
                        throw new Error(errorMessage);
                  }

                  const data: ShopResponse = await response.json();
                  return data;
            } catch (error: any) {
                  console.error('Fetch shop error:', error);
                  if (error.name === 'TypeError' && (error.message.includes('fetch') || error.message.includes('Failed to fetch'))) {
                        throw new Error('Unable to connect to server. Please ensure the backend server is running on http://localhost:8000');
                  }
                  throw new Error(error.message || 'Failed to fetch shop');
            }
      }
}

export default ShopService;

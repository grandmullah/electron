import { API_BASE_URL, API_BASE_URL_CANDIDATES, getApiHeaders } from './apiConfig';

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
            let lastError: unknown = null;

            for (const baseUrl of API_BASE_URL_CANDIDATES) {
                  try {
                        const url = `${baseUrl}/shops/active`;
                        console.log('Fetching shops from:', url);

                        const response = await fetch(url, {
                              method: 'GET',
                              headers: getApiHeaders(false), // No auth required for shops
                              cache: 'no-store',
                        });

                        if (!response.ok) {
                              let errorMessage = 'Failed to fetch shops';
                              try {
                                    const errorData = await response.json();
                                    errorMessage = errorData.message || errorData.error || errorMessage;
                              } catch {
                                    if (response.status >= 500) {
                                          errorMessage = 'Server error. Please try again later';
                                    }
                              }
                              throw new Error(errorMessage);
                        }

                        const data: ShopResponse = await response.json();
                        console.log('Shops fetched successfully:', data);
                        return data;
                  } catch (error: any) {
                        lastError = error;
                        console.error(`Fetch shops error (baseUrl=${baseUrl}):`, error);

                        // Only retry on network-level failures (fetch throws TypeError)
                        if (error?.name !== 'TypeError') {
                              throw new Error(error?.message || 'Failed to fetch shops');
                        }
                  }
            }

            const message =
                  (lastError as any)?.message ||
                  `Unable to connect to server. Please check your internet connection and API settings (API_BASE_URL=${API_BASE_URL}).`;
            throw new Error(message);
      }

      static async getShopByCode(shopCode: string): Promise<ShopResponse> {
            try {
                  console.log('Fetching shop by code:', shopCode);
                  const response = await fetch(`${API_BASE_URL}/shops/code/${shopCode}`, {
                        method: 'GET',
                        headers: getApiHeaders(false), // No auth required for shops
                        cache: 'no-store',
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
                  console.log('Shop fetched successfully:', data);
                  return data;
            } catch (error: any) {
                  console.error('Fetch shop error:', error);
                  throw new Error(error.message || 'Failed to fetch shop');
            }
      }
}

export default ShopService;

import { API_BASE_URL, API_KEY } from './apiConfig';

// console.log('API_BASE_URL:', API_BASE_URL, 'Mode:', import.meta.env.MODE);

export interface RegisterRequest {
      phone_number: string;
      password: string;
      country_code: string;
      role: 'user' | 'agent' | 'super_agent' | 'admin';
      currency: string;
      shop_code: string;
}

export interface LoginRequest {
      phone_number: string;
      password: string;
}

export interface BettingLimits {
      minStake: number;
      maxStake: number;
      maxDailyLoss: number;
      maxWeeklyLoss: number;
}

export interface NotificationPreferences {
      betSettled: boolean;
      oddsChanged: boolean;
      newGames: boolean;
}

export interface UserPreferences {
      oddsFormat: 'decimal' | 'fractional' | 'american';
      timezone: string;
      notifications: NotificationPreferences;
}

// Backend snake_case preferences format
export interface BackendUserPreferences {
      odds_format: 'decimal' | 'fractional' | 'american';
      timezone: string;
      notifications: {
            bet_settled: boolean;
            odds_changed: boolean;
            new_games: boolean;
      };
}

export interface AuthUser {
      id: string;
      phone_number: string;
      role: 'user' | 'agent' | 'super_agent' | 'admin';
      balance: number;
      currency: string;
      isActive: boolean;
      shop_id?: string;
      shop?: {
            id: string;
            shop_name: string;
            shop_code: string;
            shop_address?: string;
            default_currency: string;
            commission_rate: number;
      };
      createdAt?: string;
      updatedAt?: string;
      lastLoginAt?: string;
      bettingLimits?: BettingLimits; // Optional for backward compatibility
      betting_limits?: { // Backend snake_case format
            min_stake: number;
            max_stake: number;
            max_daily_loss: number;
            max_weekly_loss: number;
      };
      preferences?: UserPreferences | BackendUserPreferences;
}

export interface AuthResponse {
      success: boolean;
      user: AuthUser;
      token: string;
      message: string;
}

export interface ProfileResponse {
      success: boolean;
      user: AuthUser;
}

class AuthService {
      static decodeTokenPayload(): Record<string, any> | null {
            const token = this.getToken();
            if (!token) return null;
            try {
                  const tokenParts = token.split('.');
                  if (tokenParts.length !== 3 || !tokenParts[1]) {
                        return null;
                  }
                  const base64Url = tokenParts[1];
                  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                  const jsonPayload = decodeURIComponent(
                        window.atob(base64)
                              .split('')
                              .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                              .join('')
                  );
                  const payload = JSON.parse(jsonPayload);
                  return payload;
            } catch {
                  return null;
            }
      }

      static getUserIdFromToken(): string | null {
            const payload = this.decodeTokenPayload();
            if (!payload) return null;
            return (payload['sub'] as string) || (payload['userId'] as string) || (payload['id'] as string) || null;
      }

      static getPhoneNumberFromToken(): string | null {
            const payload = this.decodeTokenPayload();
            if (!payload) return null;
            return (payload['phone_number'] as string) || (payload['phoneNumber'] as string) || null;
      }

      static getShopNameFromToken(): string | null {
            const payload = this.decodeTokenPayload();
            if (!payload) return null;
            return (payload['shop_name'] as string) || (payload['shopName'] as string) || null;
      }

      static getShopCodeFromToken(): string | null {
            const payload = this.decodeTokenPayload();
            if (!payload) return null;
            return (payload['shop_code'] as string) || (payload['shopCode'] as string) || null;
      }
      private static getAuthHeaders(): Record<string, string> {
            const token = localStorage.getItem('authToken');
            return {
                  'Content-Type': 'application/json',
                  'X-API-Key': API_KEY,
                  ...(token && { 'Authorization': `Bearer ${token}` }),
            };
      }

      static async register(userData: RegisterRequest): Promise<AuthResponse> {
            try {
                  console.log('Registering user with data:', { ...userData, password: '***' });
                  const response = await fetch(`${API_BASE_URL}/auth/register`, {
                        method: 'POST',
                        headers: {
                              'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(userData),
                  });

                  if (!response.ok) {
                        let errorMessage = 'Registration failed';
                        try {
                              const errorData = await response.json();
                              errorMessage = errorData.message || errorData.error || errorMessage;
                        } catch (parseError) {
                              // If we can't parse JSON, use status-based message
                              if (response.status === 409) {
                                    errorMessage = 'An account with this phone number already exists';
                              } else if (response.status === 400) {
                                    errorMessage = 'Invalid registration data provided';
                              } else if (response.status >= 500) {
                                    errorMessage = 'Server error. Please try again later';
                              }
                        }
                        throw new Error(errorMessage);
                  }

                  const data: AuthResponse = await response.json();
                  console.log('Raw registration response:', data);

                  // Validate response structure
                  if (!data.success) {
                        console.error('Registration failed - success is false:', data);
                        throw new Error(data.message || 'Registration failed');
                  }

                  if (!data.user) {
                        console.error('Registration failed - no user data:', data);
                        throw new Error('No user data received from server');
                  }

                  if (!data.token) {
                        console.error('Registration failed - no token:', data);
                        throw new Error('No authentication token received');
                  }

                  console.log('Registration response validation passed');

                  // Store the token
                  localStorage.setItem('authToken', data.token);

                  return data;
            } catch (error: any) {
                  console.error('Registration fetch error:', error);
                  if (error.name === 'TypeError' && (error.message.includes('fetch') || error.message.includes('Failed to fetch'))) {
                        throw new Error(`Unable to connect to server. Please check your internet connection and API settings (API_BASE_URL=${API_BASE_URL}).`);
                  }
                  throw new Error(error.message || 'Registration failed');
            }
      }

      static async login(credentials: LoginRequest): Promise<AuthResponse> {
            try {
                  const response = await fetch(`${API_BASE_URL}/auth/login`, {
                        method: 'POST',
                        headers: {
                              'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(credentials),
                  });

                  if (!response.ok) {
                        let errorMessage = 'Login failed';
                        try {
                              const errorData = await response.json();
                              errorMessage = errorData.message || errorData.error || errorMessage;
                        } catch (parseError) {
                              // If we can't parse JSON, use status-based message
                              if (response.status === 401) {
                                    errorMessage = 'Invalid phone number or password';
                              } else if (response.status === 400) {
                                    errorMessage = 'Invalid login credentials provided';
                              } else if (response.status === 404) {
                                    errorMessage = 'Account not found. Please register first';
                              } else if (response.status >= 500) {
                                    errorMessage = 'Server error. Please try again later';
                              }
                        }
                        throw new Error(errorMessage);
                  }

                  const data: AuthResponse = await response.json();

                  // Validate and store token
                  if (!data.success || !data.user || !data.token) {
                        throw new Error('Invalid response from server');
                  }

                  localStorage.setItem('authToken', data.token);

                  // If this is an agent login, also store agent-specific information
                  if (data.user.role === 'agent') {
                        console.log('Agent logged in successfully, token stored');
                        // Store agent token with a specific key for agent operations if needed
                        localStorage.setItem('agentToken', data.token);
                  }

                  return data;
            } catch (error: any) {
                  console.error('Login fetch error:', error);
                  if (error.name === 'TypeError' && (error.message.includes('fetch') || error.message.includes('Failed to fetch'))) {
                        throw new Error(`Unable to connect to server. Please check your internet connection and API settings (API_BASE_URL=${API_BASE_URL}).`);
                  }
                  throw new Error(error.message || 'Login failed');
            }
      }

      static async getProfile(): Promise<ProfileResponse> {
            try {
                  const token = localStorage.getItem('authToken');
                  // Guard against accidental stringified tokens that cause "authenticated" state without a real JWT
                  if (!token || token === 'undefined' || token === 'null') {
                        throw new Error('No authentication token');
                  }

                  const response = await fetch(`${API_BASE_URL}/auth/profile`, {
                        method: 'GET',
                        headers: this.getAuthHeaders(),
                        // Prevent any redirect loops from taking down the app startup flow
                        redirect: 'manual',
                        cache: 'no-store',
                  });

                  // In some environments, redirects can surface as opaque redirects rather than a normal Response.
                  // Treat any redirect as an auth failure to avoid ERR_TOO_MANY_REDIRECTS loops.
                  if ((response as any).type === 'opaqueredirect' || (response.status >= 300 && response.status < 400)) {
                        this.logout();
                        throw new Error('Authentication expired');
                  }

                  if (!response.ok) {
                        if (response.status === 401) {
                              // Token is invalid, clear it
                              localStorage.removeItem('authToken');
                              throw new Error('Authentication expired');
                        }
                        const errorData = await response.json();
                        throw new Error(errorData.message || 'Failed to fetch profile');
                  }

                  const data: ProfileResponse = await response.json();
                  return data;
            } catch (error: any) {
                  throw new Error(error.message || 'Failed to fetch profile');
            }
      }

      static logout(): void {
            localStorage.removeItem('authToken');
            localStorage.removeItem('agentToken');
      }

      static getToken(): string | null {
            const token = localStorage.getItem('authToken');
            if (!token || token === 'undefined' || token === 'null') return null;
            return token;
      }

      static getAgentToken(): string | null {
            const token = localStorage.getItem('agentToken');
            if (!token || token === 'undefined' || token === 'null') return null;
            return token;
      }

      static isAuthenticated(): boolean {
            return !!this.getToken();
      }

      static isAgent(): boolean {
            return !!this.getAgentToken();
      }

      static getTokenExpiration(): number | null {
            const payload = this.decodeTokenPayload();
            if (!payload) return null;
            return payload['exp'] ? (payload['exp'] as number) * 1000 : null;
      }

      static isTokenExpiring(warningMinutes: number = 5): boolean {
            const expiration = this.getTokenExpiration();
            if (!expiration) return false;

            const now = Date.now();
            const warningTime = warningMinutes * 60 * 1000; // Convert to milliseconds
            return (expiration - now) <= warningTime && (expiration - now) > 0;
      }

      static isTokenExpired(): boolean {
            const expiration = this.getTokenExpiration();
            if (!expiration) return false;
            return Date.now() >= expiration;
      }

      static async refreshToken(): Promise<AuthResponse> {
            try {
                  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
                        method: 'POST',
                        headers: this.getAuthHeaders(),
                  });

                  if (!response.ok) {
                        throw new Error('Token refresh failed');
                  }

                  const data: AuthResponse = await response.json();

                  // Validate response structure
                  if (!data.success || !data.user || !data.token) {
                        throw new Error('Invalid refresh response from server');
                  }

                  // Store the new token
                  localStorage.setItem('authToken', data.token);
                  return data;
            } catch (error: any) {
                  // If refresh fails, clear the token
                  this.logout();
                  throw new Error(error.message || 'Token refresh failed');
            }
      }
}

export default AuthService; 
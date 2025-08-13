import { API_BASE_URL } from './apiConfig';

// console.log('API_BASE_URL:', API_BASE_URL, 'Mode:', import.meta.env.MODE);

// Development mode fallback for testing without backend
// const isDevelopmentMode = import.meta.env.MODE === 'development';
const isDevelopmentMode = true;
const ENABLE_DEV_FALLBACK = false; // Set to true to enable mock responses
const ENABLE_TEST_EXPIRATION = false; // Set to true to test session expiration warning
const USE_AGENT_TOKEN = true; // Set to true to use specific agent token for testing

export interface RegisterRequest {
      phone_number: string;
      password: string;
      role: 'user' | 'agent' | 'admin';
      currency: string;
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

export interface AuthUser {
      id: string;
      phone_number: string;
      role: 'user' | 'agent' | 'admin';
      balance: number;
      currency: string;
      isActive: boolean;
      createdAt?: string;
      updatedAt?: string;
      lastLoginAt?: string;
      bettingLimits: BettingLimits;
      preferences: UserPreferences;
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
      private static getAuthHeaders(): Record<string, string> {
            const token = localStorage.getItem('authToken');
            return {
                  'Content-Type': 'application/json',
                  ...(token && { 'Authorization': `Bearer ${token}` }),
            };
      }

      // Login with test agent credentials for development testing
      private static async loginTestAgent(): Promise<string> {
            try {
                  const response = await fetch(`${API_BASE_URL}/auth/login`, {
                        method: 'POST',
                        headers: {
                              'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                              phone_number: "+1555999001",
                              password: "agent123"
                        }),
                  });

                  if (!response.ok) {
                        throw new Error(`Failed to login test agent: ${response.status}`);
                  }

                  const data = await response.json();
                  console.log('Test agent login response:', data);

                  if (data.success && data.token) {
                        return data.token;
                  } else {
                        throw new Error('Invalid test agent login response');
                  }
            } catch (error) {
                  console.error('Failed to login test agent:', error);
                  throw error;
            }
      }

      static async register(userData: RegisterRequest): Promise<AuthResponse> {
            try {
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

                  // Validate response structure
                  if (!data.success || !data.user || !data.token) {
                        throw new Error('Invalid response from server');
                  }

                  // Store the token (or create a test token for expiration testing)
                  if (ENABLE_TEST_EXPIRATION && isDevelopmentMode) {
                        // Create a mock JWT token that expires in 6 minutes for testing
                        const testPayload = {
                              sub: data.user.id,
                              exp: Math.floor(Date.now() / 1000) + (6 * 60), // Expires in 6 minutes
                              iat: Math.floor(Date.now() / 1000)
                        };
                        const testToken = 'test.' + btoa(JSON.stringify(testPayload)) + '.signature';
                        localStorage.setItem('authToken', testToken);
                        console.log('Test token created, expires in 6 minutes');
                  } else {
                        localStorage.setItem('authToken', data.token);
                  }

                  return data;
            } catch (error: any) {
                  console.error('Registration fetch error:', error);
                  if (error.name === 'TypeError' && (error.message.includes('fetch') || error.message.includes('Failed to fetch'))) {
                        throw new Error('Unable to connect to server. Please ensure the backend server is running on http://localhost:8000');
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

                  // Validate response structure
                  if (!data.success || !data.user || !data.token) {
                        throw new Error('Invalid response from server');
                  }

                  // Store the token
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
                        throw new Error('Unable to connect to server. Please ensure the backend server is running on http://localhost:8000');
                  }
                  throw new Error(error.message || 'Login failed');
            }
      }

      static async getProfile(): Promise<ProfileResponse> {
            try {
                  const response = await fetch(`${API_BASE_URL}/auth/profile`, {
                        method: 'GET',
                        headers: this.getAuthHeaders(),
                  });

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
            return localStorage.getItem('authToken');
      }

      static getAgentToken(): string | null {
            return localStorage.getItem('agentToken');
      }

      static isAuthenticated(): boolean {
            return !!this.getToken();
      }

      static isAgent(): boolean {
            return !!this.getAgentToken();
      }

      // Initialize test agent token for development testing
      static async initializeAgentToken(): Promise<void> {
            if (USE_AGENT_TOKEN && isDevelopmentMode) {
                  try {
                        const agentToken = await this.loginTestAgent();
                        localStorage.setItem('authToken', agentToken);
                        localStorage.setItem('agentToken', agentToken);
                        console.log('Test agent token initialized for development');
                  } catch (error) {
                        console.error('Failed to initialize test agent token:', error);
                  }
            }
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
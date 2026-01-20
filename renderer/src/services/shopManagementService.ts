import axios from "axios";
import { API_BASE_URL, API_KEY } from "./apiConfig";
import type { Shop, ShopsListResponse, ShopResponse, ShopStatsResponse } from "../types/shops";

export interface ShopUser {
  id: string;
  phone_number: string;
  role: "user" | "agent" | "super_agent" | "admin";
  shop_id?: string | null;
  balance?: string | number;
  is_active?: boolean;
  created_at?: string;
}

export type CreateShopRequest = Omit<
  Shop,
  "id" | "created_at" | "updated_at" | "created_by"
>;

export type UpdateShopRequest = Partial<
  Omit<Shop, "id" | "created_at" | "updated_at" | "created_by">
>;

class ShopManagementService {
  private static getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem("authToken");
    return {
      "Content-Type": "application/json",
      "X-API-Key": API_KEY,
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  static async updateUserBalance(params: {
    userId: string;
    action: "adjust" | "reset";
    amount?: number; // required for "adjust"
    type?: string; // defaults to "adjustment"
    description?: string;
  }): Promise<{ success: boolean; message?: string; data?: any; error?: string }> {
    const res = await axios.post(
      `${API_BASE_URL}/admin/users/${encodeURIComponent(params.userId)}/balance`,
      {
        action: params.action,
        amount: params.amount,
        type: params.type,
        description: params.description,
      },
      { headers: this.getAuthHeaders() }
    );
    return res.data;
  }

  static async searchUsers(params: {
    phone?: string;
    role?: ShopUser["role"];
    shop_id?: string;
    limit?: number;
    offset?: number;
  }): Promise<ShopUser[]> {
    const qs = new URLSearchParams();
    if (params.phone) qs.set("phone", params.phone);
    if (params.role) qs.set("role", params.role);
    if (params.shop_id) qs.set("shop_id", params.shop_id);
    qs.set("limit", String(params.limit ?? 50));
    qs.set("offset", String(params.offset ?? 0));

    const res = await axios.get<{ success: boolean; data: ShopUser[]; count?: number; error?: string }>(
      `${API_BASE_URL}/admin/users?${qs.toString()}`,
      { headers: this.getAuthHeaders() }
    );
    if (!res.data?.success) {
      throw new Error((res.data as any)?.error || "Failed to search users");
    }
    return Array.isArray(res.data.data) ? res.data.data : [];
  }

  static async updateUserRole(params: { userId: string; role: ShopUser["role"]; shop_id?: string | null }): Promise<any> {
    const res = await axios.put(
      `${API_BASE_URL}/admin/users/${encodeURIComponent(params.userId)}/role`,
      { role: params.role, shop_id: params.shop_id ?? undefined },
      { headers: this.getAuthHeaders() }
    );
    return res.data;
  }

  static async listShopUsers(shopId: string): Promise<ShopUser[]> {
    // Backend: GET /api/admin/users?shop_id=<id>
    const res = await axios.get<{ success: boolean; data: ShopUser[]; count?: number; error?: string }>(
      `${API_BASE_URL}/admin/users?shop_id=${encodeURIComponent(shopId)}`,
      { headers: this.getAuthHeaders() }
    );

    if (!res.data?.success) {
      throw new Error((res.data as any)?.error || "Failed to load shop users");
    }
    return Array.isArray(res.data.data) ? res.data.data : [];
  }

  static async listShops(): Promise<Shop[]> {
    const res = await axios.get<ShopsListResponse>(`${API_BASE_URL}/shops`, {
      headers: this.getAuthHeaders(),
    });
    if (!res.data?.success) {
      throw new Error((res.data as any)?.error || "Failed to load shops");
    }
    return res.data.data || [];
  }

  static async createShop(payload: CreateShopRequest): Promise<Shop> {
    const res = await axios.post<ShopResponse>(`${API_BASE_URL}/shops`, payload, {
      headers: this.getAuthHeaders(),
    });
    if (!res.data?.success) {
      throw new Error((res.data as any)?.error || "Failed to create shop");
    }
    return res.data.data;
  }

  static async updateShop(shopId: string, payload: UpdateShopRequest): Promise<Shop> {
    const res = await axios.put<ShopResponse>(`${API_BASE_URL}/shops/${shopId}`, payload, {
      headers: this.getAuthHeaders(),
    });
    if (!res.data?.success) {
      throw new Error((res.data as any)?.error || "Failed to update shop");
    }
    return res.data.data;
  }

  static async getShopStats(shopId: string): Promise<ShopStatsResponse> {
    const res = await axios.get<ShopStatsResponse>(`${API_BASE_URL}/shops/${shopId}/stats`, {
      headers: this.getAuthHeaders(),
    });
    return res.data;
  }
}

export default ShopManagementService;


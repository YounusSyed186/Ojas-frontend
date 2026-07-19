import apiClient from "../apiClient";
import type { PaginatedResponse } from "./types";

export type OrderItem = {
  id: number;
  meal_name: string;
  quantity: number;
  unit_price: string;
  line_total: string;
  delivery_date: string;
  fulfillment_status: string;
};

export type MealOrder = {
  id: number;
  order_number: string;
  status: string;
  payment_status: string;
  grand_total: string;
  currency: string;
  delivery_address_line_1: string;
  delivery_address_line_2?: string | null;
  delivery_city: string;
  delivery_state: string;
  delivery_pincode: string;
  created_at: string;
  items: OrderItem[];
};

export type CheckoutResponse = {
  order: MealOrder;
  razorpay: {
    key_id: string;
    order: { id: string; amount: number; currency: string };
  };
};

export const orderApi = {
  checkout: (data: {
    version: number;
    delivery_address_line_1: string;
    delivery_address_line_2?: string;
    delivery_city: string;
    delivery_state: string;
    delivery_pincode: string;
  }) => apiClient.post<CheckoutResponse>("/cart/checkout", data).then((response) => response.data),
  verify: (orderNumber: string, data: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) =>
    apiClient.post("/orders/" + orderNumber + "/payments/razorpay/verify", data).then((response) => response.data),
  abandon: (orderNumber: string) => apiClient.post("/orders/" + orderNumber + "/checkout/abandon").then((response) => response.data),
  getAll: (params?: { page?: number; per_page?: number }) => apiClient.get<{ orders: PaginatedResponse<MealOrder> }>("/orders", { params }).then((response) => response.data.orders),
  getByNumber: (orderNumber: string) => apiClient.get<{ order: MealOrder }>("/orders/" + orderNumber).then((response) => response.data.order),
};

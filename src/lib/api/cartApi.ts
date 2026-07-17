import apiClient from "../apiClient";

export type CartItem = {
  id: number;
  meal_option_id: number;
  name: string;
  slug: string;
  category: string;
  quantity: number;
  delivery_date: string | null;
  unit_price: number;
  line_total: number;
  issues: string[];
};

export type ServerCart = {
  id: number;
  status: "active" | "checkout_locked";
  currency: "INR";
  version: number;
  items: CartItem[];
  count: number;
  subtotal: number;
  discount_total: number;
  tax_total: number;
  delivery_fee: number;
  grand_total: number;
  issues: { item_id: number; message: string }[];
  checkout_ready: boolean;
  delivery_window: { minimum: string; maximum: string; timezone: string };
};

export const cartApi = {
  get: () => apiClient.get<{ cart: ServerCart }>("/cart").then((response) => response.data.cart),
  add: (mealOptionId: number, quantity: number, version: number) =>
    apiClient.post<{ cart: ServerCart }>("/cart/items", { meal_option_id: mealOptionId, quantity, version }).then((response) => response.data.cart),
  update: (itemId: number, values: { quantity?: number; delivery_date?: string | null }, version: number) =>
    apiClient.patch<{ cart: ServerCart }>("/cart/items/" + itemId, { ...values, version }).then((response) => response.data.cart),
  remove: (itemId: number, version: number) =>
    apiClient.delete<{ cart: ServerCart }>("/cart/items/" + itemId, { data: { version } }).then((response) => response.data.cart),
  clear: (version: number) =>
    apiClient.delete<{ cart: ServerCart }>("/cart", { data: { version } }).then((response) => response.data.cart),
};

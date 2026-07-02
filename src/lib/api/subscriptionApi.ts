import apiClient from "../apiClient";

export const subscriptionApi = {
  getAll: () => apiClient.get("/subscriptions").then((r) => r.data),
  getById: (id: number) => apiClient.get(`/subscriptions/${id}`).then((r) => r.data),
  create: (data: {
    subscription_plan_id: number;
    delivery_pincode: string;
    delivery_address_line_1?: string;
    delivery_address_line_2?: string;
    delivery_city?: string;
    delivery_state?: string;
    start_date?: string;
    meal_preferences?: { meal_type: string; meal_option_id: number }[];
    health_details?: {
      age?: number;
      weight?: number;
      height?: number;
      goal?: string;
      allergies?: string;
      medical_conditions?: string;
    };
  }) => apiClient.post("/subscriptions", data).then((r) => r.data),
  cancel: (id: number) => apiClient.post(`/subscriptions/${id}/cancel`).then((r) => r.data),
  pause: (id: number) => apiClient.post(`/subscriptions/${id}/pause`).then((r) => r.data),
  resume: (id: number) => apiClient.post(`/subscriptions/${id}/resume`).then((r) => r.data),
};

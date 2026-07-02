import apiClient from "../apiClient";
import type { ProfileUpdatePayload } from "./types";

export const customerApi = {
  dashboard: () => apiClient.get("/customer/dashboard").then((r) => r.data),
  payments: () => apiClient.get("/customer/payments").then((r) => r.data),
  consultations: () => apiClient.get("/customer/consultations").then((r) => r.data),
  profile: () => apiClient.get("/customer/profile").then((r) => r.data),
  updateProfile: (data: ProfileUpdatePayload) => apiClient.put("/customer/profile", data).then((r) => r.data),
  pauseSubscription: (id: number) => apiClient.post(`/subscriptions/${id}/pause`).then((r) => r.data),
  resumeSubscription: (id: number) => apiClient.post(`/subscriptions/${id}/resume`).then((r) => r.data),
  cancelSubscription: (id: number) => apiClient.post(`/subscriptions/${id}/cancel`).then((r) => r.data),
};

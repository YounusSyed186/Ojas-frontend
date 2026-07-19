import apiClient from "../apiClient";
import type {
  ConsultationDetail,
  CustomerDashboardResponse,
  CustomerProfileData,
  DashboardConsultation,
  DashboardPayment,
  PaginatedResponse,
} from "./types";

export const customerDashboardApi = {
  overview: () => apiClient.get<CustomerDashboardResponse>("/customer/dashboard").then((r) => r.data),

  profile: () => apiClient.get<{ user: CustomerProfileData }>("/customer/profile").then((r) => r.data),

  updateProfile: (data: Record<string, unknown>, token?: string | null) =>
    apiClient
      .put("/customer/profile", data, token ? { headers: { Authorization: `Bearer ${token}` } } : undefined)
      .then((r) => r.data),

  subscriptions: () => apiClient.get("/subscriptions").then((r) => r.data),

  subscriptionDetail: (id: number) =>
    apiClient.get(`/subscriptions/${id}`).then((r) => r.data),

  pauseSubscription: (id: number) =>
    apiClient.post(`/subscriptions/${id}/pause`).then((r) => r.data),

  resumeSubscription: (id: number) =>
    apiClient.post(`/subscriptions/${id}/resume`).then((r) => r.data),

  cancelSubscription: (id: number) =>
    apiClient.post(`/subscriptions/${id}/cancel`).then((r) => r.data),

  consultations: (params?: Record<string, unknown>) =>
    apiClient.get<{ consultations: PaginatedResponse<DashboardConsultation> }>("/customer/consultations", { params }).then((r) => r.data),

  consultationDetail: (id: number) =>
    apiClient.get<{ consultation: ConsultationDetail }>(`/consultations/${id}`).then((r) => r.data),

  bookConsultation: (data: { doctor_id?: number; preferred_slot_at?: string; request_notes?: string }) =>
    apiClient.post("/consultations", data).then((r) => r.data),

  cancelConsultation: (id: number) =>
    apiClient.post(`/consultations/${id}/cancel`).then((r) => r.data),

  payments: (params?: Record<string, unknown>) =>
    apiClient.get<{ payments: PaginatedResponse<DashboardPayment> }>("/customer/payments", { params }).then((r) => r.data),
};

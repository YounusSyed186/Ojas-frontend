import apiClient from "../apiClient";
import type { ConsultationPaymentOrderResponse, RazorpayVerifyPayload } from "./types";

export const consultationApi = {
  getAll: () => apiClient.get("/consultations").then((r) => r.data),

  getById: (id: number) => apiClient.get(`/consultations/${id}`).then((r) => r.data),

  create: (data: {
    doctor_id?: number;
    preferred_slot_at?: string;
    request_notes?: string;
  }) => apiClient.post("/consultations", data).then((r) => r.data),

  cancel: (id: number) => apiClient.post(`/consultations/${id}/cancel`).then((r) => r.data),

  getAvailableDoctors: () => apiClient.get("/consultations/doctors/available").then((r) => r.data),

  getFee: () => apiClient.get("/consultation-fee").then((r) => r.data),

  createRazorpayOrder: (id: number) =>
    apiClient.post<ConsultationPaymentOrderResponse>(`/consultations/${id}/payments/razorpay/order`).then((r) => r.data),

  verifyRazorpayPayment: (id: number, data: RazorpayVerifyPayload) =>
    apiClient.post(`/consultations/${id}/payments/razorpay/verify`, data).then((r) => r.data),
};

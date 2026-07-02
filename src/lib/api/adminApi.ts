import apiClient from "../apiClient";
import type { PaginatedResponse } from "./types";

type ListParams = {
  search?: string;
  status?: string;
  role?: string;
  page?: number;
  per_page?: number;
  sort?: string;
  direction?: "asc" | "desc";
  [key: string]: unknown;
};

export const adminApi = {
  dashboard: () => apiClient.get("/admin/dashboard").then((r) => r.data),

  reports: () => apiClient.get("/admin/reports").then((r) => r.data),

  consultations: (params?: ListParams) =>
    apiClient.get("/admin/consultations", { params }).then((r) => r.data),

  assignDoctor: (id: number, doctorId: number) =>
    apiClient.post(`/admin/consultations/${id}/assign-doctor`, { doctor_id: doctorId }).then((r) => r.data),

  updateConsultation: (id: number, data: Record<string, unknown>) =>
    apiClient.put(`/admin/consultations/${id}`, data).then((r) => r.data),

  users: (params?: ListParams) => apiClient.get("/admin/users", { params }).then((r) => r.data),

  updateUser: (id: number, data: Record<string, unknown>) =>
    apiClient.put(`/admin/users/${id}`, data).then((r) => r.data),

  subscriptions: (params?: ListParams) =>
    apiClient.get("/admin/subscriptions", { params }).then((r) => r.data),

  updateSubscription: (id: number, data: Record<string, unknown>) =>
    apiClient.put(`/admin/subscriptions/${id}`, data).then((r) => r.data),

  payments: (params?: ListParams) => apiClient.get("/admin/payments", { params }).then((r) => r.data),

  plans: (params?: ListParams) => apiClient.get("/admin/plans", { params }).then((r) => r.data),

  updatePlan: (id: number, data: Record<string, unknown>) =>
    apiClient.put(`/admin/plans/${id}`, data).then((r) => r.data),

  mealTemplates: (params?: ListParams) =>
    apiClient.get("/admin/meal-templates", { params }).then((r) => r.data),

  updateMealTemplate: (id: number, data: Record<string, unknown>) =>
    apiClient.put(`/admin/meal-templates/${id}`, data).then((r) => r.data),

  pincodes: (params?: ListParams) => apiClient.get("/admin/pincodes", { params }).then((r) => r.data),

  createPincode: (data: { pincode: string; label: string; is_active?: boolean }) =>
    apiClient.post("/admin/pincodes", data).then((r) => r.data),

  updatePincode: (id: number, data: Record<string, unknown>) =>
    apiClient.put(`/admin/pincodes/${id}`, data).then((r) => r.data),

  settings: () => apiClient.get("/admin/settings").then((r) => r.data),

  updateSetting: (id: number, value: string) =>
    apiClient.put(`/admin/settings/${id}`, { value }).then((r) => r.data),
};

export type AdminListResult<T> = PaginatedResponse<T>;

// Doctor management
export const adminDoctorApi = {
  list: (params?: Record<string, unknown>) =>
    apiClient.get("/admin/doctors", { params }).then((r) => r.data),

  detail: (id: number) =>
    apiClient.get(`/admin/doctors/${id}`).then((r) => r.data),

  create: (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    specialization?: string;
    qualification?: string;
    experience?: string;
    bio?: string;
    status?: string;
  }) => apiClient.post("/admin/doctors", data).then((r) => r.data),

  update: (id: number, data: Record<string, unknown>) =>
    apiClient.put(`/admin/doctors/${id}`, data).then((r) => r.data),

  resetPassword: (id: number, password: string) =>
    apiClient.post(`/admin/doctors/${id}/reset-password`, { password }).then((r) => r.data),

  toggleStatus: (id: number, status: string) =>
    apiClient.post(`/admin/doctors/${id}/toggle-status`, { status }).then((r) => r.data),
};

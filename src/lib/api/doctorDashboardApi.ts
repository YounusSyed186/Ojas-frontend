import apiClient from "../apiClient";

type ListParams = {
  search?: string;
  status?: string;
  scope?: "assigned" | "available";
  page?: number;
  per_page?: number;
};

export const doctorDashboardApi = {
  dashboard: () => apiClient.get("/doctor/dashboard").then((r) => r.data),

  consultations: (params?: ListParams) =>
    apiClient.get("/doctor/consultations", { params }).then((r) => r.data),

  consultation: (id: number) => apiClient.get(`/doctor/consultations/${id}`).then((r) => r.data),

  acceptConsultation: (id: number) =>
    apiClient.post(`/doctor/consultations/${id}/accept`).then((r) => r.data),

  scheduleConsultation: (id: number, scheduledFor: string) =>
    apiClient.post(`/doctor/consultations/${id}/schedule`, { scheduled_for: scheduledFor }).then((r) => r.data),

  addNotes: (id: number, doctorNotes: string, markCompleted = true) =>
    apiClient.post(`/doctor/consultations/${id}/notes`, {
      doctor_notes: doctorNotes,
      mark_completed: markCompleted,
    }).then((r) => r.data),

  assignPlan: (id: number, mealPlanTemplateId: number) =>
    apiClient.post(`/doctor/consultations/${id}/assign`, {
      meal_plan_template_id: mealPlanTemplateId,
    }).then((r) => r.data),

  markCompleted: (id: number) =>
    apiClient.post(`/doctor/consultations/${id}/complete`).then((r) => r.data),

  mealTemplates: () => apiClient.get("/doctor/meal-templates").then((r) => r.data),

  patients: (params?: { search?: string; page?: number; per_page?: number }) =>
    apiClient.get("/doctor/patients", { params }).then((r) => r.data),

  patient: (id: number) => apiClient.get(`/doctor/patients/${id}`).then((r) => r.data),

  schedule: (params?: { view?: string; date?: string; page?: number }) =>
    apiClient.get("/doctor/schedule", { params }).then((r) => r.data),

  notes: (params?: { page?: number; per_page?: number }) =>
    apiClient.get("/doctor/notes", { params }).then((r) => r.data),

  profile: () => apiClient.get("/doctor/profile").then((r) => r.data),
  updateProfile: (data: Record<string, unknown>) =>
    apiClient.put("/doctor/profile", data).then((r) => r.data),
};
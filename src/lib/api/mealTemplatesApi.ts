import apiClient from "../apiClient";

export const mealTemplatesApi = {
  getAll: () => apiClient.get("/meal-templates").then((r) => r.data),
  getById: (id: number) => apiClient.get(`/meal-templates/${id}`).then((r) => r.data),
  getOptions: (templateId: number) => apiClient.get(`/meal-options/${templateId}`).then((r) => r.data),
};

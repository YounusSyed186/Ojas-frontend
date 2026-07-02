import apiClient from "../apiClient";
import type { Doctor } from "./types";

export const doctorApi = {
  getAll: () => apiClient.get<{ doctors: Doctor[] }>("/doctors").then((r) => r.data),
  getBySlug: (slug: string) => apiClient.get<{ doctor: Doctor }>(`/doctors/${slug}`).then((r) => r.data),
};

import apiClient from "../apiClient";
import type { SubscriptionPlan } from "./types";

export const plansApi = {
  getAll: () => apiClient.get<{ plans: SubscriptionPlan[] }>("/subscription-plans").then((r) => r.data),
  getById: (id: string) => apiClient.get<{ plan: SubscriptionPlan }>(`/subscription-plans/${id}`).then((r) => r.data),
};

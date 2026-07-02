import apiClient from "../apiClient";
import type { Meal, MealCategory } from "./types";

export const mealApi = {
  getAll: () => apiClient.get<{ meals: Meal[] }>("/meals").then((r) => r.data),
  getBySlug: (slug: string) => apiClient.get<{ meal: Meal }>(`/meals/${slug}`).then((r) => r.data),
  getCategories: () => apiClient.get<{ categories: MealCategory[] }>("/categories").then((r) => r.data),
  getCategoryMeals: (slug: string) =>
    apiClient.get<{ category: MealCategory; meals: Meal[] }>(`/categories/${slug}`).then((r) => r.data),
};

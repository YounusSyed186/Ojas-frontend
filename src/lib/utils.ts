import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatCurrency = (value?: number | string | null) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(value ?? 0));

export const formatDashboardDate = (value?: string | null, includeTime = false) => {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
    ...(includeTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
};

export const dashboardErrorMessage = (error: unknown, fallback: string) => {
  const candidate = error as { response?: { data?: { message?: string } }; message?: string };
  return candidate.response?.data?.message || candidate.message || fallback;
};

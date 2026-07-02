export const USER_ROLES = {
  CUSTOMER: "customer",
  DOCTOR: "doctor",
  ADMIN: "admin",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const DASHBOARD_PATHS: Record<UserRole, string> = {
  [USER_ROLES.CUSTOMER]: "/customer/dashboard",
  [USER_ROLES.DOCTOR]: "/doctor/dashboard",
  [USER_ROLES.ADMIN]: "/admin/dashboard",
};

export const getDashboardPath = (role?: string | null): string => {
  if (role === USER_ROLES.DOCTOR) return DASHBOARD_PATHS[USER_ROLES.DOCTOR];
  if (role === USER_ROLES.ADMIN) return DASHBOARD_PATHS[USER_ROLES.ADMIN];
  return DASHBOARD_PATHS[USER_ROLES.CUSTOMER];
};

export const isUserRole = (role?: string | null): role is UserRole =>
  role === USER_ROLES.CUSTOMER || role === USER_ROLES.DOCTOR || role === USER_ROLES.ADMIN;

import apiClient from "../apiClient";

export const authApi = {
  register: (data: { name: string; email: string; password: string; password_confirmation: string; phone?: string }) =>
    apiClient.post("/auth/register", data).then((r) => r.data),

  login: (data: { email?: string; phone?: string; password: string }) =>
    apiClient.post("/auth/login", data).then((r) => r.data),

  logout: (token?: string | null) =>
    apiClient
      .post(
        "/auth/logout",
        undefined,
        token ? { headers: { Authorization: `Bearer ${token}` }, skipAuthRedirect: true } : { skipAuthRedirect: true },
      )
      .then((r) => r.data),

  me: () => apiClient.get("/auth/me").then((r) => r.data),

  sendOtp: (phone: string) => apiClient.post("/auth/otp/send", { phone }).then((r) => r.data),

  verifyOtp: (phone: string, otp: string) => apiClient.post("/auth/otp/verify", { phone, otp }).then((r) => r.data),
};

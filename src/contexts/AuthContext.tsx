import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authApi } from "@/lib/api/authApi";

type User = {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: string;
  status: string;
  phone_verified_at?: string | null;
} | null;

type AuthContextType = {
  user: User;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isPhoneVerified: boolean;
  login: (email: string, password: string) => Promise<{ requires_phone_verification: boolean }>;
  register: (name: string, email: string, password: string, passwordConfirmation: string, phone: string) => Promise<void>;
  logout: () => Promise<void>;
  sendOtp: (phone: string) => Promise<void>;
  verifyOtp: (phone: string, otp: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(() => {
    try {
      const cached = localStorage.getItem("auth_user");
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("auth_token"));
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      const data = await authApi.me();
      setUser(data.user);
      localStorage.setItem("auth_user", JSON.stringify(data.user));
    } catch {
      setToken(null);
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (email: string, password: string) => {
    const data = await authApi.login({ email, password });
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem("auth_token", data.token);
    localStorage.setItem("auth_user", JSON.stringify(data.user));
    return { requires_phone_verification: data.requires_phone_verification ?? false };
  };

  const register = async (name: string, email: string, password: string, passwordConfirmation: string, phone: string) => {
    const data = await authApi.register({ name, email, password, password_confirmation: passwordConfirmation, phone });
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem("auth_token", data.token);
    localStorage.setItem("auth_user", JSON.stringify(data.user));
  };

  const logout = async () => {
    const logoutToken = localStorage.getItem("auth_token");

    setToken(null);
    setUser(null);
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");

    authApi.logout(logoutToken).catch(() => {
      // Ignore errors on logout; the local session has already been cleared.
    });
  };

  const sendOtp = async (phone: string) => {
    await authApi.sendOtp(phone);
  };

  const verifyOtp = async (phone: string, otp: string) => {
    const data = await authApi.verifyOtp(phone, otp);
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem("auth_token", data.token);
    localStorage.setItem("auth_user", JSON.stringify(data.user));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token && !!user,
        isPhoneVerified: !!user?.phone_verified_at,
        login,
        register,
        logout,
        sendOtp,
        verifyOtp,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

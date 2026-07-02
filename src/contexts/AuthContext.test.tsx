import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AuthProvider, useAuth } from "./AuthContext";
import { authApi } from "@/lib/api/authApi";

vi.mock("@/lib/api/authApi", () => ({
  authApi: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    me: vi.fn(),
    sendOtp: vi.fn(),
    verifyOtp: vi.fn(),
  },
}));

const AuthProbe = () => {
  const { login, logout, isAuthenticated, user } = useAuth();

  return (
    <div>
      <span>{isAuthenticated ? user?.name : "signed-out"}</span>
      <button type="button" onClick={() => login("customer@example.com", "password")}>
        Login
      </button>
      <button type="button" onClick={logout}>
        Logout
      </button>
    </div>
  );
};

describe("AuthContext", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.mocked(authApi.me).mockReset();
    vi.mocked(authApi.login).mockReset();
    vi.mocked(authApi.logout).mockReset();
  });

  it("stores the Sanctum token and user after login", async () => {
    vi.mocked(authApi.login).mockResolvedValue({
      token: "token-123",
      user: {
        id: 1,
        name: "Demo Customer",
        email: "customer@example.com",
        role: "customer",
        status: "active",
      },
    });
    vi.mocked(authApi.me).mockResolvedValue({
      user: {
        id: 1,
        name: "Demo Customer",
        email: "customer@example.com",
        role: "customer",
        status: "active",
      },
    });

    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    );

    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    await waitFor(() => expect(screen.getByText("Demo Customer")).toBeInTheDocument());
    await waitFor(() => expect(localStorage.getItem("auth_token")).toBe("token-123"));
    expect(authApi.login).toHaveBeenCalledWith({ email: "customer@example.com", password: "password" });
  });

  it("clears the local session immediately while backend logout is pending", async () => {
    localStorage.setItem("auth_token", "token-123");
    localStorage.setItem(
      "auth_user",
      JSON.stringify({
        id: 1,
        name: "Demo Customer",
        email: "customer@example.com",
        role: "customer",
        status: "active",
      }),
    );

    vi.mocked(authApi.me).mockResolvedValue({
      user: {
        id: 1,
        name: "Demo Customer",
        email: "customer@example.com",
        role: "customer",
        status: "active",
      },
    });
    vi.mocked(authApi.logout).mockReturnValue(new Promise(() => {}));

    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    );

    await waitFor(() => expect(screen.getByText("Demo Customer")).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: /logout/i }));

    await waitFor(() => expect(screen.getByText("signed-out")).toBeInTheDocument());
    expect(localStorage.getItem("auth_token")).toBeNull();
    expect(localStorage.getItem("auth_user")).toBeNull();
    expect(authApi.logout).toHaveBeenCalledWith("token-123");
  });
});

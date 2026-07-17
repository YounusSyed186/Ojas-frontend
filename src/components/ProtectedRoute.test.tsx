import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProtectedRoute } from "./ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { USER_ROLES } from "@/lib/roles";

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: vi.fn(),
}));

const renderRoute = (initialEntry = "/customer/dashboard", allowedRoles?: string[]) =>
  render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route
          path="/customer/dashboard"
          element={
            <ProtectedRoute allowedRoles={allowedRoles as never}>
              <div>Customer dashboard</div>
            </ProtectedRoute>
          }
        />
        <Route path="/doctor/dashboard" element={<div>Doctor dashboard</div>} />
        <Route path="/" element={<div>Public home</div>} />
      </Routes>
    </MemoryRouter>,
  );

describe("ProtectedRoute", () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReset();
  });

  it("renders protected content when authenticated", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 1, name: "Customer", email: "c@test.com", role: USER_ROLES.CUSTOMER, status: "active", phone_verified_at: "2026-01-01T00:00:00Z" },
      token: "token-123",
      isLoading: false,
      isAuthenticated: true,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      verifyOtp: vi.fn(),
    });

    renderRoute();

    expect(screen.getByText("Customer dashboard")).toBeInTheDocument();
  });

  it("redirects guests to the public home", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      verifyOtp: vi.fn(),
    });

    renderRoute();

    expect(screen.getByText("Public home")).toBeInTheDocument();
  });

  it("redirects users with the wrong role to their dashboard", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 2, name: "Doctor", email: "d@test.com", role: USER_ROLES.DOCTOR, status: "active" },
      token: "token-123",
      isLoading: false,
      isAuthenticated: true,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      verifyOtp: vi.fn(),
    });

    renderRoute("/customer/dashboard", [USER_ROLES.CUSTOMER]);

    expect(screen.getByText("Doctor dashboard")).toBeInTheDocument();
  });
});

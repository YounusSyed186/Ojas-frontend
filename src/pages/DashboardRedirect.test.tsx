import { render } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import DashboardRedirect from "./DashboardRedirect";
import { useAuth } from "@/contexts/AuthContext";
import { USER_ROLES } from "@/lib/roles";

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: vi.fn(),
}));

describe("DashboardRedirect", () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReset();
  });

  it("redirects admins to the admin dashboard route", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 1, name: "Admin", email: "a@test.com", role: USER_ROLES.ADMIN, status: "active" },
      token: "token",
      isLoading: false,
      isAuthenticated: true,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      verifyOtp: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route path="/dashboard" element={<DashboardRedirect />} />
          <Route path="/admin/dashboard" element={<div>Admin dashboard</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(document.body.textContent).toContain("Admin dashboard");
  });

  it("redirects customers to the canonical customer dashboard", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 2, name: "Customer", email: "c@test.com", role: USER_ROLES.CUSTOMER, status: "active" },
      token: "token",
      isLoading: false,
      isAuthenticated: true,
      login: vi.fn(), register: vi.fn(), logout: vi.fn(), verifyOtp: vi.fn(),
    });

    render(<MemoryRouter initialEntries={["/dashboard"]}><Routes><Route path="/dashboard" element={<DashboardRedirect />} /><Route path="/customer/dashboard" element={<div>Customer overview</div>} /></Routes></MemoryRouter>);
    expect(document.body.textContent).toContain("Customer overview");
  });
});

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Dashboard from "./Dashboard";
import { useAuth } from "@/contexts/AuthContext";
import { customerApi } from "@/lib/api/customerApi";

vi.mock("@/components/PageLayout", () => ({
  PageLayout: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/components/PageHero", () => ({
  PageHero: ({ title }: { title: React.ReactNode }) => <h1>{title}</h1>,
}));

vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/lib/api/customerApi", () => ({
  customerApi: {
    dashboard: vi.fn(),
    pauseSubscription: vi.fn(),
    resumeSubscription: vi.fn(),
    cancelSubscription: vi.fn(),
    updateProfile: vi.fn(),
  },
}));

const renderDashboard = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

describe("Dashboard", () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({
      user: {
        id: 1,
        name: "Demo Customer",
        email: "customer@example.com",
        phone: "9991112222",
        role: "customer",
        status: "active",
      },
      token: "token-123",
      isLoading: false,
      isAuthenticated: true,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      verifyOtp: vi.fn(),
    });
    vi.mocked(customerApi.dashboard).mockResolvedValue({
      user: {
        id: 1,
        name: "Demo Customer",
        email: "customer@example.com",
        phone: "9991112222",
      },
      active_subscription: null,
      today_meals: [],
      upcoming_meals: [],
      recent_consultations: [
        {
          id: 88,
          status: "requested",
          payment_status: "paid",
          doctor: { name: "Dr. Aarti Mehta" },
        },
      ],
      recent_payments: [],
      stats: {
        total_subscriptions: 0,
        active_subscriptions: 0,
        pending_payments: 0,
        paid_payments: 1,
      },
    });
  });

  it("renders consultation status and payment status", async () => {
    renderDashboard();

    expect(await screen.findByText("Consultation #88")).toBeInTheDocument();
    expect(screen.getByText("Dr. Aarti Mehta")).toBeInTheDocument();
    expect(screen.getByText("requested")).toBeInTheDocument();
    expect(screen.getByText("paid")).toBeInTheDocument();
  });
});

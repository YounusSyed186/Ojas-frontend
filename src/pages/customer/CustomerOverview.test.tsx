import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CustomerOverview from "./CustomerOverview";
import { customerDashboardApi } from "@/lib/api/customerDashboardApi";

vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: vi.fn() }) }));
vi.mock("@/contexts/AuthContext", () => ({ useAuth: () => ({ user: { name: "Demo Customer", email: "demo@example.com" }, logout: vi.fn() }) }));
vi.mock("@/lib/api/customerDashboardApi", () => ({ customerDashboardApi: { overview: vi.fn(), pauseSubscription: vi.fn(), resumeSubscription: vi.fn(), cancelSubscription: vi.fn() } }));

const response = {
  user: { id: 1, name: "Demo Customer", email: "demo@example.com" },
  active_subscription: null,
  today_meals: [], upcoming_meals: [], recent_orders: [], recent_consultations: [], recent_payments: [],
  stats: { total_subscriptions: 0, active_subscriptions: 0, total_consultations: 3, total_orders: 2, pending_payments: 1, paid_payments: 4, upcoming_meals: 0 },
};

const renderOverview = () => render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}><MemoryRouter><CustomerOverview /></MemoryRouter></QueryClientProvider>);

describe("CustomerOverview", () => {
  beforeEach(() => vi.mocked(customerDashboardApi.overview).mockResolvedValue(response));

  it("renders accurate dashboard totals and onboarding action", async () => {
    renderOverview();
    expect(await screen.findByText("Welcome back, Demo")).toBeInTheDocument();
    expect(screen.getByText("No active subscription")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Browse plans" })).toHaveAttribute("href", "/plans");
    expect(screen.getByText("All meal orders").parentElement).toHaveTextContent("2");
  });
});

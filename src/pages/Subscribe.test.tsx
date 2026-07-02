import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Subscribe from "./Subscribe";
import { useAuth } from "@/contexts/AuthContext";
import { mealTemplatesApi } from "@/lib/api/mealTemplatesApi";
import { paymentApi } from "@/lib/api/paymentApi";
import { pincodeApi } from "@/lib/api/pincodeApi";
import { plansApi } from "@/lib/api/plansApi";
import { subscriptionApi } from "@/lib/api/subscriptionApi";

vi.mock("@/components/PageLayout", () => ({
  PageLayout: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/hooks/use-toast", () => ({
  toast: vi.fn(),
  useToast: () => ({ toast: vi.fn() }),
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/lib/api/plansApi", () => ({
  plansApi: { getAll: vi.fn() },
}));

vi.mock("@/lib/api/mealTemplatesApi", () => ({
  mealTemplatesApi: { getAll: vi.fn() },
}));

vi.mock("@/lib/api/pincodeApi", () => ({
  pincodeApi: { validate: vi.fn() },
}));

vi.mock("@/lib/api/subscriptionApi", () => ({
  subscriptionApi: { create: vi.fn() },
}));

vi.mock("@/lib/api/paymentApi", () => ({
  paymentApi: { createOrder: vi.fn(), verifyPayment: vi.fn() },
}));

const renderSubscribe = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <Subscribe />
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

describe("Subscribe", () => {
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
    vi.mocked(plansApi.getAll).mockResolvedValue({
      plans: [
        {
          id: 7,
          name: "Weekly Reset",
          description: "Seven days of meals.",
          period: "weekly",
          price: 1000,
          meal_plan_template_id: 3,
        },
      ],
    });
    vi.mocked(mealTemplatesApi.getAll).mockResolvedValue({
      templates: [
        {
          id: 3,
          meal_options: [
            { id: 11, meal_type: "breakfast", title: "Protein Breakfast", calories: 350 },
            { id: 12, meal_type: "lunch", title: "Balanced Lunch", calories: 500 },
          ],
        },
      ],
    });
    vi.mocked(pincodeApi.validate).mockResolvedValue({ is_valid: true, message: "Serviceable" });
    vi.mocked(subscriptionApi.create).mockResolvedValue({ subscription: { id: 42 } });
  });

  it("reaches the Razorpay payment step after valid checkout details", async () => {
    renderSubscribe();

    fireEvent.click(await screen.findByRole("button", { name: /weekly reset/i }));
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    fireEvent.change(screen.getByLabelText(/age/i), { target: { value: "30" } });
    fireEvent.change(screen.getByLabelText(/weight/i), { target: { value: "70" } });
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    fireEvent.change(screen.getByLabelText(/pincode/i), { target: { value: "400001" } });
    fireEvent.click(screen.getByRole("button", { name: /check/i }));
    await waitFor(() => expect(screen.getByText(/serviceable area/i)).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText(/address line 1/i), { target: { value: "15 Wellness Street" } });
    fireEvent.change(screen.getByLabelText(/city/i), { target: { value: "Mumbai" } });
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    await screen.findByText(/protein breakfast/i);
    fireEvent.click(screen.getByRole("button", { name: /review & pay/i }));

    await waitFor(() =>
      expect(subscriptionApi.create).toHaveBeenCalledWith(expect.objectContaining({ subscription_plan_id: 7 }), expect.anything()),
    );
    expect(await screen.findByText(/complete payment/i)).toBeInTheDocument();
  });
});

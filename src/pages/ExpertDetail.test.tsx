import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ExpertDetail from "./ExpertDetail";
import { useAuth } from "@/contexts/AuthContext";
import { consultationApi } from "@/lib/api/consultationApi";
import { doctorApi } from "@/lib/api/doctorApi";

vi.mock("@/components/PageLayout", () => ({
  PageLayout: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/components/AuthDialog", () => ({
  AuthDialog: () => null,
}));

vi.mock("@/hooks/use-toast", () => ({
  toast: vi.fn(),
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: vi.fn(),
}));

vi.mock("@/lib/api/doctorApi", () => ({
  doctorApi: { getAll: vi.fn() },
}));

vi.mock("@/lib/api/consultationApi", () => ({
  consultationApi: {
    getFee: vi.fn(),
    create: vi.fn(),
    createRazorpayOrder: vi.fn(),
    verifyRazorpayPayment: vi.fn(),
  },
}));

const renderExpertDetail = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={["/experts/aarti-mehta"]}>
        <Routes>
          <Route path="/experts/:slug" element={<ExpertDetail />} />
          <Route path="/experts" element={<div>Experts</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
};

describe("ExpertDetail", () => {
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
    vi.mocked(doctorApi.getAll).mockResolvedValue({
      doctors: [
        {
          slug: "aarti-mehta",
          name: "Dr. Aarti Mehta",
          spec: "Clinical Nutritionist",
          exp: "12 yrs",
          rating: 4.9,
          bio: "Evidence-based nutrition.",
          focus: ["Weight management"],
        },
      ],
    });
    vi.mocked(consultationApi.getFee).mockResolvedValue({ fee: { amount: 1499, currency: "INR" } });
    vi.mocked(consultationApi.create).mockResolvedValue({ consultation: { id: 77 } });
    vi.mocked(consultationApi.createRazorpayOrder).mockResolvedValue({
      consultation_id: 77,
      key_id: "rzp_test_key",
      order: { id: "order_consult_123", amount: 149900, currency: "INR" },
    });
    vi.mocked(consultationApi.verifyRazorpayPayment).mockResolvedValue({
      consultation: { id: 77, status: "requested", payment_status: "paid" },
    });

    Object.defineProperty(window, "Razorpay", {
      configurable: true,
      value: vi.fn((options) => ({
        on: vi.fn(),
        open: vi.fn(() => {
          void options.handler({
            razorpay_order_id: "order_consult_123",
            razorpay_payment_id: "pay_consult_123",
            razorpay_signature: "signature",
          });
        }),
      })),
    });
  });

  it("creates a consultation, opens Razorpay, and verifies payment before showing success", async () => {
    renderExpertDetail();

    fireEvent.click(await screen.findByRole("button", { name: "10:00" }));
    fireEvent.click(screen.getByRole("button", { name: /confirm booking/i }));

    await waitFor(() => expect(consultationApi.create).toHaveBeenCalledWith(expect.objectContaining({
      preferred_slot_at: expect.stringContaining("T10:00:00"),
    })));
    await waitFor(() => expect(consultationApi.createRazorpayOrder).toHaveBeenCalledWith(77));
    await waitFor(() =>
      expect(consultationApi.verifyRazorpayPayment).toHaveBeenCalledWith(77, {
        razorpay_order_id: "order_consult_123",
        razorpay_payment_id: "pay_consult_123",
        razorpay_signature: "signature",
      }),
    );
    expect(await screen.findByText(/consultation booked/i)).toBeInTheDocument();
  });
});

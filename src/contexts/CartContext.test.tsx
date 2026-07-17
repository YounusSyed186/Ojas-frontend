import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CartProvider, useCart } from "./CartContext";
import { useAuth } from "./AuthContext";
import { cartApi, type ServerCart } from "@/lib/api/cartApi";

vi.mock("./AuthContext", () => ({ useAuth: vi.fn() }));
vi.mock("@/lib/api/cartApi", () => ({ cartApi: { get: vi.fn(), add: vi.fn(), update: vi.fn(), remove: vi.fn(), clear: vi.fn() } }));

const baseCart: ServerCart = {
  id: 1, status: "active", currency: "INR", version: 3, items: [], count: 0, subtotal: 0,
  discount_total: 0, tax_total: 0, delivery_fee: 0, grand_total: 0, issues: [], checkout_ready: false,
  delivery_window: { minimum: "2026-07-18", maximum: "2026-08-16", timezone: "Asia/Kolkata" },
};

const Consumer = () => {
  const { count, add } = useCart();
  return <button onClick={() => void add(9)}>Count {count}</button>;
};

describe("CartContext", () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 1, name: "Customer", email: "c@test.com", role: "customer", status: "active", phone_verified_at: "2026-01-01" },
      token: "token", isLoading: false, isAuthenticated: true, isPhoneVerified: true,
      pendingVerificationUser: null, pendingVerificationToken: null, login: vi.fn(), register: vi.fn(),
      logout: vi.fn(), sendOtp: vi.fn(), verifyOtp: vi.fn(),
    });
    vi.mocked(cartApi.get).mockResolvedValue(baseCart);
    vi.mocked(cartApi.add).mockResolvedValue({ ...baseCart, version: 4, count: 1 });
  });

  it("loads the authoritative cart and sends its version with mutations", async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(<QueryClientProvider client={client}><CartProvider><Consumer /></CartProvider></QueryClientProvider>);
    expect(await screen.findByRole("button", { name: "Count 0" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Count 0" }));
    await waitFor(() => expect(cartApi.add).toHaveBeenCalledWith(9, 1, 3));
    expect(await screen.findByRole("button", { name: "Count 1" })).toBeInTheDocument();
  });
});

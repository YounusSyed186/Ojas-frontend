import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { cartApi, type CartItem, type ServerCart } from "@/lib/api/cartApi";

type CartContextValue = {
  cart: ServerCart | null;
  items: CartItem[];
  count: number;
  total: number;
  isLoading: boolean;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  add: (mealOptionId: number, quantity?: number) => Promise<void>;
  remove: (itemId: number) => Promise<void>;
  setQty: (itemId: number, quantity: number) => Promise<void>;
  setDeliveryDate: (itemId: number, deliveryDate: string | null) => Promise<void>;
  clear: () => Promise<void>;
  refresh: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const { user, isAuthenticated, isPhoneVerified } = useAuth();
  const queryClient = useQueryClient();
  const queryKey = ["cart", user?.id] as const;
  const [isOpen, setIsOpen] = useState(false);
  const enabled = isAuthenticated && isPhoneVerified && user?.role === "customer";
  const { data: cart = null, isLoading, refetch } = useQuery({
    queryKey,
    queryFn: cartApi.get,
    enabled,
    staleTime: 10_000,
  });

  const apply = useCallback(async (operation: (cart: ServerCart) => Promise<ServerCart>) => {
    const current = queryClient.getQueryData<ServerCart>(queryKey);
    if (!current) throw new Error("Cart is not ready. Please refresh and try again.");
    try {
      const next = await operation(current);
      queryClient.setQueryData(queryKey, next);
    } catch (error: unknown) {
      const conflict = error as { response?: { status?: number; data?: { cart?: ServerCart } } };
      if (conflict.response?.status === 409 && conflict.response.data?.cart) {
        queryClient.setQueryData(queryKey, conflict.response.data.cart);
      }
      throw error;
    }
  }, [queryClient, queryKey]);

  const value = useMemo<CartContextValue>(() => ({
    cart: enabled ? cart : null,
    items: enabled ? cart?.items ?? [] : [],
    count: enabled ? cart?.count ?? 0 : 0,
    total: enabled ? cart?.grand_total ?? 0 : 0,
    isLoading: enabled && isLoading,
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((current) => !current),
    add: async (mealOptionId, quantity = 1) => apply((current) => cartApi.add(mealOptionId, quantity, current.version)),
    remove: async (itemId) => apply((current) => cartApi.remove(itemId, current.version)),
    setQty: async (itemId, quantity) => {
      if (quantity <= 0) return apply((current) => cartApi.remove(itemId, current.version));
      return apply((current) => cartApi.update(itemId, { quantity }, current.version));
    },
    setDeliveryDate: async (itemId, deliveryDate) =>
      apply((current) => cartApi.update(itemId, { delivery_date: deliveryDate }, current.version)),
    clear: async () => apply((current) => cartApi.clear(current.version)),
    refresh: async () => { await refetch(); },
  }), [apply, cart, enabled, isLoading, isOpen, refetch]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};

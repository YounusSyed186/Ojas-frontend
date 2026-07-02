import apiClient from "../apiClient";

export type RazorpayOrderResponse = {
  key_id: string;
  subscription_id: number;
  order: {
    id: string;
    amount: number;
    currency: string;
    receipt?: string;
    status?: string;
  };
};

export const paymentApi = {
  createOrder: (data: { subscription_id: number }) =>
    apiClient.post<RazorpayOrderResponse>("/payments/razorpay/order", data).then((r) => r.data),

  verifyPayment: (data: {
    subscription_id: number;
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => apiClient.post("/payments/razorpay/verify", data).then((r) => r.data),
};

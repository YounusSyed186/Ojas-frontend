import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { CreditCard, Loader2, MapPin } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { orderApi } from "@/lib/api/orderApi";
import { getApiErrorMessage } from "@/lib/api/types";
import { toast } from "@/hooks/use-toast";

const CHECKOUT_SRC = "https://checkout.razorpay.com/v1/checkout.js";
type CheckoutResult = { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string };
type RazorpayInstance = { open: () => void; on?: (event: string, callback: (response: { error?: { description?: string } }) => void) => void };
type RazorpayWindow = Window & { Razorpay?: new (options: Record<string, unknown>) => RazorpayInstance };

const loadCheckout = () => new Promise<void>((resolve, reject) => {
  const target = window as RazorpayWindow;
  if (target.Razorpay) return resolve();
  const existing = document.querySelector<HTMLScriptElement>('script[src="' + CHECKOUT_SRC + '"]');
  if (existing) {
    existing.addEventListener("load", () => resolve(), { once: true });
    existing.addEventListener("error", () => reject(new Error("Razorpay Checkout failed to load.")), { once: true });
    return;
  }
  const script = document.createElement("script");
  script.src = CHECKOUT_SRC; script.async = true; script.onload = () => resolve(); script.onerror = () => reject(new Error("Razorpay Checkout failed to load."));
  document.body.appendChild(script);
});

const Checkout = () => {
  const { cart, refresh } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [address, setAddress] = useState({ delivery_address_line_1: "", delivery_address_line_2: "", delivery_city: "", delivery_state: "", delivery_pincode: "" });

  if (!cart || cart.items.length === 0) return <Navigate to="/meals" replace />;
  if (!cart.checkout_ready) return <Navigate to="/meals" replace />;

  const submit = async () => {
    setSubmitting(true);
    try {
      const data = await orderApi.checkout({ version: cart.version, ...address });
      await loadCheckout();
      const target = window as RazorpayWindow;
      if (!target.Razorpay) throw new Error("Razorpay Checkout is unavailable.");
      const checkout = new target.Razorpay({
        key: data.razorpay.key_id,
        amount: data.razorpay.order.amount,
        currency: data.razorpay.order.currency,
        name: "OJAS",
        description: "Meal order " + data.order.order_number,
        order_id: data.razorpay.order.id,
        prefill: { name: user?.name, email: user?.email, contact: user?.phone },
        theme: { color: "#315C4D" },
        handler: async (result: CheckoutResult) => {
          await orderApi.verify(data.order.order_number, result);
          await refresh();
          toast({ title: "Order confirmed", description: data.order.order_number });
          navigate("/customer/orders/" + data.order.order_number);
        },
        modal: {
          ondismiss: async () => {
            await orderApi.abandon(data.order.order_number);
            await refresh();
            setSubmitting(false);
            toast({ title: "Checkout cancelled", description: "Your meals are still in your tray." });
          },
        },
      });
      checkout.on?.("payment.failed", async (response) => {
        await orderApi.abandon(data.order.order_number);
        await refresh();
        setSubmitting(false);
        toast({ title: "Payment failed", description: response.error?.description || "Your cart has been restored.", variant: "destructive" });
      });
      checkout.open();
    } catch (error: unknown) {
      setSubmitting(false);
      toast({ title: "Checkout unavailable", description: getApiErrorMessage(error, "Please try again."), variant: "destructive" });
    }
  };

  const update = (key: keyof typeof address, value: string) => setAddress((current) => ({ ...current, [key]: value }));
  const complete = address.delivery_address_line_1 && address.delivery_city && address.delivery_state && /^\d{6}$/.test(address.delivery_pincode);

  return (
    <PageLayout title="Checkout — OJAS" description="Secure checkout for your scheduled meals.">
      <section className="pt-28 pb-24"><div className="container max-w-5xl grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 rounded-3xl bg-card p-6 md:p-8 shadow-soft">
          <div className="flex items-center gap-2"><MapPin className="w-5 h-5 text-accent" /><h1 className="font-display text-3xl font-semibold">Delivery address</h1></div>
          <div className="grid sm:grid-cols-2 gap-4 mt-7">
            <div className="sm:col-span-2"><Label htmlFor="line1">Address line 1</Label><Input id="line1" value={address.delivery_address_line_1} onChange={(e) => update("delivery_address_line_1", e.target.value)} /></div>
            <div className="sm:col-span-2"><Label htmlFor="line2">Address line 2</Label><Input id="line2" value={address.delivery_address_line_2} onChange={(e) => update("delivery_address_line_2", e.target.value)} /></div>
            <div><Label htmlFor="city">City</Label><Input id="city" value={address.delivery_city} onChange={(e) => update("delivery_city", e.target.value)} /></div>
            <div><Label htmlFor="state">State</Label><Input id="state" value={address.delivery_state} onChange={(e) => update("delivery_state", e.target.value)} /></div>
            <div><Label htmlFor="pincode">Pincode</Label><Input id="pincode" inputMode="numeric" maxLength={6} value={address.delivery_pincode} onChange={(e) => update("delivery_pincode", e.target.value.replace(/\D/g, ""))} /></div>
          </div>
        </div>
        <aside className="lg:col-span-2 rounded-3xl bg-primary text-primary-foreground p-6 h-fit">
          <h2 className="font-display text-2xl font-semibold">Order summary</h2>
          <div className="mt-5 space-y-4">{cart.items.map((item) => <div key={item.id} className="flex justify-between gap-4 text-sm"><div><p>{item.name} × {item.quantity}</p><p className="opacity-70">{item.delivery_date}</p></div><span>₹{item.line_total.toLocaleString("en-IN")}</span></div>)}</div>
          <div className="border-t border-primary-foreground/20 mt-6 pt-5 flex justify-between text-xl font-semibold"><span>Total</span><span>₹{cart.grand_total.toLocaleString("en-IN")}</span></div>
          <p className="text-xs opacity-70 mt-2">Tax included · Free delivery</p>
          <Button disabled={!complete || submitting} onClick={submit} className="w-full mt-6 rounded-full bg-accent text-accent-foreground">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CreditCard className="w-4 h-4 mr-2" />Pay securely</>}
          </Button>
        </aside>
      </div></section>
    </PageLayout>
  );
};

export default Checkout;

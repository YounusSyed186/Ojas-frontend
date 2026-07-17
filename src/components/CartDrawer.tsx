import { Minus, Plus, ShoppingBag, Trash2, X, CalendarDays } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { toast } from "@/hooks/use-toast";
import { getApiErrorMessage } from "@/lib/api/types";
import mealImage from "@/assets/meal-1.jpg";

export const CartDrawer = () => {
  const { cart, items, isOpen, close, total, setQty, setDeliveryDate, remove, count, isLoading } = useCart();
  const run = async (operation: () => Promise<void>) => {
    try { await operation(); }
    catch (error: unknown) {
      toast({ title: "Cart update failed", description: getApiErrorMessage(error, "Refresh and try again."), variant: "destructive" });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={close}
            className="fixed inset-0 z-[60] bg-foreground/40 backdrop-blur-sm" />
          <motion.aside initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "tween", ease: [0.16, 1, 0.3, 1], duration: 0.45 }}
            className="fixed top-0 right-0 z-[61] h-full w-full sm:w-[440px] bg-background shadow-elegant flex flex-col"
            role="dialog" aria-label="Your tray">
            <header className="flex items-center justify-between px-6 py-5 border-b border-border">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Your tray</p>
                <h2 className="font-display text-2xl font-semibold mt-1">{count} item{count !== 1 ? "s" : ""}</h2>
              </div>
              <button onClick={close} className="w-10 h-10 rounded-full grid place-items-center hover:bg-secondary" aria-label="Close tray"><X className="w-4 h-4" /></button>
            </header>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              {isLoading ? <p className="text-center text-muted-foreground py-16">Loading your tray…</p> : items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center gap-4 py-16">
                  <div className="w-16 h-16 rounded-full bg-secondary grid place-items-center"><ShoppingBag className="w-6 h-6 text-muted-foreground" /></div>
                  <div><p className="font-display text-lg">Your tray is empty</p><p className="text-sm text-muted-foreground mt-1">Add a meal to get started.</p></div>
                  <Button asChild onClick={close} className="rounded-full mt-2"><Link to="/meals">Browse meals</Link></Button>
                </div>
              ) : (
                <ul className="space-y-4">
                  {items.map((item) => (
                    <li key={item.id} className="p-3 rounded-2xl bg-card shadow-soft">
                      <div className="flex gap-4">
                        <img src={mealImage} alt={item.name} className="w-20 h-20 rounded-xl object-cover" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-medium leading-tight truncate">{item.name}</p>
                            <button onClick={() => void run(() => remove(item.id))} className="text-muted-foreground hover:text-destructive" aria-label={"Remove " + item.name}><Trash2 className="w-4 h-4" /></button>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">₹{item.unit_price.toLocaleString("en-IN")} each</p>
                          <div className="flex items-center justify-between mt-3">
                            <div className="inline-flex items-center rounded-full border border-border">
                              <button onClick={() => void run(() => setQty(item.id, item.quantity - 1))} className="w-8 h-8 grid place-items-center" aria-label="Decrease quantity"><Minus className="w-3 h-3" /></button>
                              <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                              <button onClick={() => void run(() => setQty(item.id, item.quantity + 1))} className="w-8 h-8 grid place-items-center" aria-label="Increase quantity"><Plus className="w-3 h-3" /></button>
                            </div>
                            <span className="font-display font-semibold">₹{item.line_total.toLocaleString("en-IN")}</span>
                          </div>
                        </div>
                      </div>
                      <label className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                        <CalendarDays className="w-4 h-4" /> Delivery date
                        <input type="date" value={item.delivery_date ?? ""} min={cart?.delivery_window.minimum} max={cart?.delivery_window.maximum}
                          onChange={(event) => void run(() => setDeliveryDate(item.id, event.target.value || null))}
                          className="ml-auto rounded-lg border border-border bg-background px-2 py-1.5 text-foreground" />
                      </label>
                      {item.issues.map((issue) => <p key={issue} className="text-xs text-destructive mt-2">{issue}</p>)}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <footer className="border-t border-border px-6 py-5 space-y-4">
                <div className="flex justify-between text-sm text-muted-foreground"><span>Tax-inclusive subtotal</span><span>₹{total.toLocaleString("en-IN")}</span></div>
                <div className="flex justify-between"><span className="font-display text-lg">Total</span><span className="font-display text-2xl font-semibold">₹{total.toLocaleString("en-IN")}</span></div>
                {cart?.checkout_ready ? (
                  <Button asChild onClick={close} size="lg" className="w-full rounded-full h-12"><Link to="/checkout">Proceed to checkout</Link></Button>
                ) : <Button disabled size="lg" className="w-full rounded-full h-12">Assign all delivery dates</Button>}
                <p className="text-[11px] text-center text-muted-foreground">Free delivery · Secure Razorpay checkout</p>
              </footer>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

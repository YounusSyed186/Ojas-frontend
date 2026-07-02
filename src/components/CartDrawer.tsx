import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";

export const CartDrawer = () => {
  const { items, isOpen, close, total, setQty, remove, count } = useCart();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={close}
            className="fixed inset-0 z-[60] bg-foreground/40 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", ease: [0.16, 1, 0.3, 1], duration: 0.45 }}
            className="fixed top-0 right-0 z-[61] h-full w-full sm:w-[420px] bg-background shadow-elegant flex flex-col"
            role="dialog"
            aria-label="Your tray"
          >
            <header className="flex items-center justify-between px-6 py-5 border-b border-border">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Your tray</p>
                <h2 className="font-display text-2xl font-semibold mt-1">{count} item{count !== 1 ? "s" : ""}</h2>
              </div>
              <button
                onClick={close}
                className="w-10 h-10 rounded-full grid place-items-center hover:bg-secondary transition-colors"
                aria-label="Close tray"
              >
                <X className="w-4 h-4" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center gap-4 py-16">
                  <div className="w-16 h-16 rounded-full bg-secondary grid place-items-center">
                    <ShoppingBag className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-display text-lg">Your tray is empty</p>
                    <p className="text-sm text-muted-foreground mt-1">Add a meal to get started.</p>
                  </div>
                  <Button asChild onClick={close} className="rounded-full mt-2 bg-primary hover:bg-primary-glow">
                    <Link to="/meals">Browse meals</Link>
                  </Button>
                </div>
              ) : (
                <ul className="space-y-4">
                  {items.map((it) => (
                    <li key={it.slug} className="flex gap-4 p-3 rounded-2xl bg-card shadow-soft">
                      <img src={it.img} alt={it.name} className="w-20 h-20 rounded-xl object-cover" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-medium leading-tight truncate">{it.name}</p>
                          <button
                            onClick={() => remove(it.slug)}
                            className="text-muted-foreground hover:text-destructive transition-colors"
                            aria-label={`Remove ${it.name}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">₹{it.price} each</p>
                        <div className="flex items-center justify-between mt-3">
                          <div className="inline-flex items-center rounded-full border border-border">
                            <button
                              onClick={() => setQty(it.slug, it.qty - 1)}
                              className="w-8 h-8 grid place-items-center hover:bg-secondary rounded-l-full"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-8 text-center text-sm font-medium">{it.qty}</span>
                            <button
                              onClick={() => setQty(it.slug, it.qty + 1)}
                              className="w-8 h-8 grid place-items-center hover:bg-secondary rounded-r-full"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <span className="font-display text-base font-semibold">₹{it.price * it.qty}</span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <footer className="border-t border-border px-6 py-5 space-y-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Subtotal</span>
                  <span>₹{total}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-display text-lg">Total</span>
                  <span className="font-display text-2xl font-semibold">₹{total}</span>
                </div>
                <Button asChild onClick={close} size="lg" className="w-full rounded-full h-12 bg-primary hover:bg-primary-glow">
                  <Link to="/delivery">Proceed to checkout</Link>
                </Button>
                <p className="text-[11px] text-center text-muted-foreground">Free delivery · Cancel anytime</p>
              </footer>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};
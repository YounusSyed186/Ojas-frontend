import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Sunrise, Coffee, Salad, Moon, Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Reveal } from "./Reveal";
import { Button } from "@/components/ui/button";

const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export const SubscriptionBuilder = () => {
  const [selected, setSelected] = useState<string[]>(["breakfast", "lunch"]);

  const subscriptionItems = useMemo(() => [
    { id: "shots", name: "Morning Shots", desc: "Cold-pressed wellness, every dawn.", price: 1499, icon: Sunrise },
    { id: "breakfast", name: "Breakfast", desc: "Slow-burning, protein-forward starts.", price: 3499, icon: Coffee },
    { id: "lunch", name: "Lunch", desc: "Balanced macros, vivid flavour.", price: 4499, icon: Salad },
    { id: "dinner", name: "Dinner", desc: "Light, restorative, easy on digestion.", price: 4299, icon: Moon },
    { id: "smoothies", name: "Smoothies", desc: "Functional blends & boosters.", price: 1999, icon: Sunrise },
    { id: "full", name: "Full Package", desc: "Everything above — best value.", price: 13999, icon: Sparkles, bundle: true },
  ], []);

  const toggle = (id: string) => {
    setSelected((cur) => {
      if (id === "full") return cur.includes("full") ? [] : ["full"];
      const without = cur.filter((x) => x !== "full");
      return without.includes(id) ? without.filter((x) => x !== id) : [...without, id];
    });
  };

  const { total, savings } = useMemo(() => {
    if (selected.includes("full")) {
      const full = subscriptionItems.find((i) => i.id === "full")!;
      const all = subscriptionItems.filter((i) => !i.bundle).reduce((s, i) => s + i.price, 0);
      return { total: full.price, savings: all - full.price };
    }
    const t = subscriptionItems
      .filter((i) => selected.includes(i.id))
      .reduce((s, i) => s + i.price, 0);
    return { total: t, savings: 0 };
  }, [selected, subscriptionItems]);

  return (
    <section id="subscribe" className="py-16 md:py-24 relative">
      <div className="container">
        <Reveal>
          <div className="max-w-2xl mx-auto text-center mb-14">
            <p className="text-xs uppercase tracking-[0.3em] text-accent font-medium mb-3">Build your subscription</p>
            <h2 className="font-display text-4xl md:text-6xl font-semibold leading-[1.05]">
              Curate your <span className="italic text-gold text-accent-glow">daily routine</span>.
            </h2>
            <p className="text-muted-foreground mt-5 text-lg">
              Select the meals you want — pricing updates in real time. Pause, swap or cancel any month.
            </p>
          </div>
        </Reveal>

        <div className="grid lg:grid-cols-[1fr_360px] gap-8 max-w-6xl mx-auto items-start">
          {/* Cards grid */}
          <div className="grid sm:grid-cols-2 gap-4">
            {subscriptionItems.map((item, i) => {
              const active = selected.includes(item.id);
              const Icon = item.icon;
              return (
                <Reveal key={item.id} delay={i * 0.05}>
                  <button
                    onClick={() => toggle(item.id)}
                    aria-pressed={active}
                    className={`group w-full text-left relative rounded-3xl p-6 border transition-all duration-300 lift ${active
                        ? "bg-primary text-primary-foreground border-primary shadow-elegant"
                        : "glass border-border hover:border-primary/40"
                      } ${item.bundle ? "sm:col-span-2" : ""}`}
                  >
                    {item.bundle && (
                      <div className="absolute -top-3 left-6 inline-flex items-center gap-1 bg-gradient-gold text-accent-foreground text-[10px] font-semibold uppercase tracking-widest px-3 py-1 rounded-full shadow-gold">
                        <Sparkles className="w-3 h-3" /> Best value
                      </div>
                    )}

                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-11 h-11 rounded-2xl grid place-items-center transition-colors ${active
                              ? "bg-accent text-accent-foreground"
                              : "bg-primary/10 text-primary group-hover:bg-primary/15"
                            }`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-display text-xl leading-tight">{item.name}</div>
                          <div className={`text-xs mt-0.5 ${active ? "opacity-80" : "text-muted-foreground"}`}>
                            {item.desc}
                          </div>
                        </div>
                      </div>

                      <AnimatePresence>
                        {active && (
                          <motion.span
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 400, damping: 22 }}
                            className="w-7 h-7 rounded-full bg-accent text-accent-foreground grid place-items-center shrink-0"
                          >
                            <Check className="w-4 h-4" />
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="mt-5 pt-4 border-t border-current/10 flex items-baseline justify-between">
                      <span className={`text-[11px] uppercase tracking-widest ${active ? "opacity-70" : "text-muted-foreground"}`}>
                        from
                      </span>
                      <div className="font-display text-2xl font-semibold">
                        {fmt(item.price)}
                        <span className={`text-xs font-normal ml-1 ${active ? "opacity-70" : "text-muted-foreground"}`}>
                          /mo
                        </span>
                      </div>
                    </div>
                  </button>
                </Reveal>
              );
            })}
          </div>

          {/* Sticky summary */}
          <Reveal delay={0.1}>
            <div className="lg:sticky lg:top-28">
              <div className="rounded-3xl bg-primary text-primary-foreground p-7 shadow-elegant">
                <div className="text-xs uppercase tracking-[0.25em] opacity-70">Your plan</div>
                <div className="mt-3 min-h-[60px]">
                  {selected.length === 0 ? (
                    <p className="text-sm opacity-70">Select one or more options to start building your routine.</p>
                  ) : (
                    <ul className="space-y-2">
                      <AnimatePresence initial={false}>
                        {subscriptionItems
                          .filter((i) => selected.includes(i.id))
                          .map((i) => (
                            <motion.li
                              key={i.id}
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -8 }}
                              className="flex items-center justify-between text-sm"
                            >
                              <span className="opacity-90">{i.name}</span>
                              <span className="opacity-70">{fmt(i.price)}</span>
                            </motion.li>
                          ))}
                      </AnimatePresence>
                    </ul>
                  )}
                </div>

                <div className="mt-5 pt-5 border-t border-primary-foreground/15">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs uppercase tracking-widest opacity-70">Total / month</span>
                    <motion.span
                      key={total}
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="font-display text-4xl font-semibold"
                    >
                      {fmt(total)}
                    </motion.span>
                  </div>
                  {savings > 0 && (
                    <div className="mt-1 text-xs text-accent-glow">You save {fmt(savings)} with the bundle</div>
                  )}
                </div>

                <Button asChild
                  disabled={selected.length === 0}
                  className="w-full mt-6 rounded-full h-12 bg-accent text-accent-foreground hover:bg-accent-glow disabled:opacity-40"
                >
                  <Link to="/subscribe">
                    Start subscription <ArrowRight className="ml-1 w-4 h-4" />
                  </Link>
                </Button>

                <p className="text-[11px] opacity-70 mt-4 leading-relaxed">
                  Not sure what suits you best?{" "}
                  <a href="#" onClick={(e) => { e.preventDefault(); document.querySelector<HTMLButtonElement>('[aria-label="Speak to our nutritionist"]')?.click(); }} className="underline hover:text-accent-glow">
                    Speak to our nutritionist
                  </a>{" "}
                  for a personalised recommendation.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

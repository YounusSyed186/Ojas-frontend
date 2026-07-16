import { Check, Sparkles, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Reveal } from "./Reveal";
import { Button } from "@/components/ui/button";
import { plansApi } from "@/lib/api/plansApi";
import type { SubscriptionPlan } from "@/lib/api/types";

export const Plans = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["plans"],
    queryFn: () => plansApi.getAll(),
  });

  const displayPlans: SubscriptionPlan[] = data?.plans ?? [];

  const formatPrice = (price: number | string | null | undefined) => {
    const amount = Number(price ?? 0);

    if (Number.isFinite(amount)) {
      return `Rs. ${amount.toLocaleString("en-IN")}`;
    }

    return price ?? "Rs. -";
  };

  const getPeriod = (period: string | undefined) => (period ? period.replace(/_/g, " ") : "");

  return (
    <section id="plans" className="py-16 md:py-24 relative">
      <div className="container">
        <Reveal>
          <div className="max-w-2xl mx-auto text-center mb-16">
            <p className="text-xs uppercase tracking-[0.3em] text-accent font-medium mb-3">Subscription plans</p>
            <h2 className="font-display text-4xl md:text-6xl font-semibold leading-[1.05]">
              Simple plans, <span className="italic text-gold text-accent-glow">honest</span> pricing.
            </h2>
            <p className="text-muted-foreground mt-5 text-lg">
              No hidden fees. Pause, swap, or cancel any time.
            </p>
          </div>
        </Reveal>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        ) : error ? (
          <div className="text-center py-20 text-muted-foreground">Failed to load plans. Please try again.</div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {displayPlans.map((p, i) => {
              const featured = p.featured ?? i === 1;
              const description = p.desc ?? p.description;
              const features = p.features ?? [
                "Fresh daily meals",
                "Serviceable pincode validation",
                "Razorpay checkout",
              ];
              const ctaTarget = `/subscribe?plan=${p.id}`;

              return (
              <Reveal key={p.id} delay={i * 0.1}>
                <div
                  className={`relative rounded-3xl p-8 h-full flex flex-col lift ${
                    featured
                      ? "bg-primary text-primary-foreground shadow-elegant scale-[1.02]"
                      : "glass shadow-soft"
                  }`}
                >
                  {(p.badge || featured) && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 bg-gradient-gold text-accent-foreground text-xs font-semibold px-4 py-1.5 rounded-full shadow-gold">
                      <Sparkles className="w-3 h-3" /> {p.badge ?? "Popular"}
                    </div>
                  )}
                  <div className={`text-sm uppercase tracking-widest ${featured ? "opacity-70" : "text-muted-foreground"}`}>
                    {p.name}
                  </div>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="font-display text-5xl md:text-6xl font-semibold">{formatPrice(p.price)}</span>
                    <span className={`text-sm capitalize ${featured ? "opacity-70" : "text-muted-foreground"}`}>/{getPeriod(p.period)}</span>
                  </div>
                  <p className={`mt-3 text-sm ${featured ? "opacity-80" : "text-muted-foreground"}`}>{description}</p>

                  <ul className="mt-7 space-y-3 flex-1">
                    {features.map((f: string) => (
                      <li key={f} className="flex items-start gap-3 text-sm">
                        <span className={`mt-0.5 w-5 h-5 rounded-full grid place-items-center shrink-0 ${
                          featured ? "bg-accent text-accent-foreground" : "bg-primary/10 text-primary"
                        }`}>
                          <Check className="w-3 h-3" />
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Button
                    asChild
                    className={`mt-8 rounded-full h-12 ${
                      featured
                        ? "bg-white text-primary hover:bg-white/90 hover:text-primary active:bg-white/80 focus-visible:ring-white focus-visible:ring-offset-primary shadow-soft"
                        : "bg-primary text-primary-foreground hover:bg-primary-glow"
                    }`}
                  >
                    <Link to={ctaTarget}>{featured ? "Start plan" : "Choose plan"}</Link>
                  </Button>
                </div>
              </Reveal>
            )})}
          </div>
        )}
      </div>
    </section>
  );
};

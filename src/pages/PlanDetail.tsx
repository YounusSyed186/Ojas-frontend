import { useParams, Link, Navigate } from "react-router-dom";
import { Check, ArrowLeft, Sparkles, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { PageLayout } from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { plansApi } from "@/lib/api/plansApi";
import type { SubscriptionPlan } from "@/lib/api/types";

const formatPrice = (price: number | string | null | undefined) => {
  const amount = Number(price ?? 0);
  if (Number.isFinite(amount)) return `Rs. ${amount.toLocaleString("en-IN")}`;
  return String(price ?? "Rs. -");
};

const PlanDetail = () => {
  const { id = "" } = useParams();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["plan", id],
    queryFn: () => plansApi.getById(id),
  });

  const { data: allPlansData } = useQuery({
    queryKey: ["plans"],
    queryFn: () => plansApi.getAll(),
  });

  if (isLoading) {
    return (
      <PageLayout title="Loading... — OJAS Plans" description="">
        <div className="flex justify-center py-40"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>
      </PageLayout>
    );
  }

  if (isError || !data?.plan) return <Navigate to="/plans" replace />;

  const plan = data.plan;
  const otherPlans: SubscriptionPlan[] = (allPlansData?.plans ?? []).filter((entry) => String(entry.id) !== id);
  const features = plan.features ?? [];
  const description = plan.long ?? plan.description ?? plan.desc ?? "";

  return (
    <PageLayout title={`${plan.name} — OJAS Plans`} description={description}>
      <section className="pt-28 md:pt-36 pb-24">
        <div className="container max-w-4xl">
          <Link to="/plans" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="w-4 h-4" /> All plans
          </Link>

          <div className="rounded-[2rem] overflow-hidden bg-primary text-primary-foreground p-10 md:p-14 shadow-elegant">
            {plan.badge && (
              <div className="inline-flex items-center gap-1 bg-gradient-gold text-accent-foreground text-xs font-semibold px-3 py-1 rounded-full mb-5">
                <Sparkles className="w-3 h-3" /> {plan.badge}
              </div>
            )}
            <p className="text-xs uppercase tracking-[0.3em] opacity-70">{plan.name}</p>
            <h1 className="font-display text-5xl md:text-7xl font-semibold mt-3 leading-[1]">
              {formatPrice(plan.price)}<span className="text-2xl opacity-70 ml-2 font-normal">{plan.period}</span>
            </h1>
            <p className="text-lg opacity-80 mt-5 max-w-xl leading-relaxed">{description}</p>

            <ul className="grid sm:grid-cols-2 gap-3 mt-10">
              {features.map((feature: string) => (
                <li key={feature} className="flex items-start gap-3 text-sm">
                  <span className="mt-0.5 w-5 h-5 rounded-full bg-accent text-accent-foreground grid place-items-center shrink-0">
                    <Check className="w-3 h-3" />
                  </span>
                  {feature}
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full h-12 px-8 bg-accent text-accent-foreground hover:bg-accent-glow">
                <Link to={`/subscribe?plan=${plan.id}`}>Start {plan.name.toLowerCase()}</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full h-12 px-8 border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10">
                <Link to="/builder">Customise first</Link>
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mt-10">
            {otherPlans.map((entry) => (
              <Link key={entry.id} to={`/plans/${entry.id}`} className="block p-6 rounded-2xl glass shadow-soft lift">
                <div className="text-xs uppercase tracking-widest text-muted-foreground">{entry.name}</div>
                <div className="font-display text-2xl font-semibold mt-2">{formatPrice(entry.price)}<span className="text-sm text-muted-foreground ml-1">{entry.period}</span></div>
                <div className="text-sm text-muted-foreground mt-2">{entry.desc ?? entry.description}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default PlanDetail;

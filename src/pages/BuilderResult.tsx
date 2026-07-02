import { Link, useSearchParams } from "react-router-dom";
import { ArrowLeft, Flame, Check, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { PageLayout } from "@/components/PageLayout";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { mealApi } from "@/lib/api/mealApi";
import type { Meal } from "@/lib/api/types";
import m1 from "@/assets/meal-1.jpg";
import m2 from "@/assets/meal-2.jpg";
import m3 from "@/assets/meal-3.jpg";
import m4 from "@/assets/meal-4.jpg";
import m5 from "@/assets/meal-5.jpg";
import m6 from "@/assets/meal-6.jpg";

const mealImages = [m1, m2, m3, m4, m5, m6];

const goalLabel: Record<string, string> = {
  weight: "Weight loss",
  diabetes: "Diabetes care",
  fitness: "Fitness & muscle",
};

const BuilderResult = () => {
  const [params] = useSearchParams();
  const goal = params.get("goal") || "fitness";
  const kcal = params.get("kcal") || "1800";
  const prefs = (params.get("pref") || "").split(",").filter(Boolean);
  const age = params.get("age") || "";

  const { data, isLoading } = useQuery({
    queryKey: ["meals"],
    queryFn: () => mealApi.getAll(),
  });

  if (isLoading) {
    return (
      <PageLayout title="Building your tray — OJAS" description="">
        <div className="flex justify-center py-40"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>
      </PageLayout>
    );
  }

  const meals: Meal[] = data?.meals ?? [];

  // Slight age-based adjustment to the calorie target so the tray skews
  const ageAdjust: Record<string, number> = {
    "15-24": 100,
    "25-34": 0,
    "35-44": -50,
    "45-54": -100,
    "55+": -150,
  };
  const target = parseInt(kcal, 10) + (ageAdjust[age] ?? 0);

  // Filter meals by preferences (best-effort tag/ingredient match)
  const prefMatch = (m: Meal) => {
    if (!prefs.length) return true;
    const hay = `${m.tag} ${m.name} ${m.desc} ${(m.ingredients || []).join(" ")}`.toLowerCase();
    return prefs.some((p) => hay.includes(p.toLowerCase().split(" ")[0]));
  };
  const pool = meals.filter(prefMatch);
  const candidates = (pool.length >= 4 ? pool : meals).slice();

  // Greedy selection of 4 meals that get as close as possible to the target.
  const sorted = [...candidates].sort((a, b) => b.kcal - a.kcal);
  const tray: Meal[] = [];
  let total = 0;
  for (const m of sorted) {
    if (tray.length >= 4) break;
    if (total + m.kcal <= target + 120) {
      tray.push(m);
      total += m.kcal;
    }
  }
  if (tray.length < 4) {
    const rest = [...candidates].sort((a, b) => a.kcal - b.kcal);
    for (const m of rest) {
      if (tray.length >= 4) break;
      if (tray.includes(m)) continue;
      tray.push(m);
      total += m.kcal;
    }
  }
  while (tray.length < 4) {
    const m = candidates[tray.length % candidates.length];
    tray.push(m);
    total += m.kcal;
  }

  const totalProtein = tray.reduce((s, m) => s + m.protein, 0);
  const totalCarbs = tray.reduce((s, m) => s + m.carbs, 0);
  const totalFat = tray.reduce((s, m) => s + m.fat, 0);

  return (
    <PageLayout title="Your custom tray — OJAS" description="A personal meal tray crafted around your goal, calories and preferences.">
      <PageHero
        eyebrow="Your custom tray"
        title={<>A day, <span className="italic text-gold text-accent-glow">tailored</span>.</>}
          subtitle={`Built for ${goalLabel[goal] || goal} · ~${kcal} kcal target${age ? " · age " + age : ""}${prefs.length ? " · " + prefs.join(", ") : ""}.`}
        crumbs={[{ label: "Home", to: "/" }, { label: "Builder", to: "/builder" }, { label: "Result" }]}
      />

      <section className="pb-24">
        <div className="container">
          <Link to="/builder" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="w-4 h-4" /> Tweak preferences
          </Link>

          <div className="grid lg:grid-cols-3 gap-6 mb-10">
            <div className="p-6 rounded-2xl glass shadow-soft">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Goal</div>
              <div className="font-display text-2xl mt-2">{goalLabel[goal] || goal}</div>
            </div>
            <div className="p-6 rounded-2xl glass shadow-soft">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Daily target</div>
              <div className="font-display text-2xl mt-2">{kcal} kcal</div>
              <div className="text-xs text-muted-foreground mt-1">Tray total: {total} kcal</div>
            </div>
            <div className="p-6 rounded-2xl glass shadow-soft">
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Macros</div>
              <div className="font-display text-2xl mt-2">{totalProtein}P · {totalCarbs}C · {totalFat}F</div>
            </div>
          </div>

          {prefs.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-10">
              {prefs.map((p) => (
                <span key={p} className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-accent/15 text-foreground border border-accent/30">
                  <Check className="w-3 h-3" /> {p}
                </span>
              ))}
            </div>
          )}

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {tray.map((m, i) => (
              <Reveal key={`${m.slug}-${i}`} delay={i * 0.08}>
                <Link to={`/meals/${m.slug}`} className="block bg-card rounded-3xl overflow-hidden shadow-soft lift group">
                  <div className="relative aspect-square overflow-hidden image-zoom-wrap">
                    <img src={mealImages[i % mealImages.length]} alt={m.name} className="w-full h-full object-cover image-zoom" />
                    <div className="absolute top-3 left-3 glass text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full">
                      Meal {i + 1}
                    </div>
                    <div className="absolute top-3 right-3 glass text-xs font-medium px-3 py-1 rounded-full inline-flex items-center gap-1">
                      <Flame className="w-3 h-3 text-accent" /> {m.kcal}
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-display text-lg font-semibold leading-tight">{m.name}</h3>
                    <div className="text-xs text-muted-foreground mt-1">{m.protein}g protein</div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>

          <div className="mt-12 p-8 rounded-3xl bg-primary text-primary-foreground flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-elegant">
            <div>
              <div className="text-xs uppercase tracking-widest opacity-70">Ready when you are</div>
              <div className="font-display text-3xl mt-2">Start this tray tomorrow</div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full h-12 px-8 bg-accent text-accent-foreground hover:bg-accent-glow">
                <Link to="/plans">Subscribe weekly</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full h-12 px-8 bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                <Link to="/delivery">Check delivery</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default BuilderResult;

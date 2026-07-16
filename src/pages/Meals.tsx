import { Link } from "react-router-dom";
import { Flame, ArrowRight, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { PageLayout } from "@/components/PageLayout";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { mealApi } from "@/lib/api/mealApi";
import type { Meal, MealCategory } from "@/lib/api/types";
import m1 from "@/assets/meal-1.jpg";
import m2 from "@/assets/meal-2.jpg";
import m3 from "@/assets/meal-3.jpg";
import m4 from "@/assets/meal-4.jpg";
import m5 from "@/assets/meal-5.jpg";
import m6 from "@/assets/meal-6.jpg";

const images = [m1, m2, m3, m4, m5, m6];
const categoryOrder = ["shots", "breakfast", "lunch", "dinner"];

const MealsPage = () => {
  const { data: mealsData, isLoading: mealsLoading } = useQuery({
    queryKey: ["meals"],
    queryFn: () => mealApi.getAll(),
  });
  const { data: catData, isLoading: catLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => mealApi.getCategories(),
  });

  const meals: Meal[] = mealsData?.meals ?? [];
  const categories: MealCategory[] = [...(catData?.categories ?? [])].sort((a, b) => {
    const aIndex = categoryOrder.indexOf(a.slug);
    const bIndex = categoryOrder.indexOf(b.slug);
    return (aIndex === -1 ? categoryOrder.length : aIndex) - (bIndex === -1 ? categoryOrder.length : bIndex);
  });
  const isLoading = mealsLoading || catLoading;

  return (
    <PageLayout title="All Meals — OJAS" description="Browse the full OJAS menu — chef-crafted, nutritionist-approved meals across breakfast, lunch, dinner and shots.">
      <PageHero
        eyebrow="The full menu"
        title={<>Every plate, in <span className="italic text-gold text-accent-glow">one place</span>.</>}
        subtitle="Browse the entire OJAS menu — sorted by daily ritual. Tap any meal for the full nutritional breakdown."
        crumbs={[{ label: "Home", to: "/" }, { label: "Meals" }]}
      />

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>
      ) : (
        <section className="pb-24">
          <div className="container space-y-20">
            {categories.map((cat) => {
              const items = meals.filter((m) => m.category === cat.slug);
              if (!items.length) return null;
              return (
                <div key={cat.slug}>
                  <div className="flex items-end justify-between gap-6 mb-8">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-accent font-medium mb-2">{cat.time}</p>
                      <h2 className="font-display text-3xl md:text-4xl font-semibold">{cat.title}</h2>
                    </div>
                    <Link to={`/categories/${cat.slug}`} className="text-sm font-medium hover:text-accent inline-flex items-center gap-1">
                      See category <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                    {items.map((m, i) => (
                      <Reveal key={m.slug} delay={i * 0.05}>
                        <Link to={`/meals/${m.slug}`} className="block bg-card rounded-3xl overflow-hidden shadow-soft lift group">
                          <div className="relative aspect-square overflow-hidden image-zoom-wrap">
                            <img src={images[i % images.length]} alt={m.name} loading="lazy" className="w-full h-full object-cover image-zoom" />
                            <div className="absolute top-4 left-4 glass text-xs font-medium px-3 py-1 rounded-full">{m.tag}</div>
                            <div className="absolute top-4 right-4 glass text-xs font-medium px-3 py-1 rounded-full inline-flex items-center gap-1">
                              <Flame className="w-3 h-3 text-accent" /> {m.kcal}
                            </div>
                          </div>
                          <div className="p-5">
                            <h3 className="font-display text-lg font-semibold leading-tight">{m.name}</h3>
                            <div className="flex items-center justify-between mt-3">
                              <div className="font-display text-xl font-semibold">₹{m.price}</div>
                              <span className="text-xs text-muted-foreground group-hover:text-accent transition-colors">View →</span>
                            </div>
                          </div>
                        </Link>
                      </Reveal>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </PageLayout>
  );
};

export default MealsPage;

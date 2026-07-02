import { useParams, Link, Navigate } from "react-router-dom";
import { ArrowRight, Flame, Clock, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { PageLayout } from "@/components/PageLayout";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import { mealApi } from "@/lib/api/mealApi";
import type { Meal, MealCategory } from "@/lib/api/types";
import shots from "@/assets/cat-shots.jpg";
import breakfast from "@/assets/cat-breakfast.jpg";
import lunch from "@/assets/cat-lunch.jpg";
import dinner from "@/assets/cat-dinner.jpg";

const catImages: Record<string, string> = { shots, breakfast, lunch, dinner };

const CategoryPage = () => {
  const { slug = "" } = useParams();
  const { data, isLoading } = useQuery({
    queryKey: ["category", slug],
    queryFn: () => mealApi.getCategoryMeals(slug),
  });
  const { data: catData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => mealApi.getCategories(),
  });

  if (isLoading) {
    return (
      <PageLayout title="Loading... — OJAS" description="">
        <div className="flex justify-center py-40"><Loader2 className="w-8 h-8 animate-spin text-accent" /></div>
      </PageLayout>
    );
  }

  const cat = data?.category ?? catData?.categories?.find((c: MealCategory) => c.slug === slug);
  if (!cat) return <Navigate to="/meals" replace />;

  const items: Meal[] = data?.meals ?? [];

  return (
    <PageLayout title={`${cat.title} — OJAS`} description={cat.intro}>
      <PageHero
        eyebrow={cat.time}
        title={<>{cat.title.split(" ")[0]} <span className="italic text-gold text-accent-glow">{cat.title.split(" ").slice(1).join(" ")}</span></>}
        subtitle={cat.intro}
        crumbs={[{ label: "Home", to: "/" }, { label: "Meals", to: "/meals" }, { label: cat.title }]}
      />

      <section className="pb-24">
        <div className="container">
          <div className="relative aspect-[21/9] rounded-[2rem] overflow-hidden mb-16 shadow-elegant">
            <img src={catImages[cat.slug] || breakfast} alt={cat.title} className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between text-primary-foreground">
              <div className="inline-flex items-center gap-2 glass-dark text-xs uppercase tracking-widest px-3 py-1.5 rounded-full">
                <Clock className="w-3 h-3" /> {cat.time}
              </div>
              <div className="text-sm opacity-80 hidden md:block">{items.length} dishes available</div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((m, i) => (
              <Reveal key={m.slug} delay={i * 0.08}>
                <Link to={`/meals/${m.slug}`} className="block bg-card rounded-3xl overflow-hidden shadow-soft lift group">
                  <div className="relative aspect-[4/3] overflow-hidden image-zoom-wrap">
                    <img src={catImages[cat.slug] || breakfast} alt={m.name} loading="lazy" className="w-full h-full object-cover image-zoom" />
                    <div className="absolute top-4 left-4 glass text-xs font-medium px-3 py-1 rounded-full">{m.tag}</div>
                    <div className="absolute top-4 right-4 glass text-xs font-medium px-3 py-1 rounded-full inline-flex items-center gap-1">
                      <Flame className="w-3 h-3 text-accent" /> {m.kcal} kcal
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-display text-xl font-semibold leading-tight">{m.name}</h3>
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{m.desc}</p>
                    <div className="flex items-center justify-between mt-5 pt-5 border-t border-border">
                      <div>
                        <div className="text-xs text-muted-foreground">From</div>
                        <div className="font-display text-2xl font-semibold">₹{m.price}</div>
                      </div>
                      <span className="rounded-full h-11 px-4 inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-sm font-medium group-hover:bg-primary-glow transition-colors">
                        View <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Button asChild size="lg" variant="outline" className="rounded-full h-12 px-8">
              <Link to="/meals">Back to all meals</Link>
            </Button>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default CategoryPage;

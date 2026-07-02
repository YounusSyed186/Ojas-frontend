import { useParams, Link, Navigate } from "react-router-dom";
import { Flame, Plus, ArrowLeft, Check, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { PageLayout } from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/Reveal";
import { mealApi } from "@/lib/api/mealApi";
import { useCart } from "@/contexts/CartContext";
import { toast } from "@/hooks/use-toast";
import type { Meal, MealCategory } from "@/lib/api/types";
import m1 from "@/assets/meal-1.jpg";
import m2 from "@/assets/meal-2.jpg";
import m3 from "@/assets/meal-3.jpg";
import m4 from "@/assets/meal-4.jpg";
import m5 from "@/assets/meal-5.jpg";
import m6 from "@/assets/meal-6.jpg";

const images = [m1, m2, m3, m4, m5, m6];

const MealDetail = () => {
  const { slug = "" } = useParams();
  const { add, open: openCart } = useCart();
  const { data, isLoading } = useQuery({
    queryKey: ["meals"],
    queryFn: () => mealApi.getAll(),
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

  const meals: Meal[] = data?.meals ?? [];
  const categories: MealCategory[] = catData?.categories ?? [];
  const meal = meals.find((m) => m.slug === slug);
  if (!meal) return <Navigate to="/meals" replace />;

  const cat = categories.find((c) => c.slug === meal.category);
  const related = meals.filter((m) => m.category === meal.category && m.slug !== meal.slug).slice(0, 3);
  const handleAdd = () => {
    add({ slug: meal.slug, name: meal.name, price: meal.price, img: images[0] });
    toast({ title: "Added to your tray", description: meal.name });
    openCart();
  };

  return (
    <PageLayout title={`${meal.name} — OJAS`} description={meal.desc}>
      <section className="pt-28 md:pt-36 pb-20">
        <div className="container">
          <Link to="/meals" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="w-4 h-4" /> Back to menu
          </Link>

          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
            <Reveal>
              <div className="relative aspect-square rounded-[2rem] overflow-hidden shadow-elegant image-zoom-wrap">
                <img src={images[0]} alt={meal.name} className="w-full h-full object-cover image-zoom" />
                <div className="absolute top-5 left-5 glass text-xs font-medium px-3 py-1.5 rounded-full">{meal.tag}</div>
              </div>
            </Reveal>

            <Reveal delay={0.15}>
              <div>
                {cat && (
                  <Link to={`/categories/${cat.slug}`} className="text-xs uppercase tracking-[0.3em] text-accent font-medium hover:underline">
                    {cat.title}
                  </Link>
                )}
                <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold mt-3 leading-[1.02]">{meal.name}</h1>
                <p className="text-lg text-muted-foreground mt-5 leading-relaxed">{meal.desc}</p>

                <div className="grid grid-cols-4 gap-3 mt-8 p-5 rounded-2xl glass">
                  <div className="text-center">
                    <div className="inline-flex items-center gap-1 font-display text-xl font-semibold">
                      <Flame className="w-4 h-4 text-accent" />{meal.kcal}
                    </div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">kcal</div>
                  </div>
                  <div className="text-center">
                    <div className="font-display text-xl font-semibold">{meal.protein}g</div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">Protein</div>
                  </div>
                  <div className="text-center">
                    <div className="font-display text-xl font-semibold">{meal.carbs}g</div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">Carbs</div>
                  </div>
                  <div className="text-center">
                    <div className="font-display text-xl font-semibold">{meal.fat}g</div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">Fat</div>
                  </div>
                </div>

                <div className="mt-8">
                  <div className="text-sm font-medium mb-3">What's inside</div>
                  <ul className="grid grid-cols-2 gap-2">
                    {meal.ingredients.map((ing: string) => (
                      <li key={ing} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="w-5 h-5 rounded-full bg-primary/10 text-primary grid place-items-center"><Check className="w-3 h-3" /></span>
                        {ing}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-10 flex items-center gap-4 p-5 rounded-2xl bg-card shadow-soft">
                  <div>
                    <div className="text-xs text-muted-foreground">Price</div>
                    <div className="font-display text-3xl font-semibold">₹{meal.price}</div>
                  </div>
                  <Button onClick={handleAdd} size="lg" className="ml-auto rounded-full h-12 px-6 bg-primary hover:bg-primary-glow gap-2">
                    <Plus className="w-4 h-4" /> Add to tray
                  </Button>
                </div>
              </div>
            </Reveal>
          </div>

          {related.length > 0 && (
            <div className="mt-24">
              <h2 className="font-display text-3xl md:text-4xl font-semibold mb-8">You may also like</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {related.map((m) => (
                  <Link key={m.slug} to={`/meals/${m.slug}`} className="block bg-card rounded-3xl overflow-hidden shadow-soft lift group">
                    <div className="relative aspect-[4/3] overflow-hidden image-zoom-wrap">
                      <img src={images[0]} alt={m.name} className="w-full h-full object-cover image-zoom" />
                    </div>
                    <div className="p-5">
                      <h3 className="font-display text-lg font-semibold">{m.name}</h3>
                      <div className="font-display text-xl font-semibold mt-2">₹{m.price}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </PageLayout>
  );
};

export default MealDetail;

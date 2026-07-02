import { ArrowUpRight, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Reveal } from "./Reveal";
import { mealApi } from "@/lib/api/mealApi";
import type { MealCategory } from "@/lib/api/types";
import shots from "@/assets/cat-shots.jpg";
import breakfast from "@/assets/cat-breakfast.jpg";
import lunch from "@/assets/cat-lunch.jpg";
import dinner from "@/assets/cat-dinner.jpg";

const catImages: Record<string, string> = {
  shots, breakfast, lunch, dinner,
};

export const Categories = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => mealApi.getCategories(),
  });

  const categories: MealCategory[] = data?.categories ?? [];

  return (
    <section id="meals" className="py-16 md:py-24">
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <Reveal>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-accent font-medium mb-3">Daily rituals</p>
              <h2 className="font-display text-4xl md:text-6xl font-semibold leading-[1.05] max-w-2xl">
                A meal for every <span className="italic text-gold text-accent-glow">moment</span> of your day.
              </h2>
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="text-muted-foreground max-w-sm">
              From dawn shots to candle-lit dinners — every plate is portioned, profiled, and full of intention.
            </p>
          </Reveal>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {categories.map((c, i) => (
              <Reveal key={c.slug} delay={i * 0.1}>
                <Link
                  to={`/categories/${c.slug}`}
                  className="group relative block aspect-[4/5] rounded-3xl overflow-hidden image-zoom-wrap shadow-soft lift"
                >
                  <img
                    src={catImages[c.slug] || breakfast}
                    alt={c.title}
                    width={896}
                    height={1152}
                    loading="lazy"
                    className="absolute inset-0 w-full h-full object-cover image-zoom"
                  />
                  <div className="absolute inset-0 bg-gradient-overlay" />
                  <div className="absolute top-5 left-5 glass-dark text-primary-foreground text-[10px] uppercase tracking-widest px-3 py-1 rounded-full">
                    {c.time}
                  </div>
                  <div className="absolute top-5 right-5 w-10 h-10 grid place-items-center rounded-full glass-dark text-primary-foreground group-hover:bg-accent group-hover:text-accent-foreground transition-all">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-primary-foreground">
                    <div className="text-xs opacity-80">{c.desc}</div>
                    <div className="font-display text-2xl md:text-3xl font-semibold mt-1">{c.title}</div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

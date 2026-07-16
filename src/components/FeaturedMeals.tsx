import { useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, Flame, ArrowRight, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Reveal } from "./Reveal";
import { Button } from "@/components/ui/button";
import { mealApi } from "@/lib/api/mealApi";
import type { Meal } from "@/lib/api/types";
import m1 from "@/assets/meal-1.jpg";
import m2 from "@/assets/meal-2.jpg";
import m3 from "@/assets/meal-3.jpg";
import m4 from "@/assets/meal-4.jpg";
import m5 from "@/assets/meal-5.jpg";
import m6 from "@/assets/meal-6.jpg";

const images = [m1, m2, m3, m4, m5, m6];

export const FeaturedMeals = () => {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: number) => ref.current?.scrollBy({ left: dir * 360, behavior: "smooth" });
  
  const { data, isLoading } = useQuery({
    queryKey: ["meals"],
    queryFn: () => mealApi.getAll(),
  });

  const featured: Meal[] = (data?.meals ?? []).slice(0, 6);

  return (
    <section className="py-14 md:py-20 overflow-hidden">
      <div className="container">
        <div className="flex items-end justify-between gap-6 mb-12">
          <Reveal>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-accent font-medium mb-3">Featured this week</p>
              <h2 className="font-display text-4xl md:text-5xl font-semibold max-w-xl leading-tight">
                Chef-crafted, nutritionist-approved.
              </h2>
            </div>
          </Reveal>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" className="rounded-full hidden sm:inline-flex">
              <Link to="/meals">View all <ArrowRight className="w-4 h-4 ml-1" /></Link>
            </Button>
            <button onClick={() => scroll(-1)} className="hidden md:grid w-12 h-12 rounded-full glass place-items-center hover:bg-secondary transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => scroll(1)} className="hidden md:grid w-12 h-12 rounded-full glass place-items-center hover:bg-secondary transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="container">
        {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      ) : (
          <div ref={ref} className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {featured.map((m, i) => (
            <Reveal key={m.slug} delay={i * 0.05}>
              <Link
                to={`/meals/${m.slug}`}
                className="snap-start shrink-0 w-[320px] sm:w-[340px] bg-card rounded-3xl overflow-hidden shadow-soft lift group block"
              >
                <div className="relative aspect-square overflow-hidden image-zoom-wrap">
                  <img src={images[i % images.length]} alt={m.name} loading="lazy" width={1024} height={1024} className="w-full h-full object-cover image-zoom" />
                  <div className="absolute top-4 left-4 glass text-xs font-medium px-3 py-1 rounded-full">{m.tag}</div>
                  <div className="absolute top-4 right-4 glass text-xs font-medium px-3 py-1 rounded-full inline-flex items-center gap-1">
                    <Flame className="w-3 h-3 text-accent" />
                    {m.kcal} kcal
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-display text-xl font-semibold leading-tight">{m.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">Delivery included</p>
                  <div className="flex items-center justify-between mt-5">
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
          <div className="shrink-0 w-4" />
        </div>
        )}
      </div>
    </section>
  );
};

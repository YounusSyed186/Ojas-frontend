import { Calendar, Star, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Reveal } from "./Reveal";
import { Button } from "@/components/ui/button";
import { doctorApi } from "@/lib/api/doctorApi";
import type { Doctor } from "@/lib/api/types";
import doc1 from "@/assets/doc-1.jpg";
import doc2 from "@/assets/doc-2.jpg";
import doc3 from "@/assets/doc-3.jpg";

const imageMap: Record<string, string> = {
  "aarti-mehta": doc1,
  "rohan-iyer": doc2,
  "priya-nair": doc3,
};

export const Doctors = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["doctors"],
    queryFn: () => doctorApi.getAll(),
  });

  const doctors: Doctor[] = data?.doctors ?? [];

  return (
    <section id="experts" className="py-16 md:py-24">
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
          <Reveal>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-accent font-medium mb-3">Doctors & nutritionists</p>
              <h2 className="font-display text-4xl md:text-6xl font-semibold leading-[1.05] max-w-2xl">
                Real experts. <span className="italic text-gold text-accent-glow">Real care.</span>
              </h2>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="text-muted-foreground max-w-sm">
              Book a 30-minute consult. Walk away with a plan that's yours alone.
            </p>
          </Reveal>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((d, i) => (
              <Reveal key={d.slug} delay={i * 0.1}>
                <Link to={`/experts/${d.slug}`} className="block group bg-card rounded-3xl overflow-hidden shadow-soft lift">
                  <div className="relative aspect-[4/5] overflow-hidden image-zoom-wrap">
                    <img src={imageMap[d.slug] || doc1} alt={d.name} loading="lazy" width={896} height={1152} className="w-full h-full object-cover image-zoom" />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-transparent to-transparent" />
                    <div className="absolute top-4 right-4 glass-dark text-primary-foreground text-xs px-3 py-1 rounded-full inline-flex items-center gap-1">
                      <Star className="w-3 h-3 fill-accent text-accent" /> {d.rating}
                    </div>
                    <div className="absolute bottom-5 left-5 right-5 text-primary-foreground">
                      <div className="text-xs opacity-80 uppercase tracking-widest">{d.spec}</div>
                      <div className="font-display text-2xl font-semibold mt-1">{d.name}</div>
                    </div>
                  </div>
                  <div className="p-5 flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">{d.exp} experience</div>
                    <Button asChild size="sm" className="rounded-full bg-primary hover:bg-primary-glow gap-1.5">
                      <span><Calendar className="w-3.5 h-3.5" /> Book</span>
                    </Button>
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

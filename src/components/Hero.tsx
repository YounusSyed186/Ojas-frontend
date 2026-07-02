import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import heroBreakfast from "@/assets/hero-breakfast.jpg";
import heroLunch from "@/assets/hero-lunch.jpg";
import heroWellness from "@/assets/hero-wellness.jpg";
import heroShots from "@/assets/hero-shots.jpg";

type Slide = {
  img: string;
  alt: string;
  eyebrow: string;
  title: string;
  highlight: string;
  subtitle: string;
};

const SLIDES: Slide[] = [
  {
    img: heroBreakfast,
    alt: "Premium balanced breakfast bowl with berries, granola and seeds in soft natural light",
    eyebrow: "Personalised wellness",
    title: "Nutrition that understands your lifestyle.",
    highlight: "lifestyle",
    subtitle: "Personalised wellness guidance designed for balanced modern living.",
  },
  {
    img: heroLunch,
    alt: "Friendly nutritionist consulting with a client over fresh fruit and a notebook",
    eyebrow: "Expert guided",
    title: "Guided by experts. Designed for better living.",
    highlight: "living",
    subtitle: "Authentic nutrition consultation focused on sustainable health and wellness.",
  },
  {
    img: heroWellness,
    alt: "Woman walking peacefully on a sunlit park path in soft golden morning light",
    eyebrow: "Everyday rituals",
    title: "Every step toward better wellness.",
    highlight: "wellness",
    subtitle: "Helping individuals build healthier routines with practical nutrition support.",
  },
  {
    img: heroShots,
    alt: "Nutritionist arranging fresh seasonal vegetables and a meal-planning notebook",
    eyebrow: "Real, sustainable wellness",
    title: "Real nutrition for real life.",
    highlight: "life",
    subtitle: "Wellness solutions tailored for everyday lifestyles and long-term balance.",
  },
];

const AUTOPLAY_MS = 5800;

export const Hero = () => {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % SLIDES.length), AUTOPLAY_MS);
    return () => clearInterval(t);
  }, []);

  const slide = SLIDES[idx];

  const renderTitle = (title: string, highlight: string) => {
    const idx = title.toLowerCase().indexOf(highlight.toLowerCase());
    if (idx === -1) return title;
    const before = title.slice(0, idx);
    const match = title.slice(idx, idx + highlight.length);
    const after = title.slice(idx + highlight.length);
    return (
      <>
        {before}
        <span className="text-[hsl(140_38%_55%)]">{match}</span>
        {after}
      </>
    );
  };

  return (
    <section className="relative min-h-[100svh] flex items-center pt-28 pb-16 overflow-hidden">
      {/* Slide background (cross-fade) */}
      <div className="absolute inset-0 -z-10">
        <AnimatePresence mode="sync">
          <motion.img
            key={slide.img}
            src={slide.img}
            alt={slide.alt}
            width={1920}
            height={1280}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ opacity: { duration: 1.6, ease: [0.4, 0, 0.2, 1] }, scale: { duration: 9, ease: "linear" } }}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </AnimatePresence>
        {/* Cinematic depth: left side of the image is softly blurred, right side stays sharp */}
        <AnimatePresence mode="sync">
          <motion.img
            key={slide.img + "-blur"}
            src={slide.img}
            alt=""
            aria-hidden="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.6, ease: [0.4, 0, 0.2, 1] }}
            className="absolute inset-0 w-full h-full object-cover blur-2xl scale-110 [mask-image:linear-gradient(to_right,black_0%,black_30%,transparent_75%)]"
          />
        </AnimatePresence>
        {/* Subtle light wash on the left for text legibility — keeps image edge-to-edge */}
        <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-background/25 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/30 via-transparent to-transparent" />
      </div>

      <div className="container relative">
        <div className="max-w-3xl">
          {/* Animated content (eyebrow + headline + subtitle only) */}
          <AnimatePresence mode="wait">
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs font-medium text-black mb-6 shadow-[0_2px_12px_rgba(0,0,0,0.08)]">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span className="text-black uppercase tracking-[0.18em] font-semibold">{slide.eyebrow}</span>
              </div>

              <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-semibold leading-[1.02] tracking-tight text-black">
                {renderTitle(slide.title, slide.highlight)}
              </h1>

              <p className="mt-6 max-w-xl text-lg md:text-xl text-black/80 font-medium leading-relaxed">
                {slide.subtitle}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Fixed CTA structure — does not animate between slides */}
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Button asChild size="lg" className="rounded-full h-14 px-8 bg-primary hover:bg-primary-glow shadow-elegant text-base group">
              <Link to="/meals">
                Explore Meals
                <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full h-14 px-8 glass border-foreground/20 hover:bg-secondary text-base">
              <Link to="/builder">Get nutrition plan</Link>
            </Button>
          </div>

          <div className="mt-12 flex items-center gap-6 text-xs uppercase tracking-[0.2em] text-black font-semibold">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-gradient-to-br from-primary to-primary-glow shadow-[0_1px_6px_rgba(0,0,0,0.15)]" />
              ))}
            </div>
            <span>Trusted by 10,000+ people</span>
          </div>
        </div>

        {/* Slide indicators */}
        <div className="absolute bottom-6 left-0 right-0 px-[inherit] flex items-center justify-center gap-2.5 z-10">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              aria-label={`Go to slide ${i + 1}`}
              className="group relative h-1.5 w-10 overflow-hidden rounded-full bg-primary/20 backdrop-blur-sm"
            >
              <span
                className={`absolute inset-y-0 left-0 bg-primary transition-all duration-700 ${
                  i === idx ? "w-full" : "w-0 group-hover:w-1/3"
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

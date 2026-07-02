import { Link } from "react-router-dom";
import { Leaf, HeartHandshake, Sparkles } from "lucide-react";
import { PageLayout } from "@/components/PageLayout";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/ui/button";
import lifestyle from "@/assets/lifestyle.jpg";

const values = [
  { icon: Leaf, title: "Real food, always", desc: "Whole ingredients, sourced near and cooked daily — never frozen, never reheated trays." },
  { icon: HeartHandshake, title: "Doctor-led care", desc: "Our menus are reviewed by clinicians, not marketers. Health is the brief, not the byline." },
  { icon: Sparkles, title: "Quietly premium", desc: "Calm packaging, on-time delivery, kind service. The details that don't shout — but stay." },
];

const AboutPage = () => (
  <PageLayout title="About — OJAS" description="OJAS is a health-tech kitchen blending real food, clinical nutrition and curated subscription wellness plans into one calm experience.">
    <PageHero
      eyebrow="Our story"
      title={<>Food as <span className="italic text-gold text-accent-glow">medicine</span>, made beautifully.</>}
      subtitle="OJAS began in a small Bengaluru kitchen with a stubborn idea: that healthy eating should feel like a treat, not a treatment."
      crumbs={[{ label: "Home", to: "/" }, { label: "About" }]}
    />

    <section className="pb-24">
      <div className="container">
        <div className="relative aspect-[21/9] rounded-[2rem] overflow-hidden mb-20 shadow-elegant">
          <img src={lifestyle} alt="OJAS lifestyle" className="absolute inset-0 w-full h-full object-cover" />
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {values.map((v, i) => (
            <Reveal key={v.title} delay={i * 0.1}>
              <div className="p-8 rounded-3xl glass shadow-soft h-full">
                <span className="grid place-items-center w-12 h-12 rounded-2xl bg-gradient-primary text-primary-foreground mb-5">
                  <v.icon className="w-5 h-5" />
                </span>
                <h3 className="font-display text-2xl font-semibold">{v.title}</h3>
                <p className="text-muted-foreground mt-3 leading-relaxed">{v.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-20 p-10 md:p-14 rounded-[2rem] bg-primary text-primary-foreground text-center shadow-elegant">
          <h2 className="font-display text-4xl md:text-5xl font-semibold leading-tight">Eat well. Live calmly.</h2>
          <p className="opacity-80 mt-5 max-w-xl mx-auto">Begin with a single tray, or build a programme around your goals.</p>
          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            <Button asChild size="lg" className="rounded-full h-12 px-8 bg-accent text-accent-foreground hover:bg-accent-glow">
              <Link to="/meals">Browse meals</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full h-12 px-8 bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
              <Link to="/builder">Build your tray</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  </PageLayout>
);

export default AboutPage;

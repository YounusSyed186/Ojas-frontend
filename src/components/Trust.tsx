import { Reveal } from "./Reveal";

const stats = [
  { value: "10,000+", label: "Meals delivered" },
  { value: "500+", label: "Happy clients" },
  { value: "25+", label: "Expert nutritionists" },
  { value: "4.9★", label: "Average rating" },
];

export const Trust = () => (
  <section className="py-14 md:py-20">
    <div className="container">
      <Reveal>
        <p className="text-center text-xs uppercase tracking-[0.3em] text-muted-foreground mb-12">
          Trusted by a community that cares
        </p>
      </Reveal>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border rounded-3xl overflow-hidden shadow-soft">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.1}>
            <div className="bg-card p-8 md:p-10 text-center h-full">
              <div className="font-display text-4xl md:text-5xl font-semibold text-primary">{s.value}</div>
              <div className="mt-2 text-sm text-muted-foreground">{s.label}</div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

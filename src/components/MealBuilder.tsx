import { useState } from "react";
import { Check, Heart, Flame, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Reveal } from "./Reveal";
import { Button } from "@/components/ui/button";
import ingredients from "@/assets/ingredients.jpg";

const goals = [
  { id: "weight", label: "Weight loss", icon: Flame },
  { id: "diabetes", label: "Diabetes care", icon: Heart },
  { id: "fitness", label: "Fitness & muscle", icon: Activity },
];
const calories = ["1200", "1500", "1800", "2100"];
const prefs = ["Vegetarian", "Vegan", "High protein", "Low carb", "Gluten-free"];
const ages = ["15-24", "25-34", "35-44", "45-54", "55+"];

const goalMacroRatios: Record<string, { protein: number; carbs: number; fat: number }> = {
  weight: { protein: 0.3, carbs: 0.4, fat: 0.3 },
  diabetes: { protein: 0.25, carbs: 0.35, fat: 0.4 },
  fitness: { protein: 0.3, carbs: 0.45, fat: 0.25 },
};

const getMacroPreview = (calories: string, goal: string, preferences: string[]) => {
  const totalCalories = Number.parseInt(calories, 10) || 0;
  const ratios = { ...(goalMacroRatios[goal] ?? goalMacroRatios.fitness) };

  if (preferences.includes("High protein")) {
    ratios.protein += 0.05;
    ratios.carbs -= 0.05;
  }

  if (preferences.includes("Low carb")) {
    ratios.protein += 0.05;
    ratios.carbs -= 0.1;
    ratios.fat += 0.05;
  }

  return {
    protein: Math.round((totalCalories * ratios.protein) / 4),
    carbs: Math.round((totalCalories * ratios.carbs) / 4),
    fat: Math.round((totalCalories * ratios.fat) / 9),
  };
};
export const MealBuilder = () => {
  const navigate = useNavigate();
  const [goal, setGoal] = useState("fitness");
  const [kcal, setKcal] = useState("1800");
  const [pref, setPref] = useState<string[]>(["High protein"]);
  const [age, setAge] = useState("25-34");

  const macros = getMacroPreview(kcal, goal, pref);

  const toggle = (p: string) =>
    setPref((s) => (s.includes(p) ? s.filter((x) => x !== p) : [...s, p]));

  const build = () => {
    const params = new URLSearchParams({ goal, kcal, pref: pref.join(","), age });
    navigate(`/builder/result?${params.toString()}`);
  };

  return (
    <section id="builder" className="py-16 md:py-24">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <Reveal>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-accent font-medium mb-3">Custom meal builder</p>
              <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold leading-[1.05]">
                Built for <span className="italic text-gold text-accent-glow">your</span> body, your goals.
              </h2>
              <p className="text-muted-foreground mt-5 text-lg max-w-md">
                Three quick choices and our nutritionists assemble a tray that fits like it was made for you — because it was.
              </p>

              <div className="mt-10 space-y-7">
                <div>
                  <div className="text-sm font-medium mb-3">01 · Choose your goal</div>
                  <div className="flex flex-wrap gap-2">
                    {goals.map(({ id, label, icon: Icon }) => (
                      <button
                        key={id}
                        onClick={() => setGoal(id)}
                        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm border transition-all ${
                          goal === id
                            ? "bg-primary text-primary-foreground border-primary shadow-soft"
                            : "glass border-border hover:border-primary/40"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium mb-3">02 · Daily calories</div>
                  <div className="flex flex-wrap gap-2">
                    {calories.map((c) => (
                      <button
                        key={c}
                        onClick={() => setKcal(c)}
                        className={`px-5 py-2.5 rounded-full text-sm border transition-all ${
                          kcal === c
                            ? "bg-primary text-primary-foreground border-primary"
                            : "glass border-border hover:border-primary/40"
                        }`}
                      >
                        {c} kcal
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium mb-3">03 · Preferences</div>
                  <div className="flex flex-wrap gap-2">
                    {prefs.map((p) => (
                      <button
                        key={p}
                        onClick={() => toggle(p)}
                        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm border transition-all ${
                          pref.includes(p)
                            ? "bg-accent/15 text-foreground border-accent"
                            : "glass border-border hover:border-accent/40"
                        }`}
                      >
                        {pref.includes(p) && <Check className="w-3.5 h-3.5" />}
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium mb-3">04 · Age</div>
                  <div className="flex flex-wrap gap-2">
                    {ages.map((a) => (
                      <button
                        key={a}
                        onClick={() => setAge(a)}
                        className={`px-5 py-2.5 rounded-full text-sm border transition-all ${
                          age === a
                            ? "bg-primary text-primary-foreground border-primary"
                            : "glass border-border hover:border-primary/40"
                        }`}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <Button onClick={build} size="lg" className="rounded-full h-14 px-8 bg-primary hover:bg-primary-glow shadow-elegant mt-10">
                Build my tray →
              </Button>
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <div className="relative">
              <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden shadow-elegant image-zoom-wrap">
                <img src={ingredients} alt="Fresh ingredients" loading="lazy" width={1536} height={1024} className="w-full h-full object-cover image-zoom" />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/40 via-transparent to-transparent" />
              </div>
              <div className="absolute -bottom-6 -left-6 glass rounded-3xl p-6 max-w-[260px] shadow-soft">
                <div className="text-xs uppercase tracking-widest text-muted-foreground">Live preview</div>
                <div className="font-display text-2xl mt-1">{kcal} kcal tray</div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {pref.slice(0, 3).map((p) => (
                    <span key={p} className="text-[10px] px-2 py-0.5 rounded-full bg-accent/15 text-foreground border border-accent/30">
                      {p}
                    </span>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-foreground/10 text-center">
                  <div><div className="font-semibold text-sm">{macros.protein}g</div><div className="text-[10px] text-muted-foreground">Protein</div></div>
                  <div><div className="font-semibold text-sm">{macros.carbs}g</div><div className="text-[10px] text-muted-foreground">Carbs</div></div>
                  <div><div className="font-semibold text-sm">{macros.fat}g</div><div className="text-[10px] text-muted-foreground">Fat</div></div>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 glass rounded-2xl px-4 py-3 shadow-soft animate-float">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Goal</div>
                <div className="font-medium capitalize">{goals.find(g=>g.id===goal)?.label}</div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};

import { PageLayout } from "@/components/PageLayout";
import { MealBuilder } from "@/components/MealBuilder";
import { PageHero } from "@/components/PageHero";

const BuilderPage = () => (
  <PageLayout title="Custom Meal Builder — OJAS" description="Design a meal tray around your goals, calorie target and preferences in three quick steps.">
    <PageHero
      eyebrow="Custom meal builder"
      title={<>Designed around <span className="italic text-gold text-accent-glow">you</span>.</>}
      subtitle="Three quick choices and our nutritionists assemble a tray that fits like it was made for you — because it was."
      crumbs={[{ label: "Home", to: "/" }, { label: "Builder" }]}
    />
    <MealBuilder />
  </PageLayout>
);

export default BuilderPage;

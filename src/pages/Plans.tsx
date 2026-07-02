import { PageLayout } from "@/components/PageLayout";
import { Plans as PlansSection } from "@/components/Plans";
import { PageHero } from "@/components/PageHero";

const PlansPage = () => (
  <PageLayout title="Plans — OJAS" description="Honest, flexible plans for every kind of life — day pass, weekly, or fully personal monthly programmes.">
    <PageHero
      eyebrow="Subscription plans"
      title={<>Plans that fit <span className="italic text-gold text-accent-glow">your week</span>.</>}
      subtitle="Pause, swap, or cancel any time. No hidden fees, no awkward emails."
      crumbs={[{ label: "Home", to: "/" }, { label: "Plans" }]}
    />
    <PlansSection />
  </PageLayout>
);

export default PlansPage;

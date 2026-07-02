import { PageLayout } from "@/components/PageLayout";
import { PageHero } from "@/components/PageHero";
import { Doctors as DoctorsSection } from "@/components/Doctors";

const ExpertsPage = () => (
  <PageLayout title="Experts — OJAS" description="Meet the OJAS panel — clinical nutritionists, diabetologists and sports dietitians ready to consult.">
    <PageHero
      eyebrow="The OJAS panel"
      title={<>Doctors who <span className="italic text-gold text-accent-glow">listen</span>.</>}
      subtitle="Every consult is 30 calm minutes — no rush, no jargon. Just a plan that fits your real life."
      crumbs={[{ label: "Home", to: "/" }, { label: "Experts" }]}
    />
    <DoctorsSection />
  </PageLayout>
);

export default ExpertsPage;

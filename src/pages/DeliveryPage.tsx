import { PageLayout } from "@/components/PageLayout";
import { Delivery } from "@/components/Delivery";
import { PageHero } from "@/components/PageHero";

const DeliveryPage = () => (
  <PageLayout title="Delivery — OJAS" description="Scheduled, daily delivery for our subscription wellness plans. Check serviceability for your area.">
    <PageHero
      eyebrow="Subscription delivery"
      title={<>Your daily <span className="italic text-gold text-accent-glow">health routine</span>, on schedule.</>}
      subtitle="Curated meal programs delivered fresh at your fixed daily slot. Check if your area is in our service zone."
      crumbs={[{ label: "Home", to: "/" }, { label: "Delivery" }]}
    />
    <Delivery />
  </PageLayout>
);

export default DeliveryPage;

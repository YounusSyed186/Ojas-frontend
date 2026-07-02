import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { Trust } from "@/components/Trust";
import { Categories } from "@/components/Categories";
import { FeaturedMeals } from "@/components/FeaturedMeals";
import { MealBuilder } from "@/components/MealBuilder";
import { Plans } from "@/components/Plans";
import { SubscriptionBuilder } from "@/components/SubscriptionBuilder";
import { Doctors } from "@/components/Doctors";
import { Delivery } from "@/components/Delivery";
import { Footer } from "@/components/Footer";
import { NutritionistFAB } from "@/components/NutritionistFAB";
import { useEffect } from "react";

const Index = () => {
  useEffect(() => {
    document.title = "OJAS — Eat Smart. Live Better.";
    const desc = "Personalised healthy meals delivered fresh, with expert nutrition plans and doctor consultations. Crafted by experts at OJAS.";
    let m = document.querySelector('meta[name="description"]');
    if (!m) { m = document.createElement("meta"); m.setAttribute("name", "description"); document.head.appendChild(m); }
    m.setAttribute("content", desc);
  }, []);

  return (
    <main className="relative overflow-x-hidden">
      <Navbar />
      <Hero />
      <Categories />
      <FeaturedMeals />
      <MealBuilder />
      <Plans />
      <SubscriptionBuilder />
      <Doctors />
      <Trust />
      <Delivery />
      <Footer />
      <NutritionistFAB />
    </main>
  );
};

export default Index;

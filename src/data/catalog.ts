import shots from "@/assets/cat-shots.jpg";
import breakfast from "@/assets/cat-breakfast.jpg";
import lunch from "@/assets/cat-lunch.jpg";
import dinner from "@/assets/cat-dinner.jpg";
import doc1 from "@/assets/doc-1.jpg";
import doc2 from "@/assets/doc-2.jpg";
import doc3 from "@/assets/doc-3.jpg";
import m1 from "@/assets/meal-1.jpg";
import m2 from "@/assets/meal-2.jpg";
import m3 from "@/assets/meal-3.jpg";
import m4 from "@/assets/meal-4.jpg";
import m5 from "@/assets/meal-5.jpg";
import m6 from "@/assets/meal-6.jpg";

export type Meal = {
  slug: string;
  name: string;
  tag: string;
  kcal: number;
  price: number;
  img: string;
  protein: number;
  carbs: number;
  fat: number;
  desc: string;
  ingredients: string[];
  category: string; // category slug
};

export const meals: Meal[] = [
  { slug: "harvest-buddha-bowl", name: "Harvest Buddha Bowl", tag: "High Protein", kcal: 480, price: 349, img: m1, protein: 32, carbs: 48, fat: 18, desc: "Roasted seasonal vegetables, quinoa, chickpeas and tahini dressing.", ingredients: ["Quinoa", "Chickpeas", "Roasted pumpkin", "Kale", "Tahini"], category: "lunch" },
  { slug: "grilled-salmon-asparagus", name: "Grilled Salmon & Asparagus", tag: "Omega-3", kcal: 520, price: 449, img: m2, protein: 38, carbs: 22, fat: 28, desc: "Atlantic salmon, charred asparagus and lemon-herb butter.", ingredients: ["Salmon fillet", "Asparagus", "Lemon", "Olive oil", "Dill"], category: "dinner" },
  { slug: "berry-protein-parfait", name: "Berry Protein Parfait", tag: "Breakfast", kcal: 310, price: 249, img: m3, protein: 22, carbs: 38, fat: 8, desc: "Greek yogurt layered with mixed berries, chia and toasted granola.", ingredients: ["Greek yogurt", "Berries", "Chia", "Granola", "Honey"], category: "breakfast" },
  { slug: "avocado-sourdough", name: "Avocado Sourdough", tag: "Energy", kcal: 380, price: 299, img: m4, protein: 14, carbs: 42, fat: 18, desc: "Stone-milled sourdough, smashed avocado, poached egg and chilli oil.", ingredients: ["Sourdough", "Avocado", "Egg", "Chilli oil", "Microgreens"], category: "breakfast" },
  { slug: "caesar-power-bowl", name: "Caesar Power Bowl", tag: "Lean", kcal: 450, price: 369, img: m5, protein: 36, carbs: 28, fat: 20, desc: "Grilled chicken, baby gem, parmesan crisps and yogurt caesar.", ingredients: ["Chicken", "Baby gem", "Parmesan", "Croutons", "Yogurt caesar"], category: "lunch" },
  { slug: "matcha-smoothie-bowl", name: "Matcha Smoothie Bowl", tag: "Detox", kcal: 290, price: 269, img: m6, protein: 12, carbs: 44, fat: 6, desc: "Ceremonial matcha, banana, spinach and coconut topped with seeds.", ingredients: ["Matcha", "Banana", "Spinach", "Coconut milk", "Seeds"], category: "shots" },
  { slug: "turmeric-ginger-shot", name: "Turmeric Ginger Shot", tag: "Immunity", kcal: 60, price: 99, img: m3, protein: 1, carbs: 12, fat: 0, desc: "Cold-pressed turmeric, ginger, lemon and a hint of black pepper.", ingredients: ["Turmeric", "Ginger", "Lemon", "Black pepper"], category: "shots" },
  { slug: "miso-glazed-tofu", name: "Miso Glazed Tofu", tag: "Plant-based", kcal: 420, price: 339, img: m1, protein: 24, carbs: 38, fat: 16, desc: "Silken tofu lacquered in white miso with brown rice and bok choy.", ingredients: ["Tofu", "Miso", "Brown rice", "Bok choy", "Sesame"], category: "dinner" },
  { slug: "overnight-oats-cocoa", name: "Cocoa Overnight Oats", tag: "Breakfast", kcal: 340, price: 219, img: m4, protein: 16, carbs: 46, fat: 9, desc: "Rolled oats steeped with cocoa, almond milk and banana.", ingredients: ["Oats", "Cocoa", "Almond milk", "Banana", "Almonds"], category: "breakfast" },
  { slug: "thai-chicken-bowl", name: "Thai Basil Chicken Bowl", tag: "High Protein", kcal: 510, price: 389, img: m5, protein: 40, carbs: 44, fat: 18, desc: "Wok-tossed chicken with thai basil, jasmine rice and lime.", ingredients: ["Chicken", "Thai basil", "Jasmine rice", "Lime", "Chilli"], category: "lunch" },
  { slug: "zucchini-pesto-pasta", name: "Zucchini Pesto Pasta", tag: "Light", kcal: 410, price: 319, img: m2, protein: 16, carbs: 52, fat: 16, desc: "Zucchini ribbons, whole wheat pasta and basil-walnut pesto.", ingredients: ["Pasta", "Zucchini", "Basil", "Walnut", "Parmesan"], category: "dinner" },
  { slug: "beet-apple-shot", name: "Beet & Apple Shot", tag: "Energy", kcal: 70, price: 99, img: m6, protein: 1, carbs: 16, fat: 0, desc: "Cold-pressed beet, apple and a touch of ginger for a clean lift.", ingredients: ["Beet", "Apple", "Ginger", "Lemon"], category: "shots" },
];

export type Category = {
  slug: string;
  title: string;
  desc: string;
  img: string;
  time: string;
  intro: string;
};

export const categories: Category[] = [
  { slug: "shots", title: "Early Morning Shots", desc: "Cold-pressed wellness", img: shots, time: "6 – 8 AM", intro: "Tiny bottles, big intent. Cold-pressed at dawn to wake your system, gently." },
  { slug: "breakfast", title: "Breakfast", desc: "Slow-burning energy", img: breakfast, time: "8 – 10 AM", intro: "Plates engineered for steady energy — protein-forward, fibre-rich, never heavy." },
  { slug: "lunch", title: "Lunch", desc: "Balanced & satisfying", img: lunch, time: "12 – 2 PM", intro: "A proper midday reset. Balanced macros, vivid flavour, zero post-meal slump." },
  { slug: "dinner", title: "Dinner", desc: "Light & restorative", img: dinner, time: "7 – 9 PM", intro: "Light, warming, easy on digestion — designed to help you wind down well." },
];

export const mealsByCategory = (slug: string) => meals.filter((m) => m.category === slug);
export const mealBySlug = (slug: string) => meals.find((m) => m.slug === slug);
export const categoryBySlug = (slug: string) => categories.find((c) => c.slug === slug);

export type Doctor = {
  slug: string;
  name: string;
  spec: string;
  exp: string;
  rating: number;
  img: string;
  bio: string;
  focus: string[];
};

export const doctors: Doctor[] = [
  { slug: "aarti-mehta", name: "Dr. Aarti Mehta", spec: "Clinical Nutritionist", exp: "12 yrs", rating: 4.9, img: doc1, bio: "Aarti blends evidence-based nutrition with everyday Indian kitchens. Her plans are practical, sustainable, and always personal.", focus: ["Weight management", "PCOS", "Gut health"] },
  { slug: "rohan-iyer", name: "Dr. Rohan Iyer", spec: "Diabetologist", exp: "15 yrs", rating: 4.8, img: doc2, bio: "Rohan helps people reverse pre-diabetes and live well with diabetes through food-first protocols and gentle accountability.", focus: ["Type 2 diabetes", "Pre-diabetes", "Cardio-metabolic"] },
  { slug: "priya-nair", name: "Dr. Priya Nair", spec: "Sports Dietitian", exp: "9 yrs", rating: 4.9, img: doc3, bio: "Priya works with athletes and weekend warriors alike, building fueling strategies that respect both performance and recovery.", focus: ["Performance", "Muscle gain", "Recovery"] },
];

export const doctorBySlug = (slug: string) => doctors.find((d) => d.slug === slug);

export type Plan = {
  id: string;
  name: string;
  price: string;
  period: string;
  desc: string;
  features: string[];
  featured?: boolean;
  badge?: string;
  long: string;
};

export const plans: Plan[] = [
  { id: "day", name: "Day Pass", price: "₹399", period: "/ day", desc: "Try a full day of curated meals.", features: ["3 meals + 1 shot", "Free delivery", "Cancel anytime"], long: "A no-commitment way to taste what we're about. One day, every meal handled — including your morning shot." },
  { id: "weekly", name: "Weekly", price: "₹1,000", period: "/ week", desc: "Most popular — 7 days of nourishment.", features: ["21 meals + 7 shots", "Nutritionist check-in", "Flexible swaps", "Priority delivery"], featured: true, badge: "Most loved", long: "Seven days of fully managed eating. Swap meals on the fly, check in weekly with a nutritionist, skip days whenever life happens." },
  { id: "monthly", name: "Monthly", price: "Free", period: "consult", desc: "Personal plan — first month consult on us.", features: ["Custom meal plan", "1:1 doctor consult", "Health tracking", "Unlimited swaps"], long: "Your fully personalised programme. Built around blood markers, lifestyle and goals — with a doctor in your corner." },
];

export const planById = (id: string) => plans.find((p) => p.id === id);

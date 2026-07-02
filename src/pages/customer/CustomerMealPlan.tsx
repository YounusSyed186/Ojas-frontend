import { useQuery } from "@tanstack/react-query";
import { Loader2, Utensils } from "lucide-react";
import { CustomerLayout } from "@/components/customer/CustomerLayout";
import { customerDashboardApi } from "@/lib/api/customerDashboardApi";
import type { DashboardMeal } from "@/lib/api/types";

const formatDate = (value?: string) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

const groupByDate = (meals: DashboardMeal[]) => {
  const grouped: Record<string, DashboardMeal[]> = {};
  meals.forEach((meal) => {
    const key = meal.meal_date || "unknown";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(meal);
  });
  return grouped;
};

const CustomerMealPlan = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["customer-overview"],
    queryFn: () => customerDashboardApi.overview(),
  });

  if (isLoading) {
    return (
      <CustomerLayout title="Meal Plan" subtitle="Loading...">
        <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div>
      </CustomerLayout>
    );
  }

  const todayMeals: DashboardMeal[] = data?.today_meals ?? [];
  const upcomingMeals: DashboardMeal[] = data?.upcoming_meals ?? [];
  const groupedUpcoming = groupByDate(upcomingMeals);

  return (
    <CustomerLayout title="Meal Plan" subtitle="View your assigned meals and nutritional information.">
      <div className="space-y-8">
        {/* Today's Meals */}
        <section className="rounded-2xl bg-card shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Utensils className="w-5 h-5" /> Today's Meals
          </h2>
          {todayMeals.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {todayMeals.map((meal) => (
                <div key={meal.id} className="p-4 rounded-xl bg-secondary/30">
                  <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">{meal.meal_type}</div>
                  <div className="font-medium">{meal.meal_option?.title ?? "Meal planned"}</div>
                  {meal.meal_option?.calories && (
                    <div className="text-xs text-muted-foreground mt-2">{meal.meal_option.calories} kcal</div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No meals planned for today. Subscribe to a plan to get started.</p>
          )}
        </section>

        {/* Upcoming Meals by Day */}
        {Object.keys(groupedUpcoming).length > 0 && (
          <section className="rounded-2xl bg-card shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4">Upcoming Meals</h2>
            <div className="space-y-6">
              {Object.entries(groupedUpcoming).map(([date, meals]) => (
                <div key={date}>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">{formatDate(date)}</h3>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {meals.map((meal) => (
                      <div key={meal.id} className="p-3 rounded-xl bg-secondary/30">
                        <div className="text-xs uppercase tracking-widest text-muted-foreground">{meal.meal_type}</div>
                        <div className="font-medium text-sm mt-1">{meal.meal_option?.title ?? "Meal planned"}</div>
                        {meal.meal_option?.calories && (
                          <div className="text-xs text-muted-foreground mt-1">{meal.meal_option.calories} kcal</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {todayMeals.length === 0 && Object.keys(groupedUpcoming).length === 0 && (
          <div className="text-center py-16">
            <Utensils className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No meal plan available yet.</p>
            <p className="text-sm text-muted-foreground mt-1">Subscribe to a plan to see your meals here.</p>
          </div>
        )}
      </div>
    </CustomerLayout>
  );
};

export default CustomerMealPlan;
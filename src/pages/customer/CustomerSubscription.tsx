import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Loader2, Pause, Play, Trash2, RotateCcw, User, Utensils } from "lucide-react";
import { CustomerLayout } from "@/components/customer/CustomerLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { customerDashboardApi } from "@/lib/api/customerDashboardApi";
import { useToast } from "@/hooks/use-toast";
import { dashboardErrorMessage } from "@/lib/utils";

const statusClass = (status?: string) => {
  if (status === "active" || status === "paid") return "bg-green-100 text-green-700";
  if (status === "paused" || status === "pending") return "bg-yellow-100 text-yellow-700";
  if (status === "cancelled" || status === "failed") return "bg-red-100 text-red-700";
  return "bg-secondary text-secondary-foreground";
};

const formatDate = (value?: string) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

const CustomerSubscription = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: overviewData, isLoading } = useQuery({
    queryKey: ["customer-overview"],
    queryFn: () => customerDashboardApi.overview(),
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["customer-overview"] });

  const pauseSub = useMutation({
    mutationFn: (id: number) => customerDashboardApi.pauseSubscription(id),
    onSuccess: () => { toast({ title: "Subscription paused" }); refresh(); },
    onError: (error) => toast({ title: dashboardErrorMessage(error, "Could not pause subscription"), variant: "destructive" }),
  });
  const resumeSub = useMutation({
    mutationFn: (id: number) => customerDashboardApi.resumeSubscription(id),
    onSuccess: () => { toast({ title: "Subscription resumed" }); refresh(); },
    onError: (error) => toast({ title: dashboardErrorMessage(error, "Could not resume subscription"), variant: "destructive" }),
  });
  const cancelSub = useMutation({
    mutationFn: (id: number) => customerDashboardApi.cancelSubscription(id),
    onSuccess: () => { toast({ title: "Subscription cancelled" }); refresh(); },
    onError: (error) => toast({ title: dashboardErrorMessage(error, "Could not cancel subscription"), variant: "destructive" }),
  });

  if (isLoading) {
    return (
      <CustomerLayout title="My Subscription" subtitle="Loading...">
        <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div>
      </CustomerLayout>
    );
  }

  const sub = overviewData?.active_subscription;
  const busy = pauseSub.isPending || resumeSub.isPending || cancelSub.isPending;

  return (
    <CustomerLayout title="My Subscription" subtitle="View and manage your current subscription plan.">
      {sub ? (
        <div className="max-w-2xl space-y-6">
          <section className="rounded-2xl bg-card shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{sub.plan?.name ?? "Active Plan"}</h2>
              <Badge className={statusClass(sub.status)}>{sub.status}</Badge>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground block text-xs">Plan</span>
                <span className="font-medium">{sub.plan?.name ?? "Active Plan"}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Period</span>
                <span className="font-medium">{sub.period}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Price</span>
                <span className="font-medium">Rs. {Number(sub.price ?? 0).toLocaleString("en-IN")}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Delivery Pincode</span>
                <span className="font-medium">{sub.delivery_pincode}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Start Date</span>
                <span className="font-medium">{formatDate(sub.start_date)}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">End Date</span>
                <span className="font-medium">{formatDate(sub.end_date)}</span>
              </div>
            </div>

            {sub.doctor && (
              <div className="mt-4 pt-4 border-t flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Assigned Doctor:</span>
                <span className="font-medium">{sub.doctor.name}</span>
              </div>
            )}

            {sub.plan?.description && (
              <div className="mt-4 pt-4 border-t">
                <span className="text-muted-foreground block text-xs mb-1">Plan Description</span>
                <p className="text-sm">{sub.plan.description}</p>
              </div>
            )}

            <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t">
              {sub.status === "paused" ? (
                <Button disabled={busy} onClick={() => resumeSub.mutate(sub.id)}>
                  <Play className="w-4 h-4 mr-2" /> Resume Subscription
                </Button>
              ) : (
                <Button disabled={busy || sub.status !== "active"} onClick={() => pauseSub.mutate(sub.id)} variant="outline">
                  <Pause className="w-4 h-4 mr-2" /> Pause Subscription
                </Button>
              )}
              <Button asChild variant="outline">
                <Link to={`/subscribe?plan=${sub.subscription_plan_id}`}>
                  <RotateCcw className="w-4 h-4 mr-2" /> Renew / Change Plan
                </Link>
              </Button>
              <Button disabled={busy} onClick={() => window.confirm("Cancel this subscription? This action cannot be undone.") && cancelSub.mutate(sub.id)} variant="outline" className="text-red-500 border-red-200 hover:bg-red-50">
                <Trash2 className="w-4 h-4 mr-2" /> Cancel Subscription
              </Button>
            </div>
          </section>

          <section className="rounded-2xl bg-card shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Utensils className="w-4 h-4" /> Meal Preferences</h2>
            {sub.preferences && sub.preferences.length > 0 ? (
              <div className="space-y-2">
                {sub.preferences.map((pref: Record<string, unknown>, i: number) => {
                  const mealOption = pref.meal_option as { title?: string } | undefined;
                  return (
                    <div key={i} className="flex justify-between text-sm p-3 rounded-xl bg-secondary/30">
                      <span className="capitalize">{pref.meal_type as string}</span>
                      <span className="font-medium">{mealOption?.title ?? "Custom"}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No specific meal preferences saved.</p>
            )}
          </section>
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-muted-foreground mb-4">You don't have an active subscription.</p>
          <Button asChild><Link to="/plans">Browse Plans</Link></Button>
        </div>
      )}
    </CustomerLayout>
  );
};

export default CustomerSubscription;

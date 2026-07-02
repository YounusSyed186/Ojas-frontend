import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Loader2, Pause, Play, Trash2, CalendarDays, CreditCard, Utensils, User, MapPin, Settings } from "lucide-react";
import { CustomerLayout } from "@/components/customer/CustomerLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { customerDashboardApi } from "@/lib/api/customerDashboardApi";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { DashboardConsultation, DashboardMeal, DashboardPayment } from "@/lib/api/types";

const formatDate = (value?: string) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

const statusClass = (status?: string) => {
  if (status === "active" || status === "paid" || status === "completed") return "bg-green-100 text-green-700";
  if (status === "paused" || status === "pending") return "bg-yellow-100 text-yellow-700";
  if (status === "cancelled" || status === "failed" || status === "suspended") return "bg-red-100 text-red-700";
  return "bg-secondary text-secondary-foreground";
};

const CustomerOverview = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["customer-overview"],
    queryFn: () => customerDashboardApi.overview(),
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["customer-overview"] });

  const pauseSub = useMutation({
    mutationFn: (id: number) => customerDashboardApi.pauseSubscription(id),
    onSuccess: () => { toast({ title: "Subscription paused" }); refresh(); },
  });
  const resumeSub = useMutation({
    mutationFn: (id: number) => customerDashboardApi.resumeSubscription(id),
    onSuccess: () => { toast({ title: "Subscription resumed" }); refresh(); },
  });
  const cancelSub = useMutation({
    mutationFn: (id: number) => customerDashboardApi.cancelSubscription(id),
    onSuccess: () => { toast({ title: "Subscription cancelled" }); refresh(); },
  });

  if (isLoading) {
    return (
      <CustomerLayout title="Dashboard" subtitle="Loading your account overview...">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </CustomerLayout>
    );
  }

  if (isError) {
    return (
      <CustomerLayout title="Dashboard" subtitle="Something went wrong">
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-red-500 mb-4">Failed to load dashboard data.</p>
          <Button onClick={() => refetch()}>Retry</Button>
        </div>
      </CustomerLayout>
    );
  }

  const activeSub = data?.active_subscription;
  const todayMeals: DashboardMeal[] = data?.today_meals ?? [];
  const upcomingMeals: DashboardMeal[] = data?.upcoming_meals ?? [];
  const consultations: DashboardConsultation[] = data?.recent_consultations ?? [];
  const payments: DashboardPayment[] = data?.recent_payments ?? [];
  const profile = data?.user ?? user;
  const busy = pauseSub.isPending || resumeSub.isPending || cancelSub.isPending;
  const stats = data?.stats ?? {};

  return (
    <CustomerLayout
      title={`Welcome back, ${profile?.name?.split(" ")[0] || "there"}`}
      subtitle="Manage your subscriptions, meals, consultations, and payments."
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="p-5 rounded-2xl bg-card shadow-sm border">
          <div className="text-sm text-muted-foreground">Active Subscription</div>
          <div className="text-2xl font-bold mt-1">{stats.active_subscriptions ?? 0}</div>
          <div className="text-xs text-muted-foreground mt-1">
            {activeSub ? statusLabel(activeSub.status) : "No active plan"}
          </div>
        </div>
        <div className="p-5 rounded-2xl bg-card shadow-sm border">
          <div className="text-sm text-muted-foreground">Total Consultations</div>
          <div className="text-2xl font-bold mt-1">{consultations.length}</div>
          <div className="text-xs text-muted-foreground mt-1">
            {consultations.filter((c) => c.status === "completed").length} completed
          </div>
        </div>
        <div className="p-5 rounded-2xl bg-card shadow-sm border">
          <div className="text-sm text-muted-foreground">Today's Meals</div>
          <div className="text-2xl font-bold mt-1">{todayMeals.length}</div>
          <div className="text-xs text-muted-foreground mt-1">meals planned</div>
        </div>
        <div className="p-5 rounded-2xl bg-card shadow-sm border">
          <div className="text-sm text-muted-foreground">Pending Payments</div>
          <div className="text-2xl font-bold mt-1">{stats.pending_payments ?? 0}</div>
          <div className="text-xs text-muted-foreground mt-1">due for payment</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Current Subscription */}
          <section className="rounded-2xl bg-card shadow-sm border p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <ClipboardListIcon /> Current Subscription
              </h2>
              {activeSub && <Badge className={statusClass(activeSub.status)}>{activeSub.status}</Badge>}
            </div>
            {activeSub ? (
              <div className="mt-5 space-y-4">
                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">Plan:</span> {activeSub.plan?.name ?? "Active Plan"}</div>
                  <div><span className="text-muted-foreground">Period:</span> {activeSub.period}</div>
                  <div><span className="text-muted-foreground">Start:</span> {formatDate(activeSub.start_date)}</div>
                  <div><span className="text-muted-foreground">End:</span> {formatDate(activeSub.end_date)}</div>
                  <div><span className="text-muted-foreground">Delivery PIN:</span> {activeSub.delivery_pincode}</div>
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  {activeSub.status === "paused" ? (
                    <Button size="sm" disabled={busy} onClick={() => resumeSub.mutate(activeSub.id)}>
                      <Play className="w-4 h-4 mr-2" /> Resume
                    </Button>
                  ) : (
                    <Button size="sm" disabled={busy || activeSub.status !== "active"} onClick={() => pauseSub.mutate(activeSub.id)} variant="outline">
                      <Pause className="w-4 h-4 mr-2" /> Pause
                    </Button>
                  )}
                  <Button size="sm" asChild variant="outline">
                    <Link to={`/subscribe?plan=${activeSub.subscription_plan_id}`}>Renew</Link>
                  </Button>
                  <Button size="sm" disabled={busy} onClick={() => cancelSub.mutate(activeSub.id)} variant="outline" className="text-red-500 border-red-200 hover:bg-red-50">
                    <Trash2 className="w-4 h-4 mr-2" /> Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mt-4 p-6 text-center">
                <p className="text-muted-foreground text-sm mb-4">No active subscription</p>
                <Button asChild><Link to="/plans">Browse plans</Link></Button>
              </div>
            )}
          </section>

          {/* Today's Meals */}
          <section className="rounded-2xl bg-card shadow-sm border p-6">
            <h2 className="text-lg font-semibold flex items-center gap-2"><Utensils className="w-5 h-5" /> Today's Meals</h2>
            {todayMeals.length > 0 ? (
              <div className="grid sm:grid-cols-2 gap-3 mt-4">
                {todayMeals.map((meal) => (
                  <div key={meal.id} className="p-3 rounded-xl bg-secondary/30">
                    <div className="text-xs uppercase tracking-widest text-muted-foreground">{meal.meal_type}</div>
                    <div className="font-medium mt-1">{meal.meal_option?.title ?? "Meal planned"}</div>
                    {meal.meal_option?.calories && <div className="text-xs text-muted-foreground mt-1">{meal.meal_option.calories} kcal</div>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">Meals will appear here after payment activation.</p>
            )}
          </section>

          {/* Upcoming Meals */}
          <section className="rounded-2xl bg-card shadow-sm border p-6">
            <h2 className="text-lg font-semibold flex items-center gap-2"><CalendarDays className="w-5 h-5" /> Upcoming Meals</h2>
            {upcomingMeals.length > 0 ? (
              <div className="mt-4 space-y-3">
                {upcomingMeals.map((meal) => (
                  <div key={meal.id} className="flex justify-between gap-4 p-3 rounded-xl bg-secondary/30 text-sm">
                    <div>
                      <div className="font-medium">{meal.meal_option?.title ?? "Meal planned"}</div>
                      <div className="text-xs text-muted-foreground capitalize">{meal.meal_type}</div>
                    </div>
                    <span className="text-muted-foreground shrink-0">{formatDate(meal.meal_date)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">No upcoming meals yet.</p>
            )}
          </section>

          {/* Recent Consultations */}
          <section className="rounded-2xl bg-card shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Recent Consultations</h2>
              <Button asChild variant="outline" size="sm"><Link to="/customer/consultations">View all</Link></Button>
            </div>
            {consultations.length > 0 ? (
              <div className="space-y-3">
                {consultations.map((c) => (
                  <div key={c.id} className="flex justify-between items-center p-3 rounded-xl bg-secondary/30">
                    <div>
                      <div className="text-sm font-medium">Consultation #{c.id}</div>
                      <div className="text-xs text-muted-foreground">{c.doctor?.name ?? "Doctor pending"}</div>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={statusClass(c.status)}>{c.status ?? "pending"}</Badge>
                      <Badge className={statusClass(c.payment_status)}>{c.payment_status ?? "pending"}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No consultations yet.</p>
            )}
          </section>

          {/* Payment History */}
          <section className="rounded-2xl bg-card shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Recent Payments</h2>
              <Button asChild variant="outline" size="sm"><Link to="/customer/payments">View all</Link></Button>
            </div>
            {payments.length > 0 ? (
              <div className="space-y-3">
                {payments.map((payment) => (
                  <div key={payment.id} className="flex justify-between items-center p-3 rounded-xl bg-secondary/30">
                    <div>
                      <div className="text-sm font-medium">{payment.gateway?.toUpperCase()} Payment</div>
                      <div className="text-xs text-muted-foreground">{formatDate(payment.created_at)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">Rs. {Number(payment.amount ?? 0).toLocaleString("en-IN")}</div>
                      <Badge className={statusClass(payment.status)}>{payment.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No payments yet.</p>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          {/* Profile Card */}
          <section className="rounded-2xl bg-card shadow-sm border p-6">
            <h3 className="text-lg font-semibold flex items-center gap-2"><User className="w-4 h-4" /> Profile</h3>
            <div className="mt-4 space-y-2 text-sm">
              <div><span className="text-muted-foreground">Name:</span> {profile?.name}</div>
              <div><span className="text-muted-foreground">Email:</span> {profile?.email ?? "-"}</div>
              <div><span className="text-muted-foreground">Phone:</span> {profile?.phone ?? "-"}</div>
              <div><span className="text-muted-foreground">Member since:</span> {profile?.created_at ? formatDate(profile.created_at) : "-"}</div>
            </div>
            <Button asChild variant="outline" size="sm" className="w-full mt-4">
              <Link to="/customer/profile"><Settings className="w-4 h-4 mr-2" /> View profile</Link>
            </Button>
          </section>

          {/* Address Card */}
          <section className="rounded-2xl bg-card shadow-sm border p-6">
            <h3 className="text-lg font-semibold flex items-center gap-2"><MapPin className="w-4 h-4" /> Address</h3>
            <p className="mt-4 text-sm text-muted-foreground">
              {[profile?.address_line_1, profile?.address_line_2, profile?.city, profile?.state, profile?.pincode]
                .filter(Boolean).join(", ") || "No address saved yet."}
            </p>
          </section>

          {/* Quick Actions */}
          <section className="rounded-2xl bg-card shadow-sm border p-6">
            <h3 className="text-lg font-semibold">Quick Actions</h3>
            <div className="mt-4 space-y-2">
              <Button asChild variant="outline" size="sm" className="w-full justify-start">
                <Link to="/customer/subscription"><ClipboardListIcon /> My Subscription</Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="w-full justify-start">
                <Link to="/customer/meal-plan"><Utensils className="w-4 h-4 mr-2" /> Meal Plan</Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="w-full justify-start">
                <Link to="/experts"><CalendarDays className="w-4 h-4 mr-2" /> Book Consultation</Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="w-full justify-start">
                <Link to="/customer/payments"><CreditCard className="w-4 h-4 mr-2" /> Payments</Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="w-full justify-start">
                <Link to="/customer/profile"><User className="w-4 h-4 mr-2" /> Update Profile</Link>
              </Button>
            </div>
          </section>
        </aside>
      </div>
    </CustomerLayout>
  );
};

const ClipboardListIcon = () => <ClipboardIcon className="w-5 h-5" />;
const ClipboardIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
  </svg>
);

const statusLabel = (status: string) => {
  const labels: Record<string, string> = { active: "Active", paused: "Paused", cancelled: "Cancelled", pending: "Pending" };
  return labels[status] || status;
};

export default CustomerOverview;
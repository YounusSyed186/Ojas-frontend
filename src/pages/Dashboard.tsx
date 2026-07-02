import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarDays,
  CreditCard,
  LayoutDashboard,
  Loader2,
  MapPin,
  Pause,
  Play,
  RotateCcw,
  Settings,
  Trash2,
  User,
  Utensils,
} from "lucide-react";
import { DashboardLayout, type DashboardNavItem } from "@/components/dashboard/DashboardLayout";
import { DashboardLoadingState } from "@/components/dashboard/DashboardErrorState";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { customerApi } from "@/lib/api/customerApi";
import type { DashboardConsultation, DashboardMeal, DashboardPayment } from "@/lib/api/types";
import { useToast } from "@/hooks/use-toast";

const customerNav: DashboardNavItem[] = [
  { label: "Overview", to: "/customer/dashboard", icon: LayoutDashboard },
];

const formatDate = (value?: string) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};

const statusClass = (status?: string) => {
  if (status === "active" || status === "paid" || status === "completed") return "bg-green-100 text-green-700";
  if (status === "paused" || status === "pending") return "bg-yellow-100 text-yellow-700";
  if (status === "cancelled" || status === "failed") return "bg-red-100 text-red-700";
  return "bg-secondary text-secondary-foreground";
};

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [profileOpen, setProfileOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["customer-dashboard"],
    queryFn: () => customerApi.dashboard(),
  });

  const refreshDashboard = () => queryClient.invalidateQueries({ queryKey: ["customer-dashboard"] });

  const pauseSub = useMutation({
    mutationFn: customerApi.pauseSubscription,
    onSuccess: () => {
      toast({ title: "Subscription paused" });
      refreshDashboard();
    },
  });

  const resumeSub = useMutation({
    mutationFn: customerApi.resumeSubscription,
    onSuccess: () => {
      toast({ title: "Subscription resumed" });
      refreshDashboard();
    },
  });

  const cancelSub = useMutation({
    mutationFn: customerApi.cancelSubscription,
    onSuccess: () => {
      toast({ title: "Subscription cancelled" });
      refreshDashboard();
    },
  });

  const updateProfile = useMutation({
    mutationFn: customerApi.updateProfile,
    onSuccess: () => {
      toast({ title: "Profile updated" });
      setProfileOpen(false);
      refreshDashboard();
    },
  });

  if (isLoading) {
    return (
      <DashboardLayout
        title="Customer dashboard"
        subtitle="Manage your subscriptions, meals, consultations, payments, and delivery details."
        navItems={customerNav}
      >
        <DashboardLoadingState />
      </DashboardLayout>
    );
  }

  const activeSub = data?.active_subscription;
  const todayMeals: DashboardMeal[] = data?.today_meals ?? [];
  const upcomingMeals: DashboardMeal[] = data?.upcoming_meals ?? [];
  const consultations: DashboardConsultation[] = data?.recent_consultations ?? [];
  const payments: DashboardPayment[] = data?.recent_payments ?? [];
  const profile = data?.user ?? user;
  const busy = pauseSub.isPending || resumeSub.isPending || cancelSub.isPending;

  const handleProfileSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    updateProfile.mutate({
      name: formData.get("name"),
      phone: formData.get("phone"),
      address_line_1: formData.get("address_line_1"),
      address_line_2: formData.get("address_line_2"),
      city: formData.get("city"),
      state: formData.get("state"),
      pincode: formData.get("pincode"),
    });
  };

  return (
    <DashboardLayout
      title={`Welcome back, ${profile?.name?.split(" ")[0] || "there"}`}
      subtitle="Manage subscriptions, meals, consultations, payments, and delivery details."
      navItems={customerNav}
    >
      <section>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="p-5 rounded-2xl glass shadow-soft">
              <div className="text-2xl font-display font-semibold">{data?.stats?.active_subscriptions ?? 0}</div>
              <div className="text-xs text-muted-foreground mt-1">Active plans</div>
            </div>
            <div className="p-5 rounded-2xl glass shadow-soft">
              <div className="text-2xl font-display font-semibold">{data?.stats?.total_subscriptions ?? 0}</div>
              <div className="text-xs text-muted-foreground mt-1">Subscriptions</div>
            </div>
            <div className="p-5 rounded-2xl glass shadow-soft">
              <div className="text-2xl font-display font-semibold">{consultations.length}</div>
              <div className="text-xs text-muted-foreground mt-1">Consultations</div>
            </div>
            <div className="p-5 rounded-2xl glass shadow-soft">
              <div className="text-2xl font-display font-semibold">{data?.stats?.pending_payments ?? 0}</div>
              <div className="text-xs text-muted-foreground mt-1">Pending payments</div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <section className="rounded-3xl bg-card shadow-soft p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="font-display text-xl font-semibold flex items-center gap-2">
                    <Utensils className="w-5 h-5 text-accent" /> Current Subscription
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
                      <div><span className="text-muted-foreground">Meals generated:</span> {activeSub.daily_selections?.length ?? 0}</div>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {activeSub.status === "paused" ? (
                        <Button size="sm" disabled={busy} onClick={() => resumeSub.mutate(activeSub.id)} className="rounded-full">
                          <Play className="w-4 h-4 mr-2" /> Resume
                        </Button>
                      ) : (
                        <Button size="sm" disabled={busy || activeSub.status !== "active"} onClick={() => pauseSub.mutate(activeSub.id)} variant="outline" className="rounded-full">
                          <Pause className="w-4 h-4 mr-2" /> Pause
                        </Button>
                      )}
                      <Button size="sm" asChild variant="outline" className="rounded-full">
                        <Link to={`/subscribe?plan=${activeSub.subscription_plan_id}`}>
                          <RotateCcw className="w-4 h-4 mr-2" /> Renew
                        </Link>
                      </Button>
                      <Button size="sm" disabled={busy} onClick={() => cancelSub.mutate(activeSub.id)} variant="outline" className="rounded-full text-red-500 border-red-200 hover:bg-red-50">
                        <Trash2 className="w-4 h-4 mr-2" /> Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 p-6 text-center">
                    <p className="text-muted-foreground text-sm mb-4">No active subscription</p>
                    <Button asChild className="rounded-full">
                      <Link to="/plans">Browse plans</Link>
                    </Button>
                  </div>
                )}
              </section>

              <section className="rounded-3xl bg-card shadow-soft p-6">
                <h2 className="font-display text-xl font-semibold flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-accent" /> Today&apos;s Meals
                </h2>
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

              <section className="rounded-3xl bg-card shadow-soft p-6">
                <h2 className="font-display text-xl font-semibold flex items-center gap-2">
                  <Utensils className="w-5 h-5 text-accent" /> Upcoming Meals
                </h2>
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

              <section className="rounded-3xl bg-card shadow-soft p-6">
                <h2 className="font-display text-xl font-semibold flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-accent" /> Consultation Status
                </h2>
                {consultations.length > 0 ? (
                  <div className="mt-4 space-y-3">
                    {consultations.map((consultation) => (
                      <div key={consultation.id} className="flex justify-between items-center p-3 rounded-xl bg-secondary/30">
                        <div>
                          <div className="text-sm font-medium">Consultation #{consultation.id}</div>
                          <div className="text-xs text-muted-foreground">{consultation.doctor?.name ?? "Doctor pending"}</div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge className={statusClass(consultation.status)}>{consultation.status ?? "pending"}</Badge>
                          <Badge className={statusClass(consultation.payment_status)}>
                            {consultation.payment_status ?? "payment pending"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-muted-foreground">No consultations yet.</p>
                )}
              </section>

              <section className="rounded-3xl bg-card shadow-soft p-6">
                <h2 className="font-display text-xl font-semibold flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-accent" /> Payment History
                </h2>
                {payments.length > 0 ? (
                  <div className="mt-4 space-y-3">
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
                  <p className="mt-4 text-sm text-muted-foreground">No payments yet.</p>
                )}
              </section>
            </div>

            <aside className="space-y-4">
              <section className="rounded-3xl bg-card shadow-soft p-6">
                <h3 className="font-display text-lg font-semibold flex items-center gap-2">
                  <User className="w-4 h-4 text-accent" /> Profile
                </h3>
                <div className="mt-4 space-y-2 text-sm">
                  <div><span className="text-muted-foreground">Name:</span> {profile?.name}</div>
                  <div><span className="text-muted-foreground">Email:</span> {profile?.email ?? "-"}</div>
                  <div><span className="text-muted-foreground">Phone:</span> {profile?.phone ?? "-"}</div>
                </div>
                <Button onClick={() => setProfileOpen((open) => !open)} variant="outline" size="sm" className="w-full mt-4 rounded-full">
                  <Settings className="w-4 h-4 mr-2" /> {profileOpen ? "Close" : "Edit profile"}
                </Button>
              </section>

              <section className="rounded-3xl bg-card shadow-soft p-6">
                <h3 className="font-display text-lg font-semibold flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-accent" /> Address
                </h3>
                <p className="mt-4 text-sm text-muted-foreground">
                  {[profile?.address_line_1, profile?.address_line_2, profile?.city, profile?.state, profile?.pincode]
                    .filter(Boolean)
                    .join(", ") || "No address saved yet."}
                </p>
              </section>

              {profileOpen && (
                <section className="rounded-3xl bg-card shadow-soft p-6">
                  <h3 className="font-display text-lg font-semibold">Profile details</h3>
                  <form onSubmit={handleProfileSubmit} className="mt-4 space-y-3">
                    <div className="space-y-1">
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" name="name" defaultValue={profile?.name ?? ""} className="h-10 rounded-xl" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" name="phone" defaultValue={profile?.phone ?? ""} className="h-10 rounded-xl" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="address_line_1">Address line 1</Label>
                      <Input id="address_line_1" name="address_line_1" defaultValue={profile?.address_line_1 ?? ""} className="h-10 rounded-xl" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="address_line_2">Address line 2</Label>
                      <Input id="address_line_2" name="address_line_2" defaultValue={profile?.address_line_2 ?? ""} className="h-10 rounded-xl" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label htmlFor="city">City</Label>
                        <Input id="city" name="city" defaultValue={profile?.city ?? ""} className="h-10 rounded-xl" />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="state">State</Label>
                        <Input id="state" name="state" defaultValue={profile?.state ?? ""} className="h-10 rounded-xl" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="pincode">Pincode</Label>
                      <Input id="pincode" name="pincode" defaultValue={profile?.pincode ?? ""} maxLength={6} className="h-10 rounded-xl" />
                    </div>
                    <Button type="submit" disabled={updateProfile.isPending} className="w-full rounded-full">
                      {updateProfile.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save profile"}
                    </Button>
                  </form>
                </section>
              )}

              <section className="rounded-3xl bg-card shadow-soft p-6">
                <h3 className="font-display text-lg font-semibold flex items-center gap-2">
                  <Settings className="w-4 h-4 text-accent" /> Quick actions
                </h3>
                <div className="mt-4 space-y-2">
                  <Button asChild variant="outline" size="sm" className="w-full rounded-full justify-start">
                    <Link to="/plans"><Utensils className="w-4 h-4 mr-2" /> New subscription</Link>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="w-full rounded-full justify-start">
                    <Link to="/experts"><CalendarDays className="w-4 h-4 mr-2" /> Book consultation</Link>
                  </Button>
                </div>
              </section>
            </aside>
          </div>
      </section>
    </DashboardLayout>
  );
};

export default Dashboard;

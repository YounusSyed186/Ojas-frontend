import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { CalendarDays, ChevronRight, ClipboardList, CreditCard, Loader2, Package, Pause, Play, ShoppingBag, Utensils } from "lucide-react";
import { CustomerLayout } from "@/components/customer/CustomerLayout";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { customerDashboardApi } from "@/lib/api/customerDashboardApi";
import { dashboardErrorMessage, formatCurrency, formatDashboardDate } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const StatCard = ({ label, value, hint, icon: Icon }: { label: string; value: number; hint: string; icon: typeof Package }) => (
  <div className="rounded-2xl border bg-card p-5 shadow-sm">
    <div className="flex items-start justify-between gap-3">
      <div><p className="text-sm text-muted-foreground">{label}</p><p className="mt-2 text-3xl font-semibold">{value}</p></div>
      <span className="rounded-xl bg-primary/10 p-2.5 text-primary"><Icon className="h-5 w-5" /></span>
    </div>
    <p className="mt-3 text-xs text-muted-foreground">{hint}</p>
  </div>
);

const SectionHeader = ({ title, to }: { title: string; to: string }) => (
  <div className="mb-4 flex items-center justify-between gap-3">
    <h2 className="text-xl font-semibold">{title}</h2>
    <Link to={to} className="flex items-center text-sm font-medium text-primary hover:underline">View all <ChevronRight className="h-4 w-4" /></Link>
  </div>
);

const CustomerOverview = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["customer-overview"], queryFn: customerDashboardApi.overview });
  const refresh = () => queryClient.invalidateQueries({ queryKey: ["customer-overview"] });
  const action = useMutation({
    mutationFn: ({ kind, id }: { kind: "pause" | "resume" | "cancel"; id: number }) =>
      kind === "pause" ? customerDashboardApi.pauseSubscription(id) : kind === "resume" ? customerDashboardApi.resumeSubscription(id) : customerDashboardApi.cancelSubscription(id),
    onSuccess: (_, variables) => { toast({ title: `Subscription ${{ pause: "paused", resume: "resumed", cancel: "cancelled" }[variables.kind]}` }); refresh(); },
    onError: (error) => toast({ title: dashboardErrorMessage(error, "Could not update subscription"), variant: "destructive" }),
  });

  if (query.isLoading) return <CustomerLayout title="Overview" subtitle="Loading your wellness dashboard..."><div className="grid place-items-center py-24"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></CustomerLayout>;
  if (query.isError || !query.data) return <CustomerLayout title="Overview" subtitle="We could not load your account."><div className="rounded-2xl border bg-card p-10 text-center"><p className="text-destructive">{dashboardErrorMessage(query.error, "Failed to load dashboard data")}</p><Button className="mt-4" onClick={() => query.refetch()}>Try again</Button></div></CustomerLayout>;

  const { user, stats, active_subscription: subscription, today_meals: todayMeals, upcoming_meals: upcomingMeals, recent_orders: orders, recent_consultations: consultations, recent_payments: payments } = query.data;
  const firstName = user.name?.split(" ")[0] || "there";

  return (
    <CustomerLayout title={`Welcome back, ${firstName}`} subtitle="Everything about your meals, plan, deliveries, and consultations in one place.">
      <div className="mb-7 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-primary px-6 py-5 text-primary-foreground shadow-lg">
        <div><p className="text-sm text-white/65">Your wellness journey</p><p className="mt-1 font-serif text-2xl">Plan today. Feel better tomorrow.</p></div>
        <Button asChild variant="secondary"><Link to={subscription ? "/customer/meal-plan" : "/plans"}>{subscription ? "View meal plan" : "Explore plans"}</Link></Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Subscription" value={stats.active_subscriptions} hint={subscription ? `Currently ${subscription.status}` : "No current plan"} icon={ClipboardList} />
        <StatCard label="Upcoming meals" value={stats.upcoming_meals} hint="Scheduled ahead" icon={Utensils} />
        <StatCard label="Orders" value={stats.total_orders} hint="All meal orders" icon={ShoppingBag} />
        <StatCard label="Consultations" value={stats.total_consultations} hint="All appointments" icon={CalendarDays} />
        <StatCard label="Pending payments" value={stats.pending_payments} hint="Awaiting completion" icon={CreditCard} />
      </div>

      <div className="mt-7 grid gap-6 xl:grid-cols-3">
        <section className="rounded-2xl border bg-card p-6 shadow-sm xl:col-span-2">
          <SectionHeader title="Current subscription" to="/customer/subscription" />
          {subscription ? <div className="rounded-2xl bg-secondary/55 p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div><StatusBadge status={subscription.status} /><h3 className="mt-3 text-2xl font-semibold">{subscription.plan?.name || "OJAS meal plan"}</h3><p className="mt-1 text-sm text-muted-foreground">{formatDashboardDate(subscription.start_date)} - {formatDashboardDate(subscription.end_date)}</p></div>
              <div className="text-right"><p className="text-sm text-muted-foreground">Plan value</p><p className="text-xl font-semibold">{formatCurrency(subscription.price)}</p></div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {subscription.status === "paused" ? <Button size="sm" disabled={action.isPending} onClick={() => action.mutate({ kind: "resume", id: subscription.id })}><Play className="mr-2 h-4 w-4" />Resume</Button> : <Button size="sm" variant="outline" disabled={action.isPending || subscription.status !== "active"} onClick={() => action.mutate({ kind: "pause", id: subscription.id })}><Pause className="mr-2 h-4 w-4" />Pause</Button>}
              <Button asChild size="sm" variant="outline"><Link to={`/subscribe?plan=${subscription.subscription_plan_id}`}>Renew or change</Link></Button>
            </div>
          </div> : <div className="rounded-2xl border border-dashed p-8 text-center"><ClipboardList className="mx-auto h-9 w-9 text-muted-foreground" /><h3 className="mt-3 font-semibold">No active subscription</h3><p className="mt-1 text-sm text-muted-foreground">Choose a plan to unlock your daily meal schedule.</p><Button asChild className="mt-4"><Link to="/plans">Browse plans</Link></Button></div>}
        </section>

        <section className="rounded-2xl border bg-card p-6 shadow-sm">
          <SectionHeader title="Today's meals" to="/customer/meal-plan" />
          {todayMeals.length ? <div className="space-y-3">{todayMeals.map((meal) => <div key={meal.id} className="flex items-center gap-3 rounded-xl bg-secondary/55 p-3"><span className="rounded-lg bg-card p-2 text-primary"><Utensils className="h-4 w-4" /></span><div className="min-w-0"><p className="truncate text-sm font-semibold">{meal.meal_option?.title || "Meal planned"}</p><p className="text-xs capitalize text-muted-foreground">{meal.meal_type}{meal.meal_option?.calories ? ` · ${meal.meal_option.calories} kcal` : ""}</p></div></div>)}</div> : <p className="rounded-xl bg-secondary/50 p-5 text-sm text-muted-foreground">No meals are scheduled for today.</p>}
        </section>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border bg-card p-6 shadow-sm"><SectionHeader title="Recent orders" to="/customer/orders" />{orders.length ? <div className="divide-y">{orders.slice(0, 4).map((order) => <Link key={order.order_number} to={`/customer/orders/${order.order_number}`} className="flex items-center justify-between gap-4 py-3 first:pt-0 hover:text-primary"><div><p className="text-sm font-semibold">{order.order_number}</p><p className="text-xs text-muted-foreground">{formatDashboardDate(order.created_at)} · {order.items.length} items</p></div><div className="text-right"><p className="text-sm font-semibold">{formatCurrency(order.grand_total)}</p><StatusBadge status={order.status} /></div></Link>)}</div> : <p className="text-sm text-muted-foreground">Your meal orders will appear here.</p>}</section>
        <section className="rounded-2xl border bg-card p-6 shadow-sm"><SectionHeader title="Upcoming meals" to="/customer/meal-plan" />{upcomingMeals.length ? <div className="divide-y">{upcomingMeals.slice(0, 5).map((meal) => <div key={meal.id} className="flex justify-between gap-4 py-3 first:pt-0"><div><p className="text-sm font-semibold">{meal.meal_option?.title || "Meal planned"}</p><p className="text-xs capitalize text-muted-foreground">{meal.meal_type}</p></div><p className="text-sm text-muted-foreground">{formatDashboardDate(meal.meal_date)}</p></div>)}</div> : <p className="text-sm text-muted-foreground">No upcoming meals scheduled.</p>}</section>
        <section className="rounded-2xl border bg-card p-6 shadow-sm"><SectionHeader title="Recent consultations" to="/customer/consultations" />{consultations.length ? <div className="divide-y">{consultations.map((consultation) => <Link key={consultation.id} to={`/customer/consultations/${consultation.id}`} className="flex items-center justify-between gap-4 py-3 first:pt-0"><div><p className="text-sm font-semibold">{consultation.doctor?.name || "Doctor assignment pending"}</p><p className="text-xs text-muted-foreground">Consultation #{consultation.id}</p></div><StatusBadge status={consultation.status} /></Link>)}</div> : <p className="text-sm text-muted-foreground">No consultations booked yet.</p>}</section>
        <section className="rounded-2xl border bg-card p-6 shadow-sm"><SectionHeader title="Recent payments" to="/customer/payments" />{payments.length ? <div className="divide-y">{payments.slice(0, 5).map((payment) => <div key={payment.id} className="flex items-center justify-between gap-4 py-3 first:pt-0"><div><p className="text-sm font-semibold">Payment #{payment.id}</p><p className="text-xs text-muted-foreground">{formatDashboardDate(payment.created_at)}</p></div><div className="text-right"><p className="text-sm font-semibold">{formatCurrency(payment.amount)}</p><StatusBadge status={payment.status} /></div></div>)}</div> : <p className="text-sm text-muted-foreground">No payments recorded yet.</p>}</section>
      </div>
    </CustomerLayout>
  );
};

export default CustomerOverview;

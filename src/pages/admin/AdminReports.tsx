import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { StatCard } from "@/components/admin/StatCard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { adminApi } from "@/lib/api/adminApi";
import { DollarSign, Users, Stethoscope, UserCircle, TrendingUp } from "lucide-react";

const formatCurrency = (value?: number) => `Rs. ${Number(value ?? 0).toLocaleString("en-IN")}`;

const AdminReports = () => {
  const reportsQuery = useQuery({
    queryKey: ["admin-reports"],
    queryFn: () => adminApi.reports(),
  });

  const data = reportsQuery.data;
  const isLoading = reportsQuery.isLoading;
  const isError = reportsQuery.isError;

  if (isLoading) {
    return (
      <AdminLayout title="Reports & Analytics" subtitle="Platform performance and analytics." breadcrumbs={[{ label: "Reports" }]}>
        <div className="rounded-xl border bg-white p-12 text-center text-sm text-muted-foreground">Loading reports...</div>
      </AdminLayout>
    );
  }

  if (isError) {
    return (
      <AdminLayout title="Reports & Analytics" subtitle="Platform performance and analytics." breadcrumbs={[{ label: "Reports" }]}>
        <div className="rounded-xl border bg-white p-12 text-center text-sm text-red-500">
          Failed to load reports. <button onClick={() => reportsQuery.refetch()} className="underline">Retry</button>
        </div>
      </AdminLayout>
    );
  }

  const consultationsByStatus = (data?.consultations_by_status ?? {}) as Record<string, number>;
  const paymentsByStatus = (data?.payments_by_status ?? {}) as Record<string, number>;
  const subscriptionsByPlan = (data?.subscriptions_by_plan ?? []) as Record<string, unknown>[];
  const topDoctors = (data?.top_doctors ?? []) as Record<string, unknown>[];
  const topPlans = (data?.top_plans ?? []) as Record<string, unknown>[];

  return (
    <AdminLayout title="Reports & Analytics" subtitle="Platform performance and analytics." breadcrumbs={[{ label: "Reports" }]}>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Revenue" value={formatCurrency(data?.revenue?.total)} icon={DollarSign} />
        <StatCard label="Revenue This Month" value={formatCurrency(data?.revenue?.this_month)} icon={TrendingUp} />
        <StatCard label="Total Users" value={data?.total_users ?? 0} icon={Users} />
        <StatCard label="Total Customers" value={data?.total_customers ?? 0} icon={UserCircle} />
        <StatCard label="Total Doctors" value={data?.total_doctors ?? 0} icon={Stethoscope} />
        <StatCard label="New Customers (Month)" value={data?.customer_growth ?? 0} icon={UserCircle} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Consultations by Status</h2>
          {Object.keys(consultationsByStatus).length > 0 ? (
            <div className="space-y-2">
              {Object.entries(consultationsByStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-2.5 text-sm">
                  <StatusBadge status={status} />
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">No consultation data</p>
          )}
        </section>

        <section className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Payments by Status</h2>
          {Object.keys(paymentsByStatus).length > 0 ? (
            <div className="space-y-2">
              {Object.entries(paymentsByStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-2.5 text-sm">
                  <StatusBadge status={status} />
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">No payment data</p>
          )}
        </section>

        <section className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Subscriptions by Plan</h2>
          {subscriptionsByPlan.length > 0 ? (
            <div className="space-y-2">
              {subscriptionsByPlan.map((plan: Record<string, unknown>, i: number) => (
                <div key={i} className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-2.5 text-sm">
                  <span>{plan.name as string}</span>
                  <span className="font-medium">{plan.subscriptions_count as number ?? 0}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">No subscription data</p>
          )}
        </section>

        <section className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Top Doctors</h2>
          {topDoctors.length > 0 ? (
            <div className="space-y-2">
              {topDoctors.map((doc: Record<string, unknown>, i: number) => (
                <div key={i} className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-2.5 text-sm">
                  <span>{(doc.doctor as Record<string, unknown>)?.name as string ?? "Doctor"}</span>
                  <span className="font-medium">{doc.completed_count as number ?? 0} completed</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">No doctor performance data</p>
          )}
        </section>

        <section className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold">Top Plans</h2>
          {topPlans.length > 0 ? (
            <div className="space-y-2">
              {topPlans.map((plan: Record<string, unknown>, i: number) => (
                <div key={i} className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-2.5 text-sm">
                  <span>{(plan.plan as Record<string, unknown>)?.name as string ?? "Plan"}</span>
                  <span className="font-medium">{plan.subscriptions_count as number ?? 0} subs</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">No plan data</p>
          )}
        </section>
      </div>
    </AdminLayout>
  );
};

export default AdminReports;
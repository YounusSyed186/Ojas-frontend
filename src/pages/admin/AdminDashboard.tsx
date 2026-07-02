import { useQuery } from "@tanstack/react-query";
import { Users, Stethoscope, UserCircle, UtensilsCrossed, MessageSquare, CreditCard, DollarSign, AlertCircle } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { StatCard } from "@/components/admin/StatCard";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { adminApi } from "@/lib/api/adminApi";

const formatCurrency = (value?: number) => `Rs. ${Number(value ?? 0).toLocaleString("en-IN")}`;

const AdminDashboard = () => {
  const dashboardQuery = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: () => adminApi.dashboard(),
  });

  const usersQuery = useQuery({
    queryKey: ["admin-users", "recent"],
    queryFn: () => adminApi.users({ per_page: 5, sort: "created_at", direction: "desc" }),
  });

  const subscriptionsQuery = useQuery({
    queryKey: ["admin-subscriptions", "recent"],
    queryFn: () => adminApi.subscriptions({ per_page: 5, sort: "created_at", direction: "desc" }),
  });

  const consultationsQuery = useQuery({
    queryKey: ["admin-consultations", "recent"],
    queryFn: () => adminApi.consultations({ per_page: 5, sort: "created_at", direction: "desc" }),
  });

  const paymentsQuery = useQuery({
    queryKey: ["admin-payments", "recent"],
    queryFn: () => adminApi.payments({ per_page: 5, sort: "created_at", direction: "desc" }),
  });

  const stats = dashboardQuery.data?.stats ?? {};

  const userColumns: Column<Record<string, unknown>>[] = [
    { key: "name", header: "Name", render: (row) => (row.name as string) ?? "-" },
    { key: "email", header: "Email", render: (row) => (row.email as string) ?? "-" },
    { key: "role", header: "Role", render: (row) => <StatusBadge status={row.role as string} /> },
    { key: "created_at", header: "Joined", render: (row) => new Date(row.created_at as string).toLocaleDateString() },
  ];

  const subscriptionColumns: Column<Record<string, unknown>>[] = [
    { key: "customer", header: "Customer", render: (row) => (row.customer as Record<string, unknown>)?.name as string ?? "-" },
    { key: "plan", header: "Plan", render: (row) => (row.plan as Record<string, unknown>)?.name as string ?? "-" },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status as string} /> },
  ];

  const consultationColumns: Column<Record<string, unknown>>[] = [
    { key: "customer", header: "Customer", render: (row) => (row.customer as Record<string, unknown>)?.name as string ?? "-" },
    { key: "doctor", header: "Doctor", render: (row) => (row.doctor as Record<string, unknown>)?.name as string ?? "Unassigned" },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status as string} /> },
  ];

  const paymentColumns: Column<Record<string, unknown>>[] = [
    { key: "gateway", header: "Gateway", render: (row) => (row.gateway as string) ?? "-" },
    { key: "amount", header: "Amount", render: (row) => formatCurrency(row.amount as number) },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status as string} /> },
    { key: "created_at", header: "Date", render: (row) => new Date(row.created_at as string).toLocaleDateString() },
  ];

  return (
    <AdminLayout
      title="Dashboard Overview"
      subtitle="Monitor revenue, subscriptions, consultations, and platform activity."
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Revenue" value={formatCurrency(stats.revenue)} icon={DollarSign} />
        <StatCard label="Active Subscriptions" value={stats.active_subscriptions ?? 0} icon={UtensilsCrossed} />
        <StatCard label="Pending Consultations" value={stats.pending_consultations ?? 0} icon={MessageSquare} />
        <StatCard label="Failed Payments" value={stats.failed_payments ?? 0} icon={AlertCircle} />
        <StatCard label="Today's Deliveries" value={stats.today_deliveries ?? 0} icon={UtensilsCrossed} />
        <StatCard label="New Customers (Month)" value={stats.customer_growth ?? 0} icon={UserCircle} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 text-lg font-semibold">Top Meal Plans</h2>
          <div className="rounded-xl border bg-white p-4 shadow-sm">
            {(dashboardQuery.data?.top_meal_plans ?? []).length > 0 ? (
              <div className="space-y-2">
                {(dashboardQuery.data?.top_meal_plans ?? []).map((plan: Record<string, unknown>, i: number) => (
                  <div key={i} className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-2.5 text-sm">
                    <span>{(plan.template as Record<string, unknown>)?.name as string ?? "Template"}</span>
                    <span className="font-medium">{plan.subscriptions_count as number ?? 0} subs</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">No plan data yet</p>
            )}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold">Doctor Performance</h2>
          <div className="rounded-xl border bg-white p-4 shadow-sm">
            {(dashboardQuery.data?.doctor_performance ?? []).length > 0 ? (
              <div className="space-y-2">
                {(dashboardQuery.data?.doctor_performance ?? []).map((entry: Record<string, unknown>, i: number) => (
                  <div key={i} className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-2.5 text-sm">
                    <span>{(entry.doctor as Record<string, unknown>)?.name as string ?? "Doctor"}</span>
                    <span className="font-medium">{entry.completed_count as number ?? 0} completed</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">No doctor performance data yet</p>
            )}
          </div>
        </section>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 text-lg font-semibold">Recent Users</h2>
          <DataTable
            columns={userColumns}
            data={(usersQuery.data?.users?.data ?? []) as Record<string, unknown>[]}
            isLoading={usersQuery.isLoading}
            isError={usersQuery.isError}
            onRetry={() => usersQuery.refetch()}
          />
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold">Recent Subscriptions</h2>
          <DataTable
            columns={subscriptionColumns}
            data={(subscriptionsQuery.data?.subscriptions?.data ?? []) as Record<string, unknown>[]}
            isLoading={subscriptionsQuery.isLoading}
            isError={subscriptionsQuery.isError}
            onRetry={() => subscriptionsQuery.refetch()}
          />
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold">Recent Consultations</h2>
          <DataTable
            columns={consultationColumns}
            data={(consultationsQuery.data?.consultations?.data ?? []) as Record<string, unknown>[]}
            isLoading={consultationsQuery.isLoading}
            isError={consultationsQuery.isError}
            onRetry={() => consultationsQuery.refetch()}
          />
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold">Recent Payments</h2>
          <DataTable
            columns={paymentColumns}
            data={(paymentsQuery.data?.payments?.data ?? []) as Record<string, unknown>[]}
            isLoading={paymentsQuery.isLoading}
            isError={paymentsQuery.isError}
            onRetry={() => paymentsQuery.refetch()}
          />
        </section>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
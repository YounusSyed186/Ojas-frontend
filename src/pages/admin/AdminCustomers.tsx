import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { adminApi } from "@/lib/api/adminApi";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Eye } from "lucide-react";

const AdminCustomers = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState<Record<string, unknown> | null>(null);

  const queryParams: Record<string, unknown> = { page, per_page: 20, role: "customer" };
  if (search) queryParams.search = search;

  const customersQuery = useQuery({
    queryKey: ["admin-customers", queryParams],
    queryFn: () => adminApi.users(queryParams),
  });

  const subscriptionsQuery = useQuery({
    queryKey: ["admin-subscriptions", "all"],
    queryFn: () => adminApi.subscriptions({ per_page: 100 }),
  });

  const consultationsQuery = useQuery({
    queryKey: ["admin-consultations", "all"],
    queryFn: () => adminApi.consultations({ per_page: 100 }),
  });

  const customers = customersQuery.data?.users?.data ?? [];
  const pagination = customersQuery.data?.users ?? {};
  const allSubscriptions = (subscriptionsQuery.data?.subscriptions?.data ?? []) as Record<string, unknown>[];
  const allConsultations = (consultationsQuery.data?.consultations?.data ?? []) as Record<string, unknown>[];

  const getCustomerSubscriptions = (userId: number) =>
    allSubscriptions.filter((s) => (s.customer as Record<string, unknown>)?.id === userId || s.user_id === userId);

  const getCustomerConsultations = (userId: number) =>
    allConsultations.filter((c) => (c.customer as Record<string, unknown>)?.id === userId);

  const columns: Column<Record<string, unknown>>[] = [
    { key: "name", header: "Name", render: (row) => row.name as string ?? "-" },
    { key: "email", header: "Email", render: (row) => row.email as string ?? "-" },
    { key: "phone", header: "Phone", render: (row) => row.phone as string ?? "-" },
    {
      key: "phone_verified_at",
      header: "Phone Verified",
      render: (row) => (row.phone_verified_at ? <span className="text-green-600">Yes</span> : <span className="text-red-500">No</span>),
    },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status as string} /> },
    { key: "created_at", header: "Joined", render: (row) => new Date(row.created_at as string).toLocaleDateString() },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <Button variant="outline" size="sm" className="rounded-lg" onClick={() => setSelectedCustomer(row)}>
          <Eye className="mr-1 h-3 w-3" /> View
        </Button>
      ),
    },
  ];

  return (
    <AdminLayout title="Customers" subtitle="View all customers and their activity." breadcrumbs={[{ label: "Customers" }]}>
      <DataTable
        columns={columns}
        data={customers as Record<string, unknown>[]}
        isLoading={customersQuery.isLoading}
        isError={customersQuery.isError}
        onRetry={() => customersQuery.refetch()}
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        searchPlaceholder="Search customers by name, email, phone..."
        page={pagination.current_page ?? 1}
        totalPages={pagination.last_page ?? 1}
        total={pagination.total}
        onPageChange={setPage}
      />

      <Dialog open={!!selectedCustomer} onOpenChange={(open) => !open && setSelectedCustomer(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Customer Profile</DialogTitle>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Name:</span> <span className="font-medium">{selectedCustomer.name as string}</span></div>
                <div><span className="text-muted-foreground">Email:</span> <span className="font-medium">{selectedCustomer.email as string}</span></div>
                <div><span className="text-muted-foreground">Phone:</span> <span className="font-medium">{selectedCustomer.phone as string ?? "-"}</span></div>
                <div><span className="text-muted-foreground">Status:</span> <StatusBadge status={selectedCustomer.status as string} /></div>
                <div><span className="text-muted-foreground">Phone Verified:</span> <span>{selectedCustomer.phone_verified_at ? "Yes" : "No"}</span></div>
                <div><span className="text-muted-foreground">Joined:</span> <span>{new Date(selectedCustomer.created_at as string).toLocaleDateString()}</span></div>
              </div>

              {(() => {
                const subs = getCustomerSubscriptions(selectedCustomer.id as number);
                return subs.length > 0 ? (
                  <div>
                    <h4 className="mb-2 text-sm font-medium">Subscriptions ({subs.length})</h4>
                    <div className="space-y-1">
                      {subs.map((s: Record<string, unknown>, i: number) => (
                        <div key={i} className="flex items-center justify-between rounded bg-gray-50 px-3 py-2 text-xs">
                          <span>{(s.plan as Record<string, unknown>)?.name as string ?? "-"}</span>
                          <StatusBadge status={s.status as string} />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null;
              })()}

              {(() => {
                const consults = getCustomerConsultations(selectedCustomer.id as number);
                return consults.length > 0 ? (
                  <div>
                    <h4 className="mb-2 text-sm font-medium">Consultations ({consults.length})</h4>
                    <div className="space-y-1">
                      {consults.map((c: Record<string, unknown>, i: number) => (
                        <div key={i} className="flex items-center justify-between rounded bg-gray-50 px-3 py-2 text-xs">
                          <span>{(c.doctor as Record<string, unknown>)?.name as string ?? "Unassigned"}</span>
                          <StatusBadge status={c.status as string} />
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null;
              })()}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminCustomers;
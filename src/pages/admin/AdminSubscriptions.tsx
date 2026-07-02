import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { adminApi } from "@/lib/api/adminApi";
import { getApiErrorMessage } from "@/lib/api/types";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Eye } from "lucide-react";

const formatCurrency = (value?: number) => `Rs. ${Number(value ?? 0).toLocaleString("en-IN")}`;

const AdminSubscriptions = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [planFilter, setPlanFilter] = useState("");
  const [page, setPage] = useState(1);
  const [selectedSub, setSelectedSub] = useState<Record<string, unknown> | null>(null);
  const [editStatus, setEditStatus] = useState("");
  const [editPincode, setEditPincode] = useState("");

  const queryParams: Record<string, unknown> = { page, per_page: 20 };
  if (search) queryParams.search = search;
  if (statusFilter) queryParams.status = statusFilter;

  const subsQuery = useQuery({
    queryKey: ["admin-subscriptions", queryParams],
    queryFn: () => adminApi.subscriptions(queryParams),
  });

  const plansQuery = useQuery({
    queryKey: ["admin-plans", "list"],
    queryFn: () => adminApi.plans({ per_page: 100 }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) => adminApi.updateSubscription(id, data),
    onSuccess: () => {
      toast({ title: "Subscription updated" });
      queryClient.invalidateQueries({ queryKey: ["admin-subscriptions"] });
      setSelectedSub(null);
    },
    onError: (error) => toast({ title: getApiErrorMessage(error, "Update failed"), variant: "destructive" }),
  });

  const subs = subsQuery.data?.subscriptions?.data ?? [];
  const pagination = subsQuery.data?.subscriptions ?? {};
  const plans = (plansQuery.data?.plans?.data ?? []) as Record<string, unknown>[];

  const openDetail = (sub: Record<string, unknown>) => {
    setSelectedSub(sub);
    setEditStatus(sub.status as string);
    setEditPincode((sub.delivery_pincode as string) ?? "");
  };

  const handleUpdate = () => {
    if (!selectedSub) return;
    const data: Record<string, unknown> = {};
    if (editStatus !== selectedSub.status) data.status = editStatus;
    if (editPincode !== (selectedSub.delivery_pincode as string)) data.delivery_pincode = editPincode;
    if (Object.keys(data).length === 0) { setSelectedSub(null); return; }
    updateMutation.mutate({ id: selectedSub.id as number, data });
  };

  const columns: Column<Record<string, unknown>>[] = [
    { key: "customer", header: "Customer", render: (row) => (row.customer as Record<string, unknown>)?.name as string ?? "-" },
    { key: "plan", header: "Plan", render: (row) => (row.plan as Record<string, unknown>)?.name as string ?? "-" },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status as string} /> },
    { key: "period", header: "Period", render: (row) => (row.period as string) ?? "-" },
    { key: "delivery_pincode", header: "Pincode", render: (row) => (row.delivery_pincode as string) ?? "-" },
    { key: "created_at", header: "Created", render: (row) => new Date(row.created_at as string).toLocaleDateString() },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <Button variant="outline" size="sm" className="rounded-lg" onClick={() => openDetail(row)}>
          <Eye className="mr-1 h-3 w-3" /> View
        </Button>
      ),
    },
  ];

  // Apply plan filter client-side since backend doesn't support it
  const filteredSubs = planFilter
    ? subs.filter((s: Record<string, unknown>) => String((s.plan as Record<string, unknown>)?.id) === planFilter)
    : subs;

  return (
    <AdminLayout title="Subscriptions" subtitle="Manage all subscriptions." breadcrumbs={[{ label: "Subscriptions" }]}>
      <div className="mb-4 flex flex-wrap gap-3">
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-40 rounded-lg">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="paused">Paused</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>
        <Select value={planFilter} onValueChange={(v) => setPlanFilter(v)}>
          <SelectTrigger className="w-40 rounded-lg">
            <SelectValue placeholder="All plans" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All plans</SelectItem>
            {plans.map((p: Record<string, unknown>) => (
              <SelectItem key={p.id as number} value={String(p.id)}>{p.name as string}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={filteredSubs as Record<string, unknown>[]}
        isLoading={subsQuery.isLoading}
        isError={subsQuery.isError}
        onRetry={() => subsQuery.refetch()}
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        searchPlaceholder="Search by customer name, email..."
        page={pagination.current_page ?? 1}
        totalPages={pagination.last_page ?? 1}
        total={pagination.total}
        onPageChange={setPage}
      />

      <Dialog open={!!selectedSub} onOpenChange={(open) => !open && setSelectedSub(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Subscription Details</DialogTitle>
            <DialogDescription>Update subscription status and delivery pincode.</DialogDescription>
          </DialogHeader>
          {selectedSub && (
            <div className="space-y-4">
              <div className="text-sm space-y-1">
                <p><span className="text-muted-foreground">Customer:</span> <span className="font-medium">{(selectedSub.customer as Record<string, unknown>)?.name as string}</span></p>
                <p><span className="text-muted-foreground">Plan:</span> <span className="font-medium">{(selectedSub.plan as Record<string, unknown>)?.name as string}</span></p>
                <p><span className="text-muted-foreground">Period:</span> <span className="font-medium">{selectedSub.period as string}</span></p>
                <p><span className="text-muted-foreground">Template:</span> <span className="font-medium">{(selectedSub.template as Record<string, unknown>)?.name as string ?? "-"}</span></p>
              </div>

              <div>
                <Label>Status</Label>
                <Select value={editStatus} onValueChange={setEditStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Delivery Pincode</Label>
                <Input value={editPincode} onChange={(e) => setEditPincode(e.target.value)} maxLength={6} />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedSub(null)}>Cancel</Button>
                <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminSubscriptions;
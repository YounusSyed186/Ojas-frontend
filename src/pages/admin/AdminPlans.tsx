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
import { Switch } from "@/components/ui/switch";
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

const AdminPlans = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedPlan, setSelectedPlan] = useState<Record<string, unknown> | null>(null);
  const [editForm, setEditForm] = useState<Record<string, unknown>>({});

  const queryParams: Record<string, unknown> = { page, per_page: 20 };
  if (search) queryParams.search = search;

  const plansQuery = useQuery({
    queryKey: ["admin-plans", queryParams],
    queryFn: () => adminApi.plans(queryParams),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) => adminApi.updatePlan(id, data),
    onSuccess: () => {
      toast({ title: "Plan updated" });
      queryClient.invalidateQueries({ queryKey: ["admin-plans"] });
      setSelectedPlan(null);
    },
    onError: (error) => toast({ title: getApiErrorMessage(error, "Update failed"), variant: "destructive" }),
  });

  const plans = plansQuery.data?.plans?.data ?? [];
  const pagination = plansQuery.data?.plans ?? {};

  const openDetail = (plan: Record<string, unknown>) => {
    setSelectedPlan(plan);
    setEditForm({
      name: plan.name ?? "",
      description: plan.description ?? "",
      price: plan.price ?? "",
      period: plan.period ?? "",
      is_active: plan.is_active ?? true,
    });
  };

  const handleUpdate = () => {
    if (!selectedPlan) return;
    const data: Record<string, unknown> = {};
    if (editForm.name !== selectedPlan.name) data.name = editForm.name;
    if (editForm.description !== selectedPlan.description) data.description = editForm.description;
    if (Number(editForm.price) !== Number(selectedPlan.price)) data.price = Number(editForm.price);
    if (editForm.period !== selectedPlan.period) data.period = editForm.period;
    if (editForm.is_active !== selectedPlan.is_active) data.is_active = editForm.is_active;
    if (Object.keys(data).length === 0) { setSelectedPlan(null); return; }
    updateMutation.mutate({ id: selectedPlan.id as number, data });
  };

  const columns: Column<Record<string, unknown>>[] = [
    { key: "name", header: "Name", render: (row) => row.name as string ?? "-" },
    { key: "period", header: "Period", render: (row) => (row.period as string) ?? "-" },
    { key: "price", header: "Price", render: (row) => formatCurrency(row.price as number) },
    { key: "is_active", header: "Active", render: (row) => <StatusBadge status={row.is_active ? "active" : "inactive"} /> },
    { key: "template", header: "Template", render: (row) => (row.template as Record<string, unknown>)?.name as string ?? "-" },
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

  return (
    <AdminLayout title="Subscription Plans" subtitle="Manage subscription plans." breadcrumbs={[{ label: "Plans" }]}>
      <DataTable
        columns={columns}
        data={plans as Record<string, unknown>[]}
        isLoading={plansQuery.isLoading}
        isError={plansQuery.isError}
        onRetry={() => plansQuery.refetch()}
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        searchPlaceholder="Search plans..."
        page={pagination.current_page ?? 1}
        totalPages={pagination.last_page ?? 1}
        total={pagination.total}
        onPageChange={setPage}
      />

      <Dialog open={!!selectedPlan} onOpenChange={(open) => !open && setSelectedPlan(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Plan</DialogTitle>
            <DialogDescription>Update plan details.</DialogDescription>
          </DialogHeader>
          {selectedPlan && (
            <div className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input value={editForm.name as string} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <Label>Description</Label>
                <Input value={editForm.description as string} onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Price</Label>
                  <Input type="number" value={editForm.price as string} onChange={(e) => setEditForm((f) => ({ ...f, price: e.target.value }))} />
                </div>
                <div>
                  <Label>Period</Label>
                  <Select value={editForm.period as string} onValueChange={(v) => setEditForm((f) => ({ ...f, period: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="week">Week</SelectItem>
                      <SelectItem value="month">Month</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={editForm.is_active as boolean}
                  onCheckedChange={(v) => setEditForm((f) => ({ ...f, is_active: v }))}
                />
                <Label>Active</Label>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedPlan(null)}>Cancel</Button>
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

export default AdminPlans;
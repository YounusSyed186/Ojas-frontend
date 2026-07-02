import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { adminApi } from "@/lib/api/adminApi";
import { getApiErrorMessage } from "@/lib/api/types";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Plus, Eye } from "lucide-react";

const AdminPincodes = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const [page, setPage] = useState(1);
  const [selectedPincode, setSelectedPincode] = useState<Record<string, unknown> | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editActive, setEditActive] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPincode, setNewPincode] = useState("");
  const [newLabel, setNewLabel] = useState("");

  const queryParams: Record<string, unknown> = { page, per_page: 20 };
  if (search) queryParams.search = search;
  if (activeFilter) queryParams.is_active = activeFilter === "active" ? "1" : "0";

  const pincodesQuery = useQuery({
    queryKey: ["admin-pincodes", queryParams],
    queryFn: () => adminApi.pincodes(queryParams),
  });

  const createMutation = useMutation({
    mutationFn: (data: { pincode: string; label: string }) => adminApi.createPincode(data),
    onSuccess: () => {
      toast({ title: "Pincode added" });
      queryClient.invalidateQueries({ queryKey: ["admin-pincodes"] });
      setShowAddForm(false);
      setNewPincode("");
      setNewLabel("");
    },
    onError: (error) => toast({ title: getApiErrorMessage(error, "Failed to add pincode"), variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) => adminApi.updatePincode(id, data),
    onSuccess: () => {
      toast({ title: "Pincode updated" });
      queryClient.invalidateQueries({ queryKey: ["admin-pincodes"] });
      setSelectedPincode(null);
    },
    onError: (error) => toast({ title: getApiErrorMessage(error, "Update failed"), variant: "destructive" }),
  });

  const pincodes = pincodesQuery.data?.pincodes?.data ?? [];
  const pagination = pincodesQuery.data?.pincodes ?? {};

  const openDetail = (pincode: Record<string, unknown>) => {
    setSelectedPincode(pincode);
    setEditLabel(pincode.label as string);
    setEditActive(pincode.is_active as boolean);
  };

  const handleUpdate = () => {
    if (!selectedPincode) return;
    const data: Record<string, unknown> = {};
    if (editLabel !== selectedPincode.label) data.label = editLabel;
    if (editActive !== selectedPincode.is_active) data.is_active = editActive;
    if (Object.keys(data).length === 0) { setSelectedPincode(null); return; }
    updateMutation.mutate({ id: selectedPincode.id as number, data });
  };

  const columns: Column<Record<string, unknown>>[] = [
    { key: "pincode", header: "Pincode", render: (row) => row.pincode as string ?? "-" },
    { key: "label", header: "Label", render: (row) => (row.label as string) ?? "-" },
    { key: "is_active", header: "Active", render: (row) => <StatusBadge status={row.is_active ? "active" : "inactive"} /> },
    { key: "created_at", header: "Created", render: (row) => new Date(row.created_at as string).toLocaleDateString() },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <Button variant="outline" size="sm" className="rounded-lg" onClick={() => openDetail(row)}>
          <Eye className="mr-1 h-3 w-3" /> Edit
        </Button>
      ),
    },
  ];

  return (
    <AdminLayout title="Pincodes" subtitle="Manage serviceable pincodes." breadcrumbs={[{ label: "Pincodes" }]}>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Select value={activeFilter} onValueChange={(v) => { setActiveFilter(v); setPage(1); }}>
          <SelectTrigger className="w-40 rounded-lg">
            <SelectValue placeholder="All" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => setShowAddForm(true)} className="rounded-lg">
          <Plus className="mr-1 h-4 w-4" /> Add Pincode
        </Button>
      </div>

      {showAddForm && (
        <div className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border bg-white p-4 shadow-sm">
          <div>
            <Label>Pincode</Label>
            <Input
              value={newPincode}
              onChange={(e) => setNewPincode(e.target.value)}
              maxLength={6}
              placeholder="6-digit pincode"
              className="w-32 rounded-lg"
            />
          </div>
          <div>
            <Label>Label</Label>
            <Input
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              placeholder="Area name"
              className="w-48 rounded-lg"
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => createMutation.mutate({ pincode: newPincode, label: newLabel })}
              disabled={newPincode.length !== 6 || !newLabel || createMutation.isPending}
              className="rounded-lg"
            >
              {createMutation.isPending ? "Adding..." : "Save"}
            </Button>
            <Button variant="outline" onClick={() => setShowAddForm(false)} className="rounded-lg">
              Cancel
            </Button>
          </div>
        </div>
      )}

      <DataTable
        columns={columns}
        data={pincodes as Record<string, unknown>[]}
        isLoading={pincodesQuery.isLoading}
        isError={pincodesQuery.isError}
        onRetry={() => pincodesQuery.refetch()}
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        searchPlaceholder="Search pincode..."
        page={pagination.current_page ?? 1}
        totalPages={pagination.last_page ?? 1}
        total={pagination.total}
        onPageChange={setPage}
      />

      <Dialog open={!!selectedPincode} onOpenChange={(open) => !open && setSelectedPincode(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit Pincode</DialogTitle>
            <DialogDescription>Update pincode label and status.</DialogDescription>
          </DialogHeader>
          {selectedPincode && (
            <div className="space-y-4">
              <p className="text-sm"><span className="text-muted-foreground">Pincode:</span> <span className="font-medium">{selectedPincode.pincode as string}</span></p>
              <div>
                <Label>Label</Label>
                <Input value={editLabel} onChange={(e) => setEditLabel(e.target.value)} />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={editActive} onCheckedChange={setEditActive} />
                <Label>Active</Label>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedPincode(null)}>Cancel</Button>
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

export default AdminPincodes;
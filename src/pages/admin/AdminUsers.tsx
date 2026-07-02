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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Eye } from "lucide-react";

const AdminUsers = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<Record<string, unknown> | null>(null);
  const [editForm, setEditForm] = useState<Record<string, string>>({});

  const queryParams: Record<string, unknown> = { page, per_page: 20 };
  if (search) queryParams.search = search;
  if (roleFilter) queryParams.role = roleFilter;
  if (statusFilter) queryParams.status = statusFilter;

  const usersQuery = useQuery({
    queryKey: ["admin-users", queryParams],
    queryFn: () => adminApi.users(queryParams),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) => adminApi.updateUser(id, data),
    onSuccess: () => {
      toast({ title: "User updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setSelectedUser(null);
    },
    onError: (error) => {
      toast({ title: getApiErrorMessage(error, "Failed to update user"), variant: "destructive" });
    },
  });

  const openDetail = (user: Record<string, unknown>) => {
    setSelectedUser(user);
    setEditForm({
      name: (user.name as string) ?? "",
      email: (user.email as string) ?? "",
      phone: (user.phone as string) ?? "",
      role: (user.role as string) ?? "",
      status: (user.status as string) ?? "",
    });
  };

  const handleUpdate = () => {
    if (!selectedUser) return;
    const data: Record<string, unknown> = {};
    if (editForm.name !== selectedUser.name) data.name = editForm.name;
    if (editForm.email !== selectedUser.email) data.email = editForm.email;
    if (editForm.phone !== selectedUser.phone) data.phone = editForm.phone;
    if (editForm.role !== selectedUser.role) data.role = editForm.role;
    if (editForm.status !== selectedUser.status) data.status = editForm.status;
    if (Object.keys(data).length === 0) {
      setSelectedUser(null);
      return;
    }
    updateMutation.mutate({ id: selectedUser.id as number, data });
  };

  const users = usersQuery.data?.users?.data ?? [];
  const pagination = usersQuery.data?.users ?? {};

  const columns: Column<Record<string, unknown>>[] = [
    { key: "name", header: "Name", render: (row) => row.name as string ?? "-" },
    { key: "email", header: "Email", render: (row) => row.email as string ?? "-" },
    { key: "phone", header: "Phone", render: (row) => row.phone as string ?? "-" },
    { key: "role", header: "Role", render: (row) => <StatusBadge status={row.role as string} /> },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status as string} /> },
    {
      key: "phone_verified_at",
      header: "Phone Verified",
      render: (row) => (row.phone_verified_at ? <span className="text-green-600">Yes</span> : <span className="text-red-500">No</span>),
    },
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
    <AdminLayout title="Users" subtitle="Manage all platform users." breadcrumbs={[{ label: "Users" }]}>
      <div className="mb-4 flex flex-wrap gap-3">
        <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v); setPage(1); }}>
          <SelectTrigger className="w-36 rounded-lg">
            <SelectValue placeholder="All roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            <SelectItem value="customer">Customer</SelectItem>
            <SelectItem value="doctor">Doctor</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-40 rounded-lg">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={users as Record<string, unknown>[]}
        isLoading={usersQuery.isLoading}
        isError={usersQuery.isError}
        onRetry={() => usersQuery.refetch()}
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        searchPlaceholder="Search by name, email, phone..."
        page={pagination.current_page ?? 1}
        totalPages={pagination.last_page ?? 1}
        total={pagination.total}
        onPageChange={setPage}
      />

      <Dialog open={!!selectedUser} onOpenChange={(open) => !open && setSelectedUser(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>View and update user information.</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Name</Label>
                  <Input value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input value={editForm.email} onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))} />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input value={editForm.phone} onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))} />
                </div>
                <div>
                  <Label>Role</Label>
                  <Select value={editForm.role} onValueChange={(v) => setEditForm((f) => ({ ...f, role: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="customer">Customer</SelectItem>
                      <SelectItem value="doctor">Doctor</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={editForm.status} onValueChange={(v) => setEditForm((f) => ({ ...f, status: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Phone Verified</Label>
                  <p className="mt-1 text-sm">{selectedUser.phone_verified_at ? "Yes" : "No"}</p>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedUser(null)}>Cancel</Button>
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

export default AdminUsers;
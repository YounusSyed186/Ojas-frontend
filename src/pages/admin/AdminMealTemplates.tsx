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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Eye } from "lucide-react";

const AdminMealTemplates = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState<Record<string, unknown> | null>(null);
  const [editForm, setEditForm] = useState<Record<string, unknown>>({});

  const queryParams: Record<string, unknown> = { page, per_page: 20 };
  if (search) queryParams.search = search;

  const templatesQuery = useQuery({
    queryKey: ["admin-meal-templates", queryParams],
    queryFn: () => adminApi.mealTemplates(queryParams),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) => adminApi.updateMealTemplate(id, data),
    onSuccess: () => {
      toast({ title: "Template updated" });
      queryClient.invalidateQueries({ queryKey: ["admin-meal-templates"] });
      setSelectedTemplate(null);
    },
    onError: (error) => toast({ title: getApiErrorMessage(error, "Update failed"), variant: "destructive" }),
  });

  const templates = templatesQuery.data?.templates?.data ?? [];
  const pagination = templatesQuery.data?.templates ?? {};

  const openDetail = (template: Record<string, unknown>) => {
    setSelectedTemplate(template);
    setEditForm({
      name: template.name ?? "",
      description: template.description ?? "",
      is_active: template.is_active ?? true,
    });
  };

  const handleUpdate = () => {
    if (!selectedTemplate) return;
    const data: Record<string, unknown> = {};
    if (editForm.name !== selectedTemplate.name) data.name = editForm.name;
    if (editForm.description !== selectedTemplate.description) data.description = editForm.description;
    if (editForm.is_active !== selectedTemplate.is_active) data.is_active = editForm.is_active;
    if (Object.keys(data).length === 0) { setSelectedTemplate(null); return; }
    updateMutation.mutate({ id: selectedTemplate.id as number, data });
  };

  const columns: Column<Record<string, unknown>>[] = [
    { key: "name", header: "Name", render: (row) => row.name as string ?? "-" },
    { key: "description", header: "Description", render: (row) => (row.description as string) ?? "-" },
    { key: "meal_options_count", header: "Meal Options", render: (row) => (row.meal_options_count as number) ?? 0 },
    { key: "is_active", header: "Active", render: (row) => <StatusBadge status={row.is_active ? "active" : "inactive"} /> },
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
    <AdminLayout title="Meal Templates" subtitle="Manage meal plan templates." breadcrumbs={[{ label: "Meal Templates" }]}>
      <DataTable
        columns={columns}
        data={templates as Record<string, unknown>[]}
        isLoading={templatesQuery.isLoading}
        isError={templatesQuery.isError}
        onRetry={() => templatesQuery.refetch()}
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        searchPlaceholder="Search templates..."
        page={pagination.current_page ?? 1}
        totalPages={pagination.last_page ?? 1}
        total={pagination.total}
        onPageChange={setPage}
      />

      <Dialog open={!!selectedTemplate} onOpenChange={(open) => !open && setSelectedTemplate(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Template</DialogTitle>
            <DialogDescription>Update template details.</DialogDescription>
          </DialogHeader>
          {selectedTemplate && (
            <div className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input value={editForm.name as string} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <Label>Description</Label>
                <Input value={editForm.description as string} onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))} />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={editForm.is_active as boolean}
                  onCheckedChange={(v) => setEditForm((f) => ({ ...f, is_active: v }))}
                />
                <Label>Active</Label>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedTemplate(null)}>Cancel</Button>
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

export default AdminMealTemplates;
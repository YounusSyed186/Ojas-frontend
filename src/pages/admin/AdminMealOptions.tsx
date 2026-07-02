import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { adminApi } from "@/lib/api/adminApi";
import apiClient from "@/lib/apiClient";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const AdminMealOptions = () => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");

  const templatesQuery = useQuery({
    queryKey: ["admin-meal-templates", "list"],
    queryFn: () => adminApi.mealTemplates({ per_page: 100 }),
  });

  const optionsQuery = useQuery({
    queryKey: ["meal-options", selectedTemplateId],
    queryFn: () => apiClient.get(`/meal-options/${selectedTemplateId}`).then((r) => r.data),
    enabled: !!selectedTemplateId,
  });

  const templates = (templatesQuery.data?.templates?.data ?? []) as Record<string, unknown>[];
  const options = optionsQuery.data?.options ?? [];

  const columns: Column<Record<string, unknown>>[] = [
    { key: "name", header: "Name", render: (row) => row.name as string ?? "-" },
    { key: "meal_type", header: "Meal Type", render: (row) => <StatusBadge status={row.meal_type as string} /> },
    { key: "calories", header: "Calories", render: (row) => (row.calories as string) ?? "-" },
    { key: "protein", header: "Protein", render: (row) => (row.protein as string) ?? "-" },
    { key: "carbs", header: "Carbs", render: (row) => (row.carbs as string) ?? "-" },
    { key: "fat", header: "Fat", render: (row) => (row.fat as string) ?? "-" },
    { key: "is_active", header: "Active", render: (row) => <StatusBadge status={row.is_active ? "active" : "inactive"} /> },
  ];

  return (
    <AdminLayout
      title="Meal Options"
      subtitle="View meal options grouped by template. Read-only - admin CRUD not available in backend."
      breadcrumbs={[{ label: "Meal Options" }]}
    >
      <div className="mb-4">
        <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
          <SelectTrigger className="w-64 rounded-lg">
            <SelectValue placeholder="Select a template" />
          </SelectTrigger>
          <SelectContent>
            {templates.map((t: Record<string, unknown>) => (
              <SelectItem key={t.id as number} value={String(t.id)}>
                {t.name as string} ({t.meal_options_count as number ?? 0} options)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedTemplateId ? (
        <DataTable
          columns={columns}
          data={options as Record<string, unknown>[]}
          isLoading={optionsQuery.isLoading}
          isError={optionsQuery.isError}
          onRetry={() => optionsQuery.refetch()}
          emptyTitle="No meal options for this template"
        />
      ) : (
        <div className="rounded-xl border bg-white p-12 text-center text-sm text-muted-foreground">
          Select a meal template above to view its meal options.
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminMealOptions;
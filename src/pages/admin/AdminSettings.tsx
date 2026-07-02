import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { adminApi } from "@/lib/api/adminApi";
import { getApiErrorMessage } from "@/lib/api/types";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { useState } from "react";

const AdminSettings = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editValues, setEditValues] = useState<Record<number, string>>({});

  const settingsQuery = useQuery({
    queryKey: ["admin-settings"],
    queryFn: () => adminApi.settings(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, value }: { id: number; value: string }) => adminApi.updateSetting(id, value),
    onSuccess: () => {
      toast({ title: "Setting updated" });
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] });
    },
    onError: (error) => toast({ title: getApiErrorMessage(error, "Update failed"), variant: "destructive" }),
  });

  const settings = (settingsQuery.data?.settings ?? []) as Record<string, unknown>[];

  return (
    <AdminLayout title="Settings" subtitle="Manage application settings." breadcrumbs={[{ label: "Settings" }]}>
      {settingsQuery.isLoading ? (
        <div className="rounded-xl border bg-white p-12 text-center text-sm text-muted-foreground">Loading settings...</div>
      ) : settingsQuery.isError ? (
        <div className="rounded-xl border bg-white p-12 text-center text-sm text-red-500">
          Failed to load settings. <button onClick={() => settingsQuery.refetch()} className="underline">Retry</button>
        </div>
      ) : settings.length === 0 ? (
        <div className="rounded-xl border bg-white p-12 text-center text-sm text-muted-foreground">No settings found.</div>
      ) : (
        <div className="space-y-3">
          {settings.map((setting) => {
            const id = setting.id as number;
            const currentValue = editValues[id] ?? (setting.value as string);
            return (
              <div key={id} className="flex flex-col gap-2 rounded-xl border bg-white p-4 shadow-sm md:flex-row md:items-end">
                <div className="min-w-[200px] flex-1">
                  <Label className="text-xs text-muted-foreground">{setting.key as string}</Label>
                  <p className="text-sm font-medium">{setting.description as string ?? ""}</p>
                </div>
                <div className="flex-1">
                  <Input
                    value={currentValue}
                    onChange={(e) => setEditValues((prev) => ({ ...prev, [id]: e.target.value }))}
                    className="rounded-lg"
                  />
                </div>
                <Button
                  size="sm"
                  className="rounded-lg shrink-0"
                  disabled={currentValue === (setting.value as string) || updateMutation.isPending}
                  onClick={() => updateMutation.mutate({ id, value: currentValue })}
                >
                  <Save className="mr-1 h-3 w-3" /> Save
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminSettings;
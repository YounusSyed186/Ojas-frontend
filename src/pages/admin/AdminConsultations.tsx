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
import { Eye, UserCheck } from "lucide-react";

const formatCurrency = (value?: number) => `Rs. ${Number(value ?? 0).toLocaleString("en-IN")}`;

const AdminConsultations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [selectedConsult, setSelectedConsult] = useState<Record<string, unknown> | null>(null);
  const [editStatus, setEditStatus] = useState("");
  const [editPaymentStatus, setEditPaymentStatus] = useState("");
  const [editScheduledFor, setEditScheduledFor] = useState("");
  const [assignDoctorId, setAssignDoctorId] = useState("");

  const queryParams: Record<string, unknown> = { page, per_page: 20 };
  if (search) queryParams.search = search;
  if (statusFilter) queryParams.status = statusFilter;

  const consultationsQuery = useQuery({
    queryKey: ["admin-consultations", queryParams],
    queryFn: () => adminApi.consultations(queryParams),
  });

  const doctorsQuery = useQuery({
    queryKey: ["admin-doctors", "list"],
    queryFn: () => adminApi.users({ role: "doctor", per_page: 100 }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) => adminApi.updateConsultation(id, data),
    onSuccess: () => {
      toast({ title: "Consultation updated" });
      queryClient.invalidateQueries({ queryKey: ["admin-consultations"] });
      setSelectedConsult(null);
    },
    onError: (error) => toast({ title: getApiErrorMessage(error, "Update failed"), variant: "destructive" }),
  });

  const assignMutation = useMutation({
    mutationFn: ({ consultationId, doctorId }: { consultationId: number; doctorId: number }) =>
      adminApi.assignDoctor(consultationId, doctorId),
    onSuccess: () => {
      toast({ title: "Doctor assigned" });
      queryClient.invalidateQueries({ queryKey: ["admin-consultations"] });
      setSelectedConsult(null);
    },
    onError: (error) => toast({ title: getApiErrorMessage(error, "Assignment failed"), variant: "destructive" }),
  });

  const consultations = consultationsQuery.data?.consultations?.data ?? [];
  const pagination = consultationsQuery.data?.consultations ?? {};
  const doctors = (doctorsQuery.data?.users?.data ?? []) as Record<string, unknown>[];

  const openDetail = (consult: Record<string, unknown>) => {
    setSelectedConsult(consult);
    setEditStatus(consult.status as string);
    setEditPaymentStatus((consult.payment_status as string) ?? "");
    setEditScheduledFor((consult.scheduled_for as string) ?? "");
    setAssignDoctorId("");
  };

  const handleUpdate = () => {
    if (!selectedConsult) return;
    const data: Record<string, unknown> = {};
    if (editStatus !== selectedConsult.status) data.status = editStatus;
    if (editPaymentStatus !== (selectedConsult.payment_status as string)) data.payment_status = editPaymentStatus;
    if (editScheduledFor !== (selectedConsult.scheduled_for as string)) data.scheduled_for = editScheduledFor;
    if (Object.keys(data).length === 0) { setSelectedConsult(null); return; }
    updateMutation.mutate({ id: selectedConsult.id as number, data });
  };

  const handleAssignDoctor = () => {
    if (!selectedConsult || !assignDoctorId) return;
    assignMutation.mutate({ consultationId: selectedConsult.id as number, doctorId: Number(assignDoctorId) });
  };

  const columns: Column<Record<string, unknown>>[] = [
    { key: "customer", header: "Customer", render: (row) => (row.customer as Record<string, unknown>)?.name as string ?? "-" },
    { key: "doctor", header: "Doctor", render: (row) => (row.doctor as Record<string, unknown>)?.name as string ?? "Unassigned" },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status as string} /> },
    { key: "payment_status", header: "Payment", render: (row) => <StatusBadge status={row.payment_status as string} /> },
    { key: "scheduled_for", header: "Scheduled", render: (row) => row.scheduled_for ? new Date(row.scheduled_for as string).toLocaleString() : "-" },
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
    <AdminLayout title="Consultations" subtitle="Manage consultations, assign doctors, update status." breadcrumbs={[{ label: "Consultations" }]}>
      <div className="mb-4 flex flex-wrap gap-3">
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-44 rounded-lg">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="requested">Requested</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="plan_assigned">Plan Assigned</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={consultations as Record<string, unknown>[]}
        isLoading={consultationsQuery.isLoading}
        isError={consultationsQuery.isError}
        onRetry={() => consultationsQuery.refetch()}
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        searchPlaceholder="Search consultations..."
        page={pagination.current_page ?? 1}
        totalPages={pagination.last_page ?? 1}
        total={pagination.total}
        onPageChange={setPage}
      />

      <Dialog open={!!selectedConsult} onOpenChange={(open) => !open && setSelectedConsult(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Consultation Details</DialogTitle>
            <DialogDescription>Update status, assign doctor, or schedule.</DialogDescription>
          </DialogHeader>
          {selectedConsult && (
            <div className="space-y-4">
              <div className="text-sm space-y-1">
                <p><span className="text-muted-foreground">Customer:</span> <span className="font-medium">{(selectedConsult.customer as Record<string, unknown>)?.name as string}</span></p>
                <p><span className="text-muted-foreground">Doctor:</span> <span className="font-medium">{(selectedConsult.doctor as Record<string, unknown>)?.name as string ?? "Unassigned"}</span></p>
                <p><span className="text-muted-foreground">Status:</span> <StatusBadge status={selectedConsult.status as string} /></p>
                <p><span className="text-muted-foreground">Payment:</span> <StatusBadge status={selectedConsult.payment_status as string} /></p>
                {selectedConsult.request_notes && <p><span className="text-muted-foreground">Notes:</span> {selectedConsult.request_notes as string}</p>}
                {selectedConsult.doctor_notes && <p><span className="text-muted-foreground">Doctor Notes:</span> {selectedConsult.doctor_notes as string}</p>}
              </div>

              <div className="border-t pt-4">
                <h4 className="mb-3 text-sm font-medium">Assign Doctor</h4>
                <div className="flex gap-2">
                  <Select value={assignDoctorId} onValueChange={setAssignDoctorId}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Select doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      {doctors.map((d: Record<string, unknown>) => (
                        <SelectItem key={d.id as number} value={String(d.id)}>{d.name as string}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    size="sm"
                    onClick={handleAssignDoctor}
                    disabled={!assignDoctorId || assignMutation.isPending}
                  >
                    <UserCheck className="mr-1 h-4 w-4" /> Assign
                  </Button>
                </div>
              </div>

              <div className="border-t pt-4 space-y-3">
                <h4 className="text-sm font-medium">Update Fields</h4>
                <div>
                  <Label>Status</Label>
                  <Select value={editStatus} onValueChange={setEditStatus}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="requested">Requested</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="plan_assigned">Plan Assigned</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Payment Status</Label>
                  <Select value={editPaymentStatus} onValueChange={setEditPaymentStatus}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="refunded">Refunded</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Scheduled Date/Time</Label>
                  <Input
                    type="datetime-local"
                    value={editScheduledFor ? editScheduledFor.substring(0, 16) : ""}
                    onChange={(e) => setEditScheduledFor(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setSelectedConsult(null)}>Cancel</Button>
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

export default AdminConsultations;
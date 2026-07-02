import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import { Loader2, Eye, CalendarDays, XCircle } from "lucide-react";
import { CustomerLayout } from "@/components/customer/CustomerLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { customerDashboardApi } from "@/lib/api/customerDashboardApi";
import { useToast } from "@/hooks/use-toast";
import type { DashboardConsultation } from "@/lib/api/types";

const statusClass = (status?: string) => {
  if (status === "paid" || status === "completed") return "bg-green-100 text-green-700";
  if (status === "pending" || status === "scheduled") return "bg-yellow-100 text-yellow-700";
  if (status === "cancelled" || status === "failed") return "bg-red-100 text-red-700";
  return "bg-secondary text-secondary-foreground";
};

const formatDate = (value?: string) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

const CustomerConsultations = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("all");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["customer-consultations", statusFilter],
    queryFn: () => customerDashboardApi.consultations({ status: statusFilter !== "all" ? statusFilter : undefined }),
  });

  const cancelConsultation = useMutation({
    mutationFn: (id: number) => customerDashboardApi.cancelConsultation(id),
    onSuccess: () => {
      toast({ title: "Consultation cancelled" });
      queryClient.invalidateQueries({ queryKey: ["customer-consultations"] });
    },
    onError: () => toast({ title: "Failed to cancel consultation", variant: "destructive" }),
  });

  const consultations: DashboardConsultation[] = data?.consultations?.data ?? data?.consultations ?? [];

  return (
    <CustomerLayout title="Consultations" subtitle="View and manage your consultations.">
      <div className="space-y-4">
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button asChild>
            <Link to="/experts"><CalendarDays className="w-4 h-4 mr-2" /> Book Consultation</Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div>
        ) : isError ? (
          <div className="text-center py-20">
            <p className="text-red-500 mb-4">Failed to load consultations.</p>
            <Button onClick={() => refetch()}>Retry</Button>
          </div>
        ) : consultations.length === 0 ? (
          <div className="text-center py-20">
            <CalendarDays className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No consultations found.</p>
            <Button asChild><Link to="/experts">Book a Consultation</Link></Button>
          </div>
        ) : (
          <div className="space-y-3">
            {consultations.map((c: Record<string, unknown>) => (
              <div key={c.id as number} className="rounded-2xl bg-card shadow-sm border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="font-medium">Consultation #{c.id as number}</div>
                  <div className="text-sm text-muted-foreground">
                    Doctor: {((c.doctor as Record<string, unknown>)?.name as string) ?? "Pending"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatDate(c.created_at as string)}
                  </div>
                  <div className="flex gap-2 mt-1">
                    <Badge className={statusClass(c.status as string)}>{c.status as string}</Badge>
                    <Badge className={statusClass(c.payment_status as string)}>{(c.payment_status as string) ?? "pending"}</Badge>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button size="sm" variant="outline" onClick={() => navigate(`/customer/consultations/${c.id}`)}>
                    <Eye className="w-4 h-4 mr-1" /> View
                  </Button>
                  {(c.status === "pending") && (
                    <Button size="sm" variant="outline" className="text-red-500 border-red-200" disabled={cancelConsultation.isPending}
                      onClick={() => {
                        if (confirm("Cancel this consultation?")) {
                          cancelConsultation.mutate(c.id as number);
                        }
                      }}
                    >
                      <XCircle className="w-4 h-4 mr-1" /> Cancel
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </CustomerLayout>
  );
};

export default CustomerConsultations;
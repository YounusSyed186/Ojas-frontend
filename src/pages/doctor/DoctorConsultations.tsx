import { useState, useMemo, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import {
  CalendarDays,
  ClipboardList,
  Search,
  X,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Utensils,
} from "lucide-react";
import { DoctorLayout } from "@/components/doctor/DoctorLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { doctorDashboardApi } from "@/lib/api/doctorDashboardApi";
import { getApiErrorMessage } from "@/lib/api/types";
import { useToast } from "@/hooks/use-toast";

const STATUSES = ["", "requested", "pending", "scheduled", "completed", "plan_assigned", "cancelled"];

const formatDate = (value?: string | null) => {
  if (!value) return "-";
  return new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const statusVariant = (s?: string | null): "default" | "secondary" | "destructive" | "outline" => {
  if (s === "completed" || s === "plan_assigned") return "default";
  if (s === "scheduled") return "secondary";
  if (s === "cancelled") return "destructive";
  return "outline";
};

const statusLabel = (s?: string | null) => {
  if (!s) return "Unknown";
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

const DoctorConsultations = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  const [scope, setScope] = useState<"assigned" | "available">(
    (searchParams.get("scope") as "assigned" | "available") || "assigned"
  );
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [scheduleAt, setScheduleAt] = useState("");
  const [notes, setNotes] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [showDetail, setShowDetail] = useState(false);

  const consultationsQuery = useQuery({
    queryKey: ["doctor-consultations", scope, search, statusFilter, page],
    queryFn: () =>
      doctorDashboardApi.consultations({
        scope,
        search: search || undefined,
        status: statusFilter || undefined,
        page,
        per_page: 10,
      }),
  });

  const detailQuery = useQuery({
    queryKey: ["doctor-consultation", selectedId],
    queryFn: () => doctorDashboardApi.consultation(selectedId as number),
    enabled: selectedId !== null,
  });

  const templatesQuery = useQuery({
    queryKey: ["doctor-meal-templates"],
    queryFn: () => doctorDashboardApi.mealTemplates(),
  });

  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["doctor-consultations"] });
    if (selectedId) queryClient.invalidateQueries({ queryKey: ["doctor-consultation", selectedId] });
    queryClient.invalidateQueries({ queryKey: ["doctor-dashboard"] });
  }, [queryClient, selectedId]);

  const acceptMutation = useMutation({
    mutationFn: doctorDashboardApi.acceptConsultation,
    onSuccess: () => { toast({ title: "Consultation accepted" }); refresh(); },
    onError: (error) => toast({ title: getApiErrorMessage(error, "Unable to accept"), variant: "destructive" }),
  });

  const scheduleMutation = useMutation({
    mutationFn: ({ id, scheduledFor }: { id: number; scheduledFor: string }) =>
      doctorDashboardApi.scheduleConsultation(id, scheduledFor),
    onSuccess: () => { toast({ title: "Consultation scheduled" }); setScheduleAt(""); refresh(); },
    onError: (error) => toast({ title: getApiErrorMessage(error, "Unable to schedule"), variant: "destructive" }),
  });

  const notesMutation = useMutation({
    mutationFn: ({ id, doctorNotes }: { id: number; doctorNotes: string }) =>
      doctorDashboardApi.addNotes(id, doctorNotes),
    onSuccess: () => { toast({ title: "Notes saved" }); setNotes(""); refresh(); },
    onError: (error) => toast({ title: getApiErrorMessage(error, "Unable to save notes"), variant: "destructive" }),
  });

  const assignMutation = useMutation({
    mutationFn: ({ id, mealPlanTemplateId }: { id: number; mealPlanTemplateId: number }) =>
      doctorDashboardApi.assignPlan(id, mealPlanTemplateId),
    onSuccess: () => { toast({ title: "Meal plan assigned" }); refresh(); },
    onError: (error) => toast({ title: getApiErrorMessage(error, "Unable to assign plan"), variant: "destructive" }),
  });

  const completeMutation = useMutation({
    mutationFn: doctorDashboardApi.markCompleted,
    onSuccess: () => { toast({ title: "Consultation completed" }); refresh(); },
    onError: (error) => toast({ title: getApiErrorMessage(error, "Unable to complete"), variant: "destructive" }),
  });

  const consultations = consultationsQuery.data?.consultations?.data ?? [];
  const pagination = consultationsQuery.data?.consultations;
  const templates = templatesQuery.data?.templates ?? [];
  const selectedConsultation = detailQuery.data?.consultation;
  const customerHealth = detailQuery.data?.customer_health_profile;

  const busy = acceptMutation.isPending || scheduleMutation.isPending || notesMutation.isPending || assignMutation.isPending || completeMutation.isPending;

  const handleSearch = () => {
    setPage(1);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);
    if (scope !== "assigned") params.set("scope", scope);
    setSearchParams(params);
  };

  const openDetail = (id: number) => {
    setSelectedId(id);
    setScheduleAt("");
    setNotes("");
    setTemplateId("");
    setShowDetail(true);
  };

  return (
    <DoctorLayout title="Consultations" subtitle="Manage your consultations - accept, schedule, add notes, and complete.">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex gap-2">
          <Button variant={scope === "assigned" ? "default" : "outline"} size="sm" className="rounded-full" onClick={() => { setScope("assigned"); setPage(1); }}>
            Assigned
          </Button>
          <Button variant={scope === "available" ? "default" : "outline"} size="sm" className="rounded-full" onClick={() => { setScope("available"); setPage(1); }}>
            Available
          </Button>
        </div>
        <div className="flex-1 min-w-[200px] max-w-sm flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, phone, or ID"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-9 rounded-xl"
            />
          </div>
          <Button variant="outline" size="icon" className="rounded-xl shrink-0" onClick={handleSearch}>
            <Search className="h-4 w-4" />
          </Button>
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-[160px] rounded-xl">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value=" ">All statuses</SelectItem>
            {STATUSES.filter(Boolean).map((s) => (
              <SelectItem key={s} value={s}>{statusLabel(s)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Loading */}
      {consultationsQuery.isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-white" />
          ))}
        </div>
      )}

      {/* Error */}
      {consultationsQuery.isError && (
        <div className="flex flex-col items-center justify-center py-20">
          <AlertCircle className="h-10 w-10 text-destructive mb-3" />
          <p className="font-medium">Failed to load consultations</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => consultationsQuery.refetch()}>
            Retry
          </Button>
        </div>
      )}

      {/* Empty */}
      {!consultationsQuery.isLoading && !consultationsQuery.isError && consultations.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <ClipboardList className="h-12 w-12 mb-3 opacity-40" />
          <p className="font-medium">No consultations found</p>
          <p className="text-sm">{scope === "available" ? "No available requests right now." : "No assigned consultations yet."}</p>
        </div>
      )}

      {/* List */}
      {!consultationsQuery.isLoading && !consultationsQuery.isError && consultations.length > 0 && (
        <div className="space-y-3">
          {consultations.map((c: any) => (
            <Card key={c.id} className="border-0 bg-white shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="rounded-full bg-[#021B09]/10 p-2.5 shrink-0">
                      <ClipboardList className="h-4 w-4 text-[#021B09]" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{c.customer?.name || "Customer"}</p>
                      <p className="text-xs text-muted-foreground">{c.customer?.phone || "No phone"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={statusVariant(c.status)} className="text-xs">{statusLabel(c.status)}</Badge>
                    {c.payment_status && (
                      <Badge variant="outline" className={`text-xs ${c.payment_status === "paid" ? "border-green-200 text-green-700" : ""}`}>
                        {c.payment_status}
                      </Badge>
                    )}
                    {c.scheduled_for && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <CalendarDays className="h-3 w-3" /> {formatDate(c.scheduled_for)}
                      </span>
                    )}
                    <Button size="sm" variant="outline" className="rounded-full" onClick={() => openDetail(c.id)}>
                      Manage
                    </Button>
                    {scope === "available" && (
                      <Button size="sm" className="rounded-full" disabled={busy} onClick={() => acceptMutation.mutate(c.id)}>
                        {acceptMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Accept"}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.last_page > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <Button variant="outline" size="sm" className="rounded-full" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {pagination.current_page} of {pagination.last_page}
          </span>
          <Button variant="outline" size="sm" className="rounded-full" disabled={page >= pagination.last_page} onClick={() => setPage((p) => p + 1)}>
            Next
          </Button>
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={showDetail} onOpenChange={(open) => { if (!open) setShowDetail(false); }}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Consultation Details</DialogTitle>
            <DialogDescription>Manage this consultation</DialogDescription>
          </DialogHeader>

          {detailQuery.isLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin" /></div>
          ) : detailQuery.isError ? (
            <div className="flex flex-col items-center py-8">
              <AlertCircle className="h-8 w-8 text-destructive mb-2" />
              <p className="text-sm">Failed to load details</p>
              <Button size="sm" variant="outline" className="mt-2" onClick={() => detailQuery.refetch()}>Retry</Button>
            </div>
          ) : selectedConsultation ? (
            <div className="space-y-5">
              {/* Patient Info */}
              <div className="rounded-xl bg-[#021B09]/5 p-4 space-y-2 text-sm">
                <h4 className="font-semibold text-base">Patient Information</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div><span className="text-muted-foreground">Name:</span> {selectedConsultation.customer?.name || "-"}</div>
                  <div><span className="text-muted-foreground">Phone:</span> {selectedConsultation.customer?.phone || "-"}</div>
                  <div><span className="text-muted-foreground">Email:</span> {selectedConsultation.customer?.email || "-"}</div>
                  <div><span className="text-muted-foreground">Pincode:</span> {selectedConsultation.customer?.pincode || "-"}</div>
                </div>
              </div>

              {/* Health Profile */}
              {customerHealth && (
                <div className="rounded-xl bg-blue-50 p-4 space-y-2 text-sm">
                  <h4 className="font-semibold text-base">Health Profile</h4>
                  {customerHealth.health_details ? (
                    <pre className="text-xs whitespace-pre-wrap font-sans">{JSON.stringify(customerHealth.health_details, null, 2)}</pre>
                  ) : (
                    <p className="text-muted-foreground">No health details available</p>
                  )}
                  {customerHealth.status && <div><span className="text-muted-foreground">Subscription:</span> {customerHealth.status}</div>}
                </div>
              )}

              {/* Consultation Info */}
              <div className="rounded-xl bg-secondary/30 p-4 space-y-2 text-sm">
                <h4 className="font-semibold text-base">Consultation</h4>
                <div><span className="text-muted-foreground">Status:</span> {statusLabel(selectedConsultation.status)}</div>
                <div><span className="text-muted-foreground">Payment:</span> {selectedConsultation.payment_status || "-"}</div>
                <div><span className="text-muted-foreground">Preferred slot:</span> {formatDate(selectedConsultation.preferred_slot_at)}</div>
                <div><span className="text-muted-foreground">Scheduled:</span> {formatDate(selectedConsultation.scheduled_for)}</div>
                <div><span className="text-muted-foreground">Request notes:</span> {selectedConsultation.request_notes || "-"}</div>
                <div><span className="text-muted-foreground">Doctor notes:</span> {selectedConsultation.doctor_notes || "-"}</div>
              </div>

              {/* Actions */}
              <div className="space-y-4 border-t pt-4">
                {/* Schedule */}
                <div className="space-y-2">
                  <Label>Schedule Consultation</Label>
                  <div className="flex gap-2">
                    <Input type="datetime-local" value={scheduleAt} onChange={(e) => setScheduleAt(e.target.value)} className="rounded-xl flex-1" />
                    <Button size="sm" className="rounded-full shrink-0" disabled={busy || !scheduleAt}
                      onClick={() => scheduleMutation.mutate({ id: selectedId!, scheduledFor: new Date(scheduleAt).toISOString() })}>
                      <CalendarDays className="mr-1 h-4 w-4" /> Schedule
                    </Button>
                  </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label>Add Doctor Notes</Label>
                  <Textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Add consultation notes..." />
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="rounded-full" disabled={busy || !notes.trim()}
                      onClick={() => notesMutation.mutate({ id: selectedId!, doctorNotes: notes })}>
                      Save Notes
                    </Button>
                    <Button size="sm" variant="outline" className="rounded-full" disabled={busy || !notes.trim()}
                      onClick={() => notesMutation.mutate({ id: selectedId!, doctorNotes: notes })}>
                      Save & Complete
                    </Button>
                  </div>
                </div>

                {/* Assign Meal Plan */}
                <div className="space-y-2">
                  <Label>Assign Meal Plan</Label>
                  <div className="flex gap-2">
                    <Select value={templateId} onValueChange={setTemplateId}>
                      <SelectTrigger className="rounded-xl flex-1">
                        <SelectValue placeholder="Choose template" />
                      </SelectTrigger>
                      <SelectContent>
                        {templates.map((t: { id: number; name: string }) => (
                          <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button size="sm" className="rounded-full shrink-0" disabled={busy || !templateId}
                      onClick={() => assignMutation.mutate({ id: selectedId!, mealPlanTemplateId: Number(templateId) })}>
                      <Utensils className="mr-1 h-4 w-4" /> Assign
                    </Button>
                  </div>
                </div>

                {/* Complete */}
                <div className="pt-2">
                  <Button className="rounded-full w-full" disabled={busy || selectedConsultation.status === "completed" || selectedConsultation.status === "plan_assigned"}
                    onClick={() => completeMutation.mutate(selectedId!)}>
                    <CheckCircle2 className="mr-2 h-4 w-4" /> Mark as Completed
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </DoctorLayout>
  );
};

export default DoctorConsultations;
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, AlertCircle, Clock } from "lucide-react";
import { DoctorLayout } from "@/components/doctor/DoctorLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { doctorDashboardApi } from "@/lib/api/doctorDashboardApi";

const formatTime = (value?: string | null) => {
  if (!value) return "-";
  return new Date(value).toLocaleString("en-IN", { hour: "2-digit", minute: "2-digit" });
};

const formatDate = (value?: string | null) => {
  if (!value) return "-";
  return new Date(value).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

const statusVariant = (s?: string | null): "default" | "secondary" | "destructive" | "outline" => {
  if (s === "completed" || s === "plan_assigned") return "default";
  if (s === "scheduled") return "secondary";
  if (s === "cancelled") return "destructive";
  return "outline";
};

const DoctorSchedule = () => {
  const [view, setView] = useState<"today" | "weekly" | "monthly">("today");
  const [page, setPage] = useState(1);

  const scheduleQuery = useQuery({
    queryKey: ["doctor-schedule", view, page],
    queryFn: () => doctorDashboardApi.schedule({ view, page }),
  });

  const appointments = scheduleQuery.data?.appointments?.data ?? [];
  const pagination = scheduleQuery.data?.appointments;

  return (
    <DoctorLayout title="Schedule" subtitle="View your consultation schedule.">
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex gap-2">
          {(["today", "weekly", "monthly"] as const).map((v) => (
            <Button
              key={v}
              variant={view === v ? "default" : "outline"}
              size="sm"
              className="rounded-full capitalize"
              onClick={() => { setView(v); setPage(1); }}
            >
              {v}
            </Button>
          ))}
        </div>
      </div>

      {scheduleQuery.isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-white" />
          ))}
        </div>
      )}

      {scheduleQuery.isError && (
        <div className="flex flex-col items-center justify-center py-20">
          <AlertCircle className="h-10 w-10 text-destructive mb-3" />
          <p className="font-medium">Failed to load schedule</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => scheduleQuery.refetch()}>Retry</Button>
        </div>
      )}

      {!scheduleQuery.isLoading && !scheduleQuery.isError && appointments.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <CalendarDays className="h-12 w-12 mb-3 opacity-40" />
          <p className="font-medium">No appointments scheduled</p>
          <p className="text-sm">Your schedule will appear here.</p>
        </div>
      )}

      {!scheduleQuery.isLoading && !scheduleQuery.isError && appointments.length > 0 && (
        <div className="space-y-3">
          {appointments.map((a: any) => (
            <Card key={a.id} className="border-0 bg-white shadow-sm">
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-[#021B09]/10 p-2.5">
                      <Clock className="h-4 w-4 text-[#021B09]" />
                    </div>
                    <div>
                      <p className="font-medium">{a.customer?.name || "Patient"}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <CalendarDays className="h-3 w-3" /> {formatDate(a.scheduled_for)} at {formatTime(a.scheduled_for)}
                      </p>
                    </div>
                  </div>
                  <Badge variant={statusVariant(a.status)}>{a.status}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {pagination && pagination.last_page > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <Button variant="outline" size="sm" className="rounded-full" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</Button>
          <span className="text-sm text-muted-foreground">Page {pagination.current_page} of {pagination.last_page}</span>
          <Button variant="outline" size="sm" className="rounded-full" disabled={page >= pagination.last_page} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      )}
    </DoctorLayout>
  );
};

export default DoctorSchedule;
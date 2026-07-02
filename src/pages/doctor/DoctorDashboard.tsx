import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  Stethoscope,
  Users,
  Utensils,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  Loader2,
} from "lucide-react";
import { DoctorLayout } from "@/components/doctor/DoctorLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { doctorDashboardApi } from "@/lib/api/doctorDashboardApi";
import { getApiErrorMessage } from "@/lib/api/types";
import { useToast } from "@/hooks/use-toast";

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

const formatTime = (value?: string | null) => {
  if (!value) return "-";
  return new Date(value).toLocaleString("en-IN", { hour: "2-digit", minute: "2-digit" });
};

const statusVariant = (status?: string | null): "default" | "secondary" | "destructive" | "outline" => {
  if (status === "completed" || status === "plan_assigned") return "default";
  if (status === "scheduled") return "secondary";
  if (status === "cancelled") return "destructive";
  return "outline";
};

type StatCardProps = {
  label: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
};

const StatCard = ({ label, value, icon: Icon, href }: StatCardProps) => {
  const content = (
    <Card className="border-0 bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
            <p className="text-3xl font-bold text-[#021B09]">{value}</p>
          </div>
          <div className="rounded-xl bg-[#021B09]/5 p-3">
            <Icon className="h-5 w-5 text-[#021B09]" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
  if (href) return <Link to={href}>{content}</Link>;
  return content;
};

const DoctorDashboard = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const dashboardQuery = useQuery({
    queryKey: ["doctor-dashboard"],
    queryFn: () => doctorDashboardApi.dashboard(),
  });

  const todayScheduleQuery = useQuery({
    queryKey: ["doctor-schedule", "today"],
    queryFn: () => doctorDashboardApi.schedule({ view: "today" }),
    enabled: false,
  });

  const acceptMutation = useMutation({
    mutationFn: doctorDashboardApi.acceptConsultation,
    onSuccess: () => {
      toast({ title: "Consultation accepted" });
      queryClient.invalidateQueries({ queryKey: ["doctor-dashboard"] });
    },
    onError: (error) => toast({ title: getApiErrorMessage(error, "Unable to accept"), variant: "destructive" }),
  });

  if (dashboardQuery.isLoading) {
    return (
      <DoctorLayout title="Dashboard" subtitle="Overview of your practice.">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="border-0 bg-white shadow-sm">
              <CardContent className="p-5"><div className="h-20 animate-pulse rounded-lg bg-muted" /></CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-8 grid gap-6 xl:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i} className="border-0 bg-white shadow-sm">
              <CardContent className="p-5"><div className="h-64 animate-pulse rounded-lg bg-muted" /></CardContent>
            </Card>
          ))}
        </div>
      </DoctorLayout>
    );
  }

  if (dashboardQuery.isError) {
    return (
      <DoctorLayout title="Dashboard" subtitle="Overview of your practice.">
        <div className="flex flex-col items-center justify-center py-20">
          <AlertCircle className="h-12 w-12 text-destructive mb-4" />
          <p className="text-lg font-medium">Failed to load dashboard</p>
          <p className="text-sm text-muted-foreground mb-4">{(dashboardQuery.error as Error)?.message || "An error occurred"}</p>
          <Button onClick={() => dashboardQuery.refetch()} disabled={dashboardQuery.isFetching}>
            {dashboardQuery.isFetching ? "Retrying..." : "Retry"}
          </Button>
        </div>
      </DoctorLayout>
    );
  }

  const stats = dashboardQuery.data?.stats ?? {};
  const recentAssigned: any[] = dashboardQuery.data?.recent_assigned ?? [];
  const availableRequests: any[] = dashboardQuery.data?.available_requests ?? [];
  const activeSubscriptions: any[] = dashboardQuery.data?.active_subscriptions ?? [];
  const recentMealPlans: any[] = dashboardQuery.data?.recent_meal_plans ?? [];

  return (
    <DoctorLayout title="Dashboard" subtitle="Overview of your practice.">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Assigned Consultations" value={stats.assigned_consultations ?? 0} icon={Stethoscope} href="/doctor/consultations" />
        <StatCard label="Available Requests" value={stats.available_requests ?? 0} icon={AlertCircle} href="/doctor/consultations?scope=available" />
        <StatCard label="Scheduled Today" value={stats.scheduled_today ?? 0} icon={CalendarDays} href="/doctor/schedule" />
        <StatCard label="Completed This Week" value={stats.completed_this_week ?? 0} icon={CheckCircle2} href="/doctor/consultations?status=completed" />
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        {/* Recent Activity */}
        <Card className="border-0 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#021B09]" />
              Recent Activity
            </CardTitle>
            <Button asChild variant="ghost" size="sm" className="rounded-full">
              <Link to="/doctor/consultations">View all <ArrowRight className="ml-1 h-3 w-3" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentAssigned.length === 0 && availableRequests.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-muted-foreground">
                <Clock className="h-8 w-8 mb-2 opacity-40" />
                <p className="text-sm">No recent activity</p>
              </div>
            ) : (
              <>
                {recentAssigned.slice(0, 3).map((c: any) => (
                  <div key={c.id} className="flex items-center justify-between rounded-xl bg-[#021B09]/5 p-3">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-[#021B09]/10 p-2">
                        <Stethoscope className="h-3.5 w-3.5 text-[#021B09]" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{c.customer?.name || "Customer"}</p>
                        <p className="text-xs text-muted-foreground">Assigned {formatDate(c.created_at)}</p>
                      </div>
                    </div>
                    <Badge variant={statusVariant(c.status)} className="text-xs">{c.status}</Badge>
                  </div>
                ))}
                {availableRequests.slice(0, 2).map((c: any) => (
                  <div key={c.id} className="flex items-center justify-between rounded-xl bg-yellow-50 p-3">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-yellow-100 p-2">
                        <AlertCircle className="h-3.5 w-3.5 text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{c.customer?.name || "Customer"}</p>
                        <p className="text-xs text-muted-foreground">Available request</p>
                      </div>
                    </div>
                    <Button size="sm" className="rounded-full h-8" disabled={acceptMutation.isPending} onClick={() => acceptMutation.mutate(c.id)}>
                      {acceptMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Accept"}
                    </Button>
                  </div>
                ))}
              </>
            )}
          </CardContent>
        </Card>

        {/* Active Subscriptions & Meal Plans */}
        <Card className="border-0 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Users className="h-4 w-4 text-[#021B09]" />
              Active Patients
            </CardTitle>
            <Button asChild variant="ghost" size="sm" className="rounded-full">
              <Link to="/doctor/patients">View all <ArrowRight className="ml-1 h-3 w-3" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {activeSubscriptions.length === 0 ? (
              <div className="flex flex-col items-center py-8 text-muted-foreground">
                <Users className="h-8 w-8 mb-2 opacity-40" />
                <p className="text-sm">No active patients</p>
              </div>
            ) : (
              activeSubscriptions.slice(0, 5).map((s: any) => (
                <div key={s.id} className="flex items-center justify-between rounded-xl bg-[#021B09]/5 p-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-[#021B09]/10 p-2">
                      <Users className="h-3.5 w-3.5 text-[#021B09]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{s.customer?.name || "Patient"}</p>
                      <p className="text-xs text-muted-foreground">{s.plan?.name || "Subscription"}</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-700 text-xs">Active</Badge>
                </div>
              ))
            )}
            {recentMealPlans.length > 0 && (
              <>
                <div className="pt-2 border-t">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
                    <Utensils className="h-3 w-3" /> Recent Meal Plans
                  </p>
                  {recentMealPlans.slice(0, 3).map((mp: any) => (
                    <div key={mp.id} className="flex items-center justify-between py-2">
                      <p className="text-sm">{mp.customer?.name || "Patient"}</p>
                      <p className="text-xs text-muted-foreground">{mp.template?.name || "Plan"}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </DoctorLayout>
  );
};

export default DoctorDashboard;
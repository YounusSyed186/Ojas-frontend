import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Users, AlertCircle, Loader2 } from "lucide-react";
import { DoctorLayout } from "@/components/doctor/DoctorLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { doctorDashboardApi } from "@/lib/api/doctorDashboardApi";

const formatDate = (value?: string | null) => {
  if (!value) return "-";
  return new Date(value).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

const DoctorPatientDetail = () => {
  const { id } = useParams<{ id: string }>();

  const patientQuery = useQuery({
    queryKey: ["doctor-patient", id],
    queryFn: () => doctorDashboardApi.patient(Number(id)),
    enabled: !!id,
  });

  return (
    <DoctorLayout title="Patient Details" subtitle="View patient information.">
      <Button asChild variant="ghost" size="sm" className="rounded-full mb-4">
        <Link to="/doctor/patients"><ArrowLeft className="mr-1 h-4 w-4" /> Back to Patients</Link>
      </Button>

      {patientQuery.isLoading && (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div>
      )}

      {patientQuery.isError && (
        <div className="flex flex-col items-center justify-center py-20">
          <AlertCircle className="h-10 w-10 text-destructive mb-3" />
          <p className="font-medium">Failed to load patient</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => patientQuery.refetch()}>Retry</Button>
        </div>
      )}

      {patientQuery.data && (
        <div className="space-y-6">
          <Card className="border-0 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-[#021B09]" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-muted-foreground">Name:</span> {patientQuery.data.patient?.name || "-"}</div>
              <div><span className="text-muted-foreground">Email:</span> {patientQuery.data.patient?.email || "-"}</div>
              <div><span className="text-muted-foreground">Phone:</span> {patientQuery.data.patient?.phone || "-"}</div>
              <div><span className="text-muted-foreground">Status:</span> {patientQuery.data.patient?.status || "-"}</div>
            </CardContent>
          </Card>

          {patientQuery.data.subscription && (
            <Card className="border-0 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Subscription</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">Plan:</span> {patientQuery.data.subscription.plan?.name || "-"}</div>
                <div><span className="text-muted-foreground">Status:</span> <Badge className="bg-green-100 text-green-700">{patientQuery.data.subscription.status}</Badge></div>
                <div><span className="text-muted-foreground">Start:</span> {formatDate(patientQuery.data.subscription.start_date)}</div>
                <div><span className="text-muted-foreground">End:</span> {formatDate(patientQuery.data.subscription.end_date)}</div>
              </CardContent>
            </Card>
          )}

          {patientQuery.data.meal_plan && (
            <Card className="border-0 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Current Meal Plan</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <p><span className="text-muted-foreground">Template:</span> {patientQuery.data.meal_plan.template?.name || "-"}</p>
                <p><span className="text-muted-foreground">Assigned on:</span> {formatDate(patientQuery.data.meal_plan.assigned_on)}</p>
              </CardContent>
            </Card>
          )}

          {patientQuery.data.consultations && patientQuery.data.consultations.length > 0 && (
            <Card className="border-0 bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Consultation History</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {patientQuery.data.consultations.map((c: any) => (
                  <div key={c.id} className="flex items-center justify-between rounded-xl bg-[#021B09]/5 p-3 text-sm">
                    <div>
                      <p className="font-medium">{formatDate(c.created_at)}</p>
                      <p className="text-xs text-muted-foreground">{c.doctor_notes ? `Notes: ${c.doctor_notes.substring(0, 50)}...` : "No notes"}</p>
                    </div>
                    <Badge variant={c.status === "completed" ? "default" : "outline"}>{c.status}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </DoctorLayout>
  );
};

export default DoctorPatientDetail;
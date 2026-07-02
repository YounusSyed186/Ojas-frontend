import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Search, Users, AlertCircle, ArrowRight, CalendarDays } from "lucide-react";
import { DoctorLayout } from "@/components/doctor/DoctorLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { doctorDashboardApi } from "@/lib/api/doctorDashboardApi";

const formatDate = (value?: string | null) => {
  if (!value) return "-";
  return new Date(value).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

const DoctorPatients = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const patientsQuery = useQuery({
    queryKey: ["doctor-patients", search, page],
    queryFn: () => doctorDashboardApi.patients({ search: search || undefined, page, per_page: 10 }),
  });

  const patients = patientsQuery.data?.patients?.data ?? [];
  const pagination = patientsQuery.data?.patients;

  return (
    <DoctorLayout title="Patients" subtitle="View your assigned patients.">
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search patients..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9 rounded-xl"
          />
        </div>
      </div>

      {patientsQuery.isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="border-0 bg-white shadow-sm">
              <CardContent className="p-5"><div className="h-32 animate-pulse rounded-lg bg-muted" /></CardContent>
            </Card>
          ))}
        </div>
      )}

      {patientsQuery.isError && (
        <div className="flex flex-col items-center justify-center py-20">
          <AlertCircle className="h-10 w-10 text-destructive mb-3" />
          <p className="font-medium">Failed to load patients</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => patientsQuery.refetch()}>Retry</Button>
        </div>
      )}

      {!patientsQuery.isLoading && !patientsQuery.isError && patients.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Users className="h-12 w-12 mb-3 opacity-40" />
          <p className="font-medium">No patients found</p>
          <p className="text-sm">Patients assigned to you will appear here.</p>
        </div>
      )}

      {!patientsQuery.isLoading && !patientsQuery.isError && patients.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {patients.map((p: any) => (
            <Card key={p.id} className="border-0 bg-white shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-[#021B09]/10 p-2.5">
                      <Users className="h-4 w-4 text-[#021B09]" />
                    </div>
                    <div>
                      <p className="font-medium">{p.name || "Patient"}</p>
                      <p className="text-xs text-muted-foreground">{p.email || p.phone || ""}</p>
                    </div>
                  </div>
                  {p.subscription_status === "active" && (
                    <Badge className="bg-green-100 text-green-700 text-xs">Active</Badge>
                  )}
                </div>
                <div className="space-y-1 text-xs text-muted-foreground">
                  {p.current_meal_plan && <p>Meal Plan: {p.current_meal_plan}</p>}
                  {p.last_consultation && <p>Last: {formatDate(p.last_consultation)}</p>}
                  {p.upcoming_consultation && (
                    <p className="flex items-center gap-1">
                      <CalendarDays className="h-3 w-3" /> Upcoming: {formatDate(p.upcoming_consultation)}
                    </p>
                  )}
                </div>
                <Button asChild variant="outline" size="sm" className="rounded-full mt-3 w-full">
                  <Link to={`/doctor/patients/${p.id}`}>View Details <ArrowRight className="ml-1 h-3 w-3" /></Link>
                </Button>
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

export default DoctorPatients;
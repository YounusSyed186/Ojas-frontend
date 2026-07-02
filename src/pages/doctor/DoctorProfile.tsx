import { useQuery } from "@tanstack/react-query";
import { UserCircle, AlertCircle, Loader2, Mail, Phone, Award, BookOpen } from "lucide-react";
import { DoctorLayout } from "@/components/doctor/DoctorLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { doctorDashboardApi } from "@/lib/api/doctorDashboardApi";

const DoctorProfile = () => {
  const profileQuery = useQuery({
    queryKey: ["doctor-profile"],
    queryFn: () => doctorDashboardApi.profile(),
  });

  if (profileQuery.isLoading) {
    return (
      <DoctorLayout title="Profile" subtitle="Your professional information.">
        <div className="max-w-2xl">
          <Card className="border-0 bg-white shadow-sm">
            <CardContent className="p-8"><div className="h-64 animate-pulse rounded-lg bg-muted" /></CardContent>
          </Card>
        </div>
      </DoctorLayout>
    );
  }

  if (profileQuery.isError) {
    return (
      <DoctorLayout title="Profile" subtitle="Your professional information.">
        <div className="flex flex-col items-center justify-center py-20">
          <AlertCircle className="h-10 w-10 text-destructive mb-3" />
          <p className="font-medium">Failed to load profile</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => profileQuery.refetch()}>Retry</Button>
        </div>
      </DoctorLayout>
    );
  }

  const profile = profileQuery.data?.doctor ?? profileQuery.data?.profile ?? {};

  return (
    <DoctorLayout title="Profile" subtitle="Your professional information.">
      <div className="max-w-2xl space-y-6">
        <Card className="border-0 bg-white shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <UserCircle className="h-5 w-5 text-[#021B09]" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground flex items-center gap-1"><UserCircle className="h-3 w-3" /> Name</span>
              <p className="font-medium">{profile.name || "-"}</p>
            </div>
            <div>
              <span className="text-muted-foreground flex items-center gap-1"><Mail className="h-3 w-3" /> Email</span>
              <p className="font-medium">{profile.email || "-"}</p>
            </div>
            <div>
              <span className="text-muted-foreground flex items-center gap-1"><Phone className="h-3 w-3" /> Phone</span>
              <p className="font-medium">{profile.phone || "-"}</p>
            </div>
            <div>
              <span className="text-muted-foreground flex items-center gap-1"><Award className="h-3 w-3" /> Specialization</span>
              <p className="font-medium">{profile.specialization || profile.spec || "-"}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Experience</span>
              <p className="font-medium">{profile.experience || profile.exp || "-"}</p>
            </div>
            <div>
              <span className="text-muted-foreground flex items-center gap-1"><BookOpen className="h-3 w-3" /> Qualification</span>
              <p className="font-medium">{profile.qualification || "-"}</p>
            </div>
          </CardContent>
        </Card>

        {profile.bio && (
          <Card className="border-0 bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Bio</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{profile.bio}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </DoctorLayout>
  );
};

export default DoctorProfile;
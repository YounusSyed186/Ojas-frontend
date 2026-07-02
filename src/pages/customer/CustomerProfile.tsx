import { FormEvent, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { CustomerLayout } from "@/components/customer/CustomerLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { customerDashboardApi } from "@/lib/api/customerDashboardApi";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const CustomerProfile = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ["customer-profile"],
    queryFn: () => customerDashboardApi.profile(),
  });

  const updateProfile = useMutation({
    mutationFn: (formData: Record<string, unknown>) => customerDashboardApi.updateProfile(formData),
    onSuccess: () => {
      toast({ title: "Profile updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["customer-profile"] });
      queryClient.invalidateQueries({ queryKey: ["customer-overview"] });
    },
    onError: () => {
      toast({ title: "Failed to update profile", variant: "destructive" });
    },
  });

  const profile = data?.user ?? user;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    updateProfile.mutate({
      name: formData.get("name"),
      phone: formData.get("phone"),
      address_line_1: formData.get("address_line_1"),
      address_line_2: formData.get("address_line_2"),
      city: formData.get("city"),
      state: formData.get("state"),
      pincode: formData.get("pincode"),
    });
  };

  if (isLoading) {
    return (
      <CustomerLayout title="Profile" subtitle="Loading your profile...">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout title="My Profile" subtitle="Manage your personal information and account details.">
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <section className="rounded-2xl bg-card shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-6">Personal Information</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" name="name" defaultValue={profile?.name ?? ""} className="h-10" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" name="phone" defaultValue={profile?.phone ?? ""} className="h-10" />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="address_line_1">Address Line 1</Label>
                <Input id="address_line_1" name="address_line_1" defaultValue={profile?.address_line_1 ?? ""} className="h-10" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="address_line_2">Address Line 2</Label>
                <Input id="address_line_2" name="address_line_2" defaultValue={profile?.address_line_2 ?? ""} className="h-10" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" name="city" defaultValue={profile?.city ?? ""} className="h-10" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="state">State</Label>
                  <Input id="state" name="state" defaultValue={profile?.state ?? ""} className="h-10" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input id="pincode" name="pincode" defaultValue={profile?.pincode ?? ""} maxLength={6} className="h-10" />
                </div>
              </div>
              <Button type="submit" disabled={updateProfile.isPending}>
                {updateProfile.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Save Changes
              </Button>
            </form>
          </section>
        </div>

        <div className="space-y-4">
          <section className="rounded-2xl bg-card shadow-sm border p-6">
            <h3 className="text-lg font-semibold mb-4">Account Info</h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-muted-foreground block text-xs">Email</span>
                <span className="font-medium">{profile?.email ?? "-"}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Phone Status</span>
                <Badge variant={profile?.phone_verified_at ? "default" : "secondary"} className="mt-1">
                  {profile?.phone_verified_at ? (
                    <><CheckCircle2 className="w-3 h-3 mr-1" /> Verified</>
                  ) : (
                    <><XCircle className="w-3 h-3 mr-1" /> Not Verified</>
                  )}
                </Badge>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Account Status</span>
                <span className="font-medium capitalize">{profile?.status ?? "active"}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Member Since</span>
                <span className="font-medium">
                  {profile?.created_at ? new Date(profile.created_at).toLocaleDateString("en-IN", {
                    year: "numeric", month: "long", day: "numeric",
                  }) : "-"}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-xs">Role</span>
                <span className="font-medium capitalize">{profile?.role ?? "customer"}</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    </CustomerLayout>
  );
};

export default CustomerProfile;
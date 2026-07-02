import { FormEvent, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { CustomerLayout } from "@/components/customer/CustomerLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { customerDashboardApi } from "@/lib/api/customerDashboardApi";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const CustomerSettings = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  const updateProfile = useMutation({
    mutationFn: (formData: Record<string, unknown>) => customerDashboardApi.updateProfile(formData),
    onSuccess: () => {
      toast({ title: "Profile updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update profile", variant: "destructive" });
    },
  });

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

  return (
    <CustomerLayout title="Settings" subtitle="Manage your account settings and preferences.">
      <div className="max-w-2xl space-y-6">
        <section className="rounded-2xl bg-card shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">Profile Information</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" defaultValue={user?.name ?? ""} className="h-10" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" defaultValue={user?.phone ?? ""} className="h-10" />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="address_line_1">Address Line 1</Label>
              <Input id="address_line_1" name="address_line_1" className="h-10" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="address_line_2">Address Line 2</Label>
              <Input id="address_line_2" name="address_line_2" className="h-10" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label htmlFor="city">City</Label>
                <Input id="city" name="city" className="h-10" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="state">State</Label>
                <Input id="state" name="state" className="h-10" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="pincode">Pincode</Label>
                <Input id="pincode" name="pincode" maxLength={6} className="h-10" />
              </div>
            </div>
            <Button type="submit" disabled={updateProfile.isPending}>
              {updateProfile.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Save Changes
            </Button>
          </form>
        </section>

        <section className="rounded-2xl bg-card shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">Account Information</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium">{user?.email ?? "-"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Phone Verification</span>
              <Badge variant={user?.phone_verified_at ? "default" : "secondary"}>
                {user?.phone_verified_at ? (
                  <><CheckCircle2 className="w-3 h-3 mr-1" /> Verified</>
                ) : (
                  <><XCircle className="w-3 h-3 mr-1" /> Not Verified</>
                )}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Account Status</span>
              <span className="font-medium capitalize">{user?.status ?? "active"}</span>
            </div>
          </div>
        </section>

        <section className="rounded-2xl bg-card shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">Change Password</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Password change is not currently supported through the API. 
            Please contact support if you need to reset your password.
          </p>
          <Button variant="outline" disabled>
            Change Password (Coming Soon)
          </Button>
        </section>
      </div>
    </CustomerLayout>
  );
};

export default CustomerSettings;
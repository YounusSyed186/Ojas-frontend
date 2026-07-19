import { FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Loader2, MapPin, ShieldCheck, UserRound, XCircle } from "lucide-react";
import { CustomerLayout } from "@/components/customer/CustomerLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { customerDashboardApi } from "@/lib/api/customerDashboardApi";
import { dashboardErrorMessage, formatDashboardDate } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const CustomerProfile = () => {
  const { toast } = useToast();
  const { user, refreshUser } = useAuth();
  const queryClient = useQueryClient();
  const profileQuery = useQuery({ queryKey: ["customer-profile"], queryFn: customerDashboardApi.profile });
  const updateProfile = useMutation({
    mutationFn: (payload: Record<string, unknown>) => customerDashboardApi.updateProfile(payload),
    onSuccess: async () => {
      await Promise.all([refreshUser(), queryClient.invalidateQueries({ queryKey: ["customer-profile"] }), queryClient.invalidateQueries({ queryKey: ["customer-overview"] })]);
      toast({ title: "Account updated" });
    },
    onError: (error) => toast({ title: dashboardErrorMessage(error, "Could not update account"), variant: "destructive" }),
  });
  const profile = profileQuery.data?.user ?? user;

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    updateProfile.mutate(Object.fromEntries(["name", "phone", "address_line_1", "address_line_2", "city", "state", "pincode"].map((key) => [key, form.get(key)])));
  };

  if (profileQuery.isLoading || !profile) return <CustomerLayout title="Account" subtitle="Loading your account..."><div className="grid place-items-center py-24"><Loader2 className="h-8 w-8 animate-spin" /></div></CustomerLayout>;

  return <CustomerLayout title="Account" subtitle="Keep your personal and delivery information accurate.">
    <div className="grid gap-6 xl:grid-cols-3">
      <form onSubmit={submit} className="space-y-6 xl:col-span-2">
        <section className="rounded-2xl border bg-card p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3"><span className="rounded-xl bg-primary/10 p-2 text-primary"><UserRound className="h-5 w-5" /></span><div><h2 className="text-xl font-semibold">Personal information</h2><p className="text-sm text-muted-foreground">Used for deliveries and appointment communication.</p></div></div>
          <div className="grid gap-4 sm:grid-cols-2"><div className="space-y-2"><Label htmlFor="name">Full name</Label><Input id="name" name="name" defaultValue={profile.name} required /></div><div className="space-y-2"><Label htmlFor="phone">Phone number</Label><Input id="phone" name="phone" defaultValue={profile.phone ?? ""} required /></div></div>
          <div className="mt-4 space-y-2"><Label>Email address</Label><Input value={profile.email ?? ""} disabled /><p className="text-xs text-muted-foreground">Email changes are managed by support.</p></div>
        </section>
        <section className="rounded-2xl border bg-card p-6 shadow-sm">
          <div className="mb-6 flex items-center gap-3"><span className="rounded-xl bg-primary/10 p-2 text-primary"><MapPin className="h-5 w-5" /></span><div><h2 className="text-xl font-semibold">Delivery address</h2><p className="text-sm text-muted-foreground">Your default address for future orders and subscriptions.</p></div></div>
          <div className="space-y-4"><div className="space-y-2"><Label htmlFor="address_line_1">Address line 1</Label><Input id="address_line_1" name="address_line_1" defaultValue={profile.address_line_1 ?? ""} /></div><div className="space-y-2"><Label htmlFor="address_line_2">Address line 2</Label><Input id="address_line_2" name="address_line_2" defaultValue={profile.address_line_2 ?? ""} /></div><div className="grid gap-4 sm:grid-cols-3"><div className="space-y-2"><Label htmlFor="city">City</Label><Input id="city" name="city" defaultValue={profile.city ?? ""} /></div><div className="space-y-2"><Label htmlFor="state">State</Label><Input id="state" name="state" defaultValue={profile.state ?? ""} /></div><div className="space-y-2"><Label htmlFor="pincode">Pincode</Label><Input id="pincode" name="pincode" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} defaultValue={profile.pincode ?? ""} /></div></div></div>
        </section>
        <Button type="submit" disabled={updateProfile.isPending}>{updateProfile.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Save account changes</Button>
      </form>
      <aside className="space-y-6">
        <section className="rounded-2xl border bg-card p-6 shadow-sm"><div className="mb-5 flex items-center gap-3"><ShieldCheck className="h-5 w-5 text-primary" /><h2 className="text-xl font-semibold">Account status</h2></div><dl className="space-y-4 text-sm"><div><dt className="text-muted-foreground">Status</dt><dd className="mt-1"><StatusBadge status={profile.status || "active"} /></dd></div><div><dt className="text-muted-foreground">Phone verification</dt><dd className="mt-1 flex items-center gap-2 font-medium">{profile.phone_verified_at ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-amber-600" />}{profile.phone_verified_at ? "Verified" : "Not verified"}</dd></div><div><dt className="text-muted-foreground">Member since</dt><dd className="mt-1 font-medium">{formatDashboardDate(profile.created_at)}</dd></div><div><dt className="text-muted-foreground">Account type</dt><dd className="mt-1 capitalize font-medium">{profile.role || "customer"}</dd></div></dl></section>
        <section className="rounded-2xl border bg-secondary/60 p-6"><h3 className="font-semibold">Need account help?</h3><p className="mt-2 text-sm text-muted-foreground">Password or email changes require identity verification. Contact OJAS support for assistance.</p></section>
      </aside>
    </div>
  </CustomerLayout>;
};

export default CustomerProfile;

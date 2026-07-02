import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { adminDoctorApi, adminApi } from "@/lib/api/adminApi";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, Stethoscope, Plus, Copy, Check, Loader2, Key, Ban, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type DoctorRow = Record<string, unknown>;
type CredentialsData = { email: string; password: string } | null;

const AdminDoctors = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");

  // Dialog states
  const [createOpen, setCreateOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [resetPassOpen, setResetPassOpen] = useState(false);
  const [credentialsOpen, setCredentialsOpen] = useState(false);
  const [credentials, setCredentials] = useState<CredentialsData>(null);
  const [copied, setCopied] = useState(false);

  // Selected doctor for detail/edit
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorRow | null>(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | null>(null);

  // Form state for create
  const [createForm, setCreateForm] = useState({
    name: "", email: "", phone: "", password: "",
    specialization: "", qualification: "", experience: "", bio: "", status: "active",
  });

  // Form state for edit
  const [editForm, setEditForm] = useState({
    name: "", phone: "", specialization: "", qualification: "", experience: "", bio: "", status: "active",
  });

  // Reset password form
  const [resetPassword, setResetPassword] = useState("");

  const queryParams: Record<string, unknown> = { page, per_page: 20 };
  if (search) queryParams.search = search;
  if (statusFilter !== "all") queryParams.status = statusFilter;

  const doctorsQuery = useQuery({
    queryKey: ["admin-doctors-list", queryParams],
    queryFn: () => adminDoctorApi.list(queryParams),
  });

  const doctorDetailQuery = useQuery({
    queryKey: ["admin-doctor-detail", selectedDoctorId],
    queryFn: () => adminDoctorApi.detail(selectedDoctorId!),
    enabled: !!selectedDoctorId && detailOpen,
  });

  const refreshList = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-doctors-list"] });
  };

  // Create doctor mutation
  const createMutation = useMutation({
    mutationFn: (data: typeof createForm) => adminDoctorApi.create(data),
    onSuccess: (res) => {
      toast({ title: "Doctor account created successfully" });
      setCreateOpen(false);
      setCredentials({ email: res.credentials.email, password: res.credentials.password });
      setCredentialsOpen(true);
      refreshList();
      setCreateForm({ name: "", email: "", phone: "", password: "", specialization: "", qualification: "", experience: "", bio: "", status: "active" });
    },
    onError: () => toast({ title: "Failed to create doctor", variant: "destructive" }),
  });

  // Update doctor mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: typeof editForm }) => adminDoctorApi.update(id, data as unknown as Record<string, unknown>),
    onSuccess: () => {
      toast({ title: "Doctor updated successfully" });
      setEditOpen(false);
      refreshList();
    },
    onError: () => toast({ title: "Failed to update doctor", variant: "destructive" }),
  });

  // Reset password mutation
  const resetPassMutation = useMutation({
    mutationFn: ({ id, password }: { id: number; password: string }) => adminDoctorApi.resetPassword(id, password),
    onSuccess: (res) => {
      toast({ title: "Password reset successfully" });
      setResetPassOpen(false);
      setCredentials({ email: res.credentials.email, password: res.credentials.password });
      setCredentialsOpen(true);
      setResetPassword("");
    },
    onError: () => toast({ title: "Failed to reset password", variant: "destructive" }),
  });

  // Toggle status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => adminDoctorApi.toggleStatus(id, status),
    onSuccess: () => {
      toast({ title: "Doctor status updated" });
      refreshList();
      if (selectedDoctorId) queryClient.invalidateQueries({ queryKey: ["admin-doctor-detail", selectedDoctorId] });
    },
    onError: () => toast({ title: "Failed to update status", variant: "destructive" }),
  });

  const doctors = doctorsQuery.data?.doctors?.data ?? [];
  const pagination = doctorsQuery.data?.doctors ?? {};
  const doctorDetail = doctorDetailQuery.data?.doctor;
  const doctorStats = doctorDetailQuery.data?.stats;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(createForm);
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedDoctorId) updateMutation.mutate({ id: selectedDoctorId, data: editForm });
  };

  const openEdit = (doctor: DoctorRow) => {
    setSelectedDoctorId(doctor.id as number);
    setEditForm({
      name: doctor.name as string,
      phone: doctor.phone as string || "",
      specialization: doctor.specialization as string || "",
      qualification: doctor.qualification as string || "",
      experience: doctor.experience as string || "",
      bio: doctor.bio as string || "",
      status: doctor.status as string || "active",
    });
    setEditOpen(true);
  };

  const openDetail = (doctor: DoctorRow) => {
    setSelectedDoctor(doctor);
    setSelectedDoctorId(doctor.id as number);
    setDetailOpen(true);
  };

  const handleCopyCredentials = () => {
    if (credentials) {
      navigator.clipboard.writeText(`Email: ${credentials.email}\nPassword: ${credentials.password}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({ title: "Credentials copied to clipboard" });
    }
  };

  const formatDate = (value?: string) => {
    if (!value) return "-";
    return new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  const columns: Column<DoctorRow>[] = [
    { key: "name", header: "Name", render: (row) => row.name as string ?? "-" },
    { key: "email", header: "Email", render: (row) => row.email as string ?? "-" },
    { key: "phone", header: "Phone", render: (row) => row.phone as string ?? "-" },
    { key: "specialization", header: "Specialization", render: (row) => row.specialization as string ?? "-" },
    { key: "experience", header: "Experience", render: (row) => row.experience as string ?? "-" },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status as string} /> },
    { key: "total_patients", header: "Patients", render: (row) => <span className="font-medium">{row.total_patients as number ?? 0}</span> },
    { key: "completed_consultations", header: "Completed", render: (row) => <span className="font-medium">{row.completed_consultations as number ?? 0}</span> },
    { key: "created_at", header: "Created", render: (row) => formatDate(row.created_at as string) },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="flex gap-1">
          <Button variant="outline" size="sm" className="rounded-lg" onClick={() => openDetail(row)}>
            <Eye className="mr-1 h-3 w-3" /> View
          </Button>
          <Button variant="outline" size="sm" className="rounded-lg" onClick={() => openEdit(row)}>
            Edit
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout title="Doctors" subtitle="Manage doctors, create accounts, and view performance." breadcrumbs={[{ label: "Doctors" }]}>
      <div className="mb-4 flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Create Doctor
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={doctors}
        isLoading={doctorsQuery.isLoading}
        isError={doctorsQuery.isError}
        onRetry={() => doctorsQuery.refetch()}
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        searchPlaceholder="Search doctors by name, email, phone..."
        page={pagination.current_page ?? 1}
        totalPages={pagination.last_page ?? 1}
        total={pagination.total}
        onPageChange={setPage}
      />

      {/* Create Doctor Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Doctor Account</DialogTitle>
            <DialogDescription>Fill in the details to create a new doctor account.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="create-name">Full Name *</Label>
                <Input id="create-name" value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="create-email">Email *</Label>
                <Input id="create-email" type="email" value={createForm.email} onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="create-phone">Phone *</Label>
                <Input id="create-phone" value={createForm.phone} onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })} required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="create-password">Password *</Label>
                <Input id="create-password" type="password" value={createForm.password} onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })} required minLength={8} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="create-specialization">Specialization</Label>
                <Input id="create-specialization" value={createForm.specialization} onChange={(e) => setCreateForm({ ...createForm, specialization: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="create-qualification">Qualification</Label>
                <Input id="create-qualification" value={createForm.qualification} onChange={(e) => setCreateForm({ ...createForm, qualification: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="create-experience">Experience</Label>
                <Input id="create-experience" placeholder="e.g. 5 years" value={createForm.experience} onChange={(e) => setCreateForm({ ...createForm, experience: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="create-status">Status</Label>
                <Select value={createForm.status} onValueChange={(v) => setCreateForm({ ...createForm, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="create-bio">Bio</Label>
              <Textarea id="create-bio" value={createForm.bio} onChange={(e) => setCreateForm({ ...createForm, bio: e.target.value })} rows={3} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Create Doctor
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Credentials Dialog */}
      <Dialog open={credentialsOpen} onOpenChange={(open) => { if (!open) { setCredentialsOpen(false); setCopied(false); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-green-600">Doctor Account Created Successfully</DialogTitle>
          </DialogHeader>
          {credentials && (
            <div className="space-y-4">
              <div className="rounded-xl bg-green-50 border border-green-200 p-4 space-y-2">
                <div className="text-sm">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="font-medium ml-2">{credentials.email}</span>
                </div>
                <div className="text-sm">
                  <span className="text-muted-foreground">Temporary Password:</span>
                  <span className="font-medium ml-2">{credentials.password}</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Please share these credentials securely with the doctor. The password will not be shown again.
              </p>
              <Button className="w-full" onClick={handleCopyCredentials}>
                {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                {copied ? "Copied!" : "Copy Credentials"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Doctor Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={(open) => { if (!open) { setDetailOpen(false); setSelectedDoctorId(null); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{doctorDetail?.name ?? "Doctor Details"}</DialogTitle>
          </DialogHeader>
          {doctorDetailQuery.isLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin" /></div>
          ) : doctorDetail ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted-foreground">Email:</span> <span className="font-medium">{doctorDetail.email}</span></div>
                <div><span className="text-muted-foreground">Phone:</span> <span className="font-medium">{doctorDetail.phone ?? "-"}</span></div>
                <div><span className="text-muted-foreground">Specialization:</span> <span className="font-medium">{doctorDetail.specialization ?? "-"}</span></div>
                <div><span className="text-muted-foreground">Qualification:</span> <span className="font-medium">{doctorDetail.qualification ?? "-"}</span></div>
                <div><span className="text-muted-foreground">Experience:</span> <span className="font-medium">{doctorDetail.experience ?? "-"}</span></div>
                <div><span className="text-muted-foreground">Status:</span> <StatusBadge status={doctorDetail.status} /></div>
                <div><span className="text-muted-foreground">Created:</span> <span className="font-medium">{formatDate(doctorDetail.created_at)}</span></div>
                <div><span className="text-muted-foreground">Rating:</span> <span className="font-medium">{doctorDetail.rating ?? "N/A"}</span></div>
              </div>
              {doctorDetail.bio && (
                <div>
                  <span className="text-muted-foreground text-sm">Bio:</span>
                  <p className="text-sm mt-1 p-3 rounded-xl bg-secondary/30">{doctorDetail.bio}</p>
                </div>
              )}
              {doctorStats && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-green-50 text-center">
                    <div className="text-lg font-bold text-green-700">{doctorStats.completed_consultations}</div>
                    <div className="text-xs text-green-600">Completed</div>
                  </div>
                  <div className="p-3 rounded-xl bg-yellow-50 text-center">
                    <div className="text-lg font-bold text-yellow-700">{doctorStats.pending_consultations}</div>
                    <div className="text-xs text-yellow-600">Pending</div>
                  </div>
                  <div className="p-3 rounded-xl bg-blue-50 text-center">
                    <div className="text-lg font-bold text-blue-700">{doctorStats.total_patients}</div>
                    <div className="text-xs text-blue-600">Patients</div>
                  </div>
                  <div className="p-3 rounded-xl bg-purple-50 text-center">
                    <div className="text-lg font-bold text-purple-700">{doctorStats.total_consultations}</div>
                    <div className="text-xs text-purple-600">Total Consults</div>
                  </div>
                </div>
              )}
              <div className="flex flex-wrap gap-2 pt-2 border-t">
                <Button variant="outline" size="sm" onClick={() => { setDetailOpen(false); openEdit(selectedDoctor!); }}>
                  Edit Doctor
                </Button>
                <Button variant="outline" size="sm" onClick={() => { setDetailOpen(false); setSelectedDoctorId(doctorDetail.id); setResetPassOpen(true); }}>
                  <Key className="w-4 h-4 mr-1" /> Reset Password
                </Button>
                <Button variant="outline" size="sm"
                  onClick={() => toggleStatusMutation.mutate({ id: doctorDetail.id, status: doctorDetail.status === "active" ? "inactive" : "active" })}
                  disabled={toggleStatusMutation.isPending}
                >
                  {doctorDetail.status === "active" ? <Ban className="w-4 h-4 mr-1" /> : <CheckCircle className="w-4 h-4 mr-1" />}
                  {doctorDetail.status === "active" ? "Deactivate" : "Activate"}
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">Doctor not found.</p>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Doctor Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Doctor</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="edit-name">Full Name</Label>
              <Input id="edit-name" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="edit-phone">Phone</Label>
              <Input id="edit-phone" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="edit-specialization">Specialization</Label>
                <Input id="edit-specialization" value={editForm.specialization} onChange={(e) => setEditForm({ ...editForm, specialization: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="edit-qualification">Qualification</Label>
                <Input id="edit-qualification" value={editForm.qualification} onChange={(e) => setEditForm({ ...editForm, qualification: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="edit-experience">Experience</Label>
                <Input id="edit-experience" value={editForm.experience} onChange={(e) => setEditForm({ ...editForm, experience: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="edit-status">Status</Label>
                <Select value={editForm.status} onValueChange={(v) => setEditForm({ ...editForm, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="edit-bio">Bio</Label>
              <Textarea id="edit-bio" value={editForm.bio} onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })} rows={3} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Save Changes
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={resetPassOpen} onOpenChange={setResetPassOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reset Doctor Password</DialogTitle>
            <DialogDescription>Enter a new temporary password for the doctor.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="reset-pass">New Password *</Label>
              <Input id="reset-pass" type="password" value={resetPassword}
                onChange={(e) => setResetPassword(e.target.value)} minLength={8} required
                placeholder="Enter new password (min 8 characters)" />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setResetPassOpen(false)}>Cancel</Button>
              <Button onClick={() => {
                if (selectedDoctorId && resetPassword.length >= 8) {
                  resetPassMutation.mutate({ id: selectedDoctorId, password: resetPassword });
                }
              }} disabled={resetPassMutation.isPending || resetPassword.length < 8}>
                {resetPassMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Reset Password
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminDoctors;
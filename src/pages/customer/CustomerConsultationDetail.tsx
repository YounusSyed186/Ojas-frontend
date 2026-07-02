import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { Loader2, ArrowLeft, User, CalendarDays, CreditCard, Stethoscope } from "lucide-react";
import { CustomerLayout } from "@/components/customer/CustomerLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { customerDashboardApi } from "@/lib/api/customerDashboardApi";

const statusClass = (status?: string) => {
  if (status === "paid" || status === "completed") return "bg-green-100 text-green-700";
  if (status === "pending" || status === "scheduled") return "bg-yellow-100 text-yellow-700";
  if (status === "cancelled" || status === "failed") return "bg-red-100 text-red-700";
  return "bg-secondary text-secondary-foreground";
};

const formatDate = (value?: string) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

const CustomerConsultationDetail = () => {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["consultation-detail", id],
    queryFn: () => customerDashboardApi.consultationDetail(Number(id)),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <CustomerLayout title="Consultation Details" subtitle="Loading...">
        <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div>
      </CustomerLayout>
    );
  }

  if (isError || !data?.consultation) {
    return (
      <CustomerLayout title="Consultation Details">
        <div className="text-center py-20">
          <p className="text-red-500 mb-4">Failed to load consultation details.</p>
          <Button asChild variant="outline"><Link to="/customer/consultations">Back to consultations</Link></Button>
        </div>
      </CustomerLayout>
    );
  }

  const c = data.consultation;

  return (
    <CustomerLayout title={`Consultation #${c.id}`}>
      <div className="space-y-6 max-w-3xl">
        <Button asChild variant="outline" size="sm">
          <Link to="/customer/consultations"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Consultations</Link>
        </Button>

        <div className="grid sm:grid-cols-2 gap-4">
          <section className="rounded-2xl bg-card shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Stethoscope className="w-5 h-5" /> Doctor</h2>
            <div className="space-y-2 text-sm">
              <div><span className="text-muted-foreground">Name:</span> {c.doctor?.name ?? "Not assigned"}</div>
              {c.doctor?.email && <div><span className="text-muted-foreground">Email:</span> {c.doctor.email}</div>}
              {c.doctor?.phone && <div><span className="text-muted-foreground">Phone:</span> {c.doctor.phone}</div>}
              {c.doctor?.specialization && <div><span className="text-muted-foreground">Specialization:</span> {c.doctor.specialization}</div>}
            </div>
          </section>

          <section className="rounded-2xl bg-card shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><CreditCard className="w-5 h-5" /> Status</h2>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Badge className={statusClass(c.status)}>{c.status}</Badge>
                <Badge className={statusClass(c.payment_status)}>{c.payment_status ?? "pending"}</Badge>
              </div>
              {c.fee && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Fee:</span> Rs. {c.fee.amount}
                </div>
              )}
            </div>
          </section>
        </div>

        <section className="rounded-2xl bg-card shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><CalendarDays className="w-5 h-5" /> Schedule & Notes</h2>
          <div className="space-y-3 text-sm">
            <div><span className="text-muted-foreground">Created:</span> {formatDate(c.created_at)}</div>
            {c.preferred_slot_at && <div><span className="text-muted-foreground">Preferred Slot:</span> {formatDate(c.preferred_slot_at)}</div>}
            {c.scheduled_at && <div><span className="text-muted-foreground">Scheduled:</span> {formatDate(c.scheduled_at)}</div>}
            {c.request_notes && (
              <div>
                <span className="text-muted-foreground block mb-1">Request Notes:</span>
                <p className="p-3 rounded-xl bg-secondary/30">{c.request_notes}</p>
              </div>
            )}
            {c.consultation_notes && (
              <div>
                <span className="text-muted-foreground block mb-1">Doctor's Notes:</span>
                <p className="p-3 rounded-xl bg-blue-50 text-blue-800">{c.consultation_notes}</p>
              </div>
            )}
          </div>
        </section>

        {c.payment && (
          <section className="rounded-2xl bg-card shadow-sm border p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><CreditCard className="w-5 h-5" /> Payment</h2>
            <div className="text-sm space-y-2">
              <div><span className="text-muted-foreground">Amount:</span> Rs. {c.payment.amount}</div>
              <div><span className="text-muted-foreground">Status:</span> <Badge className={statusClass(c.payment.status)}>{c.payment.status}</Badge></div>
              {c.payment.gateway && <div><span className="text-muted-foreground">Gateway:</span> {c.payment.gateway}</div>}
              {c.payment.created_at && <div><span className="text-muted-foreground">Date:</span> {formatDate(c.payment.created_at)}</div>}
            </div>
          </section>
        )}
      </div>
    </CustomerLayout>
  );
};

export default CustomerConsultationDetail;
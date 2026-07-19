import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, ChevronLeft, ChevronRight, Loader2, XCircle } from "lucide-react";
import { CustomerLayout } from "@/components/customer/CustomerLayout";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { customerDashboardApi } from "@/lib/api/customerDashboardApi";
import { formatDashboardDate } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const CustomerConsultations = () => {
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["customer-consultations", status, page], queryFn: () => customerDashboardApi.consultations({ status: status === "all" ? undefined : status, page, per_page: 12 }) });
  const cancel = useMutation({ mutationFn: customerDashboardApi.cancelConsultation, onSuccess: () => { toast({ title: "Consultation cancelled" }); queryClient.invalidateQueries({ queryKey: ["customer-consultations"] }); }, onError: () => toast({ title: "Could not cancel consultation", variant: "destructive" }) });
  const consultations = query.data?.consultations.data ?? [];

  return <CustomerLayout title="Consultations" subtitle="Book appointments and follow your care journey.">
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><Select value={status} onValueChange={(value) => { setStatus(value); setPage(1); }}><SelectTrigger className="w-44 bg-card"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All statuses</SelectItem><SelectItem value="pending">Pending</SelectItem><SelectItem value="requested">Requested</SelectItem><SelectItem value="scheduled">Scheduled</SelectItem><SelectItem value="completed">Completed</SelectItem><SelectItem value="cancelled">Cancelled</SelectItem></SelectContent></Select><Button asChild><Link to="/experts"><CalendarDays className="mr-2 h-4 w-4" />Book consultation</Link></Button></div>
    {query.isLoading ? <div className="grid place-items-center py-24"><Loader2 className="h-8 w-8 animate-spin" /></div> : query.isError ? <div className="rounded-2xl border bg-card p-10 text-center"><p className="text-destructive">Could not load consultations.</p><Button className="mt-4" onClick={() => query.refetch()}>Try again</Button></div> : consultations.length === 0 ? <div className="rounded-2xl border border-dashed bg-card p-12 text-center"><CalendarDays className="mx-auto h-10 w-10 text-muted-foreground" /><h2 className="mt-4 text-xl font-semibold">No consultations found</h2><p className="mt-1 text-sm text-muted-foreground">Book an OJAS expert when you are ready for personal guidance.</p></div> : <>
      <div className="overflow-hidden rounded-2xl border bg-card shadow-sm"><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-sm"><thead className="bg-secondary/60 text-left"><tr><th className="p-4 font-medium">Consultation</th><th className="p-4 font-medium">Doctor</th><th className="p-4 font-medium">Schedule</th><th className="p-4 font-medium">Status</th><th className="p-4 font-medium">Payment</th><th className="p-4 text-right font-medium">Actions</th></tr></thead><tbody className="divide-y">{consultations.map((consultation) => <tr key={consultation.id} className="hover:bg-secondary/30"><td className="p-4 font-semibold">#{consultation.id}<p className="mt-1 text-xs font-normal text-muted-foreground">{formatDashboardDate(consultation.created_at)}</p></td><td className="p-4">{consultation.doctor?.name || "Awaiting assignment"}</td><td className="p-4 text-muted-foreground">{formatDashboardDate(consultation.scheduled_for || consultation.preferred_slot_at, true)}</td><td className="p-4"><StatusBadge status={consultation.status} /></td><td className="p-4"><StatusBadge status={consultation.payment_status} /></td><td className="p-4"><div className="flex justify-end gap-2"><Button asChild variant="outline" size="sm"><Link to={`/customer/consultations/${consultation.id}`}>View</Link></Button>{["pending", "requested"].includes(consultation.status || "") && <Button variant="outline" size="sm" className="text-destructive" disabled={cancel.isPending} onClick={() => window.confirm("Cancel this consultation?") && cancel.mutate(consultation.id)}><XCircle className="mr-1 h-4 w-4" />Cancel</Button>}</div></td></tr>)}</tbody></table></div></div>
      {query.data && query.data.consultations.last_page > 1 && <div className="mt-5 flex items-center justify-between"><p className="text-sm text-muted-foreground">Page {query.data.consultations.current_page} of {query.data.consultations.last_page}</p><div className="flex gap-2"><Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}><ChevronLeft className="h-4 w-4" />Previous</Button><Button size="sm" variant="outline" disabled={page >= query.data.consultations.last_page} onClick={() => setPage((value) => value + 1)}>Next<ChevronRight className="h-4 w-4" /></Button></div></div>}
    </>}
  </CustomerLayout>;
};

export default CustomerConsultations;

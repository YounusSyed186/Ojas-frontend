import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, CreditCard, Loader2, Search } from "lucide-react";
import { CustomerLayout } from "@/components/customer/CustomerLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { customerDashboardApi } from "@/lib/api/customerDashboardApi";
import { formatCurrency, formatDashboardDate } from "@/lib/utils";

const CustomerPayments = () => {
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const query = useQuery({ queryKey: ["customer-payments", status, page], queryFn: () => customerDashboardApi.payments({ status: status === "all" ? undefined : status, page, per_page: 15 }) });
  const paginated = query.data?.payments;
  const payments = (paginated?.data ?? []).filter((payment) => !search || String(payment.id).includes(search) || (payment.reference ?? "").toLowerCase().includes(search.toLowerCase()) || (payment.gateway ?? "").toLowerCase().includes(search.toLowerCase()));

  return <CustomerLayout title="Payments" subtitle="Review transactions for your subscriptions and consultations.">
    <div className="mb-5 flex flex-wrap gap-3"><div className="relative min-w-[220px] flex-1 sm:max-w-sm"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input className="bg-card pl-9" placeholder="Search ID, reference, or gateway" value={search} onChange={(event) => setSearch(event.target.value)} /></div><Select value={status} onValueChange={(value) => { setStatus(value); setPage(1); }}><SelectTrigger className="w-40 bg-card"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All statuses</SelectItem><SelectItem value="paid">Paid</SelectItem><SelectItem value="pending">Pending</SelectItem><SelectItem value="failed">Failed</SelectItem><SelectItem value="refunded">Refunded</SelectItem></SelectContent></Select></div>
    {query.isLoading ? <div className="grid place-items-center py-24"><Loader2 className="h-8 w-8 animate-spin" /></div> : query.isError ? <div className="rounded-2xl border bg-card p-10 text-center"><p className="text-destructive">Could not load payments.</p><Button className="mt-4" onClick={() => query.refetch()}>Try again</Button></div> : payments.length === 0 ? <div className="rounded-2xl border border-dashed bg-card p-12 text-center"><CreditCard className="mx-auto h-10 w-10 text-muted-foreground" /><h2 className="mt-4 text-xl font-semibold">No payments found</h2><p className="mt-1 text-sm text-muted-foreground">Try another filter, or return after completing a purchase.</p></div> : <>
      <div className="overflow-hidden rounded-2xl border bg-card shadow-sm"><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-sm"><thead className="bg-secondary/60 text-left"><tr><th className="p-4 font-medium">Transaction</th><th className="p-4 font-medium">Reference</th><th className="p-4 font-medium">Gateway</th><th className="p-4 font-medium">Date</th><th className="p-4 font-medium">Status</th><th className="p-4 text-right font-medium">Amount</th></tr></thead><tbody className="divide-y">{payments.map((payment) => <tr key={payment.id} className="hover:bg-secondary/30"><td className="p-4 font-semibold">#{payment.id}<p className="mt-1 text-xs font-normal text-muted-foreground">{payment.payable_type?.includes("Subscription") ? "Subscription" : payment.payable_type?.includes("Consultation") ? "Consultation" : "Payment"}</p></td><td className="p-4 font-mono text-xs text-muted-foreground">{payment.reference || "-"}</td><td className="p-4 capitalize">{payment.gateway || "-"}</td><td className="p-4 text-muted-foreground">{formatDashboardDate(payment.created_at)}</td><td className="p-4"><StatusBadge status={payment.status} /></td><td className="p-4 text-right font-semibold">{formatCurrency(payment.amount)}</td></tr>)}</tbody></table></div></div>
      {paginated && paginated.last_page > 1 && <div className="mt-5 flex items-center justify-between"><p className="text-sm text-muted-foreground">Page {paginated.current_page} of {paginated.last_page}</p><div className="flex gap-2"><Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}><ChevronLeft className="h-4 w-4" />Previous</Button><Button size="sm" variant="outline" disabled={page >= paginated.last_page} onClick={() => setPage((value) => value + 1)}>Next<ChevronRight className="h-4 w-4" /></Button></div></div>}
    </>}
  </CustomerLayout>;
};

export default CustomerPayments;

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, CreditCard, Search } from "lucide-react";
import { CustomerLayout } from "@/components/customer/CustomerLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { customerDashboardApi } from "@/lib/api/customerDashboardApi";

type CustomerPayment = {
  id: number | string;
  amount?: number | string | null;
  status?: string | null;
  gateway?: string | null;
  created_at?: string | null;
  payable_type?: string | null;
  payable_id?: number | string | null;
};

type PaymentsResponse = {
  payments?: CustomerPayment[] | {
    data?: CustomerPayment[];
  };
};

const statusClass = (status?: string) => {
  if (status === "paid" || status === "completed") return "bg-green-100 text-green-700";
  if (status === "pending") return "bg-yellow-100 text-yellow-700";
  if (status === "failed" || status === "cancelled") return "bg-red-100 text-red-700";
  return "bg-secondary text-secondary-foreground";
};

const formatDate = (value?: string) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

const CustomerPayments = () => {
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["customer-payments", statusFilter],
    queryFn: () => customerDashboardApi.payments({ status: statusFilter !== "all" ? statusFilter : undefined }),
  });

  const paymentsResponse = data as PaymentsResponse | undefined;
  const paymentsSource = paymentsResponse?.payments;
  const payments = Array.isArray(paymentsSource) ? paymentsSource : paymentsSource?.data ?? [];

  const filteredPayments = searchQuery
    ? payments.filter((p) =>
        String(p.id).includes(searchQuery) ||
        String(p.gateway ?? "").toLowerCase().includes(searchQuery.toLowerCase())
      )
    : payments;

  return (
    <CustomerLayout title="Payments" subtitle="View your payment history and transaction details.">
      <div className="space-y-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by Payment ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div>
        ) : isError ? (
          <div className="text-center py-20">
            <p className="text-red-500 mb-4">Failed to load payments.</p>
            <Button onClick={() => refetch()}>Retry</Button>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="text-center py-20">
            <CreditCard className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No payments found.</p>
          </div>
        ) : (
          <div className="rounded-2xl bg-card shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-4 font-medium">ID</th>
                    <th className="text-left p-4 font-medium">Amount</th>
                    <th className="text-left p-4 font-medium">Status</th>
                    <th className="text-left p-4 font-medium">Gateway</th>
                    <th className="text-left p-4 font-medium">Date</th>
                    <th className="text-left p-4 font-medium">Reference</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map((p) => (
                    <tr key={p.id} className="border-b last:border-0 hover:bg-muted/30">
                      <td className="p-4 font-medium">#{p.id}</td>
                      <td className="p-4">Rs. {Number(p.amount ?? 0).toLocaleString("en-IN")}</td>
                      <td className="p-4"><Badge className={statusClass(p.status ?? undefined)}>{p.status ?? "-"}</Badge></td>
                      <td className="p-4 capitalize">{p.gateway ?? "-"}</td>
                      <td className="p-4 text-muted-foreground">{formatDate(p.created_at ?? undefined)}</td>
                      <td className="p-4 text-muted-foreground text-xs">
                        {p.payable_type ? `${p.payable_type.includes("Subscription") ? "Subscription" : "Consultation"} #${String(p.payable_id)}` : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </CustomerLayout>
  );
};

export default CustomerPayments;

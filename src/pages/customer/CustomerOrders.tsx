import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Loader2, PackageOpen } from "lucide-react";
import { CustomerLayout } from "@/components/customer/CustomerLayout";
import { orderApi } from "@/lib/api/orderApi";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDashboardDate } from "@/lib/utils";

const CustomerOrders = () => {
  const [page, setPage] = useState(1);
  const query = useQuery({ queryKey: ["meal-orders", page], queryFn: () => orderApi.getAll({ page, per_page: 12 }) });
  const orders = query.data?.data ?? [];

  return <CustomerLayout title="Orders" subtitle="Track your scheduled meal deliveries and payment status.">
    {query.isLoading ? <div className="grid place-items-center py-24"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div> : query.isError ? <div className="rounded-2xl border bg-card p-10 text-center"><p className="text-destructive">Could not load your orders.</p><Button className="mt-4" onClick={() => query.refetch()}>Try again</Button></div> : orders.length === 0 ?
      <div className="rounded-2xl border border-dashed bg-card p-12 text-center"><PackageOpen className="mx-auto h-10 w-10 text-muted-foreground" /><h2 className="mt-4 text-xl font-semibold">No orders yet</h2><p className="mt-1 text-sm text-muted-foreground">Build your first fresh meal order from the OJAS menu.</p><Button asChild className="mt-5"><Link to="/meals">Browse meals</Link></Button></div>
      : <>
        <div className="overflow-hidden rounded-2xl border bg-card shadow-sm"><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-sm">
          <thead className="bg-secondary/60 text-left"><tr><th className="p-4 font-medium">Order</th><th className="p-4 font-medium">Placed</th><th className="p-4 font-medium">Delivery</th><th className="p-4 font-medium">Order status</th><th className="p-4 font-medium">Payment</th><th className="p-4 text-right font-medium">Total</th></tr></thead>
          <tbody className="divide-y">{orders.map((order) => <tr key={order.order_number} className="hover:bg-secondary/30"><td className="p-4"><Link className="font-semibold text-primary hover:underline" to={`/customer/orders/${order.order_number}`}>{order.order_number}</Link><p className="mt-1 text-xs text-muted-foreground">{order.items.length} line{order.items.length === 1 ? "" : "s"}</p></td><td className="p-4 text-muted-foreground">{formatDashboardDate(order.created_at)}</td><td className="p-4"><p>{order.delivery_city}</p><p className="text-xs text-muted-foreground">{order.delivery_pincode}</p></td><td className="p-4"><StatusBadge status={order.status} /></td><td className="p-4"><StatusBadge status={order.payment_status} /></td><td className="p-4 text-right font-semibold">{formatCurrency(order.grand_total)}</td></tr>)}</tbody>
        </table></div></div>
        {query.data && query.data.last_page > 1 && <div className="mt-5 flex items-center justify-between"><p className="text-sm text-muted-foreground">Page {query.data.current_page} of {query.data.last_page}</p><div className="flex gap-2"><Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}><ChevronLeft className="h-4 w-4" /> Previous</Button><Button variant="outline" size="sm" disabled={page >= query.data.last_page} onClick={() => setPage((value) => value + 1)}>Next <ChevronRight className="h-4 w-4" /></Button></div></div>}
      </>}
  </CustomerLayout>;
};

export default CustomerOrders;

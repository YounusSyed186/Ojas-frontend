import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";
import { CustomerLayout } from "@/components/customer/CustomerLayout";
import { orderApi } from "@/lib/api/orderApi";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDashboardDate } from "@/lib/utils";

const CustomerOrderDetail = () => {
  const { orderNumber = "" } = useParams();
  const query = useQuery({ queryKey: ["meal-order", orderNumber], queryFn: () => orderApi.getByNumber(orderNumber), enabled: Boolean(orderNumber) });
  if (query.isLoading) return <CustomerLayout title="Order"><div className="grid place-items-center py-24"><Loader2 className="h-8 w-8 animate-spin" /></div></CustomerLayout>;
  if (!query.data) return <CustomerLayout title="Order"><div className="rounded-2xl border bg-card p-10 text-center"><p>Order could not be found.</p><Button asChild className="mt-4" variant="outline"><Link to="/customer/orders">Back to orders</Link></Button></div></CustomerLayout>;

  const order = query.data;
  const groups = Object.entries(order.items.reduce<Record<string, typeof order.items>>((all, item) => { (all[item.delivery_date] ??= []).push(item); return all; }, {}));
  return <CustomerLayout title={order.order_number} subtitle="Meal delivery and payment details">
    <Button asChild variant="outline" size="sm"><Link to="/customer/orders"><ArrowLeft className="mr-2 h-4 w-4" />All orders</Link></Button>
    <div className="mt-5 grid gap-6 lg:grid-cols-3">
      <div className="space-y-5 lg:col-span-2">{groups.map(([date, items]) => <section key={date} className="rounded-2xl border bg-card p-5 shadow-sm"><h2 className="font-semibold">Delivery: {formatDashboardDate(date)}</h2><div className="mt-3 divide-y">{items.map((item) => <div key={item.id} className="flex justify-between gap-3 py-3"><div><p>{item.meal_name} x {item.quantity}</p><StatusBadge status={item.fulfillment_status} /></div><span className="font-medium">{formatCurrency(item.line_total)}</span></div>)}</div></section>)}</div>
      <aside className="h-fit space-y-3 rounded-2xl border bg-card p-5 shadow-sm"><div className="flex justify-between"><span>Order</span><StatusBadge status={order.status} /></div><div className="flex justify-between"><span>Payment</span><StatusBadge status={order.payment_status} /></div><div className="flex justify-between border-t pt-3 text-lg font-semibold"><span>Total</span><span>{formatCurrency(order.grand_total)}</span></div><div className="border-t pt-3"><p className="text-xs uppercase tracking-wide text-muted-foreground">Delivery address</p><p className="mt-2 text-sm">{order.delivery_address_line_1}{order.delivery_address_line_2 ? <><br />{order.delivery_address_line_2}</> : null}<br />{order.delivery_city}, {order.delivery_state} {order.delivery_pincode}</p></div></aside>
    </div>
  </CustomerLayout>;
};

export default CustomerOrderDetail;

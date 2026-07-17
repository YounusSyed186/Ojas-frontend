import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { CustomerLayout } from "@/components/customer/CustomerLayout";
import { orderApi } from "@/lib/api/orderApi";
import { StatusBadge } from "@/components/admin/StatusBadge";

const CustomerOrderDetail = () => {
  const { orderNumber = "" } = useParams();
  const { data: order, isLoading } = useQuery({ queryKey: ["meal-order", orderNumber], queryFn: () => orderApi.getByNumber(orderNumber) });
  if (isLoading || !order) return <CustomerLayout title="Order"><p>Loading order…</p></CustomerLayout>;
  const groups = Object.entries(order.items.reduce<Record<string, typeof order.items>>((all, item) => {
    (all[item.delivery_date] ??= []).push(item); return all;
  }, {}));
  return (
    <CustomerLayout title={order.order_number} subtitle="Meal delivery and payment details">
      <Link to="/customer/orders" className="text-sm text-primary">← All orders</Link>
      <div className="grid lg:grid-cols-3 gap-6 mt-5">
        <div className="lg:col-span-2 space-y-5">{groups.map(([date, items]) => (
          <section key={date} className="rounded-xl border bg-white p-5"><h2 className="font-semibold">{new Date(date + "T00:00:00").toLocaleDateString("en-IN", { dateStyle: "full" })}</h2>
            <div className="mt-3 divide-y">{items.map((item) => <div key={item.id} className="py-3 flex justify-between gap-3"><div><p>{item.meal_name} × {item.quantity}</p><StatusBadge status={item.fulfillment_status} /></div><span>₹{Number(item.line_total).toLocaleString("en-IN")}</span></div>)}</div>
          </section>
        ))}</div>
        <aside className="rounded-xl border bg-white p-5 h-fit space-y-3"><div className="flex justify-between"><span>Order</span><StatusBadge status={order.status} /></div><div className="flex justify-between"><span>Payment</span><StatusBadge status={order.payment_status} /></div><div className="flex justify-between font-semibold text-lg"><span>Total</span><span>₹{Number(order.grand_total).toLocaleString("en-IN")}</span></div><p className="text-sm text-muted-foreground">{order.delivery_address_line_1}<br />{order.delivery_city}, {order.delivery_state} {order.delivery_pincode}</p></aside>
      </div>
    </CustomerLayout>
  );
};

export default CustomerOrderDetail;

import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { PackageOpen } from "lucide-react";
import { CustomerLayout } from "@/components/customer/CustomerLayout";
import { orderApi } from "@/lib/api/orderApi";
import { StatusBadge } from "@/components/admin/StatusBadge";

const CustomerOrders = () => {
  const { data, isLoading } = useQuery({ queryKey: ["meal-orders"], queryFn: orderApi.getAll });
  return (
    <CustomerLayout title="Meal orders" subtitle="Your scheduled à-la-carte meal deliveries.">
      <div className="space-y-4">
        {isLoading ? <p>Loading orders…</p> : (data?.data ?? []).length === 0 ? (
          <div className="rounded-xl border bg-white p-10 text-center"><PackageOpen className="mx-auto h-8 w-8 text-muted-foreground" /><p className="mt-3">No meal orders yet.</p></div>
        ) : data!.data.map((order) => (
          <Link key={order.order_number} to={"/customer/orders/" + order.order_number} className="block rounded-xl border bg-white p-5 hover:border-primary/40">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div><p className="font-semibold">{order.order_number}</p><p className="text-sm text-muted-foreground">{new Date(order.created_at).toLocaleDateString("en-IN")} · {order.items.length} lines</p></div>
              <div className="flex items-center gap-3"><StatusBadge status={order.status} /><span className="font-semibold">₹{Number(order.grand_total).toLocaleString("en-IN")}</span></div>
            </div>
          </Link>
        ))}
      </div>
    </CustomerLayout>
  );
};

export default CustomerOrders;

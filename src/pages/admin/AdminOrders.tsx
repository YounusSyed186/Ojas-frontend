import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { adminApi } from "@/lib/api/adminApi";
import { type MealOrder } from "@/lib/api/orderApi";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { getApiErrorMessage } from "@/lib/api/types";

const nextStatus: Record<string, string | undefined> = { confirmed: "preparing", preparing: "out_for_delivery", out_for_delivery: "delivered" };

const AdminOrders = () => {
  const client = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["admin-orders"], queryFn: () => adminApi.orders({ per_page: 50 }) });
  const mutate = async (operation: () => Promise<unknown>, success: string) => {
    try { await operation(); await client.invalidateQueries({ queryKey: ["admin-orders"] }); toast({ title: success }); }
    catch (error: unknown) { toast({ title: "Order update failed", description: getApiErrorMessage(error, "Please try again."), variant: "destructive" }); }
  };
  const orders: MealOrder[] = data?.orders?.data ?? [];
  return (
    <AdminLayout title="Meal orders" subtitle="Fulfillment, cancellations, and Razorpay refunds">
      {isLoading ? <p>Loading orders…</p> : <div className="space-y-5">{orders.map((order) => (
        <section key={order.order_number} className="rounded-xl border bg-white p-5">
          <div className="flex flex-wrap justify-between gap-3"><div><h2 className="font-semibold">{order.order_number}</h2><p className="text-sm text-muted-foreground">{order.delivery_city} · ₹{Number(order.grand_total).toLocaleString("en-IN")}</p></div><div className="flex gap-2"><StatusBadge status={order.status} /><StatusBadge status={order.payment_status} /></div></div>
          <div className="mt-4 divide-y">{order.items.map((item) => (
            <div key={item.id} className="py-3 flex flex-wrap items-center justify-between gap-3">
              <div><p className="text-sm font-medium">{item.meal_name} × {item.quantity}</p><p className="text-xs text-muted-foreground">{item.delivery_date}</p></div>
              <div className="flex items-center gap-2"><StatusBadge status={item.fulfillment_status} />
                {nextStatus[item.fulfillment_status] && <Button size="sm" variant="outline" onClick={() => void mutate(() => adminApi.updateOrderItem(order.order_number, item.id, nextStatus[item.fulfillment_status]!), "Fulfillment updated")}>{nextStatus[item.fulfillment_status]!.replaceAll("_", " ")}</Button>}
                {!["delivered", "cancelled", "pending_payment"].includes(item.fulfillment_status) && <Button size="sm" variant="destructive" onClick={() => { if (window.confirm("Cancel this delivery line and initiate a refund?")) void mutate(() => adminApi.cancelOrder(order.order_number, { order_item_id: item.id, reason: "Cancelled by administrator" }), "Refund initiated"); }}>Cancel & refund</Button>}
              </div>
            </div>
          ))}</div>
        </section>
      ))}</div>}
    </AdminLayout>
  );
};

export default AdminOrders;

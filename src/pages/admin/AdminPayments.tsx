import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { adminApi } from "@/lib/api/adminApi";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Eye } from "lucide-react";

const formatCurrency = (value?: number) => `Rs. ${Number(value ?? 0).toLocaleString("en-IN")}`;

const AdminPayments = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState<Record<string, unknown> | null>(null);

  const queryParams: Record<string, unknown> = { page, per_page: 20 };
  if (search) queryParams.search = search;
  if (statusFilter) queryParams.status = statusFilter;

  const paymentsQuery = useQuery({
    queryKey: ["admin-payments", queryParams],
    queryFn: () => adminApi.payments(queryParams),
  });

  const payments = paymentsQuery.data?.payments?.data ?? [];
  const pagination = paymentsQuery.data?.payments ?? {};

  const columns: Column<Record<string, unknown>>[] = [
    { key: "gateway", header: "Gateway", render: (row) => (row.gateway as string) ?? "-" },
    { key: "reference", header: "Reference", render: (row) => (row.reference as string) ?? "-" },
    { key: "amount", header: "Amount", render: (row) => formatCurrency(row.amount as number) },
    { key: "currency", header: "Currency", render: (row) => (row.currency as string) ?? "INR" },
    { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status as string} /> },
    { key: "paid_at", header: "Paid At", render: (row) => row.paid_at ? new Date(row.paid_at as string).toLocaleString() : "-" },
    { key: "created_at", header: "Created", render: (row) => new Date(row.created_at as string).toLocaleDateString() },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <Button variant="outline" size="sm" className="rounded-lg" onClick={() => setSelectedPayment(row)}>
          <Eye className="mr-1 h-3 w-3" /> View
        </Button>
      ),
    },
  ];

  return (
    <AdminLayout title="Payments" subtitle="View all payments." breadcrumbs={[{ label: "Payments" }]}>
      <div className="mb-4 flex flex-wrap gap-3">
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-40 rounded-lg">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={payments as Record<string, unknown>[]}
        isLoading={paymentsQuery.isLoading}
        isError={paymentsQuery.isError}
        onRetry={() => paymentsQuery.refetch()}
        search={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        searchPlaceholder="Search by reference, gateway..."
        page={pagination.current_page ?? 1}
        totalPages={pagination.last_page ?? 1}
        total={pagination.total}
        onPageChange={setPage}
      />

      <Dialog open={!!selectedPayment} onOpenChange={(open) => !open && setSelectedPayment(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-muted-foreground">Gateway:</span> <span className="font-medium">{selectedPayment.gateway as string}</span></div>
                <div><span className="text-muted-foreground">Reference:</span> <span className="font-medium">{selectedPayment.reference as string}</span></div>
                <div><span className="text-muted-foreground">Amount:</span> <span className="font-medium">{formatCurrency(selectedPayment.amount as number)}</span></div>
                <div><span className="text-muted-foreground">Currency:</span> <span className="font-medium">{selectedPayment.currency as string}</span></div>
                <div><span className="text-muted-foreground">Status:</span> <StatusBadge status={selectedPayment.status as string} /></div>
                <div><span className="text-muted-foreground">Paid At:</span> <span className="font-medium">{selectedPayment.paid_at ? new Date(selectedPayment.paid_at as string).toLocaleString() : "-"}</span></div>
              </div>
              {selectedPayment.payload && (
                <div>
                  <p className="mb-1 text-muted-foreground">Payload:</p>
                  <pre className="max-h-32 overflow-y-auto rounded bg-gray-50 p-2 text-xs">
                    {JSON.stringify(selectedPayment.payload, null, 2)}
                  </pre>
                </div>
              )}
              {selectedPayment.payable && (
                <p className="text-muted-foreground">
                  Linked to: {((selectedPayment.payable as Record<string, unknown>).type as string) ?? "N/A"} 
                  #{((selectedPayment.payable as Record<string, unknown>).id as string) ?? ""}
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminPayments;
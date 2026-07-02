import { cn } from "@/lib/utils";

type StatusBadgeProps = {
  status?: string | null;
  className?: string;
};

const statusStyles: Record<string, string> = {
  active: "bg-green-100 text-green-700 border-green-200",
  paid: "bg-green-100 text-green-700 border-green-200",
  completed: "bg-green-100 text-green-700 border-green-200",
  plan_assigned: "bg-green-100 text-green-700 border-green-200",
  pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  requested: "bg-yellow-100 text-yellow-700 border-yellow-200",
  paused: "bg-yellow-100 text-yellow-700 border-yellow-200",
  failed: "bg-red-100 text-red-700 border-red-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
  expired: "bg-gray-100 text-gray-600 border-gray-200",
  inactive: "bg-gray-100 text-gray-600 border-gray-200",
  refunded: "bg-purple-100 text-purple-700 border-purple-200",
  scheduled: "bg-blue-100 text-blue-700 border-blue-200",
  assigned: "bg-blue-100 text-blue-700 border-blue-200",
};

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  if (!status) return null;
  const style = statusStyles[status.toLowerCase()] ?? "bg-secondary text-secondary-foreground border-secondary";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize",
        style,
        className,
      )}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
};
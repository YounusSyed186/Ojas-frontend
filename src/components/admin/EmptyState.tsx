import { Inbox } from "lucide-react";

type EmptyStateProps = {
  title?: string;
  description?: string;
};

export const EmptyState = ({ title = "No records found", description }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Inbox className="h-12 w-12 text-muted-foreground/40" />
      <p className="mt-4 text-sm font-medium text-muted-foreground">{title}</p>
      {description && <p className="mt-1 text-xs text-muted-foreground/60">{description}</p>}
    </div>
  );
};
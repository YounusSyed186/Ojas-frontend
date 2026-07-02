import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

type DashboardErrorStateProps = {
  message?: string;
  onRetry?: () => void;
  retrying?: boolean;
};

export const DashboardErrorState = ({
  message = "Something went wrong while loading this section.",
  onRetry,
  retrying,
}: DashboardErrorStateProps) => (
  <div className="rounded-2xl border border-red-100 bg-red-50 px-6 py-8 text-center">
    <p className="text-sm text-red-700">{message}</p>
    {onRetry && (
      <Button variant="outline" size="sm" className="mt-4 rounded-full" onClick={onRetry} disabled={retrying}>
        {retrying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
        Retry
      </Button>
    )}
  </div>
);

export const DashboardLoadingState = () => (
  <div className="flex justify-center py-16">
    <Loader2 className="h-8 w-8 animate-spin text-accent" />
  </div>
);

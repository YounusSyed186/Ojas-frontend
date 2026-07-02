import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

type ErrorStateProps = {
  message?: string;
  onRetry?: () => void;
  retrying?: boolean;
};

export const ErrorState = ({ message = "Something went wrong", onRetry, retrying }: ErrorStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <AlertTriangle className="h-12 w-12 text-red-400" />
      <p className="mt-4 text-sm font-medium text-muted-foreground">{message}</p>
      {onRetry && (
        <Button
          variant="outline"
          size="sm"
          className="mt-4 rounded-lg"
          onClick={onRetry}
          disabled={retrying}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${retrying ? "animate-spin" : ""}`} />
          {retrying ? "Retrying..." : "Try again"}
        </Button>
      )}
    </div>
  );
};
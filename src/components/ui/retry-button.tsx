import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RetryButtonProps {
  onRetry: () => Promise<void> | void;
  label?: string;
  className?: string;
  variant?: "default" | "outline" | "ghost";
}

export function RetryButton({ 
  onRetry, 
  label = "Retry",
  className,
  variant = "outline"
}: RetryButtonProps) {
  const [isRetrying, setIsRetrying] = useState(false);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <Button 
      variant={variant}
      onClick={handleRetry}
      disabled={isRetrying}
      className={cn("min-h-[44px]", className)}
    >
      <RefreshCw className={cn("h-4 w-4 mr-2", isRetrying && "animate-spin")} />
      {isRetrying ? "Retrying..." : label}
    </Button>
  );
}

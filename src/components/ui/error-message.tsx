import { cn } from "@/lib/utils";
import { AlertCircle, AlertTriangle, Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type ErrorVariant = "error" | "warning" | "info";

interface ErrorMessageProps {
  message: string;
  variant?: ErrorVariant;
  className?: string;
  onDismiss?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function ErrorMessage({ 
  message, 
  variant = "error",
  className,
  onDismiss,
  action
}: ErrorMessageProps) {
  const variants = {
    error: {
      bg: "bg-destructive/10 border-destructive/20",
      text: "text-destructive",
      icon: AlertCircle,
    },
    warning: {
      bg: "bg-amber-500/10 border-amber-500/20",
      text: "text-amber-600 dark:text-amber-500",
      icon: AlertTriangle,
    },
    info: {
      bg: "bg-blue-500/10 border-blue-500/20",
      text: "text-blue-600 dark:text-blue-500",
      icon: Info,
    },
  };

  const { bg, text, icon: Icon } = variants[variant];

  return (
    <div className={cn(
      "flex items-start gap-3 p-4 rounded-lg border",
      bg,
      className
    )}>
      <Icon className={cn("h-5 w-5 shrink-0 mt-0.5", text)} />
      <div className="flex-1 min-w-0">
        <p className={cn("text-sm font-medium", text)}>{message}</p>
        {action && (
          <Button 
            variant="link" 
            size="sm" 
            onClick={action.onClick}
            className={cn("h-auto p-0 mt-1", text)}
          >
            {action.label}
          </Button>
        )}
      </div>
      {onDismiss && (
        <Button 
          variant="ghost" 
          size="icon" 
          className={cn("h-6 w-6 shrink-0", text)}
          onClick={onDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

interface InlineErrorProps {
  message?: string;
}

export function InlineError({ message }: InlineErrorProps) {
  if (!message) return null;
  
  return (
    <p className="text-sm text-destructive flex items-center gap-1 mt-1">
      <AlertCircle className="h-3.5 w-3.5" />
      {message}
    </p>
  );
}

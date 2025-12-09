import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  secondaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  className?: string;
  compact?: boolean;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  className,
  compact = false,
}: EmptyStateProps) {
  return (
    <div 
      className={cn(
        "flex flex-col items-center justify-center text-center",
        compact ? "py-8" : "py-12 md:py-16",
        className
      )}
      role="status"
      aria-label={title}
    >
      <div 
        className={cn(
          "rounded-full bg-muted flex items-center justify-center mb-4",
          compact ? "w-12 h-12" : "w-16 h-16"
        )}
        aria-hidden="true"
      >
        <Icon className={cn(
          "text-muted-foreground",
          compact ? "h-6 w-6" : "h-8 w-8"
        )} />
      </div>
      
      <h3 className={cn(
        "font-semibold text-foreground",
        compact ? "text-base" : "text-lg"
      )}>
        {title}
      </h3>
      
      {description && (
        <p className={cn(
          "text-muted-foreground mt-1 max-w-sm",
          compact ? "text-sm" : "text-sm md:text-base"
        )}>
          {description}
        </p>
      )}
      
      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row gap-2 mt-4">
          {action && (
            action.href ? (
              <Button asChild className="min-h-[44px]">
                <Link to={action.href}>{action.label}</Link>
              </Button>
            ) : (
              <Button onClick={action.onClick} className="min-h-[44px]">
                {action.label}
              </Button>
            )
          )}
          {secondaryAction && (
            secondaryAction.href ? (
              <Button variant="outline" asChild className="min-h-[44px]">
                <Link to={secondaryAction.href}>{secondaryAction.label}</Link>
              </Button>
            ) : (
              <Button variant="outline" onClick={secondaryAction.onClick} className="min-h-[44px]">
                {secondaryAction.label}
              </Button>
            )
          )}
        </div>
      )}
    </div>
  );
}

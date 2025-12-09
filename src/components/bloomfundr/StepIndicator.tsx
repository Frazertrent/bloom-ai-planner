import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export interface Step {
  id: number;
  name: string;
  description?: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (step: number) => void;
  allowNavigation?: boolean;
}

export function StepIndicator({
  steps,
  currentStep,
  onStepClick,
  allowNavigation = false,
}: StepIndicatorProps) {
  return (
    <nav aria-label="Progress" className="w-full">
      <ol className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = step.id < currentStep;
          const isCurrent = step.id === currentStep;
          const isClickable = allowNavigation && (isCompleted || isCurrent);

          return (
            <li key={step.id} className="relative flex-1">
              <div className="flex items-center">
                {/* Connector line */}
                {index > 0 && (
                  <div
                    className={cn(
                      "absolute left-0 top-4 -translate-y-1/2 w-full h-0.5 -translate-x-1/2",
                      isCompleted || isCurrent
                        ? "bg-primary"
                        : "bg-muted"
                    )}
                    style={{ width: "calc(100% - 2rem)", left: "calc(-50% + 1rem)" }}
                  />
                )}

                {/* Step circle and label */}
                <div className="relative flex flex-col items-center w-full">
                  <button
                    type="button"
                    onClick={() => isClickable && onStepClick?.(step.id)}
                    disabled={!isClickable}
                    className={cn(
                      "relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors",
                      isCompleted && "bg-primary border-primary text-primary-foreground",
                      isCurrent && "border-primary bg-background text-primary",
                      !isCompleted && !isCurrent && "border-muted bg-background text-muted-foreground",
                      isClickable && "cursor-pointer hover:border-primary/80"
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      step.id
                    )}
                  </button>
                  <span
                    className={cn(
                      "mt-2 text-xs font-medium text-center",
                      isCurrent && "text-primary",
                      !isCurrent && "text-muted-foreground"
                    )}
                  >
                    {step.name}
                  </span>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

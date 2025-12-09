import * as React from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface FilterDropdownProps {
  label: string;
  options: FilterOption[];
  value: string[];
  onChange: (value: string[]) => void;
  multiSelect?: boolean;
  className?: string;
}

export function FilterDropdown({
  label,
  options,
  value,
  onChange,
  multiSelect = false,
  className,
}: FilterDropdownProps) {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (optionValue: string) => {
    if (multiSelect) {
      if (value.includes(optionValue)) {
        onChange(value.filter((v) => v !== optionValue));
      } else {
        onChange([...value, optionValue]);
      }
    } else {
      onChange([optionValue]);
      setOpen(false);
    }
  };

  const handleClear = () => {
    onChange([]);
    setOpen(false);
  };

  const selectedLabels = options
    .filter((opt) => value.includes(opt.value))
    .map((opt) => opt.label);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("justify-between min-w-[150px]", className)}
        >
          <span className="truncate">
            {value.length === 0
              ? label
              : value.length === 1
              ? selectedLabels[0]
              : `${value.length} selected`}
          </span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0 bg-popover" align="start">
        <div className="max-h-[300px] overflow-auto">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={cn(
                "flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-accent cursor-pointer",
                value.includes(option.value) && "bg-accent/50"
              )}
            >
              <span className="flex items-center gap-2">
                {multiSelect && (
                  <div
                    className={cn(
                      "h-4 w-4 rounded border flex items-center justify-center",
                      value.includes(option.value)
                        ? "bg-primary border-primary text-primary-foreground"
                        : "border-muted-foreground"
                    )}
                  >
                    {value.includes(option.value) && <Check className="h-3 w-3" />}
                  </div>
                )}
                {option.label}
              </span>
              {option.count !== undefined && (
                <Badge variant="secondary" className="ml-auto text-xs">
                  {option.count}
                </Badge>
              )}
              {!multiSelect && value.includes(option.value) && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </button>
          ))}
        </div>
        {value.length > 0 && (
          <>
            <Separator />
            <button
              onClick={handleClear}
              className="flex w-full items-center justify-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <X className="h-4 w-4" />
              Clear filters
            </button>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}

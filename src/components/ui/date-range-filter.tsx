import * as React from "react";
import { format, subDays, startOfWeek, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

interface DateRangeFilterProps {
  value: DateRange | undefined;
  onChange: (value: DateRange | undefined) => void;
  className?: string;
  placeholder?: string;
}

const presets = [
  {
    label: "Today",
    getValue: () => {
      const today = new Date();
      return { from: today, to: today };
    },
  },
  {
    label: "Last 7 days",
    getValue: () => ({
      from: subDays(new Date(), 7),
      to: new Date(),
    }),
  },
  {
    label: "This week",
    getValue: () => ({
      from: startOfWeek(new Date(), { weekStartsOn: 1 }),
      to: new Date(),
    }),
  },
  {
    label: "This month",
    getValue: () => ({
      from: startOfMonth(new Date()),
      to: new Date(),
    }),
  },
  {
    label: "Last month",
    getValue: () => {
      const lastMonth = subMonths(new Date(), 1);
      return {
        from: startOfMonth(lastMonth),
        to: endOfMonth(lastMonth),
      };
    },
  },
  {
    label: "Last 30 days",
    getValue: () => ({
      from: subDays(new Date(), 30),
      to: new Date(),
    }),
  },
];

export function DateRangeFilter({
  value,
  onChange,
  className,
  placeholder = "Select date range",
}: DateRangeFilterProps) {
  const [open, setOpen] = React.useState(false);

  const handlePreset = (preset: (typeof presets)[0]) => {
    onChange(preset.getValue());
  };

  const handleClear = () => {
    onChange(undefined);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "justify-start text-left font-normal min-w-[240px]",
            !value && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value?.from ? (
            value.to ? (
              <>
                {format(value.from, "LLL dd")} - {format(value.to, "LLL dd, y")}
              </>
            ) : (
              format(value.from, "LLL dd, y")
            )
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-popover" align="start">
        <div className="flex">
          {/* Presets */}
          <div className="border-r p-2 space-y-1">
            <p className="text-xs font-medium text-muted-foreground px-2 pb-2">
              Presets
            </p>
            {presets.map((preset) => (
              <Button
                key={preset.label}
                variant="ghost"
                size="sm"
                className="w-full justify-start text-sm font-normal"
                onClick={() => handlePreset(preset)}
              >
                {preset.label}
              </Button>
            ))}
          </div>
          {/* Calendar */}
          <div className="p-3">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={value?.from}
              selected={value}
              onSelect={onChange}
              numberOfMonths={2}
              className="pointer-events-auto"
            />
          </div>
        </div>
        {value && (
          <>
            <Separator />
            <div className="p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-center gap-2 text-muted-foreground"
                onClick={handleClear}
              >
                <X className="h-4 w-4" />
                Clear dates
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}

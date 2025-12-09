import { useSearchParams } from "react-router-dom";
import { useCallback, useMemo } from "react";
import { DateRange } from "react-day-picker";

interface UseUrlFiltersOptions {
  defaultValues?: Record<string, string>;
}

export function useUrlFilters(options: UseUrlFiltersOptions = {}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const { defaultValues = {} } = options;

  const getFilter = useCallback(
    (key: string): string => {
      return searchParams.get(key) || defaultValues[key] || "";
    },
    [searchParams, defaultValues]
  );

  const getArrayFilter = useCallback(
    (key: string): string[] => {
      const value = searchParams.get(key);
      return value ? value.split(",").filter(Boolean) : [];
    },
    [searchParams]
  );

  const getDateRangeFilter = useCallback(
    (key: string): DateRange | undefined => {
      const fromStr = searchParams.get(`${key}From`);
      const toStr = searchParams.get(`${key}To`);
      
      if (!fromStr && !toStr) return undefined;
      
      return {
        from: fromStr ? new Date(fromStr) : undefined,
        to: toStr ? new Date(toStr) : undefined,
      };
    },
    [searchParams]
  );

  const setFilter = useCallback(
    (key: string, value: string) => {
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        if (value && value !== defaultValues[key]) {
          newParams.set(key, value);
        } else {
          newParams.delete(key);
        }
        return newParams;
      });
    },
    [setSearchParams, defaultValues]
  );

  const setArrayFilter = useCallback(
    (key: string, values: string[]) => {
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        if (values.length > 0) {
          newParams.set(key, values.join(","));
        } else {
          newParams.delete(key);
        }
        return newParams;
      });
    },
    [setSearchParams]
  );

  const setDateRangeFilter = useCallback(
    (key: string, range: DateRange | undefined) => {
      setSearchParams((prev) => {
        const newParams = new URLSearchParams(prev);
        if (range?.from) {
          newParams.set(`${key}From`, range.from.toISOString().split("T")[0]);
        } else {
          newParams.delete(`${key}From`);
        }
        if (range?.to) {
          newParams.set(`${key}To`, range.to.toISOString().split("T")[0]);
        } else {
          newParams.delete(`${key}To`);
        }
        return newParams;
      });
    },
    [setSearchParams]
  );

  const clearAllFilters = useCallback(() => {
    setSearchParams(new URLSearchParams());
  }, [setSearchParams]);

  const hasActiveFilters = useMemo(() => {
    return searchParams.toString().length > 0;
  }, [searchParams]);

  return {
    getFilter,
    getArrayFilter,
    getDateRangeFilter,
    setFilter,
    setArrayFilter,
    setDateRangeFilter,
    clearAllFilters,
    hasActiveFilters,
    searchParams,
  };
}

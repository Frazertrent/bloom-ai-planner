import { Badge } from "@/components/ui/badge";
import type { FulfillmentStatus } from "@/types/bloomfundr";

interface OrderFulfillmentBadgeProps {
  status: FulfillmentStatus;
}

const statusConfig: Record<FulfillmentStatus, { label: string; className: string }> = {
  pending: {
    label: "Pending",
    className: "bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-amber-500/20",
  },
  in_production: {
    label: "In Production",
    className: "bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-blue-500/20",
  },
  ready: {
    label: "Ready",
    className: "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20",
  },
  picked_up: {
    label: "Picked Up",
    className: "bg-purple-500/10 text-purple-600 hover:bg-purple-500/20 border-purple-500/20",
  },
  delivered: {
    label: "Delivered",
    className: "bg-green-600/10 text-green-700 hover:bg-green-600/20 border-green-600/20",
  },
};

export function OrderFulfillmentBadge({ status }: OrderFulfillmentBadgeProps) {
  const config = statusConfig[status] || statusConfig.pending;
  
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}

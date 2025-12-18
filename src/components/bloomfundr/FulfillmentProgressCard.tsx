import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Wrench, Package, CheckCircle, Truck } from "lucide-react";

export interface FulfillmentBreakdown {
  pending: number;
  in_production: number;
  ready: number;
  picked_up: number;
  delivered: number;
}

interface FulfillmentProgressCardProps {
  breakdown: FulfillmentBreakdown;
  totalOrders: number;
}

export function FulfillmentProgressCard({ breakdown, totalOrders }: FulfillmentProgressCardProps) {
  if (totalOrders === 0) return null;

  const readyForPickup = breakdown.ready;
  const completedCount = breakdown.picked_up + breakdown.delivered;
  
  const segments = [
    { key: "pending", count: breakdown.pending, color: "bg-muted-foreground/40", label: "Pending" },
    { key: "in_production", count: breakdown.in_production, color: "bg-amber-500", label: "In Production" },
    { key: "ready", count: breakdown.ready, color: "bg-blue-500", label: "Ready" },
    { key: "picked_up", count: breakdown.picked_up, color: "bg-purple-500", label: "Picked Up" },
    { key: "delivered", count: breakdown.delivered, color: "bg-green-600", label: "Delivered" },
  ];

  const statusItems = [
    { 
      icon: Clock, 
      label: "Pending", 
      count: breakdown.pending, 
      color: "text-muted-foreground" 
    },
    { 
      icon: Wrench, 
      label: "In Production", 
      count: breakdown.in_production, 
      color: "text-amber-600" 
    },
    { 
      icon: Package, 
      label: "Ready for Seller Pickup", 
      count: breakdown.ready, 
      color: "text-blue-600" 
    },
    { 
      icon: CheckCircle, 
      label: "Picked Up by Sellers", 
      count: breakdown.picked_up, 
      color: "text-purple-600" 
    },
    { 
      icon: Truck, 
      label: "Delivered to Customers", 
      count: breakdown.delivered, 
      color: "text-green-700" 
    },
  ];

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Fulfillment Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Text */}
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{readyForPickup}</span> of{" "}
          <span className="font-semibold text-foreground">{totalOrders}</span> orders ready for seller pickup
          {completedCount > 0 && (
            <span className="text-emerald-600"> • {completedCount} completed</span>
          )}
        </p>

        {/* Progress Bar */}
        <div className="h-3 rounded-full overflow-hidden flex bg-muted">
          {segments.map((segment) => {
            const percentage = (segment.count / totalOrders) * 100;
            if (percentage === 0) return null;
            return (
              <div
                key={segment.key}
                className={`${segment.color} transition-all duration-300`}
                style={{ width: `${percentage}%` }}
                title={`${segment.label}: ${segment.count}`}
              />
            );
          })}
        </div>

        {/* Status Breakdown */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {statusItems.map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <item.icon className={`h-4 w-4 ${item.color}`} />
              <span className="text-sm">
                <span className="font-medium">{item.count}</span>
                <span className="text-muted-foreground ml-1 hidden sm:inline">{item.label.split(' ')[0]}</span>
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

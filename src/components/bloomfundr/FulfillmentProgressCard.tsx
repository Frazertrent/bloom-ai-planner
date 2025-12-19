import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Wrench, Package, CheckCircle, Truck, LucideIcon } from "lucide-react";

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

interface PhaseMessage {
  icon: LucideIcon;
  text: string;
  color: string;
}

function getPhaseMessage(breakdown: FulfillmentBreakdown, totalOrders: number): PhaseMessage {
  const { pending, in_production, ready, picked_up, delivered } = breakdown;
  
  // All delivered = complete
  if (delivered === totalOrders) {
    return { icon: Truck, text: `All ${totalOrders} orders delivered to customers!`, color: "text-green-700" };
  }
  
  // All picked up or delivered = in delivery phase
  if (picked_up + delivered === totalOrders && picked_up > 0) {
    return { icon: Package, text: `${picked_up} orders with sellers for delivery`, color: "text-purple-600" };
  }
  
  // Some ready = pickup phase
  if (ready > 0) {
    return { icon: Package, text: `${ready} of ${totalOrders} orders ready for seller pickup`, color: "text-blue-600" };
  }
  
  // In production = preparation phase
  if (in_production > 0) {
    return { icon: Wrench, text: `${in_production} of ${totalOrders} orders being prepared`, color: "text-amber-600" };
  }
  
  // All pending = waiting phase
  if (pending === totalOrders) {
    return { icon: Clock, text: `${pending} orders pending - awaiting preparation`, color: "text-muted-foreground" };
  }
  
  // Mixed state - show progress summary
  const completedCount = picked_up + delivered;
  if (completedCount > 0) {
    return { icon: CheckCircle, text: `${completedCount} of ${totalOrders} orders completed`, color: "text-green-600" };
  }
  
  return { icon: Clock, text: `${totalOrders} orders in progress`, color: "text-foreground" };
}

export function FulfillmentProgressCard({ breakdown, totalOrders }: FulfillmentProgressCardProps) {
  if (totalOrders === 0) return null;

  const phaseMessage = getPhaseMessage(breakdown, totalOrders);
  const PhaseIcon = phaseMessage.icon;
  
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
        {/* Dynamic Phase Summary */}
        <div className="flex items-center gap-2">
          <PhaseIcon className={`h-5 w-5 ${phaseMessage.color}`} />
          <p className={`text-sm font-medium ${phaseMessage.color}`}>
            {phaseMessage.text}
          </p>
        </div>

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

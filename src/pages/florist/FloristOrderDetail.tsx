import { useParams, Link } from "react-router-dom";
import { FloristLayout } from "@/components/bloomfundr/FloristLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OrderFulfillmentBadge } from "@/components/bloomfundr/OrderFulfillmentBadge";
import { useFloristOrderDetail, useUpdateOrderStatus } from "@/hooks/useFloristOrders";
import { 
  ArrowLeft, 
  User, 
  Calendar, 
  Mail, 
  Phone, 
  Package,
  Clock,
  CheckCircle,
  Play,
  StickyNote
} from "lucide-react";
import { format } from "date-fns";
import type { FulfillmentStatus } from "@/types/bloomfundr";

const statusTimeline: { status: FulfillmentStatus; label: string; icon: React.ReactNode }[] = [
  { status: "pending", label: "Order Placed", icon: <Clock className="h-4 w-4" /> },
  { status: "in_production", label: "In Production", icon: <Play className="h-4 w-4" /> },
  { status: "ready", label: "Ready for Pickup", icon: <CheckCircle className="h-4 w-4" /> },
  { status: "picked_up", label: "Picked Up", icon: <Package className="h-4 w-4" /> },
];

const statusOrder: FulfillmentStatus[] = ["pending", "in_production", "ready", "picked_up"];

export default function FloristOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading } = useFloristOrderDetail(id);
  const updateStatus = useUpdateOrderStatus();

  const currentStatusIndex = order ? statusOrder.indexOf(order.fulfillment_status) : -1;

  const handleMarkInProduction = () => {
    if (!id) return;
    updateStatus.mutate({ orderId: id, status: "in_production", campaignId: order?.campaign_id });
  };

  const handleMarkReady = () => {
    if (!id) return;
    updateStatus.mutate({ orderId: id, status: "ready", campaignId: order?.campaign_id });
  };

  const handleMarkPickedUp = () => {
    if (!id) return;
    updateStatus.mutate({ orderId: id, status: "picked_up", campaignId: order?.campaign_id });
  };

  if (isLoading) {
    return (
      <FloristLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-48" />
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
          <Skeleton className="h-64" />
        </div>
      </FloristLayout>
    );
  }

  if (!order) {
    return (
      <FloristLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Order not found</p>
          <Button asChild className="mt-4">
            <Link to="/florist/orders">Back to Orders</Link>
          </Button>
        </div>
      </FloristLayout>
    );
  }

  return (
    <FloristLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/florist/orders">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-foreground">{order.order_number}</h1>
              <OrderFulfillmentBadge status={order.fulfillment_status} />
            </div>
            <p className="text-muted-foreground mt-1">
              Ordered {format(new Date(order.created_at), "MMMM d, yyyy 'at' h:mm a")}
            </p>
          </div>
          <div className="flex gap-2">
            {order.fulfillment_status === "pending" && (
              <Button onClick={handleMarkInProduction} disabled={updateStatus.isPending}>
                <Play className="h-4 w-4 mr-2" />
                Mark In Production
              </Button>
            )}
            {order.fulfillment_status === "in_production" && (
              <Button onClick={handleMarkReady} disabled={updateStatus.isPending}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark Ready
              </Button>
            )}
            {order.fulfillment_status === "ready" && (
              <Button onClick={handleMarkPickedUp} disabled={updateStatus.isPending}>
                <Package className="h-4 w-4 mr-2" />
                Mark Picked Up
              </Button>
            )}
          </div>
        </div>

        {/* Status Timeline */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Order Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              {statusTimeline.map((step, idx) => {
                const isCompleted = idx <= currentStatusIndex;
                const isCurrent = idx === currentStatusIndex;
                return (
                  <div key={step.status} className="flex-1 flex items-center">
                    <div className={`
                      flex items-center justify-center w-10 h-10 rounded-full border-2
                      ${isCompleted 
                        ? "bg-emerald-500 border-emerald-500 text-white" 
                        : "border-muted-foreground/30 text-muted-foreground"
                      }
                      ${isCurrent ? "ring-4 ring-emerald-500/20" : ""}
                    `}>
                      {step.icon}
                    </div>
                    <div className="ml-3 hidden sm:block">
                      <p className={`text-sm font-medium ${isCompleted ? "text-foreground" : "text-muted-foreground"}`}>
                        {step.label}
                      </p>
                    </div>
                    {idx < statusTimeline.length - 1 && (
                      <div className={`
                        flex-1 h-0.5 mx-4
                        ${idx < currentStatusIndex ? "bg-emerald-500" : "bg-muted-foreground/30"}
                      `} />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Customer Info */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-lg font-medium">{order.customer?.full_name || "Unknown"}</p>
              {order.customer?.email && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <a href={`mailto:${order.customer.email}`} className="hover:underline">
                    {order.customer.email}
                  </a>
                </div>
              )}
              {order.customer?.phone && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <a href={`tel:${order.customer.phone}`} className="hover:underline">
                    {order.customer.phone}
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Campaign Info */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Campaign
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-lg font-medium">{order.campaign?.name || "Unknown"}</p>
              {order.campaign?.pickup_date && (
                <p className="text-sm text-muted-foreground">
                  Pickup: {format(new Date(order.campaign.pickup_date), "MMMM d, yyyy")}
                </p>
              )}
              {order.campaign?.pickup_location && (
                <p className="text-sm text-muted-foreground">
                  Location: {order.campaign.pickup_location}
                </p>
              )}
              <Button variant="outline" size="sm" asChild>
                <Link to={`/florist/campaigns/${order.campaign_id}`}>
                  View Campaign
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Order Items */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Items
            </CardTitle>
            <CardDescription>
              {order.order_items?.reduce((sum, i) => sum + i.quantity, 0) || 0} items in this order
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Customizations</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead className="text-center">Qty</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.order_items?.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">
                          {item.campaign_product?.product?.name || "Unknown"}
                        </p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {item.campaign_product?.product?.category}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm space-y-1">
                        {item.customizations?.color && (
                          <p>Color: <span className="font-medium">{item.customizations.color}</span></p>
                        )}
                        {item.customizations?.ribbon_color && (
                          <p>Ribbon: <span className="font-medium">{item.customizations.ribbon_color}</span></p>
                        )}
                        {item.customizations?.special_instructions && (
                          <p className="text-muted-foreground italic">
                            {item.customizations.special_instructions}
                          </p>
                        )}
                        {!item.customizations?.color && 
                         !item.customizations?.ribbon_color && 
                         !item.customizations?.special_instructions && (
                          <span className="text-muted-foreground">None</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {item.recipient_name || <span className="text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell className="text-center">{item.quantity}</TableCell>
                    <TableCell className="text-right">
                      ${(Number(item.unit_price) * item.quantity).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <Separator className="my-4" />

            <div className="flex justify-end">
              <div className="w-64 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${Number(order.subtotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Processing Fee</span>
                  <span>${Number(order.processing_fee).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-medium text-lg pt-2 border-t">
                  <span>Total</span>
                  <span>${Number(order.total).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Order Notes */}
        {order.notes && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <StickyNote className="h-5 w-5" />
                Order Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{order.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </FloristLayout>
  );
}

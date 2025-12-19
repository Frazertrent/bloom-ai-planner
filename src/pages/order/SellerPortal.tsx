import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Loader2, AlertCircle, Package, Truck, CheckCircle, Flower, ExternalLink, 
  Copy, Clock, MapPin, Mail, Phone, ChevronDown, ChevronUp, Calendar,
  Info, ShoppingBag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OrderFulfillmentBadge } from "@/components/bloomfundr/OrderFulfillmentBadge";
import { useToast } from "@/hooks/use-toast";
import { generateOrderLink } from "@/lib/linkGenerator";
import { format, parseISO, isPast } from "date-fns";
import type { FulfillmentStatus } from "@/types/bloomfundr";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export default function SellerPortal() {
  const { magicLinkCode } = useParams<{ magicLinkCode: string }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCompleted, setShowCompleted] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());

  // Toggle order details expansion
  const toggleOrderDetails = (orderId: string) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  // Fetch seller data by magic link code
  const { data, isLoading, error } = useQuery({
    queryKey: ["seller-portal", magicLinkCode],
    queryFn: async () => {
      if (!magicLinkCode) throw new Error("No magic link code provided");

      // Get campaign student by magic link
      const { data: campaignStudent, error: csError } = await supabase
        .from("bf_campaign_students")
        .select(`
          id,
          student_id,
          campaign_id,
          magic_link_code,
          total_sales,
          order_count,
          bf_students (
            id,
            name,
            email,
            phone
          ),
          bf_campaigns (
            id,
            name,
            status,
            pickup_date,
            pickup_location,
            end_date,
            start_date,
            tracking_mode,
            bf_organizations (
              name,
              contact_phone,
              notification_email
            )
          )
        `)
        .eq("magic_link_code", magicLinkCode)
        .single();

      if (csError || !campaignStudent) throw new Error("Invalid seller link");

      // Get orders for this seller with order items
      const { data: orders, error: ordersError } = await supabase
        .from("bf_orders")
        .select(`
          id,
          order_number,
          customer_name,
          total,
          fulfillment_status,
          payment_status,
          created_at,
          notes,
          bf_customers (
            full_name,
            email,
            phone
          ),
          bf_order_items (
            id,
            quantity,
            unit_price,
            recipient_name,
            customizations,
            bf_campaign_products (
              bf_products (
                name
              )
            )
          )
        `)
        .eq("attributed_student_id", campaignStudent.student_id)
        .eq("campaign_id", campaignStudent.campaign_id)
        .eq("payment_status", "paid")
        .order("created_at", { ascending: false });

      if (ordersError) throw ordersError;

      return {
        seller: campaignStudent.bf_students,
        campaign: campaignStudent.bf_campaigns,
        organization: (campaignStudent.bf_campaigns as any)?.bf_organizations,
        stats: {
          totalSales: campaignStudent.total_sales,
          orderCount: campaignStudent.order_count,
        },
        orders: orders || [],
        magicLinkCode,
      };
    },
    enabled: !!magicLinkCode,
  });

  // Mark order as picked up mutation
  const markPickedUpMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const { error } = await supabase
        .from("bf_orders")
        .update({ fulfillment_status: "picked_up" })
        .eq("id", orderId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-portal", magicLinkCode] });
      toast({
        title: "Flowers picked up!",
        description: "Now deliver them to your customer ASAP.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update order status.",
        variant: "destructive",
      });
    },
  });

  // Mark order as delivered mutation
  const markDeliveredMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const { error } = await supabase
        .from("bf_orders")
        .update({ fulfillment_status: "delivered" })
        .eq("id", orderId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-portal", magicLinkCode] });
      toast({
        title: "Order delivered!",
        description: "Great job! The customer has received their flowers.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update order status.",
        variant: "destructive",
      });
    },
  });

  // Copy link to clipboard
  const copyLink = () => {
    const link = generateOrderLink(magicLinkCode || "");
    navigator.clipboard.writeText(link);
    toast({
      title: "Link copied!",
      description: "Share this link with friends and family to sell flowers.",
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Error state
  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
            <h2 className="text-xl font-semibold mb-2">Invalid Seller Link</h2>
            <p className="text-muted-foreground mb-4">
              This seller portal link is not valid or has expired.
            </p>
            <Button asChild variant="outline">
              <Link to="/fundraiser">Go to BloomFundr</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { seller, campaign, organization, stats, orders } = data;
  
  // Categorize orders by status
  const readyOrders = orders.filter((o: any) => o.fulfillment_status === "ready");
  const pickedUpOrders = orders.filter((o: any) => o.fulfillment_status === "picked_up");
  const preparingOrders = orders.filter((o: any) => ["pending", "in_production"].includes(o.fulfillment_status));
  const completedOrders = orders.filter((o: any) => o.fulfillment_status === "delivered");

  // Calculate delivery deadline (2 days after pickup)
  const deliveryDeadline = campaign?.pickup_date 
    ? new Date(new Date(campaign.pickup_date).getTime() + 2 * 24 * 60 * 60 * 1000)
    : null;

  const isCampaignActive = campaign?.status === "active";
  const isCampaignEnded = campaign?.end_date ? isPast(parseISO(campaign.end_date)) : false;

  // Order card component with expandable details
  const OrderCard = ({ 
    order, 
    actionButton,
    bgClass = "bg-muted/50",
    borderClass = ""
  }: { 
    order: any; 
    actionButton?: React.ReactNode;
    bgClass?: string;
    borderClass?: string;
  }) => {
    const isExpanded = expandedOrders.has(order.id);
    const customer = order.bf_customers;
    const items = order.bf_order_items || [];

    return (
      <div className={`p-4 rounded-lg ${bgClass} ${borderClass}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-medium">{order.customer_name || customer?.full_name}</p>
              <OrderFulfillmentBadge status={order.fulfillment_status as FulfillmentStatus} />
            </div>
            <p className="text-sm text-muted-foreground">{order.order_number}</p>
            <p className="text-sm font-semibold text-primary mt-1">${Number(order.total).toFixed(2)}</p>
            
            {/* Customer contact */}
            {customer && (customer.email || customer.phone) && (
              <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
                {customer.email && (
                  <a href={`mailto:${customer.email}`} className="flex items-center gap-1 hover:text-primary">
                    <Mail className="h-3 w-3" />
                    {customer.email}
                  </a>
                )}
                {customer.phone && (
                  <a href={`tel:${customer.phone}`} className="flex items-center gap-1 hover:text-primary">
                    <Phone className="h-3 w-3" />
                    {customer.phone}
                  </a>
                )}
              </div>
            )}
          </div>
          
          <div className="flex flex-col items-end gap-2">
            {actionButton}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleOrderDetails(order.id)}
              className="text-xs"
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              Details
            </Button>
          </div>
        </div>

        {/* Expanded details */}
        {isExpanded && items.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border/50">
            <p className="text-xs font-medium text-muted-foreground mb-2">Order Items:</p>
            <div className="space-y-2">
              {items.map((item: any) => (
                <div key={item.id} className="text-sm flex justify-between">
                  <span>
                    {item.quantity}x {item.bf_campaign_products?.bf_products?.name || "Product"}
                    {item.recipient_name && (
                      <span className="text-muted-foreground"> — for {item.recipient_name}</span>
                    )}
                  </span>
                  <span className="text-muted-foreground">${(Number(item.unit_price) * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            {order.notes && (
              <div className="mt-3 p-2 bg-background/50 rounded text-sm">
                <p className="text-xs font-medium text-muted-foreground">Notes:</p>
                <p>{order.notes}</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-primary/10 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <Flower className="h-7 w-7 text-primary" />
            </div>
            <CardTitle className="text-2xl">Seller Dashboard</CardTitle>
            <CardDescription className="text-base">
              Welcome back, <span className="font-medium text-foreground">{seller?.name}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Campaign info */}
            <div className="text-center space-y-2">
              <p className="font-semibold text-lg">{campaign?.name}</p>
              <p className="text-sm text-muted-foreground">
                by {organization?.name || "Organization"}
              </p>
              <div className="flex items-center justify-center gap-2">
                <Badge variant={isCampaignActive ? "default" : "secondary"}>
                  {isCampaignActive ? "Active" : isCampaignEnded ? "Ended" : campaign?.status}
                </Badge>
                {campaign?.end_date && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Ends {format(parseISO(campaign.end_date), "MMM d")}
                  </span>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold text-primary">{stats.orderCount}</p>
                <p className="text-sm text-muted-foreground">Orders</p>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-2xl font-bold text-emerald-600">${Number(stats.totalSales || 0).toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">Total Sales</p>
              </div>
            </div>

            {/* Selling Link */}
            <div className="p-4 bg-muted/50 rounded-lg space-y-3">
              <p className="text-sm font-medium flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" />
                Your Selling Link
              </p>
              <div className="p-2 bg-background rounded border text-xs text-muted-foreground break-all font-mono">
                {generateOrderLink(data.magicLinkCode)}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={copyLink}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Link
                </Button>
                <Button
                  variant="default"
                  className="flex-1"
                  onClick={() => window.open(generateOrderLink(data.magicLinkCode), '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Shop
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SECTION 1: Orders Ready for Pickup - URGENT */}
        {readyOrders.length > 0 && (
          <Card className="border-2 border-emerald-500 bg-emerald-500/5 shadow-lg shadow-emerald-500/10">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                <Flower className="h-5 w-5" />
                🌸 Orders Ready for Pickup!!
              </CardTitle>
              <CardDescription className="text-emerald-600 dark:text-emerald-300 font-medium text-base">
                Your flowers are ready! Pick them up ASAP — fresh flowers don't last long!
              </CardDescription>
              {campaign?.pickup_date && (
                <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300 mt-2 p-3 bg-emerald-500/10 rounded-lg">
                  <MapPin className="h-4 w-4" />
                  <span>
                    Pickup: {format(parseISO(campaign.pickup_date), "MMMM d, yyyy")}
                    {campaign.pickup_location && ` at ${campaign.pickup_location}`}
                  </span>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              {readyOrders.map((order: any) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  bgClass="bg-emerald-500/10"
                  borderClass="border border-emerald-500/30"
                  actionButton={
                    <Button
                      onClick={() => markPickedUpMutation.mutate(order.id)}
                      disabled={markPickedUpMutation.isPending}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      size="sm"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Mark Picked Up
                    </Button>
                  }
                />
              ))}
            </CardContent>
          </Card>
        )}

        {/* SECTION 2: Orders to Deliver - URGENT */}
        {pickedUpOrders.length > 0 && (
          <Card className="border-2 border-amber-500 bg-amber-500/5">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                <Truck className="h-5 w-5" />
                📦 Orders to Deliver
              </CardTitle>
              <CardDescription className="text-amber-600 dark:text-amber-300 font-medium">
                You have the flowers — deliver to your customers before they wilt!
              </CardDescription>
              {deliveryDeadline && (
                <div className="flex items-center gap-2 text-sm font-semibold text-amber-700 dark:text-amber-300 mt-2 p-3 bg-amber-500/10 rounded-lg">
                  <Clock className="h-4 w-4" />
                  <span>Deliver by: {format(deliveryDeadline, "MMMM d, yyyy")}</span>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              {pickedUpOrders.map((order: any) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  bgClass="bg-amber-500/10"
                  borderClass="border border-amber-500/30"
                  actionButton={
                    <Button
                      onClick={() => markDeliveredMutation.mutate(order.id)}
                      disabled={markDeliveredMutation.isPending}
                      className="bg-amber-600 hover:bg-amber-700 text-white"
                      size="sm"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Mark Delivered
                    </Button>
                  }
                />
              ))}
            </CardContent>
          </Card>
        )}

        {/* SECTION 3: Orders Being Prepared */}
        {preparingOrders.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                ⏳ Orders Being Prepared
              </CardTitle>
              <CardDescription>
                The florist is working on these orders. You'll be able to pick them up soon!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {preparingOrders.map((order: any) => (
                <OrderCard
                  key={order.id}
                  order={order}
                />
              ))}
            </CardContent>
          </Card>
        )}

        {/* SECTION 4: Completed Orders (Collapsible) */}
        {completedOrders.length > 0 && (
          <Card className="border-green-500/30 bg-green-500/5">
            <Collapsible open={showCompleted} onOpenChange={setShowCompleted}>
              <CardHeader className="pb-3">
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                      <CheckCircle className="h-5 w-5" />
                      ✅ Completed Orders ({completedOrders.length})
                    </CardTitle>
                    <Button variant="ghost" size="sm">
                      {showCompleted ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </div>
                </CollapsibleTrigger>
              </CardHeader>
              <CollapsibleContent>
                <CardContent className="space-y-3 pt-0">
                  {completedOrders.map((order: any) => (
                    <OrderCard
                      key={order.id}
                      order={order}
                      bgClass="bg-green-500/10"
                      borderClass="border border-green-500/20"
                    />
                  ))}
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        )}

        {/* Empty state */}
        {orders.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-lg font-medium">No orders yet</p>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                Share your selling link to start getting orders!
              </p>
              <Button onClick={copyLink} variant="outline">
                <Copy className="h-4 w-4 mr-2" />
                Copy Your Selling Link
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Campaign Info Footer */}
        <Card className="bg-muted/30">
          <CardContent className="py-4 space-y-3">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="text-sm space-y-2">
                {campaign?.pickup_date && (
                  <p>
                    <span className="font-medium">Pickup:</span>{" "}
                    {format(parseISO(campaign.pickup_date), "MMMM d, yyyy")}
                    {campaign.pickup_location && ` at ${campaign.pickup_location}`}
                  </p>
                )}
                {organization && (
                  <p>
                    <span className="font-medium">Questions?</span>{" "}
                    Contact {organization.name}
                    {organization.notification_email && (
                      <a href={`mailto:${organization.notification_email}`} className="text-primary hover:underline ml-1">
                        ({organization.notification_email})
                      </a>
                    )}
                    {organization.contact_phone && !organization.notification_email && (
                      <a href={`tel:${organization.contact_phone}`} className="text-primary hover:underline ml-1">
                        ({organization.contact_phone})
                      </a>
                    )}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, AlertCircle, Package, Truck, CheckCircle, Flower, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { OrderFulfillmentBadge } from "@/components/bloomfundr/OrderFulfillmentBadge";
import { useToast } from "@/hooks/use-toast";
import { generateOrderLink } from "@/lib/linkGenerator";
import { format, parseISO } from "date-fns";
import type { FulfillmentStatus } from "@/types/bloomfundr";

export default function SellerPortal() {
  const { magicLinkCode } = useParams<{ magicLinkCode: string }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
            email
          ),
          bf_campaigns (
            id,
            name,
            status,
            pickup_date,
            pickup_location,
            end_date,
            tracking_mode,
            bf_organizations (
              name
            )
          )
        `)
        .eq("magic_link_code", magicLinkCode)
        .single();

      if (csError || !campaignStudent) throw new Error("Invalid seller link");

      // Get orders for this seller
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
          bf_customers (
            full_name,
            email,
            phone
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
        title: "Order marked as delivered",
        description: "The customer has received their order.",
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
  const pickedUpOrders = orders.filter((o: any) => o.fulfillment_status === "picked_up");
  const deliveredOrders = orders.filter((o: any) => o.fulfillment_status === "delivered");
  const pendingDelivery = pickedUpOrders.length;

  // Calculate delivery deadline (2 days after campaign end)
  const deliveryDeadline = campaign?.end_date 
    ? new Date(new Date(campaign.end_date).getTime() + 2 * 24 * 60 * 60 * 1000)
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-primary/10 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
              <Flower className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Seller Dashboard</CardTitle>
            <CardDescription>
              Welcome back, <span className="font-medium text-foreground">{seller?.name}</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-1">
              <p className="font-semibold text-lg">{campaign?.name}</p>
              <p className="text-sm text-muted-foreground">
                by {organization?.name || "Organization"}
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mt-6">
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
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <p className="text-sm font-medium mb-2">Your Selling Link</p>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.open(generateOrderLink(data.magicLinkCode), '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Your Shop Page
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Pending Deliveries Alert */}
        {pendingDelivery > 0 && (
          <Card className="border-amber-500/50 bg-amber-500/5">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-amber-600" />
                <div>
                  <p className="font-medium text-amber-800 dark:text-amber-200">
                    {pendingDelivery} order{pendingDelivery > 1 ? "s" : ""} ready for delivery
                  </p>
                  {deliveryDeadline && (
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      Deliver by {format(deliveryDeadline, "MMMM d, yyyy")}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Orders to Deliver */}
        {pickedUpOrders.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Orders to Deliver
              </CardTitle>
              <CardDescription>
                Mark orders as delivered once the customer receives them
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {pickedUpOrders.map((order: any) => (
                <div key={order.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">{order.customer_name || order.bf_customers?.full_name}</p>
                    <p className="text-sm text-muted-foreground">{order.order_number}</p>
                    <p className="text-sm font-medium text-primary">${Number(order.total).toFixed(2)}</p>
                  </div>
                  <Button
                    onClick={() => markDeliveredMutation.mutate(order.id)}
                    disabled={markDeliveredMutation.isPending}
                    className="min-h-[44px]"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark Delivered
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Delivered Orders */}
        {deliveredOrders.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Delivered Orders
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {deliveredOrders.map((order: any) => (
                <div key={order.id} className="flex items-center justify-between p-4 bg-green-500/5 rounded-lg">
                  <div>
                    <p className="font-medium">{order.customer_name || order.bf_customers?.full_name}</p>
                    <p className="text-sm text-muted-foreground">{order.order_number}</p>
                    <p className="text-sm font-medium text-primary">${Number(order.total).toFixed(2)}</p>
                  </div>
                  <Badge className="bg-green-600/10 text-green-700 border-green-600/20">
                    Delivered
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* All Orders (pending production/ready) */}
        {orders.filter((o: any) => !["picked_up", "delivered"].includes(o.fulfillment_status)).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Orders In Progress</CardTitle>
              <CardDescription>
                These orders are still being prepared by the florist
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {orders
                .filter((o: any) => !["picked_up", "delivered"].includes(o.fulfillment_status))
                .map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">{order.customer_name || order.bf_customers?.full_name}</p>
                      <p className="text-sm text-muted-foreground">{order.order_number}</p>
                      <p className="text-sm font-medium text-primary">${Number(order.total).toFixed(2)}</p>
                    </div>
                    <OrderFulfillmentBadge status={order.fulfillment_status as FulfillmentStatus} />
                  </div>
                ))}
            </CardContent>
          </Card>
        )}

        {/* Empty state */}
        {orders.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Package className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-lg font-medium">No orders yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Share your selling link to start getting orders!
              </p>
            </CardContent>
          </Card>
        )}

        {/* Pickup Info */}
        {campaign?.pickup_date && (
          <Card className="bg-muted/30">
            <CardContent className="py-4">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Seller Pickup:</span>{" "}
                {format(parseISO(campaign.pickup_date), "MMMM d, yyyy")}
                {campaign.pickup_location && ` at ${campaign.pickup_location}`}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle, Flower, ArrowLeft, Package } from "lucide-react";

interface OrderDetails {
  orderNumber: string;
  total: number;
  campaignName: string;
  organizationName: string;
  endDate: string;
}

export default function OrderSuccess() {
  const { magicLinkCode } = useParams<{ magicLinkCode: string }>();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");
  
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchOrderDetails() {
      if (!orderId) {
        setIsLoading(false);
        return;
      }

      try {
        const { data: order, error } = await supabase
          .from("bf_orders")
          .select(`
            order_number,
            total,
            campaign:bf_campaigns(
              name,
              end_date,
              organization:bf_organizations(name)
            )
          `)
          .eq("id", orderId)
          .single();

        if (error) throw error;

        if (order && order.campaign) {
          setOrderDetails({
            orderNumber: order.order_number,
            total: Number(order.total),
            campaignName: order.campaign.name,
            organizationName: order.campaign.organization?.name || "Organization",
            endDate: order.campaign.end_date,
          });
        }
      } catch (error) {
        console.error("Error fetching order details:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchOrderDetails();
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-4 py-12">
          <Skeleton className="h-20 w-20 rounded-full mx-auto mb-6" />
          <Skeleton className="h-10 w-64 mx-auto mb-4" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Flower className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="font-bold">{orderDetails?.organizationName || "Fundraiser"}</h1>
              <p className="text-sm text-muted-foreground">{orderDetails?.campaignName || "Campaign"}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-emerald-600" />
          </div>
          
          <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
          <p className="text-muted-foreground mb-6">
            Thank you for your order. Your purchase supports this fundraiser!
          </p>

          <Card className="bg-card border-border text-left mb-8">
            <CardContent className="pt-6">
              <div className="text-center mb-4">
                <p className="text-sm text-muted-foreground">Order Number</p>
                <p className="text-2xl font-bold font-mono">{orderDetails?.orderNumber || "---"}</p>
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Paid</span>
                  <span className="font-bold text-lg">${orderDetails?.total.toFixed(2) || "0.00"}</span>
                </div>
                
                {orderDetails?.endDate && (
                  <>
                    <Separator className="my-3" />
                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Package className="h-4 w-4 text-primary" />
                        <span className="font-medium">Delivery Information</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Delivered By: {new Date(new Date(orderDetails.endDate).getTime() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric"
                        })}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              A confirmation email has been sent with your order details.
            </p>
            <Button variant="outline" asChild>
              <Link to={`/order/${magicLinkCode}`}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Store
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

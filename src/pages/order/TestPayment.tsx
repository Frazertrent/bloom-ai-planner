import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { 
  Flower, 
  ArrowLeft, 
  CreditCard, 
  Loader2,
  AlertTriangle
} from "lucide-react";

interface OrderSummary {
  orderNumber: string;
  total: number;
  campaignName: string;
  organizationName: string;
}

export default function TestPayment() {
  const { magicLinkCode } = useParams<{ magicLinkCode: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get("orderId");
  
  const [orderSummary, setOrderSummary] = useState<OrderSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    async function fetchOrder() {
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
            payment_status,
            campaign:bf_campaigns(
              name,
              organization:bf_organizations(name)
            )
          `)
          .eq("id", orderId)
          .single();

        if (error) throw error;

        // If already paid, redirect to success
        if (order.payment_status === "paid") {
          navigate(`/order/${magicLinkCode}/success?orderId=${orderId}`, { replace: true });
          return;
        }

        if (order && order.campaign) {
          setOrderSummary({
            orderNumber: order.order_number,
            total: Number(order.total),
            campaignName: order.campaign.name,
            organizationName: order.campaign.organization?.name || "Organization",
          });
        }
      } catch (error) {
        console.error("Error fetching order:", error);
        toast.error("Failed to load order details");
      } finally {
        setIsLoading(false);
      }
    }

    fetchOrder();
  }, [orderId, magicLinkCode, navigate]);

  const handleCompletePayment = async () => {
    if (!orderId) return;
    
    setIsProcessing(true);
    try {
      // Call the complete-payment edge function
      const { data, error } = await supabase.functions.invoke("complete-payment", {
        body: { orderId }
      });

      if (error) throw error;

      toast.success("Payment completed successfully!");
      navigate(`/order/${magicLinkCode}/success?orderId=${orderId}`, { replace: true });
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Failed to process payment. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-lg mx-auto px-4 py-12">
          <Skeleton className="h-10 w-48 mb-8" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!orderId || !orderSummary) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Order not found</p>
          <Button variant="outline" asChild>
            <Link to={`/order/${magicLinkCode}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Store
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Flower className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="font-bold">{orderSummary.organizationName}</h1>
              <p className="text-sm text-muted-foreground">{orderSummary.campaignName}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-8">
        {/* Test Mode Banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-amber-800">Test Mode</p>
            <p className="text-sm text-amber-700">
              This is a simulated payment page for testing. In production, you will be redirected to Stripe's secure checkout.
            </p>
          </div>
        </div>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Complete Payment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">Order</span>
                <span className="font-mono text-sm">{orderSummary.orderNumber}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between items-center">
                <span className="font-medium">Total</span>
                <span className="text-xl font-bold">${orderSummary.total.toFixed(2)}</span>
              </div>
            </div>

            <Button 
              className="w-full py-6 text-lg"
              onClick={handleCompletePayment}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="h-5 w-5 mr-2" />
                  Complete Test Payment
                </>
              )}
            </Button>

            <Button 
              variant="ghost" 
              className="w-full"
              asChild
              disabled={isProcessing}
            >
              <Link to={`/order/${magicLinkCode}/cancel?orderId=${orderId}`}>
                Cancel
              </Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

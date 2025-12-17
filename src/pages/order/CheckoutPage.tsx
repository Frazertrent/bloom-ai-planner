import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useOrder } from "@/contexts/OrderContext";
import { useOrderPageData } from "@/hooks/useOrderPage";
import { useCreateOrder } from "@/hooks/useCreateOrder";
import { checkoutFormSchema, CheckoutFormData } from "@/lib/checkoutValidation";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  ChevronDown,
  Flower,
  ShoppingCart,
  User,
  Mail,
  Phone,
  FileText,
  Loader2,
} from "lucide-react";

export default function CheckoutPage() {
  const { magicLinkCode } = useParams<{ magicLinkCode: string }>();
  const navigate = useNavigate();
  const { cart, cartTotal, campaignId, studentId, studentName, clearCart } = useOrder();
  const { data: pageData, isLoading: pageLoading } = useOrderPageData(magicLinkCode);
  const createOrderMutation = useCreateOrder();
  
  const [summaryOpen, setSummaryOpen] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      specialInstructions: "",
    },
  });

  // Redirect if cart is empty and not already redirecting to payment
  useEffect(() => {
    if (!pageLoading && cart.length === 0 && !isRedirecting) {
      navigate(`/order/${magicLinkCode}`);
    }
  }, [cart.length, magicLinkCode, navigate, pageLoading, isRedirecting]);

  // Calculate fees
  const processingFeePercent = 3;
  const subtotal = cartTotal;
  const processingFee = subtotal * (processingFeePercent / 100);
  const total = subtotal + processingFee;

  const onSubmit = async (data: CheckoutFormData) => {
    if (!campaignId) {
      console.error("Missing campaign context");
      return;
    }

    try {
      const result = await createOrderMutation.mutateAsync({
        campaignId,
        studentId: studentId || null,
        customerData: data,
        cart,
        subtotal,
      });

      // Call edge function to get checkout URL
      setIsRedirecting(true);
      const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke(
        "create-checkout-session",
        {
          body: {
            orderId: result.orderId,
            magicLinkCode,
            origin: window.location.origin,
          },
        }
      );

      if (checkoutError) {
        console.error("Checkout session error:", checkoutError);
        toast.error("Failed to initiate payment. Please try again.");
        setIsRedirecting(false);
        return;
      }

      // Clear cart and redirect to payment
      clearCart();
      
      if (checkoutData?.checkoutUrl) {
        window.location.href = checkoutData.checkoutUrl;
      } else {
        toast.error("Failed to get payment URL");
        setIsRedirecting(false);
      }
    } catch (error) {
      console.error("Error creating order:", error);
      setIsRedirecting(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Skeleton className="h-10 w-48 mb-8" />
          <div className="grid gap-8 lg:grid-cols-5">
            <div className="lg:col-span-3 space-y-6">
              <Skeleton className="h-64" />
            </div>
            <div className="lg:col-span-2">
              <Skeleton className="h-80" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-6">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-3 md:px-4 py-3 md:py-4">
          <div className="flex items-center gap-2 md:gap-3">
            <Button variant="ghost" size="icon" asChild className="min-h-[44px] min-w-[44px]">
              <Link to={`/order/${magicLinkCode}`}>
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="flex-1">
              <h1 className="font-bold text-base md:text-lg">Checkout</h1>
              <p className="text-xs md:text-sm text-muted-foreground truncate">
                {pageData?.organization.name} Fundraiser
                {studentName && ` · Supporting ${studentName}`}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-3 md:px-4 py-4 md:py-6">
        <div className="grid gap-6 lg:grid-cols-5">
          {/* Customer Form */}
          <div className="lg:col-span-3 order-2 lg:order-1">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {/* Full Name */}
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Full Name *
                    </Label>
                    <Input
                      id="fullName"
                      placeholder="John Smith"
                      {...register("fullName")}
                      className={errors.fullName ? "border-destructive" : ""}
                    />
                    {errors.fullName && (
                      <p className="text-sm text-destructive">{errors.fullName.message}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email Address *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      {...register("email")}
                      className={errors.email ? "border-destructive" : ""}
                    />
                    {errors.email && (
                      <p className="text-sm text-destructive">{errors.email.message}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      We'll send your order confirmation here
                    </p>
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone Number *
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="(555) 123-4567"
                      {...register("phone")}
                      className={errors.phone ? "border-destructive" : ""}
                    />
                    {errors.phone && (
                      <p className="text-sm text-destructive">{errors.phone.message}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      For pickup coordination
                    </p>
                  </div>

                  {/* Special Instructions */}
                  <div className="space-y-2">
                    <Label htmlFor="specialInstructions" className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Special Instructions (Optional)
                    </Label>
                    <Textarea
                      id="specialInstructions"
                      placeholder="Any special requests or notes for your order..."
                      rows={3}
                      {...register("specialInstructions")}
                      className={errors.specialInstructions ? "border-destructive" : ""}
                    />
                    {errors.specialInstructions && (
                      <p className="text-sm text-destructive">{errors.specialInstructions.message}</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <Button 
                    type="submit" 
                    className="w-full py-7 text-base md:text-lg min-h-[56px] active:scale-[0.98] transition-transform"
                    disabled={isSubmitting || createOrderMutation.isPending || isRedirecting}
                  >
                    {(isSubmitting || createOrderMutation.isPending) ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Creating Order...
                      </>
                    ) : isRedirecting ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Redirecting to Payment...
                      </>
                    ) : (
                      <>Continue to Payment</>
                    )}
                  </Button>

                  {createOrderMutation.isError && (
                    <p className="text-sm text-destructive text-center">
                      There was an error creating your order. Please try again.
                    </p>
                  )}
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-2 order-1 lg:order-2">
            {/* Mobile: Collapsible at top */}
            <div className="lg:hidden">
              <Collapsible open={summaryOpen} onOpenChange={setSummaryOpen}>
                <Card className="bg-card border-border">
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer">
                      <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <ShoppingCart className="h-5 w-5" />
                          Order Summary
                        </span>
                        <ChevronDown className={`h-5 w-5 transition-transform ${summaryOpen ? "rotate-180" : ""}`} />
                      </CardTitle>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent>
                      <OrderSummaryContent 
                        cart={cart}
                        subtotal={subtotal}
                        processingFee={processingFee}
                        total={total}
                      />
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            </div>

            {/* Desktop: Always visible */}
            <div className="hidden lg:block sticky top-24">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <OrderSummaryContent 
                    cart={cart}
                    subtotal={subtotal}
                    processingFee={processingFee}
                    total={total}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

interface OrderSummaryContentProps {
  cart: any[];
  subtotal: number;
  processingFee: number;
  total: number;
}

function OrderSummaryContent({ cart, subtotal, processingFee, total }: OrderSummaryContentProps) {
  return (
    <div className="space-y-4">
      {/* Items */}
      <div className="space-y-3">
        {cart.map((item) => (
          <div key={item.id} className="flex gap-3">
            {item.imageUrl ? (
              <img 
                src={item.imageUrl}
                alt={item.name}
                className="w-12 h-12 rounded object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded bg-gradient-to-br from-rose-100 to-emerald-100 flex items-center justify-center">
                <span>🌸</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{item.name}</p>
              {item.recipientName && (
                <p className="text-xs text-muted-foreground">For: {item.recipientName}</p>
              )}
              <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
            </div>
            <p className="font-medium text-sm">
              ${(item.price * item.quantity).toFixed(2)}
            </p>
          </div>
        ))}
      </div>

      <Separator />

      {/* Totals */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Processing Fee</span>
          <span>${processingFee.toFixed(2)}</span>
        </div>
      </div>

      <Separator />

      <div className="flex justify-between font-semibold text-lg">
        <span>Total</span>
        <span>${total.toFixed(2)}</span>
      </div>
    </div>
  );
}

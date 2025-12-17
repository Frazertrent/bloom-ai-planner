import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useOrderPageData } from "@/hooks/useOrderPage";
import { useOrder } from "@/contexts/OrderContext";
import { ProductCard } from "@/components/order/ProductCard";
import { ProductDetailModal } from "@/components/order/ProductDetailModal";
import { FloatingCart } from "@/components/order/FloatingCart";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Clock, AlertCircle, Flower, Rocket } from "lucide-react";
import { format } from "date-fns";
import type { BFCampaignProductWithProduct } from "@/types/bloomfundr";

export default function OrderPage() {
  const { magicLinkCode } = useParams<{ magicLinkCode: string }>();
  const { setCampaignContext } = useOrder();
  const [selectedProduct, setSelectedProduct] = useState<BFCampaignProductWithProduct | null>(null);
  
  const { data, isLoading, error } = useOrderPageData(magicLinkCode);

  // Set campaign context when data loads
  useEffect(() => {
    if (data) {
      setCampaignContext(
        data.campaign.id,
        data.student?.id || null,
        data.student?.name || null
      );
    }
  }, [data, setCampaignContext]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Skeleton className="h-32 mb-6" />
          <Skeleton className="h-20 mb-8" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Skeleton key={i} className="h-80" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <AlertCircle className="h-16 w-16 mx-auto mb-4 text-destructive" />
          <h1 className="text-2xl font-bold mb-2">Link Not Found</h1>
          <p className="text-muted-foreground mb-6">
            This fundraiser link is not valid. Please check the link and try again,
            or contact the organization for assistance.
          </p>
        </div>
      </div>
    );
  }

  const { campaign, organization, student, products, isActive, isExpired, isNotStarted, isDraft, trackingMode } = data;

  // For 'none' tracking mode, we show "Supporting: {Organization}" instead of a student
  const supportingText = student ? student.name : organization.name;

  // Common header component for non-active states
  const CampaignHeader = () => (
    <header className="bg-card border-b border-border">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Flower className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="font-bold text-lg">{organization.name} Fundraiser</h1>
            {trackingMode !== 'none' && student && (
              <p className="text-sm text-muted-foreground">Supporting: {student.name}</p>
            )}
          </div>
        </div>
      </div>
    </header>
  );

  // Show "not launched yet" message for draft campaigns
  if (isDraft) {
    return (
      <div className="min-h-screen bg-background">
        <CampaignHeader />
        <div className="flex items-center justify-center py-24">
          <div className="text-center max-w-md px-4">
            <Rocket className="h-16 w-16 mx-auto mb-4 text-primary" />
            <h2 className="text-2xl font-bold mb-2">Campaign Not Launched Yet</h2>
            <p className="text-muted-foreground mb-6">
              This fundraiser hasn't been launched yet! Ready to get started? 
              Just hit <span className="font-semibold text-primary">"Launch"</span> in your campaign settings.
            </p>
            <p className="text-sm text-muted-foreground">
              Once launched, customers will be able to place orders here.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show "coming soon" message for campaigns that haven't started
  if (isNotStarted) {
    return (
      <div className="min-h-screen bg-background">
        <CampaignHeader />
        <div className="flex items-center justify-center py-24">
          <div className="text-center max-w-md px-4">
            <Calendar className="h-16 w-16 mx-auto mb-4 text-primary" />
            <h2 className="text-2xl font-bold mb-2">Campaign Coming Soon</h2>
            <p className="text-muted-foreground mb-6">
              This fundraiser opens on {format(new Date(campaign.start_date), "MMMM d, yyyy")}.
              Check back then to place your order!
            </p>
            {trackingMode !== 'none' && student && (
              <p className="text-sm text-muted-foreground">
                Supporting {student.name} from {organization.name}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Show expired message
  if (isExpired) {
    return (
      <div className="min-h-screen bg-background">
        <CampaignHeader />
        <div className="flex items-center justify-center py-24">
          <div className="text-center max-w-md px-4">
            <Clock className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">Campaign Has Ended</h2>
            <p className="text-muted-foreground mb-6">
              This fundraiser ended on {format(new Date(campaign.end_date), "MMMM d, yyyy")}.
              Thank you for your interest in supporting {organization.name}!
            </p>
            <p className="text-sm text-muted-foreground">
              For questions, please contact the organization directly.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show "not active" message for other non-active states
  if (!isActive) {
    return (
      <div className="min-h-screen bg-background">
        <CampaignHeader />
        <div className="flex items-center justify-center py-24">
          <div className="text-center max-w-md px-4">
            <AlertCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">Campaign Not Available</h2>
            <p className="text-muted-foreground mb-6">
              This fundraiser is not currently accepting orders.
              Please contact {organization.name} for more information.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32 md:pb-8">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-3 md:px-4 py-3 md:py-6">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-9 h-9 md:w-12 md:h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Flower className="h-4 w-4 md:h-6 md:w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-bold text-sm md:text-lg truncate">
                {organization.name} Fundraiser
              </h1>
              {trackingMode !== 'none' && student ? (
                <p className="text-xs md:text-sm text-muted-foreground">
                  Supporting: <span className="font-medium text-foreground">{student.name}</span>
                </p>
              ) : (
                <p className="text-xs md:text-sm text-muted-foreground">
                  {campaign.name}
                </p>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-3 md:px-4 py-4 md:py-6 md:pr-96">
        {/* Campaign Info Banner */}
        <div className="bg-gradient-to-r from-primary/10 to-rose-500/10 rounded-xl p-4 md:p-6 mb-6 md:mb-8">
          <h2 className="text-lg md:text-2xl font-bold mb-2 md:mb-3">{campaign.name}</h2>
          
          {campaign.description && (
            <p className="text-muted-foreground text-sm md:text-base mb-3 md:mb-4">{campaign.description}</p>
          )}

          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 md:gap-4 text-xs md:text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-3.5 w-3.5 md:h-4 md:w-4 shrink-0" />
              <span>Order by {format(new Date(campaign.end_date), "MMM d, yyyy")}</span>
            </div>
            
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-3.5 w-3.5 md:h-4 md:w-4 shrink-0" />
              <span>Delivered By: {format(new Date(new Date(campaign.end_date).getTime() + 2 * 24 * 60 * 60 * 1000), "MMM d, yyyy")}</span>
            </div>
          </div>
        </div>

        {/* Products Section */}
        <section>
          <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Select Your Flowers</h3>
          
          {products.length > 0 ? (
            <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product}
                  onClick={() => setSelectedProduct(product)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>No products available for this campaign.</p>
            </div>
          )}
        </section>
      </main>

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      {/* Floating Cart */}
      <FloatingCart magicLinkCode={magicLinkCode!} />
    </div>
  );
}

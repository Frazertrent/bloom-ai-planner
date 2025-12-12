import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Loader2,
  Package,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  Copy,
  HelpCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  usePricingState,
  useSaveCampaignPricing,
  useCampaignProductsWithDetails,
} from "@/hooks/useCampaignPricing";
import {
  calculatePricing,
  calculateRevenueProjections,
  calculateRevenueAtPrice,
  ProductPricing,
} from "@/lib/pricingCalculator";

interface Step3PricingProps {
  campaignId: string;
  onBack: () => void;
  onContinue: () => void;
}

function ProductPricingCard({
  product,
  pricing,
  onUpdate,
}: {
  product: { id: string; name: string; image_url: string | null; base_cost: number };
  pricing: ProductPricing;
  onUpdate: (updates: Partial<ProductPricing>) => void;
}) {
  const breakdown = calculatePricing(
    pricing.floristPrice,
    pricing.orgProfitPercent
  );

  const effectivePrice = pricing.isCustomPrice
    ? pricing.retailPrice
    : breakdown.suggestedRetailPrice;

  // Calculate actual breakdown at the effective price
  const actualBreakdown = pricing.isCustomPrice
    ? calculateRevenueAtPrice(pricing.floristPrice, pricing.retailPrice)
    : null;

  const isPriceBelowMinimum =
    pricing.isCustomPrice && pricing.retailPrice < breakdown.minimumRetailPrice;

  return (
    <Card>
      <CardContent className="p-3 sm:p-4">
        {/* Header: Image + Name on same row */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 sm:w-16 sm:h-16 shrink-0 rounded-lg bg-muted overflow-hidden">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="h-5 w-5 text-muted-foreground/50" />
              </div>
            )}
          </div>
          <h3 className="font-semibold text-base sm:text-lg truncate">{product.name}</h3>
        </div>

        {/* Pricing inputs - 2 columns */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* Florist Price (fixed) */}
          <div>
            <Label className="text-xs text-muted-foreground">Florist Price</Label>
            <p className="font-semibold text-lg">${pricing.floristPrice.toFixed(2)}</p>
          </div>

          {/* Org Profit % */}
          <div>
            <Label htmlFor={`org-${product.id}`} className="text-xs text-muted-foreground">
              Your Profit %
            </Label>
            <div className="flex items-center gap-1">
              <Input
                id={`org-${product.id}`}
                type="number"
                min={0}
                max={50}
                value={pricing.orgProfitPercent}
                onChange={(e) =>
                  onUpdate({ orgProfitPercent: parseFloat(e.target.value) || 0 })
                }
                className="h-10 w-20 text-lg font-semibold"
              />
              <span className="text-muted-foreground">%</span>
            </div>
          </div>
        </div>

        {/* Selling Price - prominent, full width */}
        <div className="bg-primary/10 rounded-xl p-4 text-center mb-4">
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Selling Price</span>
          <p className="font-bold text-2xl sm:text-3xl text-primary">${effectivePrice.toFixed(2)}</p>
          <p className="text-sm font-medium text-rose-600 mt-1">
            You earn ${(actualBreakdown?.orgProfit ?? breakdown.orgProfit).toFixed(2)} per sale
          </p>
        </div>

        {/* Detailed breakdown - hidden on mobile, visible on desktop */}
        <div className="hidden sm:grid grid-cols-4 gap-3 text-sm mb-4 text-center">
          <div className="p-2 bg-muted/50 rounded-lg">
            <span className="text-xs text-muted-foreground block">Florist</span>
            <p className="font-medium">${pricing.floristPrice.toFixed(2)}</p>
          </div>
          <div className="p-2 bg-muted/50 rounded-lg">
            <span className="text-xs text-muted-foreground block">Your Profit</span>
            <p className="font-medium text-rose-600">${(actualBreakdown?.orgProfit ?? breakdown.orgProfit).toFixed(2)}</p>
          </div>
          <div className="p-2 bg-muted/50 rounded-lg">
            <span className="text-xs text-muted-foreground block">Platform</span>
            <p className="font-medium">${(actualBreakdown?.platformFee ?? breakdown.platformFee).toFixed(2)}</p>
          </div>
          <div className="p-2 bg-muted/50 rounded-lg">
            <span className="text-xs text-muted-foreground block">Processing</span>
            <p className="font-medium">${(actualBreakdown?.processingFee ?? breakdown.processingFee).toFixed(2)}</p>
          </div>
        </div>

        {/* Custom Price Override */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Checkbox
              id={`custom-${product.id}`}
              checked={pricing.isCustomPrice}
              onCheckedChange={(checked) =>
                onUpdate({
                  isCustomPrice: !!checked,
                  retailPrice: checked ? breakdown.suggestedRetailPrice : 0,
                })
              }
            />
            <Label htmlFor={`custom-${product.id}`} className="text-sm cursor-pointer">
              Set custom selling price
            </Label>
          </div>

          {pricing.isCustomPrice && (
            <div className="flex items-center gap-2 pl-6">
              <span className="text-sm font-medium">$</span>
              <Input
                type="number"
                min={0}
                step={0.01}
                value={pricing.retailPrice}
                onChange={(e) =>
                  onUpdate({ retailPrice: parseFloat(e.target.value) || 0 })
                }
                className="h-10 w-28 text-lg"
              />
            </div>
          )}
        </div>

        {/* Warning if below minimum */}
        {isPriceBelowMinimum && (
          <Alert variant="destructive" className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              Price below minimum (${breakdown.minimumRetailPrice.toFixed(2)})
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

export function Step3Pricing({ campaignId, onBack, onContinue }: Step3PricingProps) {
  const { data: campaignProducts, isLoading } = useCampaignProductsWithDetails(campaignId);
  const savePricing = useSaveCampaignPricing();
  const {
    productPricing,
    defaultOrgProfit,
    updateProductPricing,
    applyOrgProfitToAll,
  } = usePricingState(campaignId);

  const handleApplyToAll = () => {
    if (productPricing.length > 0) {
      const first = productPricing[0];
      applyOrgProfitToAll(first.orgProfitPercent);
    }
  };

  const handleSaveAndContinue = async () => {
    // Calculate final prices for products without custom pricing
    const finalPricing = productPricing.map((p) => {
      if (!p.isCustomPrice) {
        const breakdown = calculatePricing(
          p.floristPrice,
          p.orgProfitPercent
        );
        return { ...p, retailPrice: breakdown.suggestedRetailPrice };
      }
      return p;
    });

    await savePricing.mutateAsync({
      campaignId,
      productPricing: finalPricing,
      orgProfitPercent: defaultOrgProfit,
    });

    onContinue();
  };

  const handleBack = async () => {
    // Save current pricing before going back
    const finalPricing = productPricing.map((p) => {
      if (!p.isCustomPrice) {
        const breakdown = calculatePricing(
          p.floristPrice,
          p.orgProfitPercent
        );
        return { ...p, retailPrice: breakdown.suggestedRetailPrice };
      }
      return p;
    });

    if (finalPricing.length > 0) {
      await savePricing.mutateAsync({
        campaignId,
        productPricing: finalPricing,
        orgProfitPercent: defaultOrgProfit,
      });
    }
    onBack();
  };

  // Revenue projections
  const projections = calculateRevenueProjections(productPricing, [10, 50, 100]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!campaignProducts || campaignProducts.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No Products Selected</h3>
        <p className="text-muted-foreground mb-4">
          Please go back and select products first.
        </p>
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Products
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Helper Text for Organizations */}
      <Alert className="bg-rose-50 border-rose-200">
        <DollarSign className="h-4 w-4 text-rose-600 shrink-0" />
        <AlertDescription className="text-rose-800 text-sm">
          <strong>Set your profit %</strong> — the amount YOUR organization earns on every sale.
        </AlertDescription>
      </Alert>

      {/* Apply to All Button - full width on mobile */}
      <Button variant="outline" onClick={handleApplyToAll} className="w-full sm:w-auto sm:ml-auto sm:flex">
        <Copy className="mr-2 h-4 w-4" />
        Apply to All Products
      </Button>

      {/* Product Pricing Cards */}
      <div className="space-y-4">
        {campaignProducts.map((cp) => {
          const pricing = productPricing.find((p) => p.productId === cp.product_id);
          if (!pricing || !cp.product) return null;

          return (
            <ProductPricingCard
              key={cp.product_id}
              product={cp.product}
              pricing={pricing}
              onUpdate={(updates) => updateProductPricing(cp.product_id, updates)}
            />
          );
        })}
      </div>

      {/* Summary Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Revenue Projections
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Average Org Profit */}
          <div className="p-4 rounded-lg bg-rose-50 border border-rose-100 mb-6">
            <p className="text-sm text-rose-700">Your Average Profit Margin</p>
            <p className="text-2xl font-bold text-rose-600">
              {(productPricing.reduce((sum, p) => sum + p.orgProfitPercent, 0) / (productPricing.length || 1)).toFixed(1)}%
            </p>
            <p className="text-xs text-rose-600/70 mt-1">
              This is the money YOUR organization will earn on each sale
            </p>
          </div>

          {/* Projections Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sales Volume</TableHead>
                <TableHead className="text-right">Your Earnings</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projections.map((proj) => (
                <TableRow key={proj.volume}>
                  <TableCell className="font-medium">{proj.volume} orders</TableCell>
                  <TableCell className="text-right text-emerald-600 text-xl font-bold">
                    ${proj.orgRevenue.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <p className="text-xs text-muted-foreground mt-2">
            * Projections assume equal distribution across all products
          </p>
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-6 border-t">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={savePricing.isPending}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Products
        </Button>
        <Button onClick={handleSaveAndContinue} disabled={savePricing.isPending}>
          {savePricing.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Continue to Students
        </Button>
      </div>
    </div>
  );
}

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
      <CardContent className="p-4">
        {/* Mobile: Stack vertically, Desktop: Side by side */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Product Image - centered on mobile */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-lg bg-muted overflow-hidden mx-auto sm:mx-0">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground/50" />
              </div>
            )}
          </div>

          {/* Product Info & Pricing */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-center sm:text-left truncate mb-3">{product.name}</h3>

            {/* Pricing inputs - 2 columns on mobile */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              {/* Florist Price (fixed, from their product) */}
              <div>
                <Label className="text-xs text-muted-foreground">Florist Price</Label>
                <p className="font-medium text-emerald-600">${pricing.floristPrice.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">What they receive</p>
              </div>

              {/* Org Profit % */}
              <div>
                <Label htmlFor={`org-${product.id}`} className="text-xs text-muted-foreground flex items-center gap-1">
                  Your Profit %
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-3 w-3" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs text-xs">
                          This is the percentage of the selling price that goes to your organization.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </Label>
                <Input
                  id={`org-${product.id}`}
                  type="number"
                  min={0}
                  max={50}
                  value={pricing.orgProfitPercent}
                  onChange={(e) =>
                    onUpdate({ orgProfitPercent: parseFloat(e.target.value) || 0 })
                  }
                  className="h-8 w-20"
                />
              </div>
            </div>

            {/* Platform & Processing - full width on mobile */}
            <div className="mt-3 text-sm">
              <Label className="text-xs text-muted-foreground">Platform + Processing</Label>
              <p className="font-medium text-muted-foreground">10% + ~3%</p>
            </div>

            <Separator className="my-3" />

            {/* Calculated Breakdown - 2x2 grid on mobile, 5 cols on desktop */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm mb-3">
              <div>
                <span className="text-xs text-muted-foreground">Florist Receives</span>
                <p className="font-medium text-emerald-600">${pricing.floristPrice.toFixed(2)}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Your Profit</span>
                <p className="font-medium text-rose-600">
                  ${(actualBreakdown?.orgProfit ?? breakdown.orgProfit).toFixed(2)}
                </p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Platform Fee</span>
                <p className="font-medium">
                  ${(actualBreakdown?.platformFee ?? breakdown.platformFee).toFixed(2)}
                </p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Processing Fee</span>
                <p className="font-medium">
                  ${(actualBreakdown?.processingFee ?? breakdown.processingFee).toFixed(2)}
                </p>
              </div>
            </div>

            {/* Selling Price - prominent */}
            <div className="bg-muted/50 rounded-lg p-3 mb-3">
              <span className="text-xs text-muted-foreground font-medium">Selling Price</span>
              <p className="font-bold text-lg text-primary">${effectivePrice.toFixed(2)}</p>
            </div>

            {/* Custom Price Override */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
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
                <div className="flex items-center gap-2">
                  <span className="text-sm">$</span>
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    value={pricing.retailPrice}
                    onChange={(e) =>
                      onUpdate({ retailPrice: parseFloat(e.target.value) || 0 })
                    }
                    className="h-8 w-24"
                  />
                </div>
              )}
            </div>

            {/* Warning if below minimum */}
            {isPriceBelowMinimum && (
              <Alert variant="destructive" className="mt-3">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Price is below minimum (${breakdown.minimumRetailPrice.toFixed(2)}). 
                  The florist won't receive their full price point.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
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
    <div className="space-y-6">
      {/* Helper Text for Organizations */}
      <Alert className="bg-rose-50 border-rose-200">
        <DollarSign className="h-4 w-4 text-rose-600" />
        <AlertDescription className="text-rose-800">
          <strong>Set your profit percentage</strong> — This is the money YOUR organization 
          will earn on every sale. The florist has already set their price; you just decide 
          how much to add for your fundraiser.
        </AlertDescription>
      </Alert>

      {/* Apply to All Button */}
      <div className="flex justify-end">
        <Button variant="outline" onClick={handleApplyToAll}>
          <Copy className="mr-2 h-4 w-4" />
          Apply First Product's Profit % to All
        </Button>
      </div>

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

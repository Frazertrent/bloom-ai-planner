import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Loader2,
  Package,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  Copy,
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
  usePricingState,
  useSaveCampaignPricing,
  useCampaignProductsWithDetails,
} from "@/hooks/useCampaignPricing";
import {
  calculatePricing,
  calculateRevenueProjections,
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
    pricing.baseCost,
    pricing.floristMarginPercent,
    pricing.orgMarginPercent
  );

  const effectivePrice = pricing.isCustomPrice
    ? pricing.retailPrice
    : breakdown.suggestedRetailPrice;

  const isPriceBelowMinimum =
    pricing.isCustomPrice && pricing.retailPrice < breakdown.minimumRetailPrice;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Product Image */}
          <div className="w-20 h-20 shrink-0 rounded-lg bg-muted overflow-hidden">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Package className="h-8 w-8 text-muted-foreground/50" />
              </div>
            )}
          </div>

          {/* Product Info & Pricing */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate mb-2">{product.name}</h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              {/* Base Cost */}
              <div>
                <Label className="text-xs text-muted-foreground">Florist Cost</Label>
                <p className="font-medium">${pricing.baseCost.toFixed(2)}</p>
              </div>

              {/* Florist Margin */}
              <div>
                <Label htmlFor={`florist-${product.id}`} className="text-xs text-muted-foreground">
                  Florist Margin %
                </Label>
                <Input
                  id={`florist-${product.id}`}
                  type="number"
                  min={0}
                  max={100}
                  value={pricing.floristMarginPercent}
                  onChange={(e) =>
                    onUpdate({ floristMarginPercent: parseFloat(e.target.value) || 0 })
                  }
                  className="h-8 w-20"
                />
              </div>

              {/* Org Margin */}
              <div>
                <Label htmlFor={`org-${product.id}`} className="text-xs text-muted-foreground">
                  Org Margin %
                </Label>
                <Input
                  id={`org-${product.id}`}
                  type="number"
                  min={0}
                  max={100}
                  value={pricing.orgMarginPercent}
                  onChange={(e) =>
                    onUpdate({ orgMarginPercent: parseFloat(e.target.value) || 0 })
                  }
                  className="h-8 w-20"
                />
              </div>

              {/* Platform & Processing (read-only) */}
              <div>
                <Label className="text-xs text-muted-foreground">Platform + Processing</Label>
                <p className="font-medium text-muted-foreground">10% + ~3%</p>
              </div>
            </div>

            <Separator className="my-3" />

            {/* Calculated Breakdown */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm mb-3">
              <div>
                <span className="text-xs text-muted-foreground">Florist Revenue</span>
                <p className="font-medium text-emerald-600">${breakdown.floristRevenue.toFixed(2)}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Org Revenue</span>
                <p className="font-medium text-rose-600">${breakdown.orgRevenue.toFixed(2)}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Platform Fee</span>
                <p className="font-medium">${breakdown.platformFee.toFixed(2)}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Processing Fee</span>
                <p className="font-medium">${breakdown.processingFee.toFixed(2)}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground font-medium">Suggested Price</span>
                <p className="font-bold text-primary">${breakdown.suggestedRetailPrice.toFixed(2)}</p>
              </div>
            </div>

            {/* Custom Price Override */}
            <div className="flex items-center gap-4">
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
                  Set custom retail price
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
                  This will result in a loss.
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
    defaultFloristMargin,
    defaultOrgMargin,
    updateProductPricing,
    applyMarginsToAll,
  } = usePricingState(campaignId);

  const handleApplyToAll = () => {
    if (productPricing.length > 0) {
      const first = productPricing[0];
      applyMarginsToAll(first.floristMarginPercent, first.orgMarginPercent);
    }
  };

  const handleSaveAndContinue = async () => {
    // Calculate final prices for products without custom pricing
    const finalPricing = productPricing.map((p) => {
      if (!p.isCustomPrice) {
        const breakdown = calculatePricing(
          p.baseCost,
          p.floristMarginPercent,
          p.orgMarginPercent
        );
        return { ...p, retailPrice: breakdown.suggestedRetailPrice };
      }
      return p;
    });

    await savePricing.mutateAsync({
      campaignId,
      productPricing: finalPricing,
      floristMarginPercent: defaultFloristMargin,
      orgMarginPercent: defaultOrgMargin,
    });

    onContinue();
  };

  const handleBack = async () => {
    // Save current pricing before going back
    const finalPricing = productPricing.map((p) => {
      if (!p.isCustomPrice) {
        const breakdown = calculatePricing(
          p.baseCost,
          p.floristMarginPercent,
          p.orgMarginPercent
        );
        return { ...p, retailPrice: breakdown.suggestedRetailPrice };
      }
      return p;
    });

    if (finalPricing.length > 0) {
      await savePricing.mutateAsync({
        campaignId,
        productPricing: finalPricing,
        floristMarginPercent: defaultFloristMargin,
        orgMarginPercent: defaultOrgMargin,
      });
    }
    onBack();
  };

  // Revenue projections
  const projections = calculateRevenueProjections(productPricing, [10, 50, 100]);

  // Calculate averages
  const avgFloristMargin =
    productPricing.reduce((sum, p) => sum + p.floristMarginPercent, 0) /
    (productPricing.length || 1);
  const avgOrgMargin =
    productPricing.reduce((sum, p) => sum + p.orgMarginPercent, 0) /
    (productPricing.length || 1);

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
      {/* Apply to All Button */}
      <div className="flex justify-end">
        <Button variant="outline" onClick={handleApplyToAll}>
          <Copy className="mr-2 h-4 w-4" />
          Apply First Product's Margins to All
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
          {/* Average Margins */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Avg. Florist Margin</p>
              <p className="text-2xl font-bold text-emerald-600">
                {avgFloristMargin.toFixed(1)}%
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">Avg. Organization Margin</p>
              <p className="text-2xl font-bold text-rose-600">
                {avgOrgMargin.toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Projections Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sales Volume</TableHead>
                <TableHead className="text-right">Total Revenue</TableHead>
                <TableHead className="text-right">Florist Earnings</TableHead>
                <TableHead className="text-right">Organization Earnings</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projections.map((proj) => (
                <TableRow key={proj.volume}>
                  <TableCell className="font-medium">{proj.volume} orders</TableCell>
                  <TableCell className="text-right">
                    ${proj.totalRevenue.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right text-emerald-600">
                    ${proj.floristRevenue.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right text-rose-600">
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

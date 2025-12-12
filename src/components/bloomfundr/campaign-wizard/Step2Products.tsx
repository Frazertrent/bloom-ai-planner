import { useEffect } from "react";
import { ArrowLeft, Loader2, Package, Check, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  useFloristProducts,
  useProductSelection,
  useSaveCampaignProducts,
} from "@/hooks/useCampaignProducts";
import { BFProduct } from "@/types/bloomfundr";

interface Step2ProductsProps {
  campaignId: string;
  floristId: string;
  onBack: () => void;
  onContinue: () => void;
}

const categoryColors: Record<string, string> = {
  boutonniere: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  corsage: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
  bouquet: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  custom: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
};

function ProductCard({
  product,
  isSelected,
  maxQuantity,
  onToggle,
  onMaxQuantityChange,
}: {
  product: BFProduct;
  isSelected: boolean;
  maxQuantity: number | null;
  onToggle: () => void;
  onMaxQuantityChange: (value: number | null) => void;
}) {
  return (
    <Card
      className={cn(
        "relative cursor-pointer transition-all hover:shadow-md",
        isSelected && "ring-2 ring-primary shadow-md"
      )}
      onClick={onToggle}
    >
      {isSelected && (
        <div className="absolute top-2 right-2 z-10 h-6 w-6 rounded-full bg-primary flex items-center justify-center">
          <Check className="h-4 w-4 text-primary-foreground" />
        </div>
      )}
      <CardContent className="p-4">
        {/* Product Image */}
        <div className="aspect-square mb-3 rounded-lg bg-muted overflow-hidden">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="h-12 w-12 text-muted-foreground/50" />
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-medium text-sm line-clamp-2">{product.name}</h3>
          </div>
          
          <Badge
            variant="secondary"
            className={cn("text-xs", categoryColors[product.category] || "")}
          >
            {product.category}
          </Badge>

          <div className="text-sm">
            <span className="text-muted-foreground">Florist cost: </span>
            <span className="font-medium">${product.base_cost.toFixed(2)}</span>
          </div>

          {/* Max Quantity Input - only show when selected */}
          {isSelected && (
            <div
              className="pt-2 mt-2 border-t"
              onClick={(e) => e.stopPropagation()}
            >
              <Label htmlFor={`qty-${product.id}`} className="text-xs text-muted-foreground">
                Max quantity (optional)
              </Label>
              <Input
                id={`qty-${product.id}`}
                type="number"
                min={1}
                placeholder="No limit"
                value={maxQuantity ?? ""}
                onChange={(e) => {
                  const val = e.target.value;
                  onMaxQuantityChange(val ? parseInt(val, 10) : null);
                }}
                className="mt-1 h-8"
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function Step2Products({
  campaignId,
  floristId,
  onBack,
  onContinue,
}: Step2ProductsProps) {
  const { data: products, isLoading } = useFloristProducts(floristId);
  const saveProducts = useSaveCampaignProducts();
  const {
    selectedProducts,
    toggleProduct,
    updateProductMaxQuantity,
    isProductSelected,
    getProductSettings,
  } = useProductSelection(campaignId);

  const handleSaveAndContinue = async () => {
    if (selectedProducts.length === 0) return;

    await saveProducts.mutateAsync({
      campaignId,
      selectedProducts,
    });

    onContinue();
  };

  const handleBack = async () => {
    // Save current selections before going back
    if (selectedProducts.length > 0) {
      await saveProducts.mutateAsync({
        campaignId,
        selectedProducts,
      });
    }
    onBack();
  };

  const getSelectedProductNames = () => {
    if (!products) return [];
    return selectedProducts
      .map((sp) => products.find((p) => p.id === sp.productId)?.name)
      .filter(Boolean) as string[];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12 max-w-md mx-auto">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
          <Package className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No Products Available Yet</h3>
        <p className="text-muted-foreground mb-6">
          This florist hasn't added any products to their catalog yet. 
          Florists manage their own products through their dashboard.
        </p>
        
        <div className="space-y-3">
          <Button onClick={onBack} className="w-full">
            <Users className="mr-2 h-4 w-4" />
            Choose a Different Florist
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground mt-6 px-4">
          Want to work with this florist? Reach out to them directly and ask them to add products to their catalog.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Product Grid */}
      <div className="flex-1">
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {products.map((product) => {
            const settings = getProductSettings(product.id);
            return (
              <ProductCard
                key={product.id}
                product={product}
                isSelected={isProductSelected(product.id)}
                maxQuantity={settings?.maxQuantity ?? null}
                onToggle={() => toggleProduct(product.id)}
                onMaxQuantityChange={(val) => updateProductMaxQuantity(product.id, val)}
              />
            );
          })}
        </div>
      </div>

      {/* Selection Sidebar */}
      <div className="lg:w-72 shrink-0">
        <Card className="sticky top-4">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">Selected Products</h3>
            
            {selectedProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Click on products to add them to your campaign.
              </p>
            ) : (
              <>
                <ScrollArea className="h-48 mb-4">
                  <ul className="space-y-2">
                    {getSelectedProductNames().map((name, idx) => (
                      <li
                        key={idx}
                        className="flex items-center gap-2 text-sm"
                      >
                        <Check className="h-4 w-4 text-primary shrink-0" />
                        <span className="line-clamp-1">{name}</span>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
                <Separator className="my-3" />
                <div className="text-sm text-muted-foreground">
                  {selectedProducts.length} product{selectedProducts.length !== 1 ? "s" : ""} selected
                </div>
              </>
            )}

            <div className="mt-4 space-y-2">
              <Button
                className="w-full"
                disabled={selectedProducts.length === 0 || saveProducts.isPending}
                onClick={handleSaveAndContinue}
              >
                {saveProducts.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Continue to Pricing
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleBack}
                disabled={saveProducts.isPending}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

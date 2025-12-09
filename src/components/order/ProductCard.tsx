import { useState } from "react";
import { Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useOrder } from "@/contexts/OrderContext";
import type { BFCampaignProductWithProduct } from "@/types/bloomfundr";

interface ProductCardProps {
  product: BFCampaignProductWithProduct;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useOrder();
  const [justAdded, setJustAdded] = useState(false);

  const handleAddToCart = () => {
    addToCart(product, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  const productDetails = product.product;
  const price = Number(product.retail_price);

  return (
    <Card className="overflow-hidden bg-card border-border hover:shadow-lg transition-shadow">
      {/* Product Image */}
      <div className="aspect-square bg-muted relative overflow-hidden">
        {productDetails?.image_url ? (
          <img
            src={productDetails.image_url}
            alt={productDetails.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-rose-100 to-emerald-100">
            <span className="text-4xl">🌸</span>
          </div>
        )}
        
        {/* Category badge */}
        {productDetails?.category && (
          <span className="absolute top-2 left-2 text-xs px-2 py-1 rounded-full bg-background/90 capitalize">
            {productDetails.category}
          </span>
        )}
      </div>

      <CardContent className="p-4">
        {/* Product Name */}
        <h3 className="font-semibold text-lg mb-1">
          {productDetails?.name || "Product"}
        </h3>

        {/* Description */}
        {productDetails?.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {productDetails.description}
          </p>
        )}

        {/* Price & Add Button */}
        <div className="flex items-center justify-between mt-auto">
          <span className="text-xl font-bold text-primary">
            ${price.toFixed(2)}
          </span>
          
          <Button
            onClick={handleAddToCart}
            disabled={justAdded}
            className="gap-2"
          >
            {justAdded ? (
              <>
                <Check className="h-4 w-4" />
                Added
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Add
              </>
            )}
          </Button>
        </div>

        {/* Max quantity note */}
        {product.max_quantity && (
          <p className="text-xs text-muted-foreground mt-2">
            Limit: {product.max_quantity} per order
          </p>
        )}
      </CardContent>
    </Card>
  );
}

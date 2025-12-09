import { Card, CardContent } from "@/components/ui/card";
import type { BFCampaignProductWithProduct } from "@/types/bloomfundr";

interface ProductCardProps {
  product: BFCampaignProductWithProduct;
  onClick: () => void;
}

export function ProductCard({ product, onClick }: ProductCardProps) {
  const productDetails = product.product;
  const price = Number(product.retail_price);

  return (
    <Card 
      className="overflow-hidden bg-card border-border hover:shadow-lg transition-all cursor-pointer group"
      onClick={onClick}
    >
      {/* Product Image */}
      <div className="aspect-square bg-muted relative overflow-hidden">
        {productDetails?.image_url ? (
          <img
            src={productDetails.image_url}
            alt={productDetails.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
          <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-background/90 px-4 py-2 rounded-full text-sm font-medium">
            View Details
          </span>
        </div>
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

        {/* Price */}
        <div className="flex items-center justify-between mt-auto">
          <span className="text-xl font-bold text-primary">
            ${price.toFixed(2)}
          </span>
          
          {/* Max quantity note */}
          {product.max_quantity && (
            <span className="text-xs text-muted-foreground">
              Limit: {product.max_quantity}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

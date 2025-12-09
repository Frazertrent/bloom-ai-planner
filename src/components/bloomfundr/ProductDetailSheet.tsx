import { format } from "date-fns";
import { 
  X, 
  Edit, 
  Trash2, 
  ImageOff, 
  Calendar,
  DollarSign,
  Palette,
  Ribbon
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { BFProduct, ProductCategory, CustomizationOptions } from "@/types/bloomfundr";

const categoryColors: Record<ProductCategory, string> = {
  boutonniere: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  corsage: "bg-pink-500/10 text-pink-600 border-pink-500/20",
  bouquet: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  custom: "bg-orange-500/10 text-orange-600 border-orange-500/20",
};

const categoryLabels: Record<ProductCategory, string> = {
  boutonniere: "Boutonniere",
  corsage: "Corsage",
  bouquet: "Bouquet",
  custom: "Custom",
};

interface ProductDetailSheetProps {
  product: BFProduct | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (product: BFProduct) => void;
  onDelete: (product: BFProduct) => void;
}

export function ProductDetailSheet({
  product,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}: ProductDetailSheetProps) {
  if (!product) return null;

  const customOptions = product.customization_options as CustomizationOptions | null;
  const hasCustomizations = customOptions?.colors?.length || customOptions?.ribbon_colors?.length;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg bg-bloomfundr-card border-bloomfundr-muted overflow-y-auto">
        <SheetHeader className="text-left">
          <div className="flex items-start justify-between">
            <div className="space-y-1 pr-8">
              <SheetTitle className="text-xl text-foreground">{product.name}</SheetTitle>
              <SheetDescription className="flex items-center gap-2">
                <Badge variant="outline" className={categoryColors[product.category as ProductCategory]}>
                  {categoryLabels[product.category as ProductCategory]}
                </Badge>
                <Badge
                  variant="outline"
                  className={
                    product.is_active
                      ? "bg-green-500/10 text-green-600 border-green-500/20"
                      : "bg-gray-500/10 text-gray-600 border-gray-500/20"
                  }
                >
                  {product.is_active ? "Active" : "Inactive"}
                </Badge>
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Product Image */}
          <div className="aspect-video rounded-lg bg-muted/30 overflow-hidden">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageOff className="h-16 w-16 text-muted-foreground/30" />
              </div>
            )}
          </div>

          {/* Price */}
          <div className="flex items-center gap-3 p-4 rounded-lg bg-bloomfundr-primary/5 border border-bloomfundr-primary/20">
            <DollarSign className="h-6 w-6 text-bloomfundr-primary" />
            <div>
              <p className="text-2xl font-bold text-foreground">
                ${Number(product.base_cost).toFixed(2)}
              </p>
              <p className="text-sm text-muted-foreground">Base cost to make</p>
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-foreground">Description</h4>
              <p className="text-muted-foreground">{product.description}</p>
            </div>
          )}

          <Separator className="bg-bloomfundr-muted" />

          {/* Customization Options */}
          {hasCustomizations && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-foreground">Customization Options</h4>
              
              {customOptions?.colors && customOptions.colors.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Palette className="h-4 w-4" />
                    <span>Available Colors</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {customOptions.colors.map((color) => (
                      <Badge
                        key={color}
                        variant="secondary"
                        className="bg-bloomfundr-primary/10 text-bloomfundr-primary"
                      >
                        {color}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {customOptions?.ribbon_colors && customOptions.ribbon_colors.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Ribbon className="h-4 w-4" />
                    <span>Ribbon Colors</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {customOptions.ribbon_colors.map((ribbon) => (
                      <Badge
                        key={ribbon}
                        variant="secondary"
                        className="bg-bloomfundr-secondary/10 text-bloomfundr-secondary"
                      >
                        {ribbon}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <Separator className="bg-bloomfundr-muted" />
            </div>
          )}

          {/* Metadata */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>
                Created {format(new Date(product.created_at), "MMMM d, yyyy")}
              </span>
            </div>
            {product.updated_at !== product.created_at && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  Updated {format(new Date(product.updated_at), "MMMM d, yyyy")}
                </span>
              </div>
            )}
          </div>

          {/* Campaigns Using This Product */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">Campaigns</h4>
            <p className="text-sm text-muted-foreground">
              No active campaigns are using this product yet.
            </p>
          </div>

          <Separator className="bg-bloomfundr-muted" />

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 border-bloomfundr-muted"
              onClick={() => {
                onOpenChange(false);
                onEdit(product);
              }}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Product
            </Button>
            <Button
              variant="outline"
              className="flex-1 border-destructive/50 text-destructive hover:bg-destructive/10"
              onClick={() => {
                onOpenChange(false);
                onDelete(product);
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

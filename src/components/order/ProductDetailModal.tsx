import { useState } from "react";
import { X, Plus, Minus, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useOrder } from "@/contexts/OrderContext";
import type { BFCampaignProductWithProduct, OrderCustomizations, CustomizationOptions } from "@/types/bloomfundr";

interface ProductDetailModalProps {
  product: BFCampaignProductWithProduct | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductDetailModal({ product, isOpen, onClose }: ProductDetailModalProps) {
  const { addToCart } = useOrder();
  const [quantity, setQuantity] = useState(1);
  const [recipientName, setRecipientName] = useState("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedRibbon, setSelectedRibbon] = useState<string>("");
  const [specialInstructions, setSpecialInstructions] = useState("");

  if (!product) return null;

  const productDetails = product.product;
  const price = Number(product.retail_price);
  const maxQuantity = product.max_quantity || 10;
  const customizationOptions = productDetails?.customization_options as CustomizationOptions | null;

  const hasColors = customizationOptions?.colors && customizationOptions.colors.length > 0;
  const hasRibbons = customizationOptions?.ribbon_colors && customizationOptions.ribbon_colors.length > 0;

  const handleAddToCart = () => {
    const customizations: OrderCustomizations = {};
    
    if (selectedColor) customizations.color = selectedColor;
    if (selectedRibbon) customizations.ribbon_color = selectedRibbon;
    if (specialInstructions.trim()) customizations.special_instructions = specialInstructions.trim();

    addToCart(
      product,
      quantity,
      recipientName.trim() || null,
      Object.keys(customizations).length > 0 ? customizations : null
    );

    // Reset form
    setQuantity(1);
    setRecipientName("");
    setSelectedColor("");
    setSelectedRibbon("");
    setSpecialInstructions("");
    onClose();
  };

  const incrementQuantity = () => {
    if (quantity < maxQuantity) setQuantity(q => q + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) setQuantity(q => q - 1);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">{productDetails?.name}</DialogTitle>
        </DialogHeader>

        {/* Product Image */}
        <div className="aspect-square bg-muted rounded-lg overflow-hidden -mt-2">
          {productDetails?.image_url ? (
            <img
              src={productDetails.image_url}
              alt={productDetails.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-rose-100 to-emerald-100">
              <span className="text-6xl">🌸</span>
            </div>
          )}
        </div>

        {/* Product Info - with solid background for contrast */}
        <div className="space-y-4 bg-background rounded-t-xl relative z-10 -mt-6 pt-6 px-1">
          <div>
            <h2 className="text-2xl font-bold">{productDetails?.name}</h2>
            <p className="text-2xl font-bold text-primary mt-1">${price.toFixed(2)}</p>
          </div>

          {productDetails?.description && (
            <p className="text-muted-foreground">{productDetails.description}</p>
          )}

          {/* Color Selection */}
          {hasColors && (
            <div className="space-y-2">
              <Label>Color</Label>
              <Select value={selectedColor} onValueChange={setSelectedColor}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a color" />
                </SelectTrigger>
                <SelectContent>
                  {customizationOptions!.colors!.map((color) => (
                    <SelectItem key={color} value={color}>
                      <span className="flex items-center gap-2">
                        <span 
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: color.toLowerCase() }}
                        />
                        {color}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Ribbon Selection */}
          {hasRibbons && (
            <div className="space-y-2">
              <Label>Ribbon Color</Label>
              <Select value={selectedRibbon} onValueChange={setSelectedRibbon}>
                <SelectTrigger>
                  <SelectValue placeholder="Select ribbon color" />
                </SelectTrigger>
                <SelectContent>
                  {customizationOptions!.ribbon_colors!.map((ribbon) => (
                    <SelectItem key={ribbon} value={ribbon}>
                      <span className="flex items-center gap-2">
                        <span 
                          className="w-4 h-4 rounded-full border"
                          style={{ backgroundColor: ribbon.toLowerCase() }}
                        />
                        {ribbon}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Recipient Name */}
          <div className="space-y-2">
            <Label htmlFor="recipient" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Recipient Name (Optional)
            </Label>
            <Input
              id="recipient"
              placeholder="Who is this for?"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
            />
          </div>

          {/* Special Instructions */}
          <div className="space-y-2">
            <Label htmlFor="instructions">Special Instructions (Optional)</Label>
            <Textarea
              id="instructions"
              placeholder="Any special requests?"
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              rows={2}
            />
          </div>

          {/* Quantity Selector */}
          <div className="space-y-2">
            <Label>Quantity</Label>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="icon"
                onClick={decrementQuantity}
                disabled={quantity <= 1}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={incrementQuantity}
                disabled={quantity >= maxQuantity}
              >
                <Plus className="h-4 w-4" />
              </Button>
              {product.max_quantity && (
                <span className="text-sm text-muted-foreground">
                  (max {maxQuantity})
                </span>
              )}
            </div>
          </div>

          {/* Add to Order Button */}
          <Button 
            className="w-full py-6 text-lg"
            onClick={handleAddToCart}
          >
            Add to Order • ${(price * quantity).toFixed(2)}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

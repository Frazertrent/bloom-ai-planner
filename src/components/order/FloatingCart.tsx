import { ShoppingCart, Plus, Minus, Trash2, ShoppingBag, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useOrder, CartItem } from "@/contexts/OrderContext";
import { useNavigate } from "react-router-dom";

interface FloatingCartProps {
  magicLinkCode: string;
}

export function FloatingCart({ magicLinkCode }: FloatingCartProps) {
  const navigate = useNavigate();
  const { 
    cart, 
    cartItemCount, 
    cartTotal, 
    updateQuantity, 
    removeFromCart,
    isCartOpen,
    setIsCartOpen,
  } = useOrder();

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate(`/order/${magicLinkCode}/checkout`);
  };

  const handleContinueShopping = () => {
    setIsCartOpen(false);
  };

  return (
    <>
      {/* Floating button on mobile - large touch target */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden z-50 p-3 bg-gradient-to-t from-background via-background to-transparent pt-8">
        <Button 
          className="w-full shadow-xl py-7 text-base min-h-[56px] active:scale-[0.98] transition-transform"
          onClick={() => setIsCartOpen(true)}
        >
          <ShoppingCart className="h-5 w-5 mr-3" />
          <span className="flex-1 text-left">
            {cartItemCount > 0 ? `${cartItemCount} item${cartItemCount !== 1 ? "s" : ""}` : "View Cart"}
          </span>
          <span className="font-bold text-lg">${cartTotal.toFixed(2)}</span>
        </Button>
      </div>

      {/* Cart Sheet */}
      <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md flex flex-col">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Your Order
            </SheetTitle>
          </SheetHeader>
          
          <div className="flex-1 flex flex-col min-h-0 mt-4">
            {cart.length === 0 ? (
              <EmptyCartState onContinueShopping={handleContinueShopping} />
            ) : (
              <>
                <ScrollArea className="flex-1">
                  <div className="space-y-4 pr-4">
                    {cart.map((item) => (
                      <CartItemRow 
                        key={item.id}
                        item={item}
                        onUpdateQuantity={updateQuantity}
                        onRemove={removeFromCart}
                      />
                    ))}
                  </div>
                </ScrollArea>
                
                <div className="border-t mt-4 pt-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-xl font-bold">${cartTotal.toFixed(2)}</span>
                  </div>
                  
                  <Button 
                    className="w-full py-7 text-base min-h-[56px] active:scale-[0.98] transition-transform" 
                    onClick={handleCheckout}
                  >
                    Proceed to Checkout
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full min-h-[48px] active:scale-[0.98] transition-transform"
                    onClick={handleContinueShopping}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Continue Shopping
                  </Button>
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Side panel on desktop */}
      <div className="hidden md:block fixed right-4 top-24 w-80 z-40">
        <div className="bg-card border border-border rounded-lg shadow-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Your Order
            </h3>
            <span className="text-sm text-muted-foreground">
              {cartItemCount} item{cartItemCount !== 1 ? "s" : ""}
            </span>
          </div>
          
          {cart.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingBag className="h-10 w-10 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">Your cart is empty</p>
              <p className="text-xs text-muted-foreground mt-1">
                Click a product to add it
              </p>
            </div>
          ) : (
            <>
              <ScrollArea className="h-[280px] pr-2">
                <div className="space-y-3">
                  {cart.map((item) => (
                    <CartItemCompact 
                      key={item.id}
                      item={item}
                      onUpdateQuantity={updateQuantity}
                      onRemove={removeFromCart}
                    />
                  ))}
                </div>
              </ScrollArea>
              
              <Separator className="my-4" />
              
              <div className="space-y-3">
                <div className="flex justify-between font-semibold">
                  <span>Subtotal</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                <Button className="w-full" onClick={handleCheckout}>
                  Checkout
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

function EmptyCartState({ onContinueShopping }: { onContinueShopping: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 text-center">
      <ShoppingBag className="h-16 w-16 mb-4 text-muted-foreground/50" />
      <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
      <p className="text-sm text-muted-foreground mb-6">
        Add some beautiful flowers to get started!
      </p>
      <Button onClick={onContinueShopping}>
        Browse Products
      </Button>
    </div>
  );
}

interface CartItemRowProps {
  item: CartItem;
  onUpdateQuantity: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
}

function CartItemRow({ item, onUpdateQuantity, onRemove }: CartItemRowProps) {
  const lineTotal = item.price * item.quantity;

  return (
    <div className="flex gap-3 p-3 rounded-lg bg-muted/50">
      {/* Image */}
      {item.imageUrl ? (
        <img 
          src={item.imageUrl} 
          alt={item.name}
          className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
        />
      ) : (
        <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-rose-100 to-emerald-100 flex items-center justify-center flex-shrink-0">
          <span className="text-2xl">🌸</span>
        </div>
      )}
      
      {/* Details */}
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{item.name}</p>
        
        {/* Customizations */}
        {item.customizations && (
          <div className="text-xs text-muted-foreground mt-0.5">
            {item.customizations.color && <span>Color: {item.customizations.color}</span>}
            {item.customizations.ribbon_color && (
              <span className="ml-2">Ribbon: {item.customizations.ribbon_color}</span>
            )}
          </div>
        )}
        
        {/* Recipient */}
        {item.recipientName && (
          <p className="text-xs text-muted-foreground">For: {item.recipientName}</p>
        )}
        
        <p className="text-sm font-medium mt-1">${item.price.toFixed(2)} each</p>
        
        {/* Quantity controls - larger for touch */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1">
            <Button 
              variant="outline" 
              size="icon" 
              className="h-9 w-9 min-h-[44px] min-w-[44px] active:scale-95 transition-transform"
              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-10 text-center font-medium text-lg">{item.quantity}</span>
            <Button 
              variant="outline" 
              size="icon" 
              className="h-9 w-9 min-h-[44px] min-w-[44px] active:scale-95 transition-transform"
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="font-semibold text-lg">${lineTotal.toFixed(2)}</span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9 min-h-[44px] min-w-[44px] text-destructive hover:text-destructive active:scale-95 transition-transform"
              onClick={() => onRemove(item.id)}
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface CartItemCompactProps {
  item: CartItem;
  onUpdateQuantity: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
}

function CartItemCompact({ item, onUpdateQuantity, onRemove }: CartItemCompactProps) {
  return (
    <div className="flex gap-2 p-2 rounded-lg bg-muted/50">
      {item.imageUrl ? (
        <img 
          src={item.imageUrl} 
          alt={item.name}
          className="w-10 h-10 rounded object-cover"
        />
      ) : (
        <div className="w-10 h-10 rounded bg-gradient-to-br from-rose-100 to-emerald-100 flex items-center justify-center">
          <span className="text-lg">🌸</span>
        </div>
      )}
      
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{item.name}</p>
        {item.recipientName && (
          <p className="text-xs text-muted-foreground truncate">For: {item.recipientName}</p>
        )}
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-5 w-5"
              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-5 text-center text-xs">{item.quantity}</span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-5 w-5"
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          <span className="text-sm font-medium">${(item.price * item.quantity).toFixed(2)}</span>
        </div>
      </div>
      
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-6 w-6 text-muted-foreground hover:text-destructive self-start"
        onClick={() => onRemove(item.id)}
      >
        <Trash2 className="h-3 w-3" />
      </Button>
    </div>
  );
}

import { ShoppingCart, X, Plus, Minus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useOrder } from "@/contexts/OrderContext";
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

  return (
    <>
      {/* Floating button on mobile */}
      <div className="fixed bottom-4 left-4 right-4 md:hidden z-50">
        <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
          <SheetTrigger asChild>
            <Button 
              className="w-full shadow-lg py-6"
              disabled={cartItemCount === 0}
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              <span className="flex-1 text-left">
                {cartItemCount} item{cartItemCount !== 1 ? "s" : ""}
              </span>
              <span className="font-bold">${cartTotal.toFixed(2)}</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[80vh]">
            <SheetHeader>
              <SheetTitle>Your Order</SheetTitle>
            </SheetHeader>
            <CartContents 
              cart={cart}
              cartTotal={cartTotal}
              updateQuantity={updateQuantity}
              removeFromCart={removeFromCart}
              onCheckout={handleCheckout}
            />
          </SheetContent>
        </Sheet>
      </div>

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
            <p className="text-sm text-muted-foreground text-center py-8">
              Your cart is empty
            </p>
          ) : (
            <>
              <ScrollArea className="h-[300px] pr-2">
                <div className="space-y-3">
                  {cart.map((item) => (
                    <CartItem 
                      key={item.id}
                      item={item}
                      onUpdateQuantity={updateQuantity}
                      onRemove={removeFromCart}
                    />
                  ))}
                </div>
              </ScrollArea>
              
              <div className="border-t mt-4 pt-4 space-y-3">
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                <Button className="w-full" onClick={handleCheckout}>
                  Proceed to Checkout
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

interface CartContentsProps {
  cart: any[];
  cartTotal: number;
  updateQuantity: (id: string, qty: number) => void;
  removeFromCart: (id: string) => void;
  onCheckout: () => void;
}

function CartContents({ cart, cartTotal, updateQuantity, removeFromCart, onCheckout }: CartContentsProps) {
  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <ShoppingCart className="h-12 w-12 mb-4 opacity-50" />
        <p>Your cart is empty</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 mt-4">
        <div className="space-y-3 pr-2">
          {cart.map((item) => (
            <CartItem 
              key={item.id}
              item={item}
              onUpdateQuantity={updateQuantity}
              onRemove={removeFromCart}
            />
          ))}
        </div>
      </ScrollArea>
      
      <div className="border-t mt-4 pt-4 space-y-3">
        <div className="flex justify-between text-lg font-semibold">
          <span>Total</span>
          <span>${cartTotal.toFixed(2)}</span>
        </div>
        <Button className="w-full py-6" onClick={onCheckout}>
          Proceed to Checkout
        </Button>
      </div>
    </div>
  );
}

interface CartItemProps {
  item: any;
  onUpdateQuantity: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
}

function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  return (
    <div className="flex gap-3 p-2 rounded-lg bg-muted/50">
      {item.imageUrl && (
        <img 
          src={item.imageUrl} 
          alt={item.name}
          className="w-12 h-12 rounded object-cover"
        />
      )}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{item.name}</p>
        {item.recipientName && (
          <p className="text-xs text-muted-foreground">For: {item.recipientName}</p>
        )}
        <p className="text-sm text-muted-foreground">${item.price.toFixed(2)}</p>
      </div>
      <div className="flex items-center gap-1">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6"
          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
        >
          <Minus className="h-3 w-3" />
        </Button>
        <span className="w-6 text-center text-sm">{item.quantity}</span>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6"
          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
        >
          <Plus className="h-3 w-3" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6 text-destructive"
          onClick={() => onRemove(item.id)}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import type { BFCampaignProductWithProduct, OrderCustomizations } from "@/types/bloomfundr";

export interface CartItem {
  id: string; // unique cart item id
  campaignProductId: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string | null;
  recipientName: string | null;
  customizations: OrderCustomizations | null;
}

interface OrderContextType {
  // Campaign data
  campaignId: string | null;
  studentId: string | null;
  studentName: string | null;
  setCampaignContext: (campaignId: string, studentId: string, studentName: string) => void;
  
  // Cart
  cart: CartItem[];
  cartItemCount: number;
  cartTotal: number;
  
  // Cart actions
  addToCart: (product: BFCampaignProductWithProduct, quantity?: number, recipientName?: string, customizations?: OrderCustomizations) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  
  // Cart UI
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const OrderContext = createContext<OrderContextType | null>(null);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [campaignId, setCampaignId] = useState<string | null>(null);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [studentName, setStudentName] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const setCampaignContext = useCallback((cId: string, sId: string, sName: string) => {
    // If switching campaigns, clear cart
    if (campaignId && campaignId !== cId) {
      setCart([]);
    }
    setCampaignId(cId);
    setStudentId(sId);
    setStudentName(sName);
  }, [campaignId]);

  const addToCart = useCallback((
    product: BFCampaignProductWithProduct,
    quantity: number = 1,
    recipientName: string | null = null,
    customizations: OrderCustomizations | null = null
  ) => {
    const cartItemId = `${product.id}-${Date.now()}`;
    
    const newItem: CartItem = {
      id: cartItemId,
      campaignProductId: product.id,
      productId: product.product_id,
      name: product.product?.name || "Unknown Product",
      price: Number(product.retail_price),
      quantity,
      imageUrl: product.product?.image_url || null,
      recipientName,
      customizations,
    };
    
    setCart(prev => [...prev, newItem]);
    setIsCartOpen(true);
  }, []);

  const updateQuantity = useCallback((cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(prev => prev.filter(item => item.id !== cartItemId));
    } else {
      setCart(prev => prev.map(item => 
        item.id === cartItemId ? { ...item, quantity } : item
      ));
    }
  }, []);

  const removeFromCart = useCallback((cartItemId: string) => {
    setCart(prev => prev.filter(item => item.id !== cartItemId));
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <OrderContext.Provider value={{
      campaignId,
      studentId,
      studentName,
      setCampaignContext,
      cart,
      cartItemCount,
      cartTotal,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      isCartOpen,
      setIsCartOpen,
    }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrder() {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error("useOrder must be used within an OrderProvider");
  }
  return context;
}

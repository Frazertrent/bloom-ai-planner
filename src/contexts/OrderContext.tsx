import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
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
  addToCart: (
    product: BFCampaignProductWithProduct, 
    quantity?: number, 
    recipientName?: string | null, 
    customizations?: OrderCustomizations | null
  ) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  
  // Cart UI
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const OrderContext = createContext<OrderContextType | null>(null);

const CART_STORAGE_KEY = "bloomfundr_cart";

interface StoredCart {
  campaignId: string;
  studentId: string;
  studentName: string;
  items: CartItem[];
}

export function OrderProvider({ children }: { children: ReactNode }) {
  const [campaignId, setCampaignId] = useState<string | null>(null);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [studentName, setStudentName] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const data: StoredCart = JSON.parse(stored);
        setCampaignId(data.campaignId);
        setStudentId(data.studentId);
        setStudentName(data.studentName);
        setCart(data.items);
      }
    } catch (e) {
      console.error("Error loading cart from localStorage:", e);
    }
    setIsInitialized(true);
  }, []);

  // Save cart to localStorage when it changes
  useEffect(() => {
    if (!isInitialized) return;
    
    if (campaignId && studentId && studentName) {
      const data: StoredCart = {
        campaignId,
        studentId,
        studentName,
        items: cart,
      };
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(data));
    } else if (cart.length === 0) {
      localStorage.removeItem(CART_STORAGE_KEY);
    }
  }, [cart, campaignId, studentId, studentName, isInitialized]);

  const setCampaignContext = useCallback((cId: string, sId: string, sName: string) => {
    // If switching campaigns, clear cart
    if (campaignId && campaignId !== cId) {
      setCart([]);
      localStorage.removeItem(CART_STORAGE_KEY);
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
    const cartItemId = `${product.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
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
    localStorage.removeItem(CART_STORAGE_KEY);
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

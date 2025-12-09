import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { CartItem } from "@/contexts/OrderContext";
import type { CheckoutFormData } from "@/lib/checkoutValidation";
import type { Json } from "@/integrations/supabase/types";

interface CreateOrderParams {
  campaignId: string;
  studentId: string;
  customerData: CheckoutFormData;
  cart: CartItem[];
  subtotal: number;
}

interface CreateOrderResult {
  orderId: string;
  orderNumber: string;
  customerId: string;
}

export function useCreateOrder() {
  return useMutation({
    mutationFn: async (params: CreateOrderParams): Promise<CreateOrderResult> => {
      const { campaignId, studentId, customerData, cart, subtotal } = params;

      // Calculate fees
      const platformFeePercent = 10;
      const processingFeePercent = 3;
      const platformFee = subtotal * (platformFeePercent / 100);
      const processingFee = subtotal * (processingFeePercent / 100);
      const total = subtotal + processingFee;

      // 1. Find or create customer
      const { data: existingCustomer } = await supabase
        .from("bf_customers")
        .select("id")
        .eq("email", customerData.email.toLowerCase())
        .single();

      let customerId: string;

      if (existingCustomer) {
        customerId = existingCustomer.id;
      } else {
        const { data: newCustomer, error: customerError } = await supabase
          .from("bf_customers")
          .insert({
            email: customerData.email.toLowerCase(),
            full_name: customerData.fullName,
            phone: customerData.phone,
          })
          .select("id")
          .single();

        if (customerError) throw customerError;
        customerId = newCustomer.id;
      }

      // 2. Create order
      const { data: order, error: orderError } = await supabase
        .from("bf_orders")
        .insert({
          campaign_id: campaignId,
          customer_id: customerId,
          attributed_student_id: studentId,
          subtotal,
          platform_fee: platformFee,
          processing_fee: processingFee,
          total,
          payment_status: "pending",
          fulfillment_status: "pending",
          entry_method: "online",
          notes: customerData.specialInstructions || null,
        })
        .select("id, order_number")
        .single();

      if (orderError) throw orderError;

      // 3. Create order items
      const orderItems = cart.map((item) => ({
        order_id: order.id,
        campaign_product_id: item.campaignProductId,
        quantity: item.quantity,
        unit_price: item.price,
        recipient_name: item.recipientName || null,
        customizations: (item.customizations ? JSON.parse(JSON.stringify(item.customizations)) : null) as Json,
      }));

      const { error: itemsError } = await supabase
        .from("bf_order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      return {
        orderId: order.id,
        orderNumber: order.order_number,
        customerId,
      };
    },
  });
}

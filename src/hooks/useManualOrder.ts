import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { notifyNewOrder, notifyFloristNewOrder } from "@/lib/notifications";
import type { Json } from "@/integrations/supabase/types";

export interface ManualOrderItem {
  campaignProductId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  recipientName?: string;
  customizations?: Record<string, string>;
}

export interface ManualOrderData {
  campaignId: string;
  studentId?: string | null;
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  items: ManualOrderItem[];
  paymentMethod: "cash" | "check" | "online";
  paymentCollected: boolean;
  amountCollected?: number;
  collectedBy?: string;
  notes?: string;
}

interface CreateManualOrderResult {
  orderId: string;
  orderNumber: string;
}

export function useCreateManualOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ManualOrderData): Promise<CreateManualOrderResult> => {
      const {
        campaignId,
        studentId,
        customerName,
        customerEmail,
        customerPhone,
        items,
        paymentMethod,
        paymentCollected,
        amountCollected,
        collectedBy,
        notes,
      } = data;

      // Calculate subtotal
      const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

      // Calculate fees
      const platformFeePercent = 10;
      const processingFeePercent = paymentMethod === "online" ? 3 : 0;
      const platformFee = subtotal * (platformFeePercent / 100);
      const processingFee = subtotal * (processingFeePercent / 100);
      const total = subtotal + processingFee;

      // 1. Find or create customer
      let customerId: string;

      if (customerEmail) {
        const { data: existingCustomer } = await supabase
          .from("bf_customers")
          .select("id")
          .eq("email", customerEmail.toLowerCase())
          .single();

        if (existingCustomer) {
          // Update customer info to latest values
          await supabase
            .from("bf_customers")
            .update({
              full_name: customerName,
              phone: customerPhone,
            })
            .eq("id", existingCustomer.id);
          customerId = existingCustomer.id;
        } else {
          const { data: newCustomer, error: customerError } = await supabase
            .from("bf_customers")
            .insert({
              email: customerEmail.toLowerCase(),
              full_name: customerName,
              phone: customerPhone,
            })
            .select("id")
            .single();

          if (customerError) throw customerError;
          customerId = newCustomer.id;
        }
      } else {
        // Create customer without email (use phone + name hash)
        const tempEmail = `manual_${Date.now()}@temp.bloomfundr.local`;
        const { data: newCustomer, error: customerError } = await supabase
          .from("bf_customers")
          .insert({
            email: tempEmail,
            full_name: customerName,
            phone: customerPhone,
          })
          .select("id")
          .single();

        if (customerError) throw customerError;
        customerId = newCustomer.id;
      }

      // Build notes
      const orderNotes = [
        notes,
        paymentMethod !== "online" && `Payment method: ${paymentMethod}`,
        paymentCollected && amountCollected && `Amount collected: $${amountCollected.toFixed(2)}`,
        collectedBy && `Collected by: ${collectedBy}`,
      ]
        .filter(Boolean)
        .join("\n");

      // 2. Create order
      const { data: order, error: orderError } = await supabase
        .from("bf_orders")
        .insert({
          campaign_id: campaignId,
          customer_id: customerId,
          attributed_student_id: studentId || null,
          customer_name: customerName,
          subtotal,
          platform_fee: platformFee,
          processing_fee: processingFee,
          total,
          payment_status: paymentCollected ? "paid" : "pending",
          fulfillment_status: "pending",
          entry_method: "manual",
          notes: orderNotes || null,
          paid_at: paymentCollected ? new Date().toISOString() : null,
        })
        .select("id, order_number")
        .single();

      if (orderError) throw orderError;

      // 3. Create order items
      const orderItems = items.map((item) => ({
        order_id: order.id,
        campaign_product_id: item.campaignProductId,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        recipient_name: item.recipientName || null,
        customizations: (item.customizations
          ? JSON.parse(JSON.stringify(item.customizations))
          : null) as Json,
      }));

      const { error: itemsError } = await supabase
        .from("bf_order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // 4. Update student's sales totals - only if studentId is provided
      let studentNameForNotification: string | null = null;
      if (studentId) {
        const { data: studentRecord } = await supabase
          .from("bf_campaign_students")
          .select("id, total_sales, order_count")
          .eq("campaign_id", campaignId)
          .eq("student_id", studentId)
          .single();

        if (studentRecord) {
          await supabase
            .from("bf_campaign_students")
            .update({
              total_sales: Number(studentRecord.total_sales || 0) + subtotal,
              order_count: Number(studentRecord.order_count || 0) + 1,
            })
            .eq("id", studentRecord.id);
        }

        // Get student name for notification
        const { data: student } = await supabase
          .from("bf_students")
          .select("name")
          .eq("id", studentId)
          .single();
        
        studentNameForNotification = student?.name || null;
      }

      // 5. Get campaign info for notification
      const { data: campaign } = await supabase
        .from("bf_campaigns")
        .select("organization_id, florist_id, name")
        .eq("id", campaignId)
        .single();

      // 6. Create notifications for organization and florist
      if (campaign) {
        // Notify organization
        await notifyNewOrder({
          organizationId: campaign.organization_id,
          campaignId,
          campaignName: campaign.name,
          orderNumber: order.order_number,
          customerName,
          studentName: studentNameForNotification || "Campaign Sale",
          amount: total,
        });

        // Notify florist
        const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
        await notifyFloristNewOrder({
          floristId: campaign.florist_id,
          campaignId,
          campaignName: campaign.name,
          orderNumber: order.order_number,
          customerName,
          amount: total,
          itemCount: totalItems,
        });
      }

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["org-campaign-analytics", campaignId] });
      queryClient.invalidateQueries({ queryKey: ["bf-campaign-students", campaignId] });
      queryClient.invalidateQueries({ queryKey: ["org-notifications"] });
      queryClient.invalidateQueries({ queryKey: ["org-notification-count"] });

      return {
        orderId: order.id,
        orderNumber: order.order_number,
      };
    },
  });
}

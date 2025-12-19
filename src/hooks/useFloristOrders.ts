import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useFloristProfile } from "@/hooks/useFloristData";
import { toast } from "sonner";
import { notifyOrgOrdersReady, notifyOrgAllOrdersReady } from "@/lib/notifications";
import { sendPickupReadyEmail, sendAllOrdersReadyEmail } from "@/lib/emailService";
import { generateSellerPortalLink } from "@/lib/linkGenerator";
import { format } from "date-fns";
import type {
  BFOrderWithRelations, 
  BFCampaign, 
  BFCustomer, 
  FulfillmentStatus,
  PaymentStatus,
  EntryMethod,
  CampaignStatus
} from "@/types/bloomfundr";

export function useFloristOrdersList(campaignId?: string, statusFilter?: FulfillmentStatus | "all") {
  const { data: florist } = useFloristProfile();

  return useQuery({
    queryKey: ["florist-orders-list", florist?.id, campaignId, statusFilter],
    queryFn: async (): Promise<BFOrderWithRelations[]> => {
      if (!florist?.id) return [];

      // First get campaigns for this florist
      const { data: campaigns } = await supabase
        .from("bf_campaigns")
        .select("id, name, organization_id")
        .eq("florist_id", florist.id);

      if (!campaigns || campaigns.length === 0) return [];

      // Fetch organizations for all campaigns
      const orgIds = [...new Set(campaigns.map((c) => c.organization_id))];
      const { data: organizations } = await supabase
        .from("bf_organizations")
        .select("id, name, org_type")
        .in("id", orgIds);

      const orgMap = new Map(organizations?.map((o) => [o.id, o]) || []);

      let campaignIds = campaigns.map((c) => c.id);
      
      // Filter by specific campaign if provided
      if (campaignId && campaignId !== "all") {
        campaignIds = campaignIds.filter((id) => id === campaignId);
      }

      // Build orders query (show all orders, not filtered by payment status)
      let query = supabase
        .from("bf_orders")
        .select("*, customer_name")
        .in("campaign_id", campaignIds)
        .order("created_at", { ascending: false });

      if (statusFilter && statusFilter !== "all") {
        query = query.eq("fulfillment_status", statusFilter);
      }

      const { data: orders, error } = await query;

      if (error) {
        console.error("Error fetching orders:", error);
        return [];
      }

      if (!orders || orders.length === 0) return [];

      // Get customer IDs
      const customerIds = [...new Set(orders.map((o) => o.customer_id))];
      
      // Fetch customers
      const { data: customers } = await supabase
        .from("bf_customers")
        .select("*")
        .in("id", customerIds);

      const customerMap = new Map(customers?.map((c) => [c.id, c]) || []);
      // Attach organization data to campaigns
      const campaignMap = new Map(campaigns.map((c) => [c.id, { ...c, organization: orgMap.get(c.organization_id) }]));

      // Fetch order items with products
      const orderIds = orders.map((o) => o.id);
      const { data: orderItems } = await supabase
        .from("bf_order_items")
        .select("*, campaign_product:bf_campaign_products(*, product:bf_products(*))")
        .in("order_id", orderIds);

      const itemsByOrder = new Map<string, typeof orderItems>();
      orderItems?.forEach((item) => {
        const existing = itemsByOrder.get(item.order_id) || [];
        existing.push(item);
        itemsByOrder.set(item.order_id, existing);
      });

      return orders.map((order) => ({
        ...order,
        payment_status: order.payment_status as PaymentStatus,
        fulfillment_status: order.fulfillment_status as FulfillmentStatus,
        entry_method: order.entry_method as EntryMethod,
        customer: customerMap.get(order.customer_id) as BFCustomer | undefined,
        campaign: campaignMap.get(order.campaign_id) as unknown as BFCampaign | undefined,
        order_items: (itemsByOrder.get(order.id) || []) as unknown as BFOrderWithRelations["order_items"],
      }));
    },
    enabled: !!florist?.id,
  });
}

export function useFloristOrderDetail(orderId: string | undefined) {
  const { data: florist } = useFloristProfile();

  return useQuery({
    queryKey: ["florist-order-detail", orderId],
    queryFn: async (): Promise<BFOrderWithRelations | null> => {
      if (!orderId) return null;

      // Fetch order
      const { data: order, error } = await supabase
        .from("bf_orders")
        .select("*")
        .eq("id", orderId)
        .single();

      if (error || !order) {
        console.error("Error fetching order:", error);
        return null;
      }

      // Fetch customer
      const { data: customer } = await supabase
        .from("bf_customers")
        .select("*")
        .eq("id", order.customer_id)
        .single();

      // Fetch campaign
      const { data: campaign } = await supabase
        .from("bf_campaigns")
        .select("*")
        .eq("id", order.campaign_id)
        .single();

      // Fetch order items with products
      const { data: orderItems } = await supabase
        .from("bf_order_items")
        .select("*, campaign_product:bf_campaign_products(*, product:bf_products(*))")
        .eq("order_id", orderId);

      return {
        ...order,
        payment_status: order.payment_status as PaymentStatus,
        fulfillment_status: order.fulfillment_status as FulfillmentStatus,
        entry_method: order.entry_method as EntryMethod,
        customer: customer as BFCustomer | undefined,
        campaign: {
          ...campaign,
          status: campaign?.status as CampaignStatus,
        } as BFCampaign | undefined,
        order_items: (orderItems || []) as unknown as BFOrderWithRelations["order_items"],
      };
    },
    enabled: !!orderId && !!florist?.id,
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  const { data: florist } = useFloristProfile();

  return useMutation({
    mutationFn: async ({ 
      orderId, 
      status,
      campaignId,
    }: { 
      orderId: string; 
      status: FulfillmentStatus;
      campaignId?: string;
    }) => {
      const { error } = await supabase
        .from("bf_orders")
        .update({ fulfillment_status: status })
        .eq("id", orderId);

      if (error) throw error;

      // If marking as ready, check if all orders for this campaign are now ready and send notification
      if (status === "ready" && campaignId) {
        // Get campaign details for notification and email
        const { data: campaign } = await supabase
          .from("bf_campaigns")
          .select("id, name, organization_id, pickup_date, pickup_location")
          .eq("id", campaignId)
          .single();

        if (campaign) {
          // Get organization details
          const { data: organization } = await supabase
            .from("bf_organizations")
            .select("name, notification_email")
            .eq("id", campaign.organization_id)
            .single();

          // Count how many orders are now ready for this campaign
          const { count: readyCount } = await supabase
            .from("bf_orders")
            .select("*", { count: "exact", head: true })
            .eq("campaign_id", campaignId)
            .eq("fulfillment_status", "ready");

          // Check if ALL orders are now ready (none pending or in production)
          const { count: pendingCount } = await supabase
            .from("bf_orders")
            .select("*", { count: "exact", head: true })
            .eq("campaign_id", campaignId)
            .in("fulfillment_status", ["pending", "in_production"]);

          const { count: totalOrders } = await supabase
            .from("bf_orders")
            .select("*", { count: "exact", head: true })
            .eq("campaign_id", campaignId);

          // If no pending/in_production orders remain, ALL orders are ready!
          if (pendingCount === 0 && totalOrders && totalOrders > 0) {
            // Send special "All Orders Ready" notification
            await notifyOrgAllOrdersReady({
              organizationId: campaign.organization_id,
              campaignId: campaign.id,
              campaignName: campaign.name,
              floristName: florist?.business_name || "Florist",
              orderCount: totalOrders,
            });

            // Send email to organization (non-blocking)
            if (organization?.notification_email) {
              sendAllOrdersReadyEmail(organization.notification_email, {
                organizationName: organization.name,
                campaignName: campaign.name,
                totalOrders,
                floristName: florist?.business_name || "Florist",
                pickupDate: campaign.pickup_date ? format(new Date(campaign.pickup_date), 'MMMM d, yyyy') : undefined,
                pickupLocation: campaign.pickup_location || undefined,
                dashboardLink: `${window.location.origin}/org/campaigns/${campaign.id}`,
              }).catch(err => console.error('Failed to send all orders ready email:', err));
            }

            return { orderId, status, campaignId, allOrdersReady: true, campaignName: campaign.name, totalOrders };
          } else {
            // Regular notification for orders marked ready
            await notifyOrgOrdersReady({
              organizationId: campaign.organization_id,
              campaignId: campaign.id,
              campaignName: campaign.name,
              floristName: florist?.business_name || "Florist",
              orderCount: readyCount || 1,
            });
          }

          // Send pickup ready emails to sellers who have orders ready (non-blocking)
          // Get the order that was just marked ready to find the seller
          const { data: thisOrder } = await supabase
            .from("bf_orders")
            .select("attributed_student_id")
            .eq("id", orderId)
            .single();

          if (thisOrder?.attributed_student_id) {
            // Get seller details
            const { data: student } = await supabase
              .from("bf_students")
              .select("id, name, email")
              .eq("id", thisOrder.attributed_student_id)
              .single();

            // Get magic link code for this seller
            const { data: campaignStudent } = await supabase
              .from("bf_campaign_students")
              .select("magic_link_code")
              .eq("campaign_id", campaignId)
              .eq("student_id", thisOrder.attributed_student_id)
              .single();

            // Count ready orders for this seller
            const { count: sellerReadyCount } = await supabase
              .from("bf_orders")
              .select("*", { count: "exact", head: true })
              .eq("campaign_id", campaignId)
              .eq("attributed_student_id", thisOrder.attributed_student_id)
              .eq("fulfillment_status", "ready");

            if (student?.email && campaignStudent?.magic_link_code && campaign.pickup_date && campaign.pickup_location) {
              sendPickupReadyEmail(student.email, {
                sellerName: student.name,
                campaignName: campaign.name,
                organizationName: organization?.name || 'Organization',
                orderCount: sellerReadyCount || 1,
                pickupDate: format(new Date(campaign.pickup_date), 'MMMM d, yyyy'),
                pickupLocation: campaign.pickup_location,
                portalLink: generateSellerPortalLink(campaignStudent.magic_link_code),
              }).catch(err => console.error('Failed to send pickup ready email:', err));
            }
          }
        }
      }

      return { orderId, status, campaignId, allOrdersReady: false };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["florist-orders-list"] });
      queryClient.invalidateQueries({ queryKey: ["florist-order-detail"] });
      queryClient.invalidateQueries({ queryKey: ["florist-stats"] });
      queryClient.invalidateQueries({ queryKey: ["org-campaign-analytics"] });
      toast.success("Order status updated");

      // Show special toast if all orders are ready
      if (result?.allOrdersReady && result?.campaignName) {
        setTimeout(() => {
          toast.success(`All orders for ${result.campaignName} are now ready for pickup!`, {
            duration: 5000,
          });
        }, 500);
      }
    },
    onError: (error) => {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status");
    },
  });
}

export function useBulkUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      orderIds, 
      status 
    }: { 
      orderIds: string[]; 
      status: FulfillmentStatus;
    }) => {
      const { error } = await supabase
        .from("bf_orders")
        .update({ fulfillment_status: status })
        .in("id", orderIds);

      if (error) throw error;

      return { orderIds, status };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["florist-orders-list"] });
      queryClient.invalidateQueries({ queryKey: ["florist-order-detail"] });
      queryClient.invalidateQueries({ queryKey: ["florist-stats"] });
      queryClient.invalidateQueries({ queryKey: ["org-campaign-analytics"] });
      toast.success(`${variables.orderIds.length} orders updated`);
    },
    onError: (error) => {
      console.error("Error updating orders:", error);
      toast.error("Failed to update orders");
    },
  });
}

export function useFloristCampaignsForFilter() {
  const { data: florist } = useFloristProfile();

  return useQuery({
    queryKey: ["florist-campaigns-filter", florist?.id],
    queryFn: async (): Promise<{ id: string; name: string }[]> => {
      if (!florist?.id) return [];

      const { data, error } = await supabase
        .from("bf_campaigns")
        .select("id, name")
        .eq("florist_id", florist.id)
        .order("name");

      if (error) {
        console.error("Error fetching campaigns:", error);
        return [];
      }

      return data || [];
    },
    enabled: !!florist?.id,
  });
}

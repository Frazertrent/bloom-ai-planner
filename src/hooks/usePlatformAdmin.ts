import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PlatformStats {
  totalOrders: number;
  totalPaidOrders: number;
  totalRevenue: number;
  totalPlatformFees: number;
  totalProcessingFees: number;
  totalFloristPayouts: number;
  totalOrgPayouts: number;
  totalRefunds: number;
  pendingPayouts: number;
  completedPayouts: number;
  failedPayouts: number;
  activeCampaigns: number;
  totalCampaigns: number;
  totalFlorists: number;
  totalOrganizations: number;
}

export function usePlatformStats() {
  return useQuery({
    queryKey: ["platform-stats"],
    queryFn: async (): Promise<PlatformStats> => {
      // Get order stats
      const { data: orders } = await supabase
        .from("bf_orders")
        .select("payment_status, total, subtotal, platform_fee, processing_fee, refund_amount");

      const paidOrders = orders?.filter(o => o.payment_status === "paid") || [];
      const refundedOrders = orders?.filter(o => 
        o.payment_status === "refunded" || o.payment_status === "partially_refunded"
      ) || [];

      // Get payout stats
      const { data: payouts } = await supabase
        .from("bf_payouts")
        .select("status, amount, recipient_type, is_reversal");

      const nonReversalPayouts = payouts?.filter(p => !p.is_reversal) || [];
      const floristPayouts = nonReversalPayouts.filter(p => p.recipient_type === "florist" && p.status === "completed");
      const orgPayouts = nonReversalPayouts.filter(p => p.recipient_type === "organization" && p.status === "completed");

      // Get campaign stats
      const { data: campaigns } = await supabase
        .from("bf_campaigns")
        .select("status");

      const activeCampaigns = campaigns?.filter(c => c.status === "active").length || 0;

      // Get florist and org counts
      const { count: floristCount } = await supabase
        .from("bf_florists")
        .select("*", { count: "exact", head: true });

      const { count: orgCount } = await supabase
        .from("bf_organizations")
        .select("*", { count: "exact", head: true });

      return {
        totalOrders: orders?.length || 0,
        totalPaidOrders: paidOrders.length,
        totalRevenue: paidOrders.reduce((sum, o) => sum + Number(o.total || 0), 0),
        totalPlatformFees: paidOrders.reduce((sum, o) => sum + Number(o.platform_fee || 0), 0),
        totalProcessingFees: paidOrders.reduce((sum, o) => sum + Number(o.processing_fee || 0), 0),
        totalFloristPayouts: floristPayouts.reduce((sum, p) => sum + Number(p.amount || 0), 0),
        totalOrgPayouts: orgPayouts.reduce((sum, p) => sum + Number(p.amount || 0), 0),
        totalRefunds: refundedOrders.reduce((sum, o) => sum + Number(o.refund_amount || 0), 0),
        pendingPayouts: nonReversalPayouts.filter(p => p.status === "pending").length,
        completedPayouts: nonReversalPayouts.filter(p => p.status === "completed").length,
        failedPayouts: nonReversalPayouts.filter(p => p.status === "failed").length,
        activeCampaigns,
        totalCampaigns: campaigns?.length || 0,
        totalFlorists: floristCount || 0,
        totalOrganizations: orgCount || 0,
      };
    },
  });
}

export interface RecentPayout {
  id: string;
  campaign_name: string;
  order_number: string | null;
  recipient_type: string;
  recipient_name: string;
  amount: number;
  status: string;
  created_at: string;
}

export function useRecentPayouts(limit = 20) {
  return useQuery({
    queryKey: ["recent-payouts", limit],
    queryFn: async (): Promise<RecentPayout[]> => {
      const { data: payouts, error } = await supabase
        .from("bf_payouts")
        .select(`
          id,
          amount,
          status,
          recipient_type,
          recipient_id,
          created_at,
          order_id,
          campaign_id,
          is_reversal,
          bf_campaigns(name),
          bf_orders(order_number)
        `)
        .eq("is_reversal", false)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        console.error("Error fetching recent payouts:", error);
        return [];
      }

      // Get recipient names
      const floristIds = [...new Set(payouts?.filter(p => p.recipient_type === "florist").map(p => p.recipient_id) || [])];
      const orgIds = [...new Set(payouts?.filter(p => p.recipient_type === "organization").map(p => p.recipient_id) || [])];

      const { data: florists } = await supabase
        .from("bf_florists")
        .select("id, business_name")
        .in("id", floristIds.length > 0 ? floristIds : ["00000000-0000-0000-0000-000000000000"]);

      const { data: orgs } = await supabase
        .from("bf_organizations")
        .select("id, name")
        .in("id", orgIds.length > 0 ? orgIds : ["00000000-0000-0000-0000-000000000000"]);

      const floristMap = new Map(florists?.map(f => [f.id, f.business_name]) || []);
      const orgMap = new Map(orgs?.map(o => [o.id, o.name]) || []);

      return (payouts || []).map((p: any) => ({
        id: p.id,
        campaign_name: p.bf_campaigns?.name || "Unknown",
        order_number: p.bf_orders?.order_number || null,
        recipient_type: p.recipient_type,
        recipient_name: p.recipient_type === "florist" 
          ? floristMap.get(p.recipient_id) || "Unknown Florist"
          : orgMap.get(p.recipient_id) || "Unknown Org",
        amount: p.amount,
        status: p.status,
        created_at: p.created_at,
      }));
    },
  });
}

export interface RecentOrder {
  id: string;
  order_number: string;
  customer_name: string;
  campaign_name: string;
  total: number;
  platform_fee: number;
  payment_status: string;
  refund_status: string | null;
  created_at: string;
}

export function useRecentOrders(limit = 20) {
  return useQuery({
    queryKey: ["recent-orders-admin", limit],
    queryFn: async (): Promise<RecentOrder[]> => {
      const { data, error } = await supabase
        .from("bf_orders")
        .select(`
          id,
          order_number,
          customer_name,
          total,
          platform_fee,
          payment_status,
          refund_status,
          created_at,
          bf_campaigns(name)
        `)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (error) {
        console.error("Error fetching recent orders:", error);
        return [];
      }

      return (data || []).map((o: any) => ({
        id: o.id,
        order_number: o.order_number,
        customer_name: o.customer_name || "Unknown",
        campaign_name: o.bf_campaigns?.name || "Unknown",
        total: o.total,
        platform_fee: o.platform_fee,
        payment_status: o.payment_status,
        refund_status: o.refund_status,
        created_at: o.created_at,
      }));
    },
  });
}

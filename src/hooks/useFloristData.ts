import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useBloomFundrAuth } from "@/contexts/BloomFundrAuthContext";
import type { BFFlorist, FloristDashboardStats, BFCampaign, BFOrder } from "@/types/bloomfundr";

export function useFloristProfile() {
  const { user } = useBloomFundrAuth();

  return useQuery({
    queryKey: ["florist-profile", user?.id],
    queryFn: async (): Promise<BFFlorist | null> => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from("bf_florists")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching florist profile:", error);
        return null;
      }

      return data as BFFlorist | null;
    },
    enabled: !!user?.id,
  });
}

export function useFloristStats() {
  const { data: florist } = useFloristProfile();

  return useQuery({
    queryKey: ["florist-stats", florist?.id],
    queryFn: async (): Promise<FloristDashboardStats> => {
      if (!florist?.id) {
        return {
          total_products: 0,
          active_campaigns: 0,
          pending_orders: 0,
          total_earnings: 0,
        };
      }

      // Get product count
      const { count: productCount } = await supabase
        .from("bf_products")
        .select("*", { count: "exact", head: true })
        .eq("florist_id", florist.id)
        .eq("is_active", true);

      // Get active campaigns count
      const { count: campaignCount } = await supabase
        .from("bf_campaigns")
        .select("*", { count: "exact", head: true })
        .eq("florist_id", florist.id)
        .eq("status", "active");

      // Get pending orders count
      const { data: campaignIds } = await supabase
        .from("bf_campaigns")
        .select("id")
        .eq("florist_id", florist.id);

      let pendingOrderCount = 0;

      if (campaignIds && campaignIds.length > 0) {
        const ids = campaignIds.map((c) => c.id);

        const { count: orderCount } = await supabase
          .from("bf_orders")
          .select("*", { count: "exact", head: true })
          .in("campaign_id", ids)
          .eq("payment_status", "paid")
          .in("fulfillment_status", ["pending", "in_production"]);

        pendingOrderCount = orderCount || 0;
      }

      // Use persistent lifetime earnings from florist profile
      const totalEarnings = Number(florist.total_lifetime_earnings) || 0;

      return {
        total_products: productCount || 0,
        active_campaigns: campaignCount || 0,
        pending_orders: pendingOrderCount,
        total_earnings: totalEarnings,
      };
    },
    enabled: !!florist?.id,
  });
}

export function useFloristCampaigns(status?: string) {
  const { data: florist } = useFloristProfile();

  return useQuery({
    queryKey: ["florist-campaigns", florist?.id, status],
    queryFn: async (): Promise<BFCampaign[]> => {
      if (!florist?.id) return [];

      let query = supabase
        .from("bf_campaigns")
        .select("*")
        .eq("florist_id", florist.id)
        .order("created_at", { ascending: false });

      if (status) {
        query = query.eq("status", status);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching campaigns:", error);
        return [];
      }

      return data as BFCampaign[];
    },
    enabled: !!florist?.id,
  });
}

export function useFloristOrders(limit?: number) {
  const { data: florist } = useFloristProfile();

  return useQuery({
    queryKey: ["florist-orders", florist?.id, limit],
    queryFn: async (): Promise<BFOrder[]> => {
      if (!florist?.id) return [];

      // First get campaign IDs for this florist
      const { data: campaigns } = await supabase
        .from("bf_campaigns")
        .select("id")
        .eq("florist_id", florist.id);

      if (!campaigns || campaigns.length === 0) return [];

      const campaignIds = campaigns.map((c) => c.id);

      let query = supabase
        .from("bf_orders")
        .select("*")
        .in("campaign_id", campaignIds)
        .order("created_at", { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching orders:", error);
        return [];
      }

      return data as BFOrder[];
    },
    enabled: !!florist?.id,
  });
}

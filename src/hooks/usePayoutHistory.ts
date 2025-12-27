import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface PayoutRecord {
  id: string;
  campaign_id: string;
  campaign_name?: string;
  order_id?: string;
  order_number?: string;
  amount: number;
  status: string;
  failure_reason?: string;
  stripe_transfer_id: string | null;
  created_at: string;
  processed_at: string | null;
}

export function useFloristPayoutHistory() {
  return useQuery({
    queryKey: ["florist-payout-history"],
    queryFn: async (): Promise<PayoutRecord[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // First get the florist ID
      const { data: florist } = await supabase
        .from("bf_florists")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!florist) return [];

      // Get all payouts for this florist with campaign and order details
      const { data: payouts, error } = await supabase
        .from("bf_payouts")
        .select(`
          id,
          campaign_id,
          order_id,
          amount,
          status,
          failure_reason,
          stripe_transfer_id,
          created_at,
          processed_at,
          bf_campaigns!inner(name),
          bf_orders(order_number)
        `)
        .eq("recipient_type", "florist")
        .eq("recipient_id", florist.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching payout history:", error);
        return [];
      }

      return (payouts || []).map((p: any) => ({
        id: p.id,
        campaign_id: p.campaign_id,
        campaign_name: p.bf_campaigns?.name,
        order_id: p.order_id,
        order_number: p.bf_orders?.order_number,
        amount: p.amount,
        status: p.status,
        failure_reason: p.failure_reason,
        stripe_transfer_id: p.stripe_transfer_id,
        created_at: p.created_at,
        processed_at: p.processed_at,
      }));
    },
  });
}

export function useOrgPayoutHistory() {
  return useQuery({
    queryKey: ["org-payout-history"],
    queryFn: async (): Promise<PayoutRecord[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // First get the organization ID
      const { data: org } = await supabase
        .from("bf_organizations")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!org) return [];

      // Get all payouts for this organization with campaign and order details
      const { data: payouts, error } = await supabase
        .from("bf_payouts")
        .select(`
          id,
          campaign_id,
          order_id,
          amount,
          status,
          failure_reason,
          stripe_transfer_id,
          created_at,
          processed_at,
          bf_campaigns!inner(name),
          bf_orders(order_number)
        `)
        .eq("recipient_type", "organization")
        .eq("recipient_id", org.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching payout history:", error);
        return [];
      }

      return (payouts || []).map((p: any) => ({
        id: p.id,
        campaign_id: p.campaign_id,
        campaign_name: p.bf_campaigns?.name,
        order_id: p.order_id,
        order_number: p.bf_orders?.order_number,
        amount: p.amount,
        status: p.status,
        failure_reason: p.failure_reason,
        stripe_transfer_id: p.stripe_transfer_id,
        created_at: p.created_at,
        processed_at: p.processed_at,
      }));
    },
  });
}

export function usePendingPayoutCount(recipientType: "florist" | "organization", recipientId: string | undefined) {
  return useQuery({
    queryKey: ["pending-payout-count", recipientType, recipientId],
    queryFn: async (): Promise<number> => {
      if (!recipientId) return 0;

      const { count, error } = await supabase
        .from("bf_payouts")
        .select("*", { count: "exact", head: true })
        .eq("recipient_type", recipientType)
        .eq("recipient_id", recipientId)
        .eq("status", "pending");

      if (error) {
        console.error("Error fetching pending payout count:", error);
        return 0;
      }

      return count || 0;
    },
    enabled: !!recipientId,
  });
}

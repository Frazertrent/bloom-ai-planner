import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { calculateCampaignPayouts, type PayoutBreakdown, type OrderData, type CampaignData } from "@/lib/payoutCalculator";
import { useToast } from "@/hooks/use-toast";

export interface Payout {
  id: string;
  campaign_id: string;
  recipient_type: 'florist' | 'organization';
  recipient_id: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  stripe_transfer_id: string | null;
  processed_at: string | null;
  created_at: string;
}

export interface CampaignPayoutData {
  breakdown: PayoutBreakdown;
  payouts: Payout[];
  floristPayout: Payout | null;
  orgPayout: Payout | null;
}

export function useCampaignPayouts(campaignId: string | undefined) {
  return useQuery({
    queryKey: ["campaign-payouts", campaignId],
    queryFn: async (): Promise<CampaignPayoutData | null> => {
      if (!campaignId) return null;

      // Fetch campaign details
      const { data: campaign, error: campaignError } = await supabase
        .from("bf_campaigns")
        .select("florist_id, organization_id, florist_margin_percent, organization_margin_percent, platform_fee_percent")
        .eq("id", campaignId)
        .single();

      if (campaignError) throw campaignError;

      // Fetch paid orders
      const { data: orders, error: ordersError } = await supabase
        .from("bf_orders")
        .select("id, order_number, subtotal, processing_fee, platform_fee, payment_status")
        .eq("campaign_id", campaignId);

      if (ordersError) throw ordersError;

      // Fetch existing payouts
      const { data: payouts, error: payoutsError } = await supabase
        .from("bf_payouts")
        .select("*")
        .eq("campaign_id", campaignId);

      if (payoutsError) throw payoutsError;

      // Calculate breakdown
      const campaignData: CampaignData = {
        florist_margin_percent: campaign.florist_margin_percent,
        organization_margin_percent: campaign.organization_margin_percent,
        platform_fee_percent: campaign.platform_fee_percent || 10,
      };

      const orderData: OrderData[] = (orders || []).map(o => ({
        id: o.id,
        order_number: o.order_number,
        subtotal: Number(o.subtotal),
        processing_fee: Number(o.processing_fee),
        platform_fee: Number(o.platform_fee),
        payment_status: o.payment_status,
      }));

      const breakdown = calculateCampaignPayouts(orderData, campaignData);

      // Find existing payouts
      const typedPayouts = (payouts || []) as Payout[];
      const floristPayout = typedPayouts.find(p => p.recipient_type === 'florist') || null;
      const orgPayout = typedPayouts.find(p => p.recipient_type === 'organization') || null;

      return {
        breakdown,
        payouts: typedPayouts,
        floristPayout,
        orgPayout,
      };
    },
    enabled: !!campaignId,
  });
}

export function useCreatePayouts() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ campaignId }: { campaignId: string }) => {
      // Fetch campaign data
      const { data: campaign, error: campaignError } = await supabase
        .from("bf_campaigns")
        .select("florist_id, organization_id, florist_margin_percent, organization_margin_percent, platform_fee_percent")
        .eq("id", campaignId)
        .single();

      if (campaignError) throw campaignError;

      // Fetch paid orders
      const { data: orders, error: ordersError } = await supabase
        .from("bf_orders")
        .select("id, order_number, subtotal, processing_fee, platform_fee, payment_status")
        .eq("campaign_id", campaignId);

      if (ordersError) throw ordersError;

      // Calculate breakdown
      const campaignData: CampaignData = {
        florist_margin_percent: campaign.florist_margin_percent,
        organization_margin_percent: campaign.organization_margin_percent,
        platform_fee_percent: campaign.platform_fee_percent || 10,
      };

      const orderData: OrderData[] = (orders || []).map(o => ({
        id: o.id,
        order_number: o.order_number,
        subtotal: Number(o.subtotal),
        processing_fee: Number(o.processing_fee),
        platform_fee: Number(o.platform_fee),
        payment_status: o.payment_status,
      }));

      const breakdown = calculateCampaignPayouts(orderData, campaignData);

      // Check for existing payouts
      const { data: existingPayouts } = await supabase
        .from("bf_payouts")
        .select("id, recipient_type")
        .eq("campaign_id", campaignId);

      const hasFloristPayout = existingPayouts?.some(p => p.recipient_type === 'florist');
      const hasOrgPayout = existingPayouts?.some(p => p.recipient_type === 'organization');

      const payoutsToCreate = [];

      // Create florist payout if doesn't exist and amount > 0
      if (!hasFloristPayout && breakdown.floristTotal > 0) {
        payoutsToCreate.push({
          campaign_id: campaignId,
          recipient_type: 'florist',
          recipient_id: campaign.florist_id,
          amount: breakdown.floristTotal,
          status: 'pending',
        });
      }

      // Create org payout if doesn't exist and amount > 0
      if (!hasOrgPayout && breakdown.orgTotal > 0) {
        payoutsToCreate.push({
          campaign_id: campaignId,
          recipient_type: 'organization',
          recipient_id: campaign.organization_id,
          amount: breakdown.orgTotal,
          status: 'pending',
        });
      }

      if (payoutsToCreate.length > 0) {
        const { error: insertError } = await supabase
          .from("bf_payouts")
          .insert(payoutsToCreate);

        if (insertError) throw insertError;
      }

      return { created: payoutsToCreate.length };
    },
    onSuccess: (data, { campaignId }) => {
      queryClient.invalidateQueries({ queryKey: ["campaign-payouts", campaignId] });
      toast({
        title: "Payouts created",
        description: `${data.created} payout record(s) created successfully.`,
      });
    },
    onError: (error) => {
      console.error("Error creating payouts:", error);
      toast({
        title: "Error",
        description: "Failed to create payout records.",
        variant: "destructive",
      });
    },
  });
}

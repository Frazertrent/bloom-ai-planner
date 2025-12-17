import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BFCampaign, BFFlorist } from "@/types/bloomfundr";
import { notifyFloristCampaignInvitation } from "@/lib/notifications";
import { format, startOfDay, isBefore, parseISO } from "date-fns";

export interface CampaignReviewData {
  campaign: BFCampaign;
  florist: BFFlorist | null;
  products: {
    id: string;
    name: string;
    retailPrice: number;
    floristPrice: number;
    maxQuantity: number | null;
  }[];
  students: {
    id: string;
    name: string;
    magicLinkCode: string;
  }[];
  avgFloristMargin: number;
  avgOrgMargin: number;
  trackingMode: string;
  campaignLinkCode: string | null;
}

export function useCampaignReviewData(campaignId: string | undefined) {
  return useQuery({
    queryKey: ["bf-campaign-review", campaignId],
    queryFn: async (): Promise<CampaignReviewData | null> => {
      if (!campaignId) return null;

      // Fetch campaign
      const { data: campaign, error: campaignError } = await supabase
        .from("bf_campaigns")
        .select("*")
        .eq("id", campaignId)
        .single();

      if (campaignError) throw campaignError;

      // Fetch florist
      const { data: florist, error: floristError } = await supabase
        .from("bf_florists")
        .select("*")
        .eq("id", campaign.florist_id)
        .single();

      if (floristError && floristError.code !== "PGRST116") throw floristError;

      // Fetch campaign products with product details
      const { data: campaignProducts, error: productsError } = await supabase
        .from("bf_campaign_products")
        .select(`
          id,
          retail_price,
          max_quantity,
          product:bf_products(id, name, base_cost)
        `)
        .eq("campaign_id", campaignId);

      if (productsError) throw productsError;

      // Fetch campaign students with student details
      const { data: campaignStudents, error: studentsError } = await supabase
        .from("bf_campaign_students")
        .select(`
          id,
          magic_link_code,
          student:bf_students(id, name)
        `)
        .eq("campaign_id", campaignId);

      if (studentsError) throw studentsError;

      // Transform products
      const products = campaignProducts.map((cp: any) => ({
        id: cp.product?.id || cp.id,
        name: cp.product?.name || "Unknown Product",
        retailPrice: cp.retail_price,
        floristPrice: cp.product?.base_cost || 0,
        maxQuantity: cp.max_quantity,
      }));

      // Transform students
      const students = campaignStudents.map((cs: any) => ({
        id: cs.student?.id || cs.id,
        name: cs.student?.name || "Unknown Student",
        magicLinkCode: cs.magic_link_code,
      }));

      return {
        campaign: campaign as BFCampaign,
        florist: florist as BFFlorist | null,
        products,
        students,
        avgFloristMargin: campaign.florist_margin_percent,
        avgOrgMargin: campaign.organization_margin_percent,
        trackingMode: campaign.tracking_mode || 'none',
        campaignLinkCode: campaign.campaign_link_code,
      };
    },
    enabled: !!campaignId,
  });
}

export function useLaunchCampaign() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (campaignId: string) => {
      // First fetch campaign to check start date
      const { data: campaignData, error: fetchError } = await supabase
        .from("bf_campaigns")
        .select("start_date")
        .eq("id", campaignId)
        .single();

      if (fetchError) throw fetchError;

      // Determine status based on start date
      const today = startOfDay(new Date());
      const startDate = startOfDay(parseISO(campaignData.start_date));
      const isFutureCampaign = isBefore(today, startDate);
      const newStatus = isFutureCampaign ? "scheduled" : "active";

      // Update campaign status
      const { data, error } = await supabase
        .from("bf_campaigns")
        .update({ status: newStatus })
        .eq("id", campaignId)
        .select("*, organization:bf_organizations(name)")
        .single();

      if (error) throw error;

      // Notify florist about the new campaign
      if (data) {
        const orgName = (data as any).organization?.name || "An organization";
        await notifyFloristCampaignInvitation({
          floristId: data.florist_id,
          campaignId: data.id,
          campaignName: data.name,
          organizationName: orgName,
          startDate: format(new Date(data.start_date), "MMM d"),
          endDate: format(new Date(data.end_date), "MMM d"),
        });
      }

      return { ...data, isFutureCampaign };
    },
    onSuccess: (data, campaignId) => {
      queryClient.invalidateQueries({ queryKey: ["bf-campaign-review", campaignId] });
      queryClient.invalidateQueries({ queryKey: ["bf-org-campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["florist-notifications"] });
      queryClient.invalidateQueries({ queryKey: ["florist-notification-count"] });
      
      const isFuture = data?.isFutureCampaign;
      toast({
        title: isFuture ? "Campaign scheduled!" : "Campaign launched!",
        description: isFuture 
          ? `Your campaign will automatically go live on ${format(new Date(data.start_date), "MMM d, yyyy")}.`
          : "Your campaign is now live and ready for orders.",
      });
    },
    onError: (error) => {
      console.error("Error launching campaign:", error);
      toast({
        title: "Error",
        description: "Failed to launch campaign. Please try again.",
        variant: "destructive",
      });
    },
  });
}

export function useSaveCampaignAsDraft() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (campaignId: string) => {
      const { data, error } = await supabase
        .from("bf_campaigns")
        .update({ status: "draft" })
        .eq("id", campaignId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, campaignId) => {
      queryClient.invalidateQueries({ queryKey: ["bf-campaign-review", campaignId] });
      queryClient.invalidateQueries({ queryKey: ["bf-org-campaigns"] });
      toast({
        title: "Draft saved",
        description: "Campaign saved as draft.",
      });
    },
    onError: (error) => {
      console.error("Error saving draft:", error);
      toast({
        title: "Error",
        description: "Failed to save draft. Please try again.",
        variant: "destructive",
      });
    },
  });
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BFCampaign, BFFlorist } from "@/types/bloomfundr";

export interface CampaignReviewData {
  campaign: BFCampaign;
  florist: BFFlorist | null;
  products: {
    id: string;
    name: string;
    retailPrice: number;
    maxQuantity: number | null;
  }[];
  students: {
    id: string;
    name: string;
    magicLinkCode: string;
  }[];
  avgFloristMargin: number;
  avgOrgMargin: number;
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
          product:bf_products(id, name)
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
      const { data, error } = await supabase
        .from("bf_campaigns")
        .update({ status: "active" })
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
        title: "Campaign launched!",
        description: "Your campaign is now live and ready for orders.",
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

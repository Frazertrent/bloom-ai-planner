import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { 
  BFCampaign, 
  BFOrganization, 
  BFStudent,
  BFCampaignProductWithProduct,
  CampaignStatus 
} from "@/types/bloomfundr";

export interface OrderPageData {
  campaignStudent: {
    id: string;
    campaign_id: string;
    student_id: string | null;
    magic_link_code: string;
  } | null;
  campaign: BFCampaign;
  organization: BFOrganization;
  student: BFStudent | null; // Can be null for 'none' tracking mode
  products: BFCampaignProductWithProduct[];
  isActive: boolean;
  isExpired: boolean;
  isNotStarted: boolean;
  trackingMode: 'none' | 'individual' | 'self_register';
}

export function useOrderPageData(magicLinkCode: string | undefined) {
  return useQuery({
    queryKey: ["order-page", magicLinkCode],
    queryFn: async (): Promise<OrderPageData | null> => {
      if (!magicLinkCode) return null;

      // First, try to look up campaign_student by magic_link_code (individual/self_register modes)
      const { data: campaignStudent } = await supabase
        .from("bf_campaign_students")
        .select("id, campaign_id, student_id, magic_link_code")
        .eq("magic_link_code", magicLinkCode)
        .single();

      let campaign: any = null;
      let student: BFStudent | null = null;

      if (campaignStudent) {
        // Found via campaign_student - fetch campaign and student
        const { data: campaignData, error: campaignError } = await supabase
          .from("bf_campaigns")
          .select("*")
          .eq("id", campaignStudent.campaign_id)
          .single();

        if (campaignError || !campaignData) {
          console.error("Campaign not found:", campaignError);
          return null;
        }
        campaign = campaignData;

        // Fetch student
        const { data: studentData } = await supabase
          .from("bf_students")
          .select("*")
          .eq("id", campaignStudent.student_id)
          .single();

        student = studentData as BFStudent | null;
      } else {
        // Not found via campaign_student - try campaign_link_code (for 'none' tracking mode)
        const { data: campaignData, error: campaignError } = await supabase
          .from("bf_campaigns")
          .select("*")
          .eq("campaign_link_code", magicLinkCode)
          .single();

        if (campaignError || !campaignData) {
          console.error("Campaign not found via campaign_link_code:", campaignError);
          return null;
        }
        campaign = campaignData;
        // No student for 'none' tracking mode
        student = null;
      }

      // Fetch organization
      const { data: organization, error: orgError } = await supabase
        .from("bf_organizations")
        .select("*")
        .eq("id", campaign.organization_id)
        .single();

      if (orgError || !organization) {
        console.error("Organization not found:", orgError);
        return null;
      }

      // Fetch campaign products with product details
      const { data: campaignProducts, error: productsError } = await supabase
        .from("bf_campaign_products")
        .select(`
          id,
          campaign_id,
          product_id,
          retail_price,
          max_quantity,
          created_at,
          product:bf_products(
            id,
            florist_id,
            name,
            description,
            category,
            base_cost,
            image_url,
            is_active,
            customization_options,
            created_at,
            updated_at
          )
        `)
        .eq("campaign_id", campaign.id);

      if (productsError) {
        console.error("Products error:", productsError);
        return null;
      }

      // Check campaign state
      const now = new Date();
      const endDate = new Date(campaign.end_date);
      const startDate = new Date(campaign.start_date);
      
      const hasStarted = now >= startDate;
      const isPastEndDate = now > endDate;
      const isTerminalStatus = ["closed", "fulfilled", "completed", "cancelled"].includes(campaign.status);
      
      // Campaign is active if status is active/draft, has started, not past end, not terminal
      const isActive = ["active", "draft"].includes(campaign.status) && hasStarted && !isPastEndDate && !isTerminalStatus;
      const isExpired = isPastEndDate || isTerminalStatus;
      const isNotStarted = !hasStarted && !isTerminalStatus;

      // Transform products
      const products: BFCampaignProductWithProduct[] = (campaignProducts || []).map((cp: any) => ({
        id: cp.id,
        campaign_id: cp.campaign_id,
        product_id: cp.product_id,
        retail_price: cp.retail_price,
        max_quantity: cp.max_quantity,
        created_at: cp.created_at,
        product: cp.product ? {
          ...cp.product,
          customization_options: cp.product.customization_options || null,
        } : undefined,
      }));

      const trackingMode = (campaign.tracking_mode || 'individual') as 'none' | 'individual' | 'self_register';

      return {
        campaignStudent: campaignStudent || null,
        campaign: {
          ...campaign,
          status: campaign.status as CampaignStatus,
        } as BFCampaign,
        organization: organization as BFOrganization,
        student,
        products,
        isActive,
        isExpired,
        isNotStarted,
        trackingMode,
      };
    },
    enabled: !!magicLinkCode,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

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
    student_id: string;
    magic_link_code: string;
  };
  campaign: BFCampaign;
  organization: BFOrganization;
  student: BFStudent;
  products: BFCampaignProductWithProduct[];
  isActive: boolean;
  isExpired: boolean;
}

export function useOrderPageData(magicLinkCode: string | undefined) {
  return useQuery({
    queryKey: ["order-page", magicLinkCode],
    queryFn: async (): Promise<OrderPageData | null> => {
      if (!magicLinkCode) return null;

      // Look up campaign_student by magic_link_code
      const { data: campaignStudent, error: csError } = await supabase
        .from("bf_campaign_students")
        .select("id, campaign_id, student_id, magic_link_code")
        .eq("magic_link_code", magicLinkCode)
        .single();

      if (csError || !campaignStudent) {
        console.error("Campaign student not found:", csError);
        return null;
      }

      // Fetch campaign
      const { data: campaign, error: campaignError } = await supabase
        .from("bf_campaigns")
        .select("*")
        .eq("id", campaignStudent.campaign_id)
        .single();

      if (campaignError || !campaign) {
        console.error("Campaign not found:", campaignError);
        return null;
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

      // Fetch student
      const { data: student, error: studentError } = await supabase
        .from("bf_students")
        .select("*")
        .eq("id", campaignStudent.student_id)
        .single();

      if (studentError || !student) {
        console.error("Student not found:", studentError);
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

      // Check if campaign is active
      const now = new Date();
      const endDate = new Date(campaign.end_date);
      const startDate = new Date(campaign.start_date);
      
      const isActive = campaign.status === "active";
      const isExpired = now > endDate || campaign.status === "closed" || campaign.status === "fulfilled" || campaign.status === "completed";
      const hasStarted = now >= startDate;

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

      return {
        campaignStudent,
        campaign: {
          ...campaign,
          status: campaign.status as CampaignStatus,
        } as BFCampaign,
        organization: organization as BFOrganization,
        student: student as BFStudent,
        products,
        isActive: isActive && hasStarted && !isExpired,
        isExpired,
      };
    },
    enabled: !!magicLinkCode,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ProductPricing } from "@/lib/pricingCalculator";
import { BFProduct, BFCampaignProduct } from "@/types/bloomfundr";

export interface CampaignProductWithDetails extends BFCampaignProduct {
  product: BFProduct;
}

export function useCampaignProductsWithDetails(campaignId: string | undefined) {
  return useQuery({
    queryKey: ["bf-campaign-products-details", campaignId],
    queryFn: async () => {
      if (!campaignId) return [];

      const { data, error } = await supabase
        .from("bf_campaign_products")
        .select(`
          *,
          product:bf_products(*)
        `)
        .eq("campaign_id", campaignId);

      if (error) throw error;
      return data as CampaignProductWithDetails[];
    },
    enabled: !!campaignId,
  });
}

export function useCampaignMargins(campaignId: string | undefined) {
  return useQuery({
    queryKey: ["bf-campaign-margins", campaignId],
    queryFn: async () => {
      if (!campaignId) return null;

      const { data, error } = await supabase
        .from("bf_campaigns")
        .select("florist_margin_percent, organization_margin_percent, platform_fee_percent")
        .eq("id", campaignId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!campaignId,
  });
}

export function useSaveCampaignPricing() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      campaignId,
      productPricing,
      floristMarginPercent,
      orgMarginPercent,
    }: {
      campaignId: string;
      productPricing: ProductPricing[];
      floristMarginPercent: number;
      orgMarginPercent: number;
    }) => {
      // Update campaign margins
      const { error: campaignError } = await supabase
        .from("bf_campaigns")
        .update({
          florist_margin_percent: floristMarginPercent,
          organization_margin_percent: orgMarginPercent,
        })
        .eq("id", campaignId);

      if (campaignError) throw campaignError;

      // Update each product's retail price
      for (const pricing of productPricing) {
        const { error } = await supabase
          .from("bf_campaign_products")
          .update({ retail_price: pricing.retailPrice })
          .eq("campaign_id", campaignId)
          .eq("product_id", pricing.productId);

        if (error) throw error;
      }

      return true;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["bf-campaign-products-details", variables.campaignId],
      });
      queryClient.invalidateQueries({
        queryKey: ["bf-campaign-margins", variables.campaignId],
      });
      toast({
        title: "Pricing saved",
        description: "Product pricing has been updated.",
      });
    },
    onError: (error) => {
      console.error("Error saving pricing:", error);
      toast({
        title: "Error",
        description: "Failed to save pricing. Please try again.",
        variant: "destructive",
      });
    },
  });
}

export function usePricingState(campaignId: string | undefined) {
  const { data: campaignProducts } = useCampaignProductsWithDetails(campaignId);
  const { data: campaignMargins } = useCampaignMargins(campaignId);
  
  const [productPricing, setProductPricing] = useState<ProductPricing[]>([]);
  const [defaultFloristMargin, setDefaultFloristMargin] = useState(30);
  const [defaultOrgMargin, setDefaultOrgMargin] = useState(40);

  // Initialize pricing state from campaign data
  useEffect(() => {
    if (campaignProducts && campaignProducts.length > 0) {
      const initialPricing = campaignProducts.map((cp) => ({
        productId: cp.product_id,
        baseCost: cp.product?.base_cost || 0,
        floristMarginPercent: campaignMargins?.florist_margin_percent || 30,
        orgMarginPercent: campaignMargins?.organization_margin_percent || 40,
        retailPrice: cp.retail_price || 0,
        isCustomPrice: cp.retail_price > 0,
      }));
      setProductPricing(initialPricing);
    }

    if (campaignMargins) {
      setDefaultFloristMargin(campaignMargins.florist_margin_percent);
      setDefaultOrgMargin(campaignMargins.organization_margin_percent);
    }
  }, [campaignProducts, campaignMargins]);

  const updateProductPricing = (
    productId: string,
    updates: Partial<ProductPricing>
  ) => {
    setProductPricing((prev) =>
      prev.map((p) =>
        p.productId === productId ? { ...p, ...updates } : p
      )
    );
  };

  const applyMarginsToAll = (floristMargin: number, orgMargin: number) => {
    setProductPricing((prev) =>
      prev.map((p) => ({
        ...p,
        floristMarginPercent: floristMargin,
        orgMarginPercent: orgMargin,
      }))
    );
    setDefaultFloristMargin(floristMargin);
    setDefaultOrgMargin(orgMargin);
  };

  return {
    productPricing,
    defaultFloristMargin,
    defaultOrgMargin,
    updateProductPricing,
    applyMarginsToAll,
    setDefaultFloristMargin,
    setDefaultOrgMargin,
    campaignProducts,
  };
}

import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BFProduct, BFCampaignProduct } from "@/types/bloomfundr";
import { useToast } from "@/hooks/use-toast";

export interface SelectedProduct {
  productId: string;
  maxQuantity: number | null;
  customizationOptions: string[];
}

export function useFloristProducts(floristId: string | undefined) {
  return useQuery({
    queryKey: ["bf-florist-products", floristId],
    queryFn: async () => {
      if (!floristId) return [];

      const { data, error } = await supabase
        .from("bf_products")
        .select("*")
        .eq("florist_id", floristId)
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      return data as BFProduct[];
    },
    enabled: !!floristId,
  });
}

export function useCampaignProducts(campaignId: string | undefined) {
  return useQuery({
    queryKey: ["bf-campaign-products", campaignId],
    queryFn: async () => {
      if (!campaignId) return [];

      const { data, error } = await supabase
        .from("bf_campaign_products")
        .select("*")
        .eq("campaign_id", campaignId);

      if (error) throw error;
      return data as BFCampaignProduct[];
    },
    enabled: !!campaignId,
  });
}

export function useSaveCampaignProducts() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      campaignId,
      selectedProducts,
    }: {
      campaignId: string;
      selectedProducts: SelectedProduct[];
    }) => {
      // First, delete existing campaign products
      const { error: deleteError } = await supabase
        .from("bf_campaign_products")
        .delete()
        .eq("campaign_id", campaignId);

      if (deleteError) throw deleteError;

      // Then insert new products
      if (selectedProducts.length > 0) {
        const productsToInsert = selectedProducts.map((sp) => ({
          campaign_id: campaignId,
          product_id: sp.productId,
          retail_price: 0, // Placeholder - will be set in pricing step
          max_quantity: sp.maxQuantity,
        }));

        const { error: insertError } = await supabase
          .from("bf_campaign_products")
          .insert(productsToInsert);

        if (insertError) throw insertError;
      }

      return selectedProducts;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["bf-campaign-products", variables.campaignId],
      });
      toast({
        title: "Products saved",
        description: "Campaign products have been updated.",
      });
    },
    onError: (error) => {
      console.error("Error saving campaign products:", error);
      toast({
        title: "Error",
        description: "Failed to save campaign products. Please try again.",
        variant: "destructive",
      });
    },
  });
}

export function useProductSelection(campaignId: string | undefined) {
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
  const { data: existingProducts } = useCampaignProducts(campaignId);

  // Load existing selections when data is available
  useEffect(() => {
    if (existingProducts && existingProducts.length > 0) {
      const mapped = existingProducts.map((cp) => ({
        productId: cp.product_id,
        maxQuantity: cp.max_quantity,
        customizationOptions: [],
      }));
      setSelectedProducts(mapped);
    }
  }, [existingProducts]);

  const toggleProduct = (productId: string) => {
    setSelectedProducts((prev) => {
      const exists = prev.find((p) => p.productId === productId);
      if (exists) {
        return prev.filter((p) => p.productId !== productId);
      }
      return [...prev, { productId, maxQuantity: null, customizationOptions: [] }];
    });
  };

  const updateProductMaxQuantity = (productId: string, maxQuantity: number | null) => {
    setSelectedProducts((prev) =>
      prev.map((p) =>
        p.productId === productId ? { ...p, maxQuantity } : p
      )
    );
  };

  const isProductSelected = (productId: string) => {
    return selectedProducts.some((p) => p.productId === productId);
  };

  const getProductSettings = (productId: string) => {
    return selectedProducts.find((p) => p.productId === productId);
  };

  return {
    selectedProducts,
    toggleProduct,
    updateProductMaxQuantity,
    isProductSelected,
    getProductSettings,
    setSelectedProducts,
  };
}

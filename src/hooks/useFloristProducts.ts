import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useFloristProfile } from "./useFloristData";
import type { BFProduct, ProductCategory } from "@/types/bloomfundr";

export function useFloristProducts(category?: ProductCategory | "all") {
  const { data: florist } = useFloristProfile();

  return useQuery({
    queryKey: ["florist-products", florist?.id, category],
    queryFn: async (): Promise<BFProduct[]> => {
      if (!florist?.id) return [];

      let query = supabase
        .from("bf_products")
        .select("*")
        .eq("florist_id", florist.id)
        .order("created_at", { ascending: false });

      if (category && category !== "all") {
        query = query.eq("category", category);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching products:", error);
        return [];
      }

      return data as BFProduct[];
    },
    enabled: !!florist?.id,
  });
}

export function useDeleteProduct() {
  return async (productId: string) => {
    const { error } = await supabase
      .from("bf_products")
      .delete()
      .eq("id", productId);

    if (error) throw error;
  };
}

export function useToggleProductStatus() {
  return async (productId: string, isActive: boolean) => {
    const { error } = await supabase
      .from("bf_products")
      .update({ is_active: isActive })
      .eq("id", productId);

    if (error) throw error;
  };
}

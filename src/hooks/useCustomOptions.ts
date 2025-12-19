import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface CustomOption {
  id: string;
  owner_type: 'organization' | 'florist';
  owner_id: string;
  option_category: string;
  option_value: string;
  option_label: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export interface PresetOption {
  value: string;
  label: string;
}

export interface MergedOption extends PresetOption {
  isCustom: boolean;
  id?: string;
}

// Fetch custom options for a category
export function useCustomOptions(
  category: string,
  ownerType: 'organization' | 'florist',
  ownerId?: string
) {
  return useQuery({
    queryKey: ['custom-options', category, ownerType, ownerId],
    queryFn: async () => {
      if (!ownerId) return [];
      
      const { data, error } = await supabase
        .from('bf_custom_options')
        .select('*')
        .eq('owner_type', ownerType)
        .eq('owner_id', ownerId)
        .eq('option_category', category)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as CustomOption[];
    },
    enabled: !!ownerId,
  });
}

// Add a new custom option
export function useAddCustomOption() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (option: {
      owner_type: 'organization' | 'florist';
      owner_id: string;
      option_category: string;
      option_value: string;
      option_label: string;
      display_order?: number;
    }) => {
      const { data, error } = await supabase
        .from('bf_custom_options')
        .insert(option)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['custom-options', variables.option_category, variables.owner_type],
      });
    },
  });
}

// Update a custom option
export function useUpdateCustomOption() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Pick<CustomOption, 'option_label' | 'option_value' | 'display_order' | 'is_active'>>;
    }) => {
      const { data, error } = await supabase
        .from('bf_custom_options')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-options'] });
    },
  });
}

// Delete a custom option
export function useDeleteCustomOption() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('bf_custom_options')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['custom-options'] });
    },
  });
}

// Get merged options (preset + custom)
export function useMergedOptions(
  category: string,
  presetOptions: PresetOption[],
  ownerType: 'organization' | 'florist',
  ownerId?: string
): { options: MergedOption[]; isLoading: boolean } {
  const { data: customOptions, isLoading } = useCustomOptions(category, ownerType, ownerId);

  const merged: MergedOption[] = [
    ...presetOptions.map((opt) => ({ ...opt, isCustom: false })),
    ...(customOptions || []).map((opt) => ({
      value: opt.option_value,
      label: opt.option_label,
      isCustom: true,
      id: opt.id,
    })),
  ];

  return { options: merged, isLoading };
}

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useBloomFundrAuth } from "@/contexts/BloomFundrAuthContext";
import { BFFlorist, BFCampaign } from "@/types/bloomfundr";
import { useToast } from "@/hooks/use-toast";

// Wizard state type
export interface CampaignWizardState {
  // Step 1: Basic Info
  name: string;
  description: string;
  eventOccasion: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
  pickupDate: Date | undefined;
  pickupLocation: string;
  floristId: string;
  trackingMode: 'none' | 'individual' | 'self_register';
}

const initialState: CampaignWizardState = {
  name: "",
  description: "",
  eventOccasion: "",
  startDate: undefined,
  endDate: undefined,
  pickupDate: undefined,
  pickupLocation: "",
  floristId: "",
  trackingMode: "individual",
};

export function useAvailableFlorists() {
  return useQuery({
    queryKey: ["bf-available-florists"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bf_florists")
        .select("id, business_name, business_address, business_phone, is_verified")
        .eq("is_verified", true)
        .order("business_name");

      if (error) throw error;
      return data as BFFlorist[];
    },
  });
}

export function useOrgForCampaign() {
  const { user } = useBloomFundrAuth();

  return useQuery({
    queryKey: ["bf-org-for-campaign", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from("bf_organizations")
        .select("id, name")
        .eq("user_id", user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });
}

export function useSaveCampaignDraft() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      campaignId,
      organizationId,
      data,
    }: {
      campaignId?: string;
      organizationId: string;
      data: CampaignWizardState;
    }) => {
      // Generate unique codes based on tracking mode
      const generateCode = () => Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
      
      const campaignData = {
        organization_id: organizationId,
        florist_id: data.floristId,
        name: data.name,
        description: data.description || null,
        start_date: data.startDate?.toISOString().split("T")[0],
        end_date: data.endDate?.toISOString().split("T")[0],
        pickup_date: data.pickupDate?.toISOString().split("T")[0] || null,
        pickup_location: data.pickupLocation || null,
        status: "draft",
        florist_margin_percent: 40,
        organization_margin_percent: 20,
        platform_fee_percent: 10,
        tracking_mode: data.trackingMode,
        // Generate codes based on tracking mode
        campaign_link_code: data.trackingMode === 'none' ? generateCode() : null,
        self_register_code: data.trackingMode === 'self_register' ? generateCode() : null,
        self_registration_open: data.trackingMode === 'self_register',
      };

      if (campaignId) {
        // Update existing draft
        const { data: result, error } = await supabase
          .from("bf_campaigns")
          .update(campaignData)
          .eq("id", campaignId)
          .select()
          .single();

        if (error) throw error;
        return result as BFCampaign;
      } else {
        // Create new draft
        const { data: result, error } = await supabase
          .from("bf_campaigns")
          .insert(campaignData)
          .select()
          .single();

        if (error) throw error;
        return result as BFCampaign;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bf-org-campaigns"] });
      toast({
        title: "Draft saved",
        description: "Your campaign draft has been saved.",
      });
    },
    onError: (error) => {
      console.error("Error saving campaign draft:", error);
      toast({
        title: "Error",
        description: "Failed to save campaign draft. Please try again.",
        variant: "destructive",
      });
    },
  });
}

export function useCampaignWizard(existingCampaignId?: string) {
  const [currentStep, setCurrentStep] = useState(1);
  const [wizardState, setWizardState] = useState<CampaignWizardState>(initialState);
  const [campaignId, setCampaignId] = useState<string | undefined>(existingCampaignId);

  const updateWizardState = (updates: Partial<CampaignWizardState>) => {
    setWizardState((prev) => ({ ...prev, ...updates }));
  };

  const goToStep = (step: number) => {
    if (step >= 1 && step <= 5) {
      setCurrentStep(step);
    }
  };

  const nextStep = () => goToStep(currentStep + 1);
  const prevStep = () => goToStep(currentStep - 1);

  return {
    currentStep,
    wizardState,
    campaignId,
    setCampaignId,
    updateWizardState,
    goToStep,
    nextStep,
    prevStep,
    setCurrentStep,
  };
}

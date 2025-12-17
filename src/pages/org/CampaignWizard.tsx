import { useEffect, useRef } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OrgLayout } from "@/components/bloomfundr/OrgLayout";
import { StepIndicator, Step } from "@/components/bloomfundr/StepIndicator";
import { Step1BasicInfo } from "@/components/bloomfundr/campaign-wizard/Step1BasicInfo";
import { Step2Products } from "@/components/bloomfundr/campaign-wizard/Step2Products";
import { Step3Pricing } from "@/components/bloomfundr/campaign-wizard/Step3Pricing";
import { Step4Students } from "@/components/bloomfundr/campaign-wizard/Step4Students";
import { Step5Review } from "@/components/bloomfundr/campaign-wizard/Step5Review";
import { useCampaignWizard } from "@/hooks/useCampaignWizard";
import { supabase } from "@/integrations/supabase/client";
import { BFCampaign } from "@/types/bloomfundr";

// Base wizard steps - Step 4 name changes based on tracking mode
const getWizardSteps = (trackingMode: string): Step[] => [
  { id: 1, name: "Basic Info" },
  { id: 2, name: "Products" },
  { id: 3, name: "Pricing" },
  { id: 4, name: trackingMode === "none" ? "—" : trackingMode === "self_register" ? "Sellers" : "Sellers" },
  { id: 5, name: "Review" },
];

export default function CampaignWizard() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const stepParam = searchParams.get("step");
  const initialStep = stepParam ? parseInt(stepParam, 10) : 1;
  const hasPopulatedState = useRef(false);

  const {
    currentStep,
    wizardState,
    campaignId,
    setCampaignId,
    updateWizardState,
    nextStep,
    prevStep,
    setCurrentStep,
  } = useCampaignWizard(id);

  // Fetch campaign data if editing
  const { data: campaignData } = useQuery({
    queryKey: ["bf-campaign-detail", id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from("bf_campaigns")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as BFCampaign;
    },
    enabled: !!id,
  });

  // Populate wizard state from campaign data - only once per campaign load
  useEffect(() => {
    if (campaignData && !hasPopulatedState.current) {
      hasPopulatedState.current = true;
      updateWizardState({
        name: campaignData.name,
        description: campaignData.description || "",
        floristId: campaignData.florist_id,
        startDate: campaignData.start_date ? new Date(campaignData.start_date) : undefined,
        endDate: campaignData.end_date ? new Date(campaignData.end_date) : undefined,
        pickupDate: campaignData.pickup_date ? new Date(campaignData.pickup_date) : undefined,
        pickupLocation: campaignData.pickup_location || "",
        trackingMode: (campaignData.tracking_mode as 'none' | 'individual' | 'self_register') || "individual",
      });
      setCampaignId(campaignData.id);
    }
  }, [campaignData]);

  // Get tracking mode from wizard state or campaign data
  const trackingMode = wizardState.trackingMode || campaignData?.tracking_mode || "individual";

  // Set initial step from URL
  useEffect(() => {
    if (initialStep !== currentStep && initialStep >= 1 && initialStep <= 5) {
      setCurrentStep(initialStep);
    }
  }, [initialStep]);

  const handleSave = (savedCampaignId: string) => {
    setCampaignId(savedCampaignId);
    // Update URL to include campaign ID
    navigate(`/org/campaigns/${savedCampaignId}/edit?step=${currentStep}`, { replace: true });
  };

  const handleContinue = (savedCampaignId: string) => {
    setCampaignId(savedCampaignId);
    nextStep();
    navigate(`/org/campaigns/${savedCampaignId}/edit?step=${currentStep + 1}`, { replace: true });
  };

  const handleStepClick = (step: number) => {
    if (campaignId && step <= currentStep) {
      setCurrentStep(step);
      navigate(`/org/campaigns/${campaignId}/edit?step=${step}`, { replace: true });
    }
  };

  const handleStep2Back = () => {
    prevStep();
    navigate(`/org/campaigns/${campaignId}/edit?step=1`, { replace: true });
  };

  const handleStep2Continue = () => {
    nextStep();
    navigate(`/org/campaigns/${campaignId}/edit?step=3`, { replace: true });
  };

  const handleStep3Back = () => {
    prevStep();
    navigate(`/org/campaigns/${campaignId}/edit?step=2`, { replace: true });
  };

  const handleStep3Continue = () => {
    // Skip Step 4 if tracking mode is 'none' (no students needed)
    if (trackingMode === "none") {
      setCurrentStep(5);
      navigate(`/org/campaigns/${campaignId}/edit?step=5`, { replace: true });
    } else {
      nextStep();
      navigate(`/org/campaigns/${campaignId}/edit?step=4`, { replace: true });
    }
  };

  const handleStep4Back = () => {
    prevStep();
    navigate(`/org/campaigns/${campaignId}/edit?step=3`, { replace: true });
  };

  const handleStep4Continue = () => {
    nextStep();
    navigate(`/org/campaigns/${campaignId}/edit?step=5`, { replace: true });
  };

  const handleStep5Back = () => {
    // Go back to Step 3 if tracking mode is 'none' (Step 4 was skipped)
    if (trackingMode === "none") {
      setCurrentStep(3);
      navigate(`/org/campaigns/${campaignId}/edit?step=3`, { replace: true });
    } else {
      prevStep();
      navigate(`/org/campaigns/${campaignId}/edit?step=4`, { replace: true });
    }
  };

  const handleEditStep = (step: number) => {
    setCurrentStep(step);
    navigate(`/org/campaigns/${campaignId}/edit?step=${step}`, { replace: true });
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return "Basic Information";
      case 2:
        return "Select Products";
      case 3:
        return "Set Pricing";
      case 4:
        if (trackingMode === "self_register") {
          return "Seller Registration";
        }
        return "Add Sellers";
      case 5:
        return "Review & Launch";
      default:
        return "Campaign Setup";
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 1:
        return "Set up the basic details for your fundraising campaign";
      case 2:
        return "Choose which products to offer in this campaign";
      case 3:
        return "Configure pricing and margins for all parties";
      case 4:
        if (trackingMode === "self_register") {
          return "Share the registration link so sellers can sign up";
        }
        return "Select which sellers will participate in this campaign";
      case 5:
        return "Review all details before launching your campaign";
      default:
        return "";
    }
  };

  // Get dynamic wizard steps based on tracking mode
  const wizardSteps = getWizardSteps(trackingMode);

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1BasicInfo
            wizardState={wizardState}
            campaignId={campaignId}
            onSave={handleSave}
            onContinue={handleContinue}
            updateWizardState={updateWizardState}
          />
        );
      case 2:
        return campaignId && wizardState.floristId ? (
          <Step2Products
            campaignId={campaignId}
            floristId={wizardState.floristId}
            onBack={handleStep2Back}
            onContinue={handleStep2Continue}
          />
        ) : (
          <div className="py-12 text-center text-muted-foreground">
            Please complete Step 1 first.
          </div>
        );
      case 3:
        return campaignId ? (
          <Step3Pricing
            campaignId={campaignId}
            onBack={handleStep3Back}
            onContinue={handleStep3Continue}
          />
        ) : (
          <div className="py-12 text-center text-muted-foreground">
            Please complete previous steps first.
          </div>
        );
      case 4:
        return campaignId ? (
          <Step4Students
            campaignId={campaignId}
            trackingMode={trackingMode as 'none' | 'individual' | 'self_register'}
            onBack={handleStep4Back}
            onContinue={handleStep4Continue}
          />
        ) : (
          <div className="py-12 text-center text-muted-foreground">
            Please complete previous steps first.
          </div>
        );
      case 5:
        return campaignId ? (
          <Step5Review
            campaignId={campaignId}
            onBack={handleStep5Back}
            onEditStep={handleEditStep}
          />
        ) : (
          <div className="py-12 text-center text-muted-foreground">
            Please complete previous steps first.
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <OrgLayout>
      <div className="space-y-6 overflow-hidden w-full max-w-full">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/org/campaigns")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {campaignId ? "Edit Campaign" : "Create New Campaign"}
            </h1>
            <p className="text-muted-foreground">
              Set up your fundraising campaign in a few simple steps
            </p>
          </div>
        </div>

        {/* Step Indicator */}
        <Card>
          <CardContent className="pt-6">
            <StepIndicator
              steps={wizardSteps}
              currentStep={currentStep}
              onStepClick={handleStepClick}
              allowNavigation={!!campaignId}
            />
          </CardContent>
        </Card>

        {/* Step Content */}
        <Card>
          <CardHeader>
            <CardTitle>{getStepTitle()}</CardTitle>
            <CardDescription>{getStepDescription()}</CardDescription>
          </CardHeader>
          <CardContent>{renderStepContent()}</CardContent>
        </Card>
      </div>
    </OrgLayout>
  );
}

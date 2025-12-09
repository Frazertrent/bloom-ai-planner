import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { OrgLayout } from "@/components/bloomfundr/OrgLayout";
import { StepIndicator, Step } from "@/components/bloomfundr/StepIndicator";
import { Step1BasicInfo } from "@/components/bloomfundr/campaign-wizard/Step1BasicInfo";
import { useCampaignWizard } from "@/hooks/useCampaignWizard";

const WIZARD_STEPS: Step[] = [
  { id: 1, name: "Basic Info" },
  { id: 2, name: "Products" },
  { id: 3, name: "Pricing" },
  { id: 4, name: "Students" },
  { id: 5, name: "Review" },
];

export default function CampaignWizard() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const stepParam = searchParams.get("step");
  const initialStep = stepParam ? parseInt(stepParam, 10) : 1;

  const {
    currentStep,
    wizardState,
    campaignId,
    setCampaignId,
    updateWizardState,
    nextStep,
    setCurrentStep,
  } = useCampaignWizard(id);

  // Set initial step from URL
  if (initialStep !== currentStep && initialStep >= 1 && initialStep <= 5) {
    setCurrentStep(initialStep);
  }

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

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return "Basic Information";
      case 2:
        return "Select Products";
      case 3:
        return "Set Pricing";
      case 4:
        return "Add Students";
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
        return "Select which students will participate in this campaign";
      case 5:
        return "Review all details before launching your campaign";
      default:
        return "";
    }
  };

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
        return (
          <div className="py-12 text-center text-muted-foreground">
            Step 2: Products - Coming soon
          </div>
        );
      case 3:
        return (
          <div className="py-12 text-center text-muted-foreground">
            Step 3: Pricing - Coming soon
          </div>
        );
      case 4:
        return (
          <div className="py-12 text-center text-muted-foreground">
            Step 4: Students - Coming soon
          </div>
        );
      case 5:
        return (
          <div className="py-12 text-center text-muted-foreground">
            Step 5: Review - Coming soon
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <OrgLayout>
      <div className="space-y-6">
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
              steps={WIZARD_STEPS}
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

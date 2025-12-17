import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import {
  ArrowLeft,
  Loader2,
  Calendar,
  MapPin,
  Store,
  Package,
  DollarSign,
  Users,
  ChevronDown,
  ChevronUp,
  Edit,
  Rocket,
  Check,
  Link as LinkIcon,
  PartyPopper,
} from "lucide-react";
import { generateOrderLink, generateCampaignLink } from "@/lib/linkGenerator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useCampaignReviewData,
  useLaunchCampaign,
  useSaveCampaignAsDraft,
} from "@/hooks/useCampaignReview";
import { calculateRevenueAtPrice } from "@/lib/pricingCalculator";
import { CampaignLinksModal } from "@/components/bloomfundr/CampaignLinksModal";
import { useToast } from "@/hooks/use-toast";

interface Step5ReviewProps {
  campaignId: string;
  onBack: () => void;
  onEditStep: (step: number) => void;
}

export function Step5Review({ campaignId, onBack, onEditStep }: Step5ReviewProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: reviewData, isLoading } = useCampaignReviewData(campaignId);
  const launchCampaign = useLaunchCampaign();
  const saveDraft = useSaveCampaignAsDraft();

  const [productsOpen, setProductsOpen] = useState(true);
  const [studentsOpen, setStudentsOpen] = useState(true);
  const [agreedToTerms] = useState(true); // Always ready to launch
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showLinksModal, setShowLinksModal] = useState(false);

  const handleLaunch = async () => {
    await launchCampaign.mutateAsync(campaignId);
    setShowSuccessModal(true);
  };

  const handleSaveDraft = async () => {
    await saveDraft.mutateAsync(campaignId);
    navigate("/org/campaigns");
  };

  const getStudentLinks = () => {
    if (!reviewData) return [];
    
    return reviewData.students.map((student) => ({
      studentId: student.id,
      studentName: student.name,
      magicLinkCode: student.magicLinkCode,
      fullUrl: generateOrderLink(student.magicLinkCode),
    }));
  };

  // Calculate estimated revenue using actual pricing breakdown
  const calculateEstimatedRevenue = (orderCount: number) => {
    if (!reviewData || reviewData.products.length === 0) return { total: 0, org: 0, avgOrgProfit: 0 };
    
    let totalOrgProfit = 0;
    let totalRevenue = 0;
    
    reviewData.products.forEach((product) => {
      const { orgProfit } = calculateRevenueAtPrice(
        product.floristPrice,
        product.retailPrice
      );
      totalOrgProfit += orgProfit;
      totalRevenue += product.retailPrice;
    });
    
    const avgOrgProfit = totalOrgProfit / reviewData.products.length;
    const avgRevenue = totalRevenue / reviewData.products.length;
    
    return {
      total: avgRevenue * orderCount,
      org: avgOrgProfit * orderCount,
      avgOrgProfit,
    };
  };

  if (isLoading || !reviewData) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const { campaign, florist, products, students, avgFloristMargin, avgOrgMargin, trackingMode, campaignLinkCode } = reviewData;
  const campaignLink = campaignLinkCode ? generateCampaignLink(campaignLinkCode) : null;

  return (
    <div className="space-y-6">
      {/* Basic Info Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Basic Information
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => onEditStep(1)}>
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Campaign Name</p>
              <p className="font-medium">{campaign.name}</p>
            </div>
            {campaign.description && (
              <div className="md:col-span-2">
                <p className="text-sm text-muted-foreground">Description</p>
                <p className="font-medium">{campaign.description}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground">Start Date</p>
              <p className="font-medium">
                {format(new Date(campaign.start_date), "PPP")}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">End Date</p>
              <p className="font-medium">
                {format(new Date(campaign.end_date), "PPP")}
              </p>
            </div>
            {campaign.pickup_date && (
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> Pickup Date
                </p>
                <p className="font-medium">
                  {format(new Date(campaign.pickup_date), "PPP")}
                </p>
              </div>
            )}
            {campaign.pickup_location && (
              <div>
                <p className="text-sm text-muted-foreground">Pickup Location</p>
                <p className="font-medium">{campaign.pickup_location}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Store className="h-3 w-3" /> Florist Partner
              </p>
              <p className="font-medium">
                {florist?.business_name || "Unknown Florist"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Section */}
      <Card>
        <Collapsible open={productsOpen} onOpenChange={setProductsOpen}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CollapsibleTrigger className="flex items-center gap-2 hover:text-primary transition-colors">
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="h-5 w-5" />
                Products
                <Badge variant="secondary">{products.length}</Badge>
              </CardTitle>
              {productsOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </CollapsibleTrigger>
            <Button variant="ghost" size="sm" onClick={() => onEditStep(2)}>
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Retail Price</TableHead>
                    <TableHead className="text-right">Max Qty</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell className="text-right">
                        ${product.retailPrice.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        {product.maxQuantity || "No limit"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Your Estimated Earnings Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Your Estimated Earnings
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => onEditStep(3)}>
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">If you sell 100 orders:</p>
            <p className="text-4xl font-bold text-emerald-600">
              ${calculateEstimatedRevenue(100).org.toFixed(0)}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              ~${calculateEstimatedRevenue(1).avgOrgProfit.toFixed(2)} average profit per sale
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Students Section OR Campaign Link Card based on tracking mode */}
      {trackingMode === 'none' ? (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <LinkIcon className="h-5 w-5" />
              Campaign Link
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              This campaign uses a single shared link. No individual seller tracking.
            </p>
            {campaignLink && (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg">
                <p className="text-sm font-medium mb-2">Share this link to start fundraising:</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs bg-background p-2 rounded border truncate">
                    {campaignLink}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(campaignLink);
                      toast({ title: "Link copied!", description: "Campaign link copied to clipboard." });
                    }}
                  >
                    Copy
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Collapsible open={studentsOpen} onOpenChange={setStudentsOpen}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CollapsibleTrigger className="flex items-center gap-2 hover:text-primary transition-colors">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {trackingMode === 'self_register' ? 'Sellers' : 'Students'}
                  <Badge variant="secondary">{students.length}</Badge>
                </CardTitle>
                {studentsOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </CollapsibleTrigger>
              <Button variant="ghost" size="sm" onClick={() => onEditStep(4)}>
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </CardHeader>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-2 mb-4">
                  {students.slice(0, 10).map((student) => (
                    <Badge key={student.id} variant="outline">
                      {student.name}
                    </Badge>
                  ))}
                  {students.length > 10 && (
                    <Badge variant="secondary">+{students.length - 10} more</Badge>
                  )}
                </div>
                {students.length > 0 && (
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg text-center">
                    <p className="text-sm font-medium mb-1">Each seller gets their own unique link to share</p>
                    <p className="text-xs text-muted-foreground mb-3">
                      Links are ready and will be available after launch
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setShowLinksModal(true)}
                    >
                      <LinkIcon className="mr-2 h-4 w-4" />
                      Preview Seller Links
                    </Button>
                  </div>
                )}
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      )}

      {/* Launch Button - Big and Prominent */}
      <div className="py-6">
        <Button
          onClick={handleLaunch}
          disabled={launchCampaign.isPending || products.length === 0}
          className="w-full h-16 text-xl font-bold bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all"
        >
          {launchCampaign.isPending ? (
            <Loader2 className="mr-3 h-6 w-6 animate-spin" />
          ) : (
            <Rocket className="mr-3 h-6 w-6" />
          )}
          Launch Campaign!
        </Button>
      </div>

      {/* Secondary Action Buttons */}
      <div className="flex flex-col-reverse sm:flex-row sm:justify-between gap-3 pt-4 border-t">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {trackingMode === 'none' ? 'Back to Pricing' : 'Back to Sellers'}
        </Button>
        <Button
          variant="outline"
          onClick={handleSaveDraft}
          disabled={saveDraft.isPending || launchCampaign.isPending}
        >
          {saveDraft.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save as Draft
        </Button>
      </div>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <PartyPopper className="h-8 w-8 text-emerald-600" />
            </div>
            <DialogTitle className="text-xl">Campaign is Live!</DialogTitle>
            <DialogDescription>
              Your campaign "{campaign.name}" is now active and ready to receive orders.
              {trackingMode === 'none' 
                ? ' Share the campaign link to start fundraising!'
                : ' Share the seller links to start fundraising!'
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-col gap-2 mt-4">
            {trackingMode === 'none' && campaignLink ? (
              <Button
                className="w-full"
                onClick={() => {
                  navigator.clipboard.writeText(campaignLink);
                  toast({ title: "Link copied!", description: "Campaign link copied to clipboard." });
                }}
              >
                <LinkIcon className="mr-2 h-4 w-4" />
                Copy Campaign Link
              </Button>
            ) : (
              <Button
                className="w-full"
                onClick={() => {
                  setShowSuccessModal(false);
                  setShowLinksModal(true);
                }}
              >
                <LinkIcon className="mr-2 h-4 w-4" />
                Share Seller Links
              </Button>
            )}
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate(`/org/campaigns`)}
            >
              Go to Campaigns
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Links Modal */}
      <CampaignLinksModal
        open={showLinksModal}
        onOpenChange={setShowLinksModal}
        campaignName={campaign.name}
        studentLinks={getStudentLinks()}
      />
    </div>
  );
}

import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FloristLayout } from "@/components/bloomfundr/FloristLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CampaignStatusBadge } from "@/components/bloomfundr/CampaignStatusBadge";
import { PayoutBreakdownCard } from "@/components/bloomfundr/PayoutBreakdownCard";
import { PayoutStatusCard } from "@/components/bloomfundr/PayoutStatusCard";
import { PayoutDetailSheet } from "@/components/bloomfundr/PayoutDetailSheet";
import { useCampaignPayouts, useCreatePayouts } from "@/hooks/useCampaignPayouts";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Building2, Calendar, MapPin, Package, DollarSign, Wallet } from "lucide-react";
import { format } from "date-fns";
import type { BFCampaignWithRelations, BFOrganization, CampaignStatus } from "@/types/bloomfundr";

export default function FloristCampaignDetail() {
  const { id } = useParams<{ id: string }>();
  const [showPayoutDetail, setShowPayoutDetail] = useState(false);

  const { data: payoutData, isLoading: payoutsLoading } = useCampaignPayouts(id);
  const createPayouts = useCreatePayouts();

  const { data: campaign, isLoading } = useQuery({
    queryKey: ["florist-campaign-detail", id],
    queryFn: async (): Promise<BFCampaignWithRelations | null> => {
      if (!id) return null;

      // Fetch campaign with organization
      const { data: campaignData, error: campaignError } = await supabase
        .from("bf_campaigns")
        .select("*")
        .eq("id", id)
        .single();

      if (campaignError || !campaignData) {
        console.error("Error fetching campaign:", campaignError);
        return null;
      }

      // Fetch organization
      const { data: orgData } = await supabase
        .from("bf_organizations")
        .select("*")
        .eq("id", campaignData.organization_id)
        .single();

      // Fetch campaign products with product details
      const { data: campaignProducts } = await supabase
        .from("bf_campaign_products")
        .select("*, product:bf_products(*)")
        .eq("campaign_id", id);

      // Fetch orders for this campaign
      const { data: orders } = await supabase
        .from("bf_orders")
        .select("*")
        .eq("campaign_id", id)
        .eq("payment_status", "paid");

      return {
        ...campaignData,
        status: campaignData.status as CampaignStatus,
        organization: orgData as BFOrganization || undefined,
        campaign_products: (campaignProducts || []) as unknown as BFCampaignWithRelations["campaign_products"],
        orders: (orders || []) as unknown as BFCampaignWithRelations["orders"],
      };
    },
    enabled: !!id,
  });

  // Calculate revenue breakdown
  const totalSales = campaign?.orders?.reduce((sum, o) => sum + Number(o.subtotal), 0) || 0;
  const floristPortion = totalSales * ((campaign?.florist_margin_percent || 0) / 100);
  const orgPortion = totalSales * ((campaign?.organization_margin_percent || 0) / 100);
  const platformPortion = totalSales * ((campaign?.platform_fee_percent || 0) / 100);

  // Calculate product quantities from orders
  const productQuantities: Record<string, number> = {};
  // This would require order_items data - for now we'll show 0

  if (isLoading) {
    return (
      <FloristLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-48" />
          <div className="grid gap-6 md:grid-cols-2">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
          <Skeleton className="h-64" />
        </div>
      </FloristLayout>
    );
  }

  if (!campaign) {
    return (
      <FloristLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Campaign not found</p>
          <Button asChild className="mt-4">
            <Link to="/florist/campaigns">Back to Campaigns</Link>
          </Button>
        </div>
      </FloristLayout>
    );
  }

  return (
    <FloristLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/florist/campaigns">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-foreground">{campaign.name}</h1>
              <CampaignStatusBadge status={campaign.status} />
            </div>
            {campaign.description && (
              <p className="text-muted-foreground mt-1">{campaign.description}</p>
            )}
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Organization Info */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Organization
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-lg font-medium">{campaign.organization?.name || "Unknown"}</p>
              <p className="text-sm text-muted-foreground capitalize">
                {campaign.organization?.org_type?.replace("_", " ") || "Organization"}
              </p>
              {campaign.organization?.address && (
                <p className="text-sm text-muted-foreground">{campaign.organization.address}</p>
              )}
              {campaign.organization?.contact_phone && (
                <p className="text-sm text-muted-foreground">{campaign.organization.contact_phone}</p>
              )}
            </CardContent>
          </Card>

          {/* Date Information */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Campaign Dates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Start Date</span>
                <span className="font-medium">{format(new Date(campaign.start_date), "MMM d, yyyy")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">End Date</span>
                <span className="font-medium">{format(new Date(campaign.end_date), "MMM d, yyyy")}</span>
              </div>
              {campaign.pickup_date && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pickup Date</span>
                  <span className="font-medium">{format(new Date(campaign.pickup_date), "MMM d, yyyy")}</span>
                </div>
              )}
              {campaign.pickup_location && (
                <div className="flex items-start gap-2 pt-2 border-t">
                  <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <span className="text-sm">{campaign.pickup_location}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Products Table */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Campaign Products
            </CardTitle>
            <CardDescription>Products included in this campaign</CardDescription>
          </CardHeader>
          <CardContent>
            {campaign.campaign_products && campaign.campaign_products.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Retail Price</TableHead>
                    <TableHead className="text-right">Qty Ordered</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaign.campaign_products.map((cp) => {
                    const qty = productQuantities[cp.product_id] || 0;
                    const revenue = qty * Number(cp.retail_price);
                    return (
                      <TableRow key={cp.id}>
                        <TableCell className="font-medium">{cp.product?.name || "Unknown"}</TableCell>
                        <TableCell className="capitalize">{cp.product?.category || "—"}</TableCell>
                        <TableCell className="text-right">${Number(cp.retail_price).toFixed(2)}</TableCell>
                        <TableCell className="text-right">{qty}</TableCell>
                        <TableCell className="text-right">${revenue.toFixed(2)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center py-8 text-muted-foreground">No products in this campaign</p>
            )}
          </CardContent>
        </Card>

        {/* Revenue Breakdown */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Revenue Breakdown
            </CardTitle>
            <CardDescription>How the revenue is distributed</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-muted-foreground">Total Sales</span>
                <span className="text-xl font-bold">${totalSales.toFixed(2)}</span>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <p className="text-sm text-muted-foreground">Your Portion ({campaign.florist_margin_percent}%)</p>
                  <p className="text-2xl font-bold text-emerald-600">${floristPortion.toFixed(2)}</p>
                </div>
                <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <p className="text-sm text-muted-foreground">Organization ({campaign.organization_margin_percent}%)</p>
                  <p className="text-2xl font-bold text-blue-600">${orgPortion.toFixed(2)}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <p className="text-sm text-muted-foreground">Platform Fee ({campaign.platform_fee_percent}%)</p>
                  <p className="text-2xl font-bold text-muted-foreground">${platformPortion.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payouts Section - Show when campaign is closed or fulfilled */}
        {(campaign.status === "closed" || campaign.status === "fulfilled") && payoutData && (
          <div className="space-y-6">
            <PayoutBreakdownCard
              breakdown={payoutData.breakdown}
              floristMarginPercent={campaign.florist_margin_percent}
              orgMarginPercent={campaign.organization_margin_percent}
              platformFeePercent={campaign.platform_fee_percent || 10}
            />
            <PayoutStatusCard
              campaignStatus={campaign.status}
              floristPayout={payoutData.floristPayout}
              orgPayout={payoutData.orgPayout}
              floristTotal={payoutData.breakdown.floristTotal}
              orgTotal={payoutData.breakdown.orgTotal}
              onCreatePayouts={() => createPayouts.mutate({ campaignId: id! })}
              isCreating={createPayouts.isPending}
              isLoading={payoutsLoading}
            />
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setShowPayoutDetail(true)}>
                <Wallet className="h-4 w-4 mr-2" />
                View Payout Details
              </Button>
            </div>
          </div>
        )}

        {/* Orders Link */}
        <Card className="bg-card border-border">
          <CardContent className="flex items-center justify-between py-6">
            <div>
              <p className="font-medium">View Orders</p>
              <p className="text-sm text-muted-foreground">
                {campaign.orders?.length || 0} orders in this campaign
              </p>
            </div>
            <Button asChild>
              <Link to={`/florist/orders?campaign=${id}`}>View Orders</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Payout Detail Sheet */}
        <PayoutDetailSheet
          open={showPayoutDetail}
          onOpenChange={setShowPayoutDetail}
          breakdown={payoutData?.breakdown || null}
          viewType="florist"
          floristMarginPercent={campaign.florist_margin_percent}
          orgMarginPercent={campaign.organization_margin_percent}
        />
      </div>
    </FloristLayout>
  );
}

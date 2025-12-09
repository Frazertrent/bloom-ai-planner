import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { FloristLayout } from "@/components/bloomfundr/FloristLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchInput } from "@/components/ui/search-input";
import { DateRangeFilter } from "@/components/ui/date-range-filter";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CampaignStatusBadge } from "@/components/bloomfundr/CampaignStatusBadge";
import { supabase } from "@/integrations/supabase/client";
import { useFloristProfile } from "@/hooks/useFloristData";
import { useUrlFilters } from "@/hooks/useUrlFilters";
import { Calendar, Eye } from "lucide-react";
import { format, isWithinInterval } from "date-fns";
import type { BFCampaign, BFOrganization, CampaignStatus } from "@/types/bloomfundr";

interface CampaignWithOrg extends BFCampaign {
  organization?: BFOrganization;
  order_count: number;
  total_revenue: number;
}

type FilterTab = "all" | "active" | "completed";

export default function FloristCampaignsPage() {
  const { getFilter, getDateRangeFilter, setFilter, setDateRangeFilter } = useUrlFilters({
    defaultValues: { tab: "all" },
  });

  const search = getFilter("search");
  const activeTab = (getFilter("tab") || "all") as FilterTab;
  const dateRange = getDateRangeFilter("date");

  const { data: florist } = useFloristProfile();

  const { data: allCampaigns, isLoading } = useQuery({
    queryKey: ["florist-campaigns-with-orgs", florist?.id, activeTab],
    queryFn: async (): Promise<CampaignWithOrg[]> => {
      if (!florist?.id) return [];

      // Build status filter
      let statusFilter: string[] = [];
      if (activeTab === "active") {
        statusFilter = ["active", "closed", "fulfilled"];
      } else if (activeTab === "completed") {
        statusFilter = ["completed"];
      }

      // Fetch campaigns
      let query = supabase
        .from("bf_campaigns")
        .select("*")
        .eq("florist_id", florist.id)
        .order("created_at", { ascending: false });

      if (statusFilter.length > 0) {
        query = query.in("status", statusFilter);
      }

      const { data: campaignsData, error } = await query;

      if (error) {
        console.error("Error fetching campaigns:", error);
        return [];
      }

      if (!campaignsData || campaignsData.length === 0) return [];

      // Get unique organization IDs
      const orgIds = [...new Set(campaignsData.map((c) => c.organization_id))];

      // Fetch organizations
      const { data: orgsData } = await supabase
        .from("bf_organizations")
        .select("*")
        .in("id", orgIds);

      const orgsMap = new Map(orgsData?.map((o) => [o.id, o]) || []);

      // Fetch orders for each campaign to get counts and revenue
      const campaignIds = campaignsData.map((c) => c.id);
      const { data: ordersData } = await supabase
        .from("bf_orders")
        .select("campaign_id, subtotal, payment_status")
        .in("campaign_id", campaignIds)
        .eq("payment_status", "paid");

      // Calculate order counts and revenue per campaign
      const orderStats = new Map<string, { count: number; revenue: number }>();
      ordersData?.forEach((order) => {
        const existing = orderStats.get(order.campaign_id) || { count: 0, revenue: 0 };
        existing.count += 1;
        existing.revenue += Number(order.subtotal);
        orderStats.set(order.campaign_id, existing);
      });

      return campaignsData.map((campaign) => {
        const stats = orderStats.get(campaign.id) || { count: 0, revenue: 0 };
        const floristRevenue = stats.revenue * (campaign.florist_margin_percent / 100);
        return {
          ...campaign,
          status: campaign.status as CampaignStatus,
          organization: orgsMap.get(campaign.organization_id) as BFOrganization | undefined,
          order_count: stats.count,
          total_revenue: floristRevenue,
        };
      });
    },
    enabled: !!florist?.id,
  });

  // Apply client-side filtering
  const campaigns = allCampaigns?.filter((campaign) => {
    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      const matchesSearch =
        campaign.name.toLowerCase().includes(searchLower) ||
        campaign.organization?.name?.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Date range filter
    if (dateRange?.from) {
      const campaignStart = new Date(campaign.start_date);
      const campaignEnd = new Date(campaign.end_date);
      const to = dateRange.to || dateRange.from;
      // Check if campaign overlaps with date range
      const overlaps =
        isWithinInterval(campaignStart, { start: dateRange.from, end: to }) ||
        isWithinInterval(campaignEnd, { start: dateRange.from, end: to }) ||
        (campaignStart <= dateRange.from && campaignEnd >= to);
      if (!overlaps) return false;
    }

    return true;
  });

  return (
    <FloristLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Campaigns</h1>
          <p className="text-muted-foreground mt-1">
            View and manage your fundraising campaigns
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <SearchInput
              value={search}
              onChange={(v) => setFilter("search", v)}
              placeholder="Search by name or organization..."
              className="flex-1 max-w-sm"
            />
            <DateRangeFilter
              value={dateRange}
              onChange={(v) => setDateRangeFilter("date", v)}
              placeholder="Filter by date"
              className="w-full sm:w-auto"
            />
          </div>

          <Tabs value={activeTab} onValueChange={(v) => setFilter("tab", v)}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Campaigns Table */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Campaigns</CardTitle>
            <CardDescription>Campaigns you're fulfilling for organizations</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : campaigns && campaigns.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campaign</TableHead>
                      <TableHead className="hidden md:table-cell">Organization</TableHead>
                      <TableHead className="hidden lg:table-cell">Dates</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right hidden sm:table-cell">Orders</TableHead>
                      <TableHead className="text-right">Your Revenue</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {campaigns.map((campaign) => (
                      <TableRow key={campaign.id}>
                        <TableCell className="font-medium">{campaign.name}</TableCell>
                        <TableCell className="hidden md:table-cell">{campaign.organization?.name || "Unknown"}</TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="text-sm">
                            <span>{format(new Date(campaign.start_date), "MMM d")}</span>
                            <span className="text-muted-foreground"> - </span>
                            <span>{format(new Date(campaign.end_date), "MMM d, yyyy")}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <CampaignStatusBadge status={campaign.status} />
                        </TableCell>
                        <TableCell className="text-right hidden sm:table-cell">{campaign.order_count}</TableCell>
                        <TableCell className="text-right font-medium text-emerald-600">
                          ${campaign.total_revenue.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link to={`/florist/campaigns/${campaign.id}`}>
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">
                  {search || dateRange ? "No campaigns match your filters" : "No campaigns yet"}
                </p>
                <p className="text-sm mt-1">
                  {search || dateRange
                    ? "Try adjusting your search or date range"
                    : "Organizations will invite you to fulfill campaigns"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </FloristLayout>
  );
}

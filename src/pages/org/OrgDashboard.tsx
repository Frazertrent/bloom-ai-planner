import { Link } from "react-router-dom";
import { OrgLayout } from "@/components/bloomfundr/OrgLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CampaignStatusBadge } from "@/components/bloomfundr/CampaignStatusBadge";
import { 
  useOrgProfile, 
  useOrgStats, 
  useOrgCampaigns, 
  useTopSellers 
} from "@/hooks/useOrgData";
import { 
  DollarSign, 
  Calendar, 
  Users, 
  TrendingUp,
  Plus,
  UserPlus,
  Trophy,
  Share2,
  Eye
} from "lucide-react";
import { format } from "date-fns";

export default function OrgDashboard() {
  const { data: org, isLoading: orgLoading } = useOrgProfile();
  const { data: stats, isLoading: statsLoading } = useOrgStats();
  const { data: campaigns, isLoading: campaignsLoading } = useOrgCampaigns("active");
  const { data: topSellers, isLoading: sellersLoading } = useTopSellers(5);

  const isLoading = orgLoading || statsLoading;

  return (
    <OrgLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex flex-col gap-4">
          <div>
            {orgLoading ? (
              <Skeleton className="h-8 w-48 md:w-64" />
            ) : (
              <>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                  Welcome, {org?.name || "Organization"}!
                </h1>
                <p className="text-sm md:text-base text-muted-foreground mt-1">
                  Manage your fundraising campaigns and track progress.
                </p>
              </>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button asChild className="min-h-[44px] flex-1 sm:flex-none">
              <Link to="/org/campaigns/new">
                <Plus className="h-4 w-4 mr-2" />
                New Campaign
              </Link>
            </Button>
            <Button variant="outline" asChild className="min-h-[44px] flex-1 sm:flex-none">
              <Link to="/org/students">
                <UserPlus className="h-4 w-4 mr-2" />
                Add Students
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards - 2x2 grid on mobile */}
        <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4">
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2 px-3 md:px-6 pt-3 md:pt-6">
              <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                Total Raised
              </CardTitle>
              <DollarSign className="h-4 w-4 md:h-5 md:w-5 text-emerald-500" />
            </CardHeader>
            <CardContent className="px-3 md:px-6 pb-3 md:pb-6">
              {statsLoading ? (
                <Skeleton className="h-7 w-20" />
              ) : (
                <div className="text-xl md:text-2xl font-bold text-foreground">
                  ${(stats?.total_raised || 0).toFixed(0)}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2 px-3 md:px-6 pt-3 md:pt-6">
              <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                Active
              </CardTitle>
              <Calendar className="h-4 w-4 md:h-5 md:w-5 text-blue-500" />
            </CardHeader>
            <CardContent className="px-3 md:px-6 pb-3 md:pb-6">
              {statsLoading ? (
                <Skeleton className="h-7 w-12" />
              ) : (
                <div className="text-xl md:text-2xl font-bold text-foreground">
                  {stats?.active_campaigns || 0}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2 px-3 md:px-6 pt-3 md:pt-6">
              <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                Students
              </CardTitle>
              <Users className="h-4 w-4 md:h-5 md:w-5 text-purple-500" />
            </CardHeader>
            <CardContent className="px-3 md:px-6 pb-3 md:pb-6">
              {statsLoading ? (
                <Skeleton className="h-7 w-12" />
              ) : (
                <div className="text-xl md:text-2xl font-bold text-foreground">
                  {stats?.total_students || 0}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between pb-2 px-3 md:px-6 pt-3 md:pt-6">
              <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                Orders
              </CardTitle>
              <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-rose-500" />
            </CardHeader>
            <CardContent className="px-3 md:px-6 pb-3 md:pb-6">
              {statsLoading ? (
                <Skeleton className="h-7 w-12" />
              ) : (
                <div className="text-xl md:text-2xl font-bold text-foreground">
                  {stats?.total_orders || 0}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:gap-6 lg:grid-cols-2">
          {/* Active Campaigns */}
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Active Campaigns</CardTitle>
                <CardDescription>Currently running fundraisers</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to="/org/campaigns">View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {campaignsLoading ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : campaigns && campaigns.length > 0 ? (
                <div className="space-y-4">
                  {campaigns.slice(0, 3).map((campaign) => (
                    <div 
                      key={campaign.id} 
                      className="p-4 rounded-lg border border-border bg-muted/30"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-medium text-foreground">{campaign.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(campaign.start_date), "MMM d")} - {format(new Date(campaign.end_date), "MMM d, yyyy")}
                          </p>
                        </div>
                        <CampaignStatusBadge status={campaign.status} />
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/org/campaigns/${campaign.id}`}>
                            <Eye className="h-4 w-4 mr-1" />
                            Details
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/org/campaigns/${campaign.id}/links`}>
                            <Share2 className="h-4 w-4 mr-1" />
                            Share Links
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
                  <p className="font-medium text-foreground">No active campaigns</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Create your first campaign to start fundraising
                  </p>
                  <Button className="mt-4" asChild>
                    <Link to="/org/campaigns/new">
                      <Plus className="h-4 w-4 mr-2" />
                      Create Campaign
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Sellers */}
          <Card className="bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-amber-500" />
                  Top Sellers
                </CardTitle>
                <CardDescription>Your best performing students</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to="/org/reports">View All</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {sellersLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : topSellers && topSellers.length > 0 ? (
                <div className="space-y-3">
                  {topSellers.map((seller, idx) => (
                    <div 
                      key={seller.student_id}
                      className="flex items-center justify-between p-3 rounded-lg border border-border"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`
                          w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                          ${idx === 0 ? "bg-amber-500 text-white" : 
                            idx === 1 ? "bg-gray-400 text-white" : 
                            idx === 2 ? "bg-amber-700 text-white" : 
                            "bg-muted text-muted-foreground"}
                        `}>
                          {idx + 1}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{seller.student_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {seller.order_count} orders
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-emerald-600">
                        ${seller.total_sales.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50 text-muted-foreground" />
                  <p className="font-medium text-foreground">No sales yet</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Top sellers will appear once orders come in
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </OrgLayout>
  );
}

import { FloristLayout } from "@/components/bloomfundr/FloristLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Package, 
  Calendar, 
  ShoppingCart, 
  DollarSign,
  Plus,
  ArrowRight,
  Clock
} from "lucide-react";
import { Link } from "react-router-dom";
import { useFloristProfile, useFloristStats, useFloristCampaigns, useFloristOrders } from "@/hooks/useFloristData";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  paid: "bg-green-500/10 text-green-600 border-green-500/20",
  failed: "bg-red-500/10 text-red-600 border-red-500/20",
  refunded: "bg-gray-500/10 text-gray-600 border-gray-500/20",
  active: "bg-bloomfundr-primary/10 text-bloomfundr-primary border-bloomfundr-primary/20",
  draft: "bg-muted text-muted-foreground border-muted",
  closed: "bg-orange-500/10 text-orange-600 border-orange-500/20",
};

const fulfillmentColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-600",
  in_production: "bg-blue-500/10 text-blue-600",
  ready: "bg-green-500/10 text-green-600",
  picked_up: "bg-gray-500/10 text-gray-600",
};

export default function FloristDashboardPage() {
  const { data: florist, isLoading: floristLoading } = useFloristProfile();
  const { data: stats, isLoading: statsLoading } = useFloristStats();
  const { data: activeCampaigns, isLoading: campaignsLoading } = useFloristCampaigns("active");
  const { data: recentOrders, isLoading: ordersLoading } = useFloristOrders(5);

  const isLoading = floristLoading || statsLoading;

  return (
    <FloristLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              {floristLoading ? (
                <Skeleton className="h-8 w-48 md:w-64" />
              ) : (
                <>Welcome, {florist?.business_name || "Florist"}!</>
              )}
            </h1>
            <p className="text-sm md:text-base text-muted-foreground mt-1">
              Manage your campaigns and orders from your dashboard.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button asChild variant="outline" className="border-bloomfundr-muted min-h-[44px] flex-1 sm:flex-none">
              <Link to="/florist/products">
                <Package className="h-4 w-4 mr-2" />
                Manage Products
              </Link>
            </Button>
            <Button asChild className="bg-bloomfundr-primary hover:bg-bloomfundr-primary-light min-h-[44px] flex-1 sm:flex-none">
              <Link to="/florist/products/new">
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards - 2x2 grid on mobile */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <Card className="bg-bloomfundr-card border-bloomfundr-muted">
            <CardHeader className="flex flex-row items-center justify-between pb-2 px-3 md:px-6 pt-3 md:pt-6">
              <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                Products
              </CardTitle>
              <Package className="h-4 w-4 md:h-5 md:w-5 text-bloomfundr-primary" />
            </CardHeader>
            <CardContent className="px-3 md:px-6 pb-3 md:pb-6">
              {isLoading ? (
                <Skeleton className="h-7 w-12" />
              ) : (
                <div className="text-xl md:text-2xl font-bold text-foreground">
                  {stats?.total_products || 0}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-bloomfundr-card border-bloomfundr-muted">
            <CardHeader className="flex flex-row items-center justify-between pb-2 px-3 md:px-6 pt-3 md:pt-6">
              <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                Active
              </CardTitle>
              <Calendar className="h-4 w-4 md:h-5 md:w-5 text-bloomfundr-secondary" />
            </CardHeader>
            <CardContent className="px-3 md:px-6 pb-3 md:pb-6">
              {isLoading ? (
                <Skeleton className="h-7 w-12" />
              ) : (
                <div className="text-xl md:text-2xl font-bold text-foreground">
                  {stats?.active_campaigns || 0}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-bloomfundr-card border-bloomfundr-muted">
            <CardHeader className="flex flex-row items-center justify-between pb-2 px-3 md:px-6 pt-3 md:pt-6">
              <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                Pending
              </CardTitle>
              <ShoppingCart className="h-4 w-4 md:h-5 md:w-5 text-orange-500" />
            </CardHeader>
            <CardContent className="px-3 md:px-6 pb-3 md:pb-6">
              {isLoading ? (
                <Skeleton className="h-7 w-12" />
              ) : (
                <div className="text-xl md:text-2xl font-bold text-foreground">
                  {stats?.pending_orders || 0}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-bloomfundr-card border-bloomfundr-muted">
            <CardHeader className="flex flex-row items-center justify-between pb-2 px-3 md:px-6 pt-3 md:pt-6">
              <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                Earnings
              </CardTitle>
              <DollarSign className="h-4 w-4 md:h-5 md:w-5 text-green-500" />
            </CardHeader>
            <CardContent className="px-3 md:px-6 pb-3 md:pb-6">
              {isLoading ? (
                <Skeleton className="h-7 w-20" />
              ) : (
                <div className="text-xl md:text-2xl font-bold text-foreground">
                  ${(stats?.total_earnings || 0).toFixed(0)}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-4 md:gap-6">
          {/* Recent Orders */}
          <Card className="bg-bloomfundr-card border-bloomfundr-muted">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-foreground">Recent Orders</CardTitle>
                <CardDescription>Latest orders from your campaigns</CardDescription>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link to="/florist/orders" className="text-bloomfundr-primary">
                  View All <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : recentOrders && recentOrders.length > 0 ? (
                <div className="space-y-3">
                  {recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-bloomfundr-muted"
                    >
                      <div className="space-y-1">
                        <p className="font-medium text-foreground">{order.order_number}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {format(new Date(order.created_at), "MMM d, yyyy")}
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="font-semibold text-foreground">${Number(order.total).toFixed(2)}</p>
                        <Badge variant="outline" className={fulfillmentColors[order.fulfillment_status]}>
                          {order.fulfillment_status.replace("_", " ")}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <ShoppingCart className="h-10 w-10 mx-auto mb-3 opacity-50" />
                  <p>No orders yet</p>
                  <p className="text-sm mt-1">Orders will appear here once campaigns start selling</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Active Campaigns */}
          <Card className="bg-bloomfundr-card border-bloomfundr-muted">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-foreground">Active Campaigns</CardTitle>
                <CardDescription>Your ongoing fundraising campaigns</CardDescription>
              </div>
              <Button asChild variant="ghost" size="sm">
                <Link to="/florist/campaigns" className="text-bloomfundr-primary">
                  View All <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {campaignsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : activeCampaigns && activeCampaigns.length > 0 ? (
                <div className="space-y-3">
                  {activeCampaigns.slice(0, 5).map((campaign) => (
                    <Link
                      key={campaign.id}
                      to={`/florist/campaigns/${campaign.id}`}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-bloomfundr-muted hover:border-bloomfundr-primary/50 transition-colors"
                    >
                      <div className="space-y-1">
                        <p className="font-medium text-foreground">{campaign.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Ends {format(new Date(campaign.end_date), "MMM d, yyyy")}
                        </p>
                      </div>
                      <Badge variant="outline" className={statusColors[campaign.status]}>
                        {campaign.status}
                      </Badge>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-10 w-10 mx-auto mb-3 opacity-50" />
                  <p>No active campaigns</p>
                  <p className="text-sm mt-1">Partner with organizations to create campaigns</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Getting Started Card (shown if no products) */}
        {!isLoading && (stats?.total_products || 0) === 0 && (
          <Card className="bg-gradient-to-r from-bloomfundr-primary/10 to-bloomfundr-secondary/10 border-bloomfundr-primary/20">
            <CardHeader>
              <CardTitle className="text-foreground">Get Started with BloomFundr</CardTitle>
              <CardDescription>Follow these steps to start receiving orders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-bloomfundr-primary text-bloomfundr-primary-foreground flex items-center justify-center font-bold text-sm shrink-0">
                    1
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Add Products</p>
                    <p className="text-sm text-muted-foreground">Create your floral product catalog</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-bloomfundr-primary text-bloomfundr-primary-foreground flex items-center justify-center font-bold text-sm shrink-0">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Partner Up</p>
                    <p className="text-sm text-muted-foreground">Connect with schools & organizations</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-bloomfundr-primary text-bloomfundr-primary-foreground flex items-center justify-center font-bold text-sm shrink-0">
                    3
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Fulfill Orders</p>
                    <p className="text-sm text-muted-foreground">Create beautiful arrangements</p>
                  </div>
                </div>
              </div>
              <Button asChild className="mt-6 bg-bloomfundr-primary hover:bg-bloomfundr-primary-light">
                <Link to="/florist/products/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Product
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </FloristLayout>
  );
}

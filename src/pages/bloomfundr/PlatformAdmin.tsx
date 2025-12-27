import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  Flower2, 
  Building2,
  CheckCircle2,
  Clock,
  XCircle,
  RefreshCcw,
  Receipt
} from "lucide-react";
import { format } from "date-fns";
import { usePlatformStats, useRecentPayouts, useRecentOrders } from "@/hooks/usePlatformAdmin";

export default function PlatformAdmin() {
  const { data: stats, isLoading: statsLoading } = usePlatformStats();
  const { data: recentPayouts, isLoading: payoutsLoading } = useRecentPayouts();
  const { data: recentOrders, isLoading: ordersLoading } = useRecentOrders();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
      case "paid":
        return (
          <Badge className="bg-emerald-500/20 text-emerald-600 border-emerald-500/30">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            {status}
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-amber-500/20 text-amber-600 border-amber-500/30">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-red-500/20 text-red-600 border-red-500/30">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
      case "refunded":
      case "partially_refunded":
        return (
          <Badge className="bg-orange-500/20 text-orange-600 border-orange-500/30">
            <RefreshCcw className="h-3 w-3 mr-1" />
            {status === "partially_refunded" ? "Partial Refund" : "Refunded"}
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Platform Admin</h1>
          <p className="text-muted-foreground">Monitor platform revenue, payouts, and system health</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Revenue */}
          <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <p className="text-2xl font-bold text-emerald-600">
                  {formatCurrency(stats?.totalRevenue || 0)}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                From {stats?.totalPaidOrders || 0} paid orders
              </p>
            </CardContent>
          </Card>

          {/* Platform Fees */}
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Platform Fees
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <p className="text-2xl font-bold text-primary">
                  {formatCurrency(stats?.totalPlatformFees || 0)}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                + {formatCurrency(stats?.totalProcessingFees || 0)} processing
              </p>
            </CardContent>
          </Card>

          {/* Total Payouts */}
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4" />
                Total Payouts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency((stats?.totalFloristPayouts || 0) + (stats?.totalOrgPayouts || 0))}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {stats?.completedPayouts || 0} completed, {stats?.pendingPayouts || 0} pending
              </p>
            </CardContent>
          </Card>

          {/* Refunds */}
          <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <RefreshCcw className="h-4 w-4" />
                Total Refunds
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <p className="text-2xl font-bold text-orange-600">
                  {formatCurrency(stats?.totalRefunds || 0)}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                {stats?.failedPayouts || 0} failed payouts
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <ShoppingCart className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.totalOrders || 0}</p>
                  <p className="text-xs text-muted-foreground">Total Orders</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                  <Receipt className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.activeCampaigns || 0}/{stats?.totalCampaigns || 0}</p>
                  <p className="text-xs text-muted-foreground">Active Campaigns</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-pink-500/10 rounded-lg">
                  <Flower2 className="h-5 w-5 text-pink-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.totalFlorists || 0}</p>
                  <p className="text-xs text-muted-foreground">Florists</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Building2 className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.totalOrganizations || 0}</p>
                  <p className="text-xs text-muted-foreground">Organizations</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payout Distribution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flower2 className="h-5 w-5 text-pink-600" />
                Florist Payouts
              </CardTitle>
              <CardDescription>Total paid to florists</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-pink-600">
                {formatCurrency(stats?.totalFloristPayouts || 0)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-600" />
                Organization Payouts
              </CardTitle>
              <CardDescription>Total paid to organizations</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">
                {formatCurrency(stats?.totalOrgPayouts || 0)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="payouts">
              <TabsList className="mb-4">
                <TabsTrigger value="payouts">Recent Payouts</TabsTrigger>
                <TabsTrigger value="orders">Recent Orders</TabsTrigger>
              </TabsList>

              <TabsContent value="payouts">
                {payoutsLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                ) : recentPayouts?.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">No payouts yet</p>
                ) : (
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-2">
                      {recentPayouts?.map((payout) => (
                        <div
                          key={payout.id}
                          className="p-4 bg-muted/50 rounded-lg flex items-center justify-between"
                        >
                          <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-lg ${
                              payout.recipient_type === "florist" 
                                ? "bg-pink-500/10" 
                                : "bg-blue-500/10"
                            }`}>
                              {payout.recipient_type === "florist" 
                                ? <Flower2 className="h-4 w-4 text-pink-600" />
                                : <Building2 className="h-4 w-4 text-blue-600" />
                              }
                            </div>
                            <div>
                              <p className="font-medium">{payout.recipient_name}</p>
                              <p className="text-sm text-muted-foreground">
                                {payout.campaign_name}
                                {payout.order_number && ` • Order #${payout.order_number}`}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-emerald-600">
                              {formatCurrency(payout.amount)}
                            </p>
                            <div className="flex items-center gap-2 justify-end mt-1">
                              {getStatusBadge(payout.status)}
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(payout.created_at), "MMM d")}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </TabsContent>

              <TabsContent value="orders">
                {ordersLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                ) : recentOrders?.length === 0 ? (
                  <p className="text-center py-8 text-muted-foreground">No orders yet</p>
                ) : (
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-2">
                      {recentOrders?.map((order) => (
                        <div
                          key={order.id}
                          className="p-4 bg-muted/50 rounded-lg flex items-center justify-between"
                        >
                          <div>
                            <p className="font-medium">Order #{order.order_number}</p>
                            <p className="text-sm text-muted-foreground">
                              {order.customer_name} • {order.campaign_name}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{formatCurrency(order.total)}</p>
                            <p className="text-xs text-emerald-600">
                              Fee: {formatCurrency(order.platform_fee)}
                            </p>
                            <div className="flex items-center gap-2 justify-end mt-1">
                              {getStatusBadge(order.refund_status || order.payment_status)}
                              <span className="text-xs text-muted-foreground">
                                {format(new Date(order.created_at), "MMM d")}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

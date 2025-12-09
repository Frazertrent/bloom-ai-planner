import { useParams, Link, useNavigate } from "react-router-dom";
import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { OrgLayout } from "@/components/bloomfundr/OrgLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { CampaignStatusBadge } from "@/components/bloomfundr/CampaignStatusBadge";
import { CampaignLinksModal } from "@/components/bloomfundr/CampaignLinksModal";
import { useOrgCampaignAnalytics, useOrgCampaignRealtime } from "@/hooks/useOrgCampaignAnalytics";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  Users,
  Share2,
  Pencil,
  ChevronDown,
  Copy,
  Download,
  Printer,
  StopCircle,
  CheckCircle,
  Trophy,
  ExternalLink,
  Bell,
} from "lucide-react";
import { format } from "date-fns";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function OrgCampaignDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showLinksModal, setShowLinksModal] = useState(false);
  const [showAllStudents, setShowAllStudents] = useState(false);

  const { data: analytics, isLoading, refetch } = useOrgCampaignAnalytics(id);

  // Real-time updates
  const handleRealtimeUpdate = useCallback(() => {
    refetch();
  }, [refetch]);

  useOrgCampaignRealtime(id, handleRealtimeUpdate);

  // End campaign mutation
  const endCampaignMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("bf_campaigns")
        .update({ status: "closed" })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org-campaign-analytics", id] });
      toast({ title: "Campaign ended", description: "Campaign has been closed." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to end campaign.", variant: "destructive" });
    },
  });

  // Mark fulfilled mutation
  const markFulfilledMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("bf_campaigns")
        .update({ status: "fulfilled" })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org-campaign-analytics", id] });
      toast({ title: "Campaign fulfilled", description: "All orders marked as fulfilled." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update campaign.", variant: "destructive" });
    },
  });

  // Export CSV
  const handleExportCSV = () => {
    if (!analytics) return;

    const headers = ["Order #", "Customer", "Student", "Amount", "Status", "Date"];
    const rows = analytics.orders.map(o => [
      o.orderNumber,
      o.customerName,
      o.studentName || "—",
      `$${o.total.toFixed(2)}`,
      o.fulfillmentStatus,
      format(new Date(o.createdAt), "yyyy-MM-dd HH:mm"),
    ]);

    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${analytics.campaign.name}-orders.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Print summary
  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <OrgLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-64" />
        </div>
      </OrgLayout>
    );
  }

  if (!analytics) {
    return (
      <OrgLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Campaign not found</p>
          <Button asChild className="mt-4">
            <Link to="/org/campaigns">Back to Campaigns</Link>
          </Button>
        </div>
      </OrgLayout>
    );
  }

  const { campaign, florist, stats, products, students, orders, salesByDay } = analytics;
  const top3Students = students.slice(0, 3);
  const displayStudents = showAllStudents ? students : students.slice(0, 5);

  return (
    <OrgLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/org/campaigns">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">{campaign.name}</h1>
              <CampaignStatusBadge status={campaign.status} />
            </div>
            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {format(new Date(campaign.start_date), "MMM d")} - {format(new Date(campaign.end_date), "MMM d, yyyy")}
              </span>
              {florist && <span>• {florist.business_name}</span>}
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {campaign.status === "draft" && (
              <Button variant="outline" asChild>
                <Link to={`/org/campaigns/${id}/edit`}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Link>
              </Button>
            )}
            {(campaign.status === "active" || campaign.status === "closed") && (
              <Button variant="outline" asChild>
                <Link to={`/org/campaigns/${id}/add-order`}>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add Manual Order
                </Link>
              </Button>
            )}
            <Button onClick={() => setShowLinksModal(true)}>
              <Share2 className="h-4 w-4 mr-2" />
              Share Links
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <ShoppingCart className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-bold">{stats.totalOrders}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">${stats.totalRevenue.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-rose-500/10">
                  <TrendingUp className="h-5 w-5 text-rose-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Your Earnings</p>
                  <p className="text-2xl font-bold">${stats.orgEarnings.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10">
                  <Users className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg. Order Value</p>
                  <p className="text-2xl font-bold">${stats.avgOrderValue.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Sales Over Time */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Sales Over Time</CardTitle>
              <CardDescription>Orders and revenue by day</CardDescription>
            </CardHeader>
            <CardContent>
              {salesByDay.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={salesByDay}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(d) => format(new Date(d), "MMM d")}
                      className="text-xs"
                    />
                    <YAxis className="text-xs" />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload?.length) {
                          return (
                            <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                              <p className="font-medium">{format(new Date(label), "MMM d, yyyy")}</p>
                              <p className="text-sm text-muted-foreground">
                                Orders: {payload[0]?.value}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Revenue: ${Number(payload[1]?.value || 0).toFixed(2)}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="orders"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="hsl(var(--chart-2))"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                  No sales data yet
                </div>
              )}
            </CardContent>
          </Card>

          {/* Product Performance */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Product Performance</CardTitle>
              <CardDescription>Units sold by product</CardDescription>
            </CardHeader>
            <CardContent>
              {products.some(p => p.quantitySold > 0) ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={products.filter(p => p.quantitySold > 0)}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload?.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
                              <p className="font-medium">{data.name}</p>
                              <p className="text-sm text-muted-foreground">
                                Sold: {data.quantitySold} units
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Revenue: ${data.revenue.toFixed(2)}
                              </p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar dataKey="quantitySold" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-[250px] text-muted-foreground">
                  No product sales yet
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Student Leaderboard */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              Student Leaderboard
            </CardTitle>
            <CardDescription>Top performers in this campaign</CardDescription>
          </CardHeader>
          <CardContent>
            {students.length > 0 ? (
              <>
                {/* Top 3 Highlighted */}
                {top3Students.length > 0 && (
                  <div className="grid gap-4 md:grid-cols-3 mb-6">
                    {top3Students.map((student, idx) => (
                      <div
                        key={student.id}
                        className={`p-4 rounded-lg border ${
                          idx === 0
                            ? "bg-amber-500/10 border-amber-500/20"
                            : idx === 1
                            ? "bg-slate-400/10 border-slate-400/20"
                            : "bg-amber-700/10 border-amber-700/20"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`text-2xl font-bold ${
                              idx === 0
                                ? "text-amber-500"
                                : idx === 1
                                ? "text-slate-400"
                                : "text-amber-700"
                            }`}
                          >
                            #{idx + 1}
                          </span>
                          <div className="flex-1">
                            <p className="font-medium">{student.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {student.orderCount} orders • ${student.totalSales.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Full list collapsible */}
                <Collapsible open={showAllStudents} onOpenChange={setShowAllStudents}>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">Rank</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead className="text-right">Orders</TableHead>
                        <TableHead className="text-right">Sales</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {displayStudents.map((student, idx) => (
                        <TableRow key={student.id}>
                          <TableCell className="font-medium">{idx + 1}</TableCell>
                          <TableCell>{student.name}</TableCell>
                          <TableCell className="text-right">{student.orderCount}</TableCell>
                          <TableCell className="text-right">${student.totalSales.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {students.length > 5 && (
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" className="w-full mt-2">
                        <ChevronDown className={`h-4 w-4 mr-2 transition-transform ${showAllStudents ? "rotate-180" : ""}`} />
                        {showAllStudents ? "Show Less" : `View All (${students.length})`}
                      </Button>
                    </CollapsibleTrigger>
                  )}
                </Collapsible>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No students assigned to this campaign
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabs: Orders & Student Links */}
        <Tabs defaultValue="orders">
          <TabsList>
            <TabsTrigger value="orders">Recent Orders</TabsTrigger>
            <TabsTrigger value="links">Student Links</TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="mt-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>{orders.length} orders total</CardDescription>
              </CardHeader>
              <CardContent>
                {orders.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order #</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Student</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.slice(0, 10).map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.orderNumber}</TableCell>
                          <TableCell>{order.customerName}</TableCell>
                          <TableCell>{order.studentName || "—"}</TableCell>
                          <TableCell className="text-right">${order.total.toFixed(2)}</TableCell>
                          <TableCell>
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                order.fulfillmentStatus === "fulfilled"
                                  ? "bg-emerald-500/10 text-emerald-600"
                                  : order.fulfillmentStatus === "pending"
                                  ? "bg-amber-500/10 text-amber-600"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {order.fulfillmentStatus}
                            </span>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {format(new Date(order.createdAt), "MMM d, h:mm a")}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No orders yet
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="links" className="mt-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Student Links</CardTitle>
                <CardDescription>Share these links with students for order attribution</CardDescription>
              </CardHeader>
              <CardContent>
                {students.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Orders</TableHead>
                        <TableHead>Sales</TableHead>
                        <TableHead>Link</TableHead>
                        <TableHead className="w-32">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {students.map((student) => {
                        const link = `${window.location.origin}/order/${student.magicLinkCode}`;
                        return (
                          <TableRow key={student.id}>
                            <TableCell className="font-medium">{student.name}</TableCell>
                            <TableCell>{student.orderCount}</TableCell>
                            <TableCell>${student.totalSales.toFixed(2)}</TableCell>
                            <TableCell>
                              <code className="text-xs bg-muted px-2 py-1 rounded">
                                {student.magicLinkCode}
                              </code>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    navigator.clipboard.writeText(link);
                                    toast({ title: "Copied!", description: "Link copied to clipboard" });
                                  }}
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" disabled title="Send Reminder">
                                  <Bell className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No students assigned
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={handleExportCSV}>
                <Download className="h-4 w-4 mr-2" />
                Export Orders CSV
              </Button>
              <Button variant="outline" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Print Summary
              </Button>
              {campaign.status === "active" && (
                <Button
                  variant="outline"
                  className="text-amber-600 hover:text-amber-700"
                  onClick={() => endCampaignMutation.mutate()}
                  disabled={endCampaignMutation.isPending}
                >
                  <StopCircle className="h-4 w-4 mr-2" />
                  End Campaign Early
                </Button>
              )}
              {campaign.status === "closed" && (
                <Button
                  variant="outline"
                  className="text-emerald-600 hover:text-emerald-700"
                  onClick={() => markFulfilledMutation.mutate()}
                  disabled={markFulfilledMutation.isPending}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark Fulfilled
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Links Modal */}
        <CampaignLinksModal
          open={showLinksModal}
          onOpenChange={setShowLinksModal}
          campaignName={campaign.name}
          studentLinks={students.map((s) => ({
            studentId: s.id,
            studentName: s.name,
            magicLinkCode: s.magicLinkCode,
            fullUrl: `${window.location.origin}/order/${s.magicLinkCode}`,
          }))}
        />
      </div>
    </OrgLayout>
  );
}

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { pdf } from "@react-pdf/renderer";
import { FloristLayout } from "@/components/bloomfundr/FloristLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DateRangeFilter } from "@/components/ui/date-range-filter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useFloristProfile } from "@/hooks/useFloristData";
import { 
  generateCSV, 
  getOrdersCSVColumns,
  getOrderItemsCSVColumns,
  getProductPerformanceCSVColumns,
} from "@/lib/exportUtils";
import { 
  FileText, 
  Download, 
  FileSpreadsheet, 
  TrendingUp, 
  DollarSign,
  Package,
  // ClipboardList hidden for future iteration
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import type { DateRange } from "react-day-picker";

type ReportType = "orders" | "revenue" | "products";

export default function FloristReports() {
  const [selectedCampaign, setSelectedCampaign] = useState<string>("all");
  const [reportType, setReportType] = useState<ReportType>("orders");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: florist } = useFloristProfile();

  // Fetch campaigns
  const { data: campaigns, isLoading: loadingCampaigns } = useQuery({
    queryKey: ["florist-campaigns-for-reports", florist?.id],
    queryFn: async () => {
      if (!florist?.id) return [];
      const { data, error } = await supabase
        .from("bf_campaigns")
        .select("id, name, start_date, end_date, status, organization:bf_organizations(name)")
        .eq("florist_id", florist.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!florist?.id,
  });

  // Fetch report data
  const { data: reportData, isLoading: loadingData } = useQuery({
    queryKey: ["florist-report-data", florist?.id, selectedCampaign, dateRange],
    queryFn: async () => {
      if (!florist?.id) return null;

      let campaignIds: string[] = [];
      if (selectedCampaign === "all") {
        campaignIds = campaigns?.map((c) => c.id) || [];
      } else {
        campaignIds = [selectedCampaign];
      }

      if (campaignIds.length === 0) return null;

      // Fetch orders
      let ordersQuery = supabase
        .from("bf_orders")
        .select(`
          *,
          customer:bf_customers(*),
          campaign:bf_campaigns(*),
          order_items:bf_order_items(
            *,
            campaign_product:bf_campaign_products(
              *,
              product:bf_products(*)
            )
          )
        `)
        .in("campaign_id", campaignIds)
        .eq("payment_status", "paid");

      if (dateRange?.from) {
        ordersQuery = ordersQuery.gte("created_at", dateRange.from.toISOString());
      }
      if (dateRange?.to) {
        ordersQuery = ordersQuery.lte("created_at", dateRange.to.toISOString());
      }

      const { data: orders } = await ordersQuery;

      return {
        orders: orders || [],
        campaigns: selectedCampaign === "all" 
          ? campaigns 
          : campaigns?.filter((c) => c.id === selectedCampaign),
      };
    },
    enabled: !!florist?.id && !!campaigns?.length,
  });

  const handleExportCSV = (type: ReportType) => {
    if (!reportData) {
      toast.error("No data to export");
      return;
    }

    try {
      switch (type) {
        case "orders":
          generateCSV(reportData.orders, getOrdersCSVColumns(), "florist_orders_export");
          break;
        // Production list export hidden for future iteration
        case "revenue":
          const revenueData = (reportData.campaigns || []).map((c: any) => {
            const campaignOrders = reportData.orders.filter((o: any) => o.campaign_id === c.id);
            const grossRevenue = campaignOrders.reduce((s: number, o: any) => s + Number(o.subtotal), 0);
            return {
              campaign_name: c.name,
              organization: c.organization?.name || "Unknown",
              start_date: c.start_date,
              end_date: c.end_date,
              order_count: campaignOrders.length,
              gross_revenue: grossRevenue,
              status: c.status,
            };
          });
          generateCSV(revenueData, [
            { header: "Campaign", accessor: "campaign_name" as const },
            { header: "Organization", accessor: "organization" as const },
            { header: "Start Date", accessor: (r: any) => format(new Date(r.start_date), "yyyy-MM-dd") },
            { header: "End Date", accessor: (r: any) => format(new Date(r.end_date), "yyyy-MM-dd") },
            { header: "Orders", accessor: "order_count" as const },
            { header: "Gross Revenue", accessor: (r: any) => Number(r.gross_revenue).toFixed(2) },
            { header: "Status", accessor: "status" as const },
          ], "revenue_export");
          break;
        case "products":
          const productData: any[] = [];
          reportData.orders.forEach((order: any) => {
            order.order_items?.forEach((item: any) => {
              const product = item.campaign_product?.product;
              if (product) {
                const existing = productData.find((p) => p.id === product.id);
                if (existing) {
                  existing.units_sold += item.quantity;
                  existing.gross_revenue += item.quantity * Number(item.unit_price);
                } else {
                  productData.push({
                    id: product.id,
                    name: product.name,
                    category: product.category,
                    base_cost: product.base_cost,
                    retail_price: item.unit_price,
                    units_sold: item.quantity,
                    gross_revenue: item.quantity * Number(item.unit_price),
                    net_revenue: item.quantity * (Number(item.unit_price) - Number(product.base_cost)),
                  });
                }
              }
            });
          });
          generateCSV(productData, getProductPerformanceCSVColumns(), "products_export");
          break;
      }
      toast.success("CSV exported successfully");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export CSV");
    }
  };

  const reportTypes = [
    { value: "orders", label: "Orders Export", icon: FileSpreadsheet, description: "All orders with customer details" },
    { value: "revenue", label: "Revenue Summary", icon: DollarSign, description: "Revenue by campaign" },
    { value: "products", label: "Product Performance", icon: Package, description: "Units sold by product" },
  ];

  // Calculate pending items for production
  const pendingItems = reportData?.orders
    .filter((o: any) => o.fulfillment_status !== "delivered")
    .reduce((sum: number, o: any) => 
      sum + (o.order_items?.reduce((s: number, i: any) => s + i.quantity, 0) || 0), 0) || 0;

  return (
    <FloristLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports & Exports</h1>
          <p className="text-muted-foreground mt-1">
            Generate production lists and export campaign data
          </p>
        </div>

        {/* Filters */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Report Parameters</CardTitle>
            <CardDescription>Select campaign and date range</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Campaign</label>
                <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select campaign" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="all">All Campaigns</SelectItem>
                    {campaigns?.map((campaign) => (
                      <SelectItem key={campaign.id} value={campaign.id}>
                        {campaign.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Date Range (Optional)</label>
                <DateRangeFilter
                  value={dateRange}
                  onChange={setDateRange}
                  placeholder="Filter by date"
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Report Type</label>
                <Select value={reportType} onValueChange={(v) => setReportType(v as ReportType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    {reportTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <type.icon className="h-4 w-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Report Types */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {reportTypes.map((type) => (
            <Card 
              key={type.value} 
              className={`bg-card border-border cursor-pointer transition-all hover:shadow-md ${
                reportType === type.value ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => setReportType(type.value as ReportType)}
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <type.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm">{type.label}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {type.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Generate/Export Actions */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Export Report</CardTitle>
            <CardDescription>
              {selectedCampaign === "all" 
                ? `Export data for all ${campaigns?.length || 0} campaigns`
                : `Export data for ${campaigns?.find((c) => c.id === selectedCampaign)?.name}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button 
                onClick={() => handleExportCSV(reportType)}
                disabled={loadingData || !reportData}
              >
                <Download className="h-4 w-4 mr-2" />
                Export {reportTypes.find((t) => t.value === reportType)?.label} as CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Data Preview */}
        {reportData && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">Data Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-bold">{reportData.orders.length}</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Pending Items</p>
                  <p className="text-2xl font-bold text-amber-600">{pendingItems}</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Campaigns</p>
                  <p className="text-2xl font-bold">{reportData.campaigns?.length || 0}</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground">Gross Revenue</p>
                  <p className="text-2xl font-bold text-emerald-600">
                    ${reportData.orders.reduce((s: number, o: any) => s + Number(o.subtotal), 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </FloristLayout>
  );
}

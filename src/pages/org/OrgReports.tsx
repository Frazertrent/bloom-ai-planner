import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { pdf } from "@react-pdf/renderer";
import { OrgLayout } from "@/components/bloomfundr/OrgLayout";
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
import { CampaignReportPDF } from "@/components/bloomfundr/CampaignReportPDF";
import { supabase } from "@/integrations/supabase/client";
import { useOrgProfile } from "@/hooks/useOrgData";
import { generateCSV, getOrdersCSVColumns, getStudentsCSVColumns, getProductPerformanceCSVColumns } from "@/lib/exportUtils";
import { FileText, Download, FileSpreadsheet, Users, DollarSign, Package, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import type { DateRange } from "react-day-picker";

type ReportType = "campaign" | "orders" | "students" | "products";

export default function OrgReports() {
  const [selectedCampaign, setSelectedCampaign] = useState<string>("all");
  const [reportType, setReportType] = useState<ReportType>("campaign");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [isGenerating, setIsGenerating] = useState(false);
  const { data: org } = useOrgProfile();

  const { data: campaigns } = useQuery({
    queryKey: ["org-campaigns-for-reports", org?.id],
    queryFn: async () => {
      if (!org?.id) return [];
      const { data } = await supabase.from("bf_campaigns").select("id, name, start_date, end_date, status, florist_margin_percent, organization_margin_percent").eq("organization_id", org.id).order("created_at", { ascending: false });
      return data || [];
    },
    enabled: !!org?.id,
  });

  const { data: reportData, isLoading } = useQuery({
    queryKey: ["org-report-data", org?.id, selectedCampaign, dateRange],
    queryFn: async () => {
      if (!org?.id) return null;
      const campaignIds = selectedCampaign === "all" ? campaigns?.map((c) => c.id) || [] : [selectedCampaign];
      if (!campaignIds.length) return null;

      let query = supabase.from("bf_orders").select("*, customer:bf_customers(*), campaign:bf_campaigns(*), attributed_student:bf_students(*), order_items:bf_order_items(*, campaign_product:bf_campaign_products(*, product:bf_products(*)))").in("campaign_id", campaignIds).eq("payment_status", "paid");
      if (dateRange?.from) query = query.gte("created_at", dateRange.from.toISOString());
      if (dateRange?.to) query = query.lte("created_at", dateRange.to.toISOString());
      const { data: orders } = await query;

      const { data: students } = await supabase.from("bf_campaign_students").select("*, student:bf_students(*)").in("campaign_id", campaignIds);
      return { orders: orders || [], students: students || [], campaigns: selectedCampaign === "all" ? campaigns : campaigns?.filter((c) => c.id === selectedCampaign) };
    },
    enabled: !!org?.id && !!campaigns?.length,
  });

  const handleExportCSV = (type: ReportType) => {
    if (!reportData) return toast.error("No data to export");
    try {
      if (type === "orders") generateCSV(reportData.orders, getOrdersCSVColumns(), "orders_export");
      else if (type === "students") {
        const data = reportData.students.map((cs: any) => ({ ...cs.student, total_sales: cs.total_sales || 0, order_count: cs.order_count || 0, magic_link_code: cs.magic_link_code }));
        generateCSV(data, getStudentsCSVColumns(), "students_export");
      } else if (type === "products") {
        const productData: any[] = [];
        reportData.orders.forEach((o: any) => o.order_items?.forEach((i: any) => {
          const p = i.campaign_product?.product;
          if (p) {
            const e = productData.find((x) => x.id === p.id);
            if (e) { e.units_sold += i.quantity; e.gross_revenue += i.quantity * Number(i.unit_price); }
            else productData.push({ id: p.id, name: p.name, category: p.category, base_cost: p.base_cost, retail_price: i.unit_price, units_sold: i.quantity, gross_revenue: i.quantity * Number(i.unit_price), net_revenue: i.quantity * (Number(i.unit_price) - Number(p.base_cost)) });
          }
        }));
        generateCSV(productData, getProductPerformanceCSVColumns(), "products_export");
      }
      toast.success("CSV exported");
    } catch { toast.error("Export failed"); }
  };

  const reportTypes = [
    { value: "campaign", label: "Campaign Summary", icon: FileText },
    { value: "orders", label: "Orders Export", icon: FileSpreadsheet },
    { value: "students", label: "Student Performance", icon: Users },
    { value: "products", label: "Product Performance", icon: Package },
  ];

  return (
    <OrgLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Reports & Exports</h1>
          <p className="text-muted-foreground mt-1">Generate reports and export data</p>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-lg">Report Parameters</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
                <SelectTrigger><SelectValue placeholder="Select campaign" /></SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="all">All Campaigns</SelectItem>
                  {campaigns?.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <DateRangeFilter value={dateRange} onChange={setDateRange} placeholder="Date range" className="w-full" />
              <Select value={reportType} onValueChange={(v) => setReportType(v as ReportType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent className="bg-popover">
                  {reportTypes.map((t) => <SelectItem key={t.value} value={t.value}><div className="flex items-center gap-2"><t.icon className="h-4 w-4" />{t.label}</div></SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Export</CardTitle></CardHeader>
          <CardContent>
            <Button onClick={() => handleExportCSV(reportType)} disabled={isLoading || !reportData}>
              <Download className="h-4 w-4 mr-2" />Export CSV
            </Button>
          </CardContent>
        </Card>

        {reportData && (
          <Card>
            <CardHeader><CardTitle className="text-lg">Data Summary</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-muted rounded-lg"><p className="text-sm text-muted-foreground">Orders</p><p className="text-2xl font-bold">{reportData.orders.length}</p></div>
                <div className="p-4 bg-muted rounded-lg"><p className="text-sm text-muted-foreground">Students</p><p className="text-2xl font-bold">{reportData.students.length}</p></div>
                <div className="p-4 bg-muted rounded-lg"><p className="text-sm text-muted-foreground">Campaigns</p><p className="text-2xl font-bold">{reportData.campaigns?.length || 0}</p></div>
                <div className="p-4 bg-muted rounded-lg"><p className="text-sm text-muted-foreground">Revenue</p><p className="text-2xl font-bold text-emerald-600">${reportData.orders.reduce((s: number, o: any) => s + Number(o.total), 0).toFixed(2)}</p></div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </OrgLayout>
  );
}

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import type { BFCampaign, BFFlorist, CampaignStatus } from "@/types/bloomfundr";

export interface FulfillmentBreakdown {
  pending: number;
  in_production: number;
  ready: number;
  picked_up: number;
}

export interface CampaignAnalytics {
  campaign: BFCampaign;
  florist: BFFlorist | null;
  stats: {
    totalOrders: number;
    totalRevenue: number;
    orgEarnings: number;
    avgOrderValue: number;
    paidOrders: number;
    pendingOrders: number;
    fulfillmentBreakdown: FulfillmentBreakdown;
  };
  products: Array<{
    id: string;
    name: string;
    retailPrice: number;
    quantitySold: number;
    revenue: number;
  }>;
  students: Array<{
    id: string;
    name: string;
    magicLinkCode: string;
    orderCount: number;
    totalSales: number;
  }>;
  orders: Array<{
    id: string;
    orderNumber: string;
    customerName: string;
    studentName: string | null;
    total: number;
    fulfillmentStatus: string;
    createdAt: string;
  }>;
  allOrders: Array<{
    id: string;
    orderNumber: string;
    customerName: string;
    studentName: string | null;
    total: number;
    subtotal: number;
    paymentStatus: string;
    entryMethod: string;
    createdAt: string;
    notes: string | null;
  }>;
  salesByDay: Array<{
    date: string;
    orders: number;
    revenue: number;
  }>;
}

export function useOrgCampaignAnalytics(campaignId: string | undefined) {
  return useQuery({
    queryKey: ["org-campaign-analytics", campaignId],
    queryFn: async (): Promise<CampaignAnalytics | null> => {
      if (!campaignId) return null;

      // Fetch campaign
      const { data: campaign, error: campaignError } = await supabase
        .from("bf_campaigns")
        .select("*")
        .eq("id", campaignId)
        .single();

      if (campaignError) throw campaignError;

      // Fetch florist
      const { data: florist } = await supabase
        .from("bf_florists")
        .select("*")
        .eq("id", campaign.florist_id)
        .single();

      // Fetch ALL orders (for payments reconciliation)
      const { data: allOrdersData } = await supabase
        .from("bf_orders")
        .select(`
          id,
          order_number,
          total,
          subtotal,
          fulfillment_status,
          payment_status,
          entry_method,
          notes,
          created_at,
          attributed_student_id,
          customer:bf_customers(full_name)
        `)
        .eq("campaign_id", campaignId)
        .order("created_at", { ascending: false });

      // Filter paid orders for stats
      const orders = (allOrdersData || []).filter((o) => o.payment_status === "paid");

      // Fetch students for this campaign
      const { data: campaignStudents } = await supabase
        .from("bf_campaign_students")
        .select(`
          id,
          magic_link_code,
          order_count,
          total_sales,
          student:bf_students(id, name)
        `)
        .eq("campaign_id", campaignId);

      // Fetch campaign products with order items
      const { data: campaignProducts } = await supabase
        .from("bf_campaign_products")
        .select(`
          id,
          product_id,
          retail_price,
          product:bf_products(name)
        `)
        .eq("campaign_id", campaignId);

      // Fetch order items for quantity calculations
      const { data: orderItems } = await supabase
        .from("bf_order_items")
        .select(`
          campaign_product_id,
          quantity,
          unit_price
        `)
        .in("order_id", (orders || []).map(o => o.id));

      // Calculate product quantities
      const productQuantities: Record<string, number> = {};
      (orderItems || []).forEach(item => {
        productQuantities[item.campaign_product_id] = 
          (productQuantities[item.campaign_product_id] || 0) + item.quantity;
      });

      // Build student name map
      const studentNameMap: Record<string, string> = {};
      (campaignStudents || []).forEach(cs => {
        if (cs.student?.id) {
          studentNameMap[cs.student.id] = cs.student.name;
        }
      });

      // Calculate stats
      const totalOrders = orders?.length || 0;
      const totalRevenue = orders?.reduce((sum, o) => sum + Number(o.subtotal), 0) || 0;
      const orgEarnings = totalRevenue * (campaign.organization_margin_percent / 100);
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      const paidOrders = (allOrdersData || []).filter(o => o.payment_status === "paid").length;
      const pendingOrders = (allOrdersData || []).filter(o => o.payment_status === "pending").length;

      // Calculate fulfillment breakdown (only for paid orders)
      const fulfillmentBreakdown: FulfillmentBreakdown = {
        pending: orders.filter(o => o.fulfillment_status === "pending").length,
        in_production: orders.filter(o => o.fulfillment_status === "in_production").length,
        ready: orders.filter(o => o.fulfillment_status === "ready").length,
        picked_up: orders.filter(o => o.fulfillment_status === "picked_up").length,
      };

      // Transform products
      const products = (campaignProducts || []).map(cp => ({
        id: cp.product_id,
        name: (cp.product as any)?.name || "Unknown",
        retailPrice: Number(cp.retail_price),
        quantitySold: productQuantities[cp.id] || 0,
        revenue: (productQuantities[cp.id] || 0) * Number(cp.retail_price),
      }));

      // Transform students
      const students = (campaignStudents || []).map(cs => ({
        id: cs.student?.id || cs.id,
        name: cs.student?.name || "Unknown",
        magicLinkCode: cs.magic_link_code,
        orderCount: cs.order_count || 0,
        totalSales: Number(cs.total_sales) || 0,
      })).sort((a, b) => b.totalSales - a.totalSales);

      // Transform orders
      const transformedOrders = (orders || []).map(o => ({
        id: o.id,
        orderNumber: o.order_number,
        customerName: (o.customer as any)?.full_name || "Unknown",
        studentName: o.attributed_student_id ? studentNameMap[o.attributed_student_id] || null : null,
        total: Number(o.total),
        fulfillmentStatus: o.fulfillment_status,
        createdAt: o.created_at || "",
      }));

      // Calculate sales by day
      const salesByDayMap: Record<string, { orders: number; revenue: number }> = {};
      (orders || []).forEach(o => {
        const date = o.created_at?.split("T")[0] || "";
        if (!salesByDayMap[date]) {
          salesByDayMap[date] = { orders: 0, revenue: 0 };
        }
        salesByDayMap[date].orders += 1;
        salesByDayMap[date].revenue += Number(o.subtotal);
      });

      const salesByDay = Object.entries(salesByDayMap)
        .map(([date, data]) => ({ date, ...data }))
        .sort((a, b) => a.date.localeCompare(b.date));

      // Transform all orders for payments tab
      const allOrders = (allOrdersData || []).map(o => ({
        id: o.id,
        orderNumber: o.order_number,
        customerName: (o.customer as any)?.full_name || "Unknown",
        studentName: o.attributed_student_id ? studentNameMap[o.attributed_student_id] || null : null,
        total: Number(o.total),
        subtotal: Number(o.subtotal),
        paymentStatus: o.payment_status,
        entryMethod: o.entry_method,
        createdAt: o.created_at || "",
        notes: o.notes,
      }));

      return {
        campaign: { ...campaign, status: campaign.status as CampaignStatus } as BFCampaign,
        florist: florist as BFFlorist | null,
        stats: {
          totalOrders,
          totalRevenue,
          orgEarnings,
          avgOrderValue,
          paidOrders,
          pendingOrders,
          fulfillmentBreakdown,
        },
        products,
        students,
        orders: transformedOrders,
        allOrders,
        salesByDay,
      };
    },
    enabled: !!campaignId,
  });
}

export function useOrgCampaignRealtime(campaignId: string | undefined, onUpdate: () => void) {
  useEffect(() => {
    if (!campaignId) return;

    const channel = supabase
      .channel(`org-campaign-${campaignId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bf_orders",
          filter: `campaign_id=eq.${campaignId}`,
        },
        () => {
          onUpdate();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bf_campaign_students",
          filter: `campaign_id=eq.${campaignId}`,
        },
        () => {
          onUpdate();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [campaignId, onUpdate]);
}

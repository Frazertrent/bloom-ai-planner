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
    paymentStatus: string;
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

      // All orders for display (not filtered by payment status)
      const allOrders = allOrdersData || [];

      // Fetch students for this campaign
      const { data: campaignStudents } = await supabase
        .from("bf_campaign_students")
        .select(`
          id,
          magic_link_code,
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

      // Fetch order items for quantity calculations (from all orders)
      const { data: orderItems } = await supabase
        .from("bf_order_items")
        .select(`
          campaign_product_id,
          quantity,
          unit_price
        `)
        .in("order_id", allOrders.map(o => o.id));

      // Calculate product quantities
      const productQuantities: Record<string, number> = {};
      (orderItems || []).forEach(item => {
        productQuantities[item.campaign_product_id] = 
          (productQuantities[item.campaign_product_id] || 0) + item.quantity;
      });

      // Build student name map and campaign student id map
      const studentNameMap: Record<string, string> = {};
      (campaignStudents || []).forEach(cs => {
        if (cs.student?.id) {
          studentNameMap[cs.student.id] = cs.student.name;
        }
      });

      // Calculate student stats directly from orders (not from stale bf_campaign_students data)
      const studentStats: Record<string, { orderCount: number; totalSales: number }> = {};
      allOrders.forEach(o => {
        if (o.attributed_student_id) {
          if (!studentStats[o.attributed_student_id]) {
            studentStats[o.attributed_student_id] = { orderCount: 0, totalSales: 0 };
          }
          studentStats[o.attributed_student_id].orderCount += 1;
          studentStats[o.attributed_student_id].totalSales += Number(o.subtotal);
        }
      });

      // Calculate stats from all orders
      const totalOrders = allOrders.length;
      const totalRevenue = allOrders.reduce((sum, o) => sum + Number(o.subtotal), 0);
      const orgEarnings = totalRevenue * (campaign.organization_margin_percent / 100);
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      const paidOrders = allOrders.filter(o => o.payment_status === "paid").length;
      const pendingOrders = allOrders.filter(o => o.payment_status === "pending").length;

      // Calculate fulfillment breakdown (from all orders)
      const fulfillmentBreakdown: FulfillmentBreakdown = {
        pending: allOrders.filter(o => o.fulfillment_status === "pending").length,
        in_production: allOrders.filter(o => o.fulfillment_status === "in_production").length,
        ready: allOrders.filter(o => o.fulfillment_status === "ready").length,
        picked_up: allOrders.filter(o => o.fulfillment_status === "picked_up").length,
      };

      // Transform products
      const products = (campaignProducts || []).map(cp => ({
        id: cp.id,
        name: (cp.product as any)?.name || "Unknown",
        retailPrice: Number(cp.retail_price),
        quantitySold: productQuantities[cp.id] || 0,
        revenue: (productQuantities[cp.id] || 0) * Number(cp.retail_price),
      }));

      // Transform students - use calculated stats from orders, not stale db data
      const students = (campaignStudents || []).map(cs => {
        const stats = studentStats[cs.student?.id || ''] || { orderCount: 0, totalSales: 0 };
        return {
          id: cs.student?.id || cs.id,
          name: cs.student?.name || "Unknown",
          magicLinkCode: cs.magic_link_code,
          orderCount: stats.orderCount,
          totalSales: stats.totalSales,
        };
      }).sort((a, b) => b.totalSales - a.totalSales);

      // Transform orders (show all orders, include payment status)
      const transformedOrders = allOrders.map(o => ({
        id: o.id,
        orderNumber: o.order_number,
        customerName: (o.customer as any)?.full_name || "Unknown",
        studentName: o.attributed_student_id ? studentNameMap[o.attributed_student_id] || null : null,
        total: Number(o.total),
        fulfillmentStatus: o.fulfillment_status,
        paymentStatus: o.payment_status,
        createdAt: o.created_at || "",
      }));

      // Calculate sales by day
      const salesByDayMap: Record<string, { orders: number; revenue: number }> = {};
      allOrders.forEach(o => {
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
      const allOrdersForPayments = allOrders.map(o => ({
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
        allOrders: allOrdersForPayments,
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

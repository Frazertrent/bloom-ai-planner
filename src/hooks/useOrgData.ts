import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useBloomFundrAuth } from "@/contexts/BloomFundrAuthContext";
import type { 
  BFOrganization, 
  OrgDashboardStats, 
  BFCampaign, 
  BFStudent,
  CampaignStatus
} from "@/types/bloomfundr";

export function useOrgProfile() {
  const { user } = useBloomFundrAuth();

  return useQuery({
    queryKey: ["org-profile", user?.id],
    queryFn: async (): Promise<BFOrganization | null> => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from("bf_organizations")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching org profile:", error);
        return null;
      }

      return data as BFOrganization | null;
    },
    enabled: !!user?.id,
  });
}

export function useOrgStats() {
  const { data: org } = useOrgProfile();

  return useQuery({
    queryKey: ["org-stats", org?.id],
    queryFn: async (): Promise<OrgDashboardStats> => {
      if (!org?.id) {
        return {
          total_students: 0,
          active_campaigns: 0,
          total_orders: 0,
          total_raised: 0,
        };
      }

      // Get student count
      const { count: studentCount } = await supabase
        .from("bf_students")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", org.id)
        .eq("is_active", true);

      // Get active campaigns count
      const { count: campaignCount } = await supabase
        .from("bf_campaigns")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", org.id)
        .eq("status", "active");

      // Get total paid orders count
      const { data: campaigns } = await supabase
        .from("bf_campaigns")
        .select("id")
        .eq("organization_id", org.id);

      let totalOrders = 0;

      if (campaigns && campaigns.length > 0) {
        const campaignIds = campaigns.map((c) => c.id);

        const { count: orderCount } = await supabase
          .from("bf_orders")
          .select("*", { count: "exact", head: true })
          .in("campaign_id", campaignIds)
          .eq("payment_status", "paid");

        totalOrders = orderCount || 0;
      }

      // Use persistent lifetime earnings from org profile
      const totalRaised = Number(org.total_lifetime_earnings) || 0;

      return {
        total_students: studentCount || 0,
        active_campaigns: campaignCount || 0,
        total_orders: totalOrders,
        total_raised: totalRaised,
      };
    },
    enabled: !!org?.id,
  });
}

export function useOrgCampaigns(status?: CampaignStatus | "all") {
  const { data: org } = useOrgProfile();

  return useQuery({
    queryKey: ["org-campaigns", org?.id, status],
    queryFn: async (): Promise<BFCampaign[]> => {
      if (!org?.id) return [];

      let query = supabase
        .from("bf_campaigns")
        .select("*")
        .eq("organization_id", org.id)
        .order("created_at", { ascending: false });

      if (status && status !== "all") {
        query = query.eq("status", status);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching campaigns:", error);
        return [];
      }

      return (data || []).map((c) => ({
        ...c,
        status: c.status as CampaignStatus,
        tracking_mode: c.tracking_mode as 'none' | 'individual' | 'self_register',
      }));
    },
    enabled: !!org?.id,
  });
}

export function useOrgStudents() {
  const { data: org } = useOrgProfile();

  return useQuery({
    queryKey: ["org-students", org?.id],
    queryFn: async (): Promise<BFStudent[]> => {
      if (!org?.id) return [];

      const { data, error } = await supabase
        .from("bf_students")
        .select("*")
        .eq("organization_id", org.id)
        .order("name");

      if (error) {
        console.error("Error fetching students:", error);
        return [];
      }

      return data || [];
    },
    enabled: !!org?.id,
  });
}

interface TopSeller {
  student_id: string;
  student_name: string;
  total_sales: number;
  order_count: number;
}

export function useTopSellers(limit: number = 5) {
  const { data: org } = useOrgProfile();

  return useQuery({
    queryKey: ["org-top-sellers", org?.id, limit],
    queryFn: async (): Promise<TopSeller[]> => {
      if (!org?.id) return [];

      // Get campaigns for this org
      const { data: campaigns } = await supabase
        .from("bf_campaigns")
        .select("id")
        .eq("organization_id", org.id);

      if (!campaigns || campaigns.length === 0) return [];

      const campaignIds = campaigns.map((c) => c.id);

      // Get campaign students with sales
      const { data: campaignStudents } = await supabase
        .from("bf_campaign_students")
        .select("student_id, total_sales, order_count")
        .in("campaign_id", campaignIds);

      if (!campaignStudents || campaignStudents.length === 0) return [];

      // Aggregate by student
      const studentTotals = new Map<string, { total_sales: number; order_count: number }>();
      
      campaignStudents.forEach((cs) => {
        const existing = studentTotals.get(cs.student_id) || { total_sales: 0, order_count: 0 };
        existing.total_sales += Number(cs.total_sales || 0);
        existing.order_count += Number(cs.order_count || 0);
        studentTotals.set(cs.student_id, existing);
      });

      // Get student names
      const studentIds = Array.from(studentTotals.keys());
      const { data: students } = await supabase
        .from("bf_students")
        .select("id, name")
        .in("id", studentIds);

      const studentNameMap = new Map(students?.map((s) => [s.id, s.name]) || []);

      // Build and sort result
      const result: TopSeller[] = [];
      studentTotals.forEach((totals, studentId) => {
        result.push({
          student_id: studentId,
          student_name: studentNameMap.get(studentId) || "Unknown",
          total_sales: totals.total_sales,
          order_count: totals.order_count,
        });
      });

      result.sort((a, b) => b.total_sales - a.total_sales);
      return result.slice(0, limit);
    },
    enabled: !!org?.id,
  });
}

interface ReadyOrdersData {
  totalReady: number;
  byCampaign: {
    campaignId: string;
    campaignName: string;
    floristName: string;
    readyCount: number;
  }[];
}

export function useOrgReadyOrders() {
  const { data: org } = useOrgProfile();

  return useQuery({
    queryKey: ["org-ready-orders", org?.id],
    queryFn: async (): Promise<ReadyOrdersData> => {
      if (!org?.id) {
        return { totalReady: 0, byCampaign: [] };
      }

      // Get campaigns for this org with florist info
      const { data: campaigns } = await supabase
        .from("bf_campaigns")
        .select("id, name, florist_id")
        .eq("organization_id", org.id)
        .in("status", ["active", "closed"]);

      if (!campaigns || campaigns.length === 0) {
        return { totalReady: 0, byCampaign: [] };
      }

      // Get florist names
      const floristIds = [...new Set(campaigns.map(c => c.florist_id))];
      const { data: florists } = await supabase
        .from("bf_florists")
        .select("id, business_name")
        .in("id", floristIds);

      const floristMap = new Map(florists?.map(f => [f.id, f.business_name]) || []);

      const campaignIds = campaigns.map(c => c.id);

      // Get ready orders grouped by campaign
      const { data: readyOrders } = await supabase
        .from("bf_orders")
        .select("id, campaign_id")
        .in("campaign_id", campaignIds)
        .eq("fulfillment_status", "ready");

      if (!readyOrders || readyOrders.length === 0) {
        return { totalReady: 0, byCampaign: [] };
      }

      // Group by campaign
      const countByCampaign = new Map<string, number>();
      readyOrders.forEach(order => {
        const current = countByCampaign.get(order.campaign_id) || 0;
        countByCampaign.set(order.campaign_id, current + 1);
      });

      const byCampaign = campaigns
        .filter(c => countByCampaign.has(c.id))
        .map(c => ({
          campaignId: c.id,
          campaignName: c.name,
          floristName: floristMap.get(c.florist_id) || "Unknown Florist",
          readyCount: countByCampaign.get(c.id) || 0,
        }))
        .sort((a, b) => b.readyCount - a.readyCount);

      return {
        totalReady: readyOrders.length,
        byCampaign,
      };
    },
    enabled: !!org?.id,
  });
}

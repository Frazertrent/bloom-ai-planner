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

      // Get campaign IDs for order queries
      const { data: campaigns } = await supabase
        .from("bf_campaigns")
        .select("id, organization_margin_percent")
        .eq("organization_id", org.id);

      let totalOrders = 0;
      let totalRaised = 0;

      if (campaigns && campaigns.length > 0) {
        const campaignIds = campaigns.map((c) => c.id);

        // Get paid orders
        const { data: orders } = await supabase
          .from("bf_orders")
          .select("campaign_id, subtotal")
          .in("campaign_id", campaignIds)
          .eq("payment_status", "paid");

        if (orders) {
          totalOrders = orders.length;
          // Calculate org portion
          orders.forEach((order) => {
            const campaign = campaigns.find((c) => c.id === order.campaign_id);
            const marginPercent = campaign?.organization_margin_percent || 0;
            totalRaised += Number(order.subtotal) * (marginPercent / 100);
          });
        }
      }

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

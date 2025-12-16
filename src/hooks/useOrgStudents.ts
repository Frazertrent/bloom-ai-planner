import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useBloomFundrAuth } from "@/contexts/BloomFundrAuthContext";
import { toast } from "sonner";
import type { BFStudent } from "@/types/bloomfundr";

interface StudentWithSales extends BFStudent {
  total_sales: number;
  order_count: number;
}

// Internal hook to get org for student operations
function useOrgForStudents() {
  const { user } = useBloomFundrAuth();
  
  return useQuery({
    queryKey: ["bf-org-for-students", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from("bf_organizations")
        .select("id, name")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (error) {
        console.error("Error fetching org:", error);
        return null;
      }
      return data;
    },
    enabled: !!user?.id,
  });
}

export function useOrgStudentsList(search?: string, teamFilter?: string) {
  const { data: org } = useOrgForStudents();

  return useQuery({
    queryKey: ["org-students-list", org?.id, search, teamFilter],
    queryFn: async (): Promise<StudentWithSales[]> => {
      if (!org?.id) return [];

      let query = supabase
        .from("bf_students")
        .select("*")
        .eq("organization_id", org.id)
        .order("name");

      if (teamFilter && teamFilter !== "all") {
        query = query.eq("team_group", teamFilter);
      }

      const { data: students, error } = await query;

      if (error) {
        console.error("Error fetching students:", error);
        return [];
      }

      if (!students || students.length === 0) return [];

      // Filter by search term
      let filteredStudents = students;
      if (search && search.trim()) {
        const searchLower = search.toLowerCase();
        filteredStudents = students.filter((s) =>
          s.name.toLowerCase().includes(searchLower) ||
          s.email?.toLowerCase().includes(searchLower) ||
          s.phone?.includes(search)
        );
      }

      // Get sales data from campaign_students
      const studentIds = filteredStudents.map((s) => s.id);
      const { data: campaignStudents } = await supabase
        .from("bf_campaign_students")
        .select("student_id, total_sales, order_count")
        .in("student_id", studentIds);

      // Aggregate sales by student
      const salesMap = new Map<string, { total_sales: number; order_count: number }>();
      campaignStudents?.forEach((cs) => {
        const existing = salesMap.get(cs.student_id) || { total_sales: 0, order_count: 0 };
        existing.total_sales += Number(cs.total_sales || 0);
        existing.order_count += Number(cs.order_count || 0);
        salesMap.set(cs.student_id, existing);
      });

      return filteredStudents.map((student) => {
        const sales = salesMap.get(student.id) || { total_sales: 0, order_count: 0 };
        return {
          ...student,
          total_sales: sales.total_sales,
          order_count: sales.order_count,
        };
      });
    },
    enabled: !!org?.id,
  });
}

export function useTeamGroups() {
  const { data: org } = useOrgForStudents();

  return useQuery({
    queryKey: ["org-team-groups", org?.id],
    queryFn: async (): Promise<string[]> => {
      if (!org?.id) return [];

      const { data, error } = await supabase
        .from("bf_students")
        .select("team_group")
        .eq("organization_id", org.id)
        .not("team_group", "is", null);

      if (error) {
        console.error("Error fetching team groups:", error);
        return [];
      }

      const teams = new Set<string>();
      data?.forEach((s) => {
        if (s.team_group) teams.add(s.team_group);
      });

      return Array.from(teams).sort();
    },
    enabled: !!org?.id,
  });
}

function generateUniqueCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

interface AddStudentData {
  name: string;
  email?: string;
  phone?: string;
  grade?: string;
  team_group?: string;
}

export function useAddStudent() {
  const queryClient = useQueryClient();
  const { data: org } = useOrgForStudents();

  return useMutation({
    mutationFn: async (data: AddStudentData) => {
      if (!org?.id) {
        throw new Error("Please wait for your organization data to load, then try again.");
      }

      const { error } = await supabase.from("bf_students").insert({
        organization_id: org.id,
        name: data.name.trim(),
        email: data.email?.trim() || null,
        phone: data.phone?.trim() || null,
        grade: data.grade || null,
        team_group: data.team_group?.trim() || null,
        unique_code: generateUniqueCode(),
        is_active: true,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org-students-list"] });
      queryClient.invalidateQueries({ queryKey: ["org-team-groups"] });
      queryClient.invalidateQueries({ queryKey: ["org-students"] });
      queryClient.invalidateQueries({ queryKey: ["org-stats"] });
      queryClient.invalidateQueries({ queryKey: ["bf-org-students-for-campaign"] });
      toast.success("Seller added successfully");
    },
    onError: (error: Error) => {
      console.error("Error adding student:", error);
      toast.error(error.message || "Failed to add seller");
    },
  });
}

interface UpdateStudentData extends AddStudentData {
  id: string;
}

export function useUpdateStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateStudentData) => {
      const { error } = await supabase
        .from("bf_students")
        .update({
          name: data.name.trim(),
          email: data.email?.trim() || null,
          phone: data.phone?.trim() || null,
          grade: data.grade || null,
          team_group: data.team_group?.trim() || null,
        })
        .eq("id", data.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org-students-list"] });
      queryClient.invalidateQueries({ queryKey: ["org-team-groups"] });
      toast.success("Student updated successfully");
    },
    onError: (error) => {
      console.error("Error updating student:", error);
      toast.error("Failed to update student");
    },
  });
}

export function useDeleteStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (studentId: string) => {
      // Soft delete - set is_active to false
      const { error } = await supabase
        .from("bf_students")
        .update({ is_active: false })
        .eq("id", studentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org-students-list"] });
      queryClient.invalidateQueries({ queryKey: ["org-stats"] });
      toast.success("Student removed successfully");
    },
    onError: (error) => {
      console.error("Error deleting student:", error);
      toast.error("Failed to remove student");
    },
  });
}

export function useToggleStudentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ studentId, isActive }: { studentId: string; isActive: boolean }) => {
      const { error } = await supabase
        .from("bf_students")
        .update({ is_active: isActive })
        .eq("id", studentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org-students-list"] });
      queryClient.invalidateQueries({ queryKey: ["org-stats"] });
      toast.success("Student status updated");
    },
    onError: (error) => {
      console.error("Error updating student status:", error);
      toast.error("Failed to update student status");
    },
  });
}

interface StudentCampaignHistory {
  campaign_id: string;
  campaign_name: string;
  total_sales: number;
  order_count: number;
  magic_link_code: string;
}

export function useStudentCampaignHistory(studentId: string | undefined) {
  return useQuery({
    queryKey: ["student-campaign-history", studentId],
    queryFn: async (): Promise<StudentCampaignHistory[]> => {
      if (!studentId) return [];

      const { data: campaignStudents, error } = await supabase
        .from("bf_campaign_students")
        .select("campaign_id, total_sales, order_count, magic_link_code")
        .eq("student_id", studentId);

      if (error) {
        console.error("Error fetching campaign history:", error);
        return [];
      }

      if (!campaignStudents || campaignStudents.length === 0) return [];

      // Get campaign names
      const campaignIds = campaignStudents.map((cs) => cs.campaign_id);
      const { data: campaigns } = await supabase
        .from("bf_campaigns")
        .select("id, name")
        .in("id", campaignIds);

      const campaignNameMap = new Map(campaigns?.map((c) => [c.id, c.name]) || []);

      return campaignStudents.map((cs) => ({
        campaign_id: cs.campaign_id,
        campaign_name: campaignNameMap.get(cs.campaign_id) || "Unknown",
        total_sales: Number(cs.total_sales || 0),
        order_count: Number(cs.order_count || 0),
        magic_link_code: cs.magic_link_code,
      }));
    },
    enabled: !!studentId,
  });
}

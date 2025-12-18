import { useState, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BFStudent, BFCampaignStudent } from "@/types/bloomfundr";
import { useOrgForCampaign } from "@/hooks/useCampaignWizard";

export interface StudentWithSales extends BFStudent {
  total_sales: number;
}

export function useOrgStudentsForCampaign() {
  const { data: org } = useOrgForCampaign();

  return useQuery({
    queryKey: ["bf-org-students-for-campaign", org?.id],
    queryFn: async () => {
      if (!org?.id) return [];

      // Get students
      const { data: students, error: studentsError } = await supabase
        .from("bf_students")
        .select("*")
        .eq("organization_id", org.id)
        .eq("is_active", true)
        .order("name");

      if (studentsError) throw studentsError;

      // Get total sales for each student from campaign_students
      const { data: salesData, error: salesError } = await supabase
        .from("bf_campaign_students")
        .select("student_id, total_sales")
        .in("student_id", students.map((s) => s.id));

      if (salesError) throw salesError;

      // Aggregate sales by student
      const salesByStudent: Record<string, number> = {};
      salesData?.forEach((s) => {
        salesByStudent[s.student_id] = 
          (salesByStudent[s.student_id] || 0) + (s.total_sales || 0);
      });

      // Combine students with their total sales
      const studentsWithSales: StudentWithSales[] = students.map((student) => ({
        ...student,
        total_sales: salesByStudent[student.id] || 0,
      }));

      return studentsWithSales;
    },
    enabled: !!org?.id,
  });
}

export function useCampaignStudents(campaignId: string | undefined) {
  return useQuery({
    queryKey: ["bf-campaign-students", campaignId],
    queryFn: async () => {
      if (!campaignId) return [];

      const { data, error } = await supabase
        .from("bf_campaign_students")
        .select("*")
        .eq("campaign_id", campaignId);

      if (error) throw error;
      return data as BFCampaignStudent[];
    },
    enabled: !!campaignId,
  });
}

function generateMagicLinkCode(campaignId: string, studentCode: string): string {
  // Take first 6 chars of campaign ID and combine with student code
  const campaignShort = campaignId.replace(/-/g, "").substring(0, 6).toUpperCase();
  return `BF-${campaignShort}-${studentCode.toUpperCase()}`;
}

export function useSaveCampaignStudents() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      campaignId,
      studentIds,
      existingStudentIds,
    }: {
      campaignId: string;
      studentIds: string[];
      existingStudentIds: string[];
    }) => {
      // Determine which students to add and which to remove
      const toAdd = studentIds.filter((id) => !existingStudentIds.includes(id));
      const toRemove = existingStudentIds.filter((id) => !studentIds.includes(id));

      // Remove unselected students
      if (toRemove.length > 0) {
        const { error: deleteError } = await supabase
          .from("bf_campaign_students")
          .delete()
          .eq("campaign_id", campaignId)
          .in("student_id", toRemove);

        if (deleteError) throw deleteError;
      }

      // Get student codes for new students
      if (toAdd.length > 0) {
        console.log("Fetching student data for IDs:", toAdd);
        const { data: studentsData, error: fetchError } = await supabase
          .from("bf_students")
          .select("id, unique_code")
          .in("id", toAdd);

        if (fetchError) {
          console.error("Error fetching students:", fetchError);
          throw fetchError;
        }

        console.log("Students data:", studentsData);

        // Create new campaign_students with magic links
        const newRecords = studentsData.map((student) => ({
          campaign_id: campaignId,
          student_id: student.id,
          magic_link_code: generateMagicLinkCode(campaignId, student.unique_code),
          total_sales: 0,
          order_count: 0,
        }));

        console.log("Inserting records:", newRecords);

        const { error: insertError } = await supabase
          .from("bf_campaign_students")
          .insert(newRecords);

        if (insertError) {
          console.error("Insert error:", insertError);
          throw insertError;
        }
        console.log("Insert successful");
      }

      return { added: toAdd.length, removed: toRemove.length };
    },
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["bf-campaign-students", variables.campaignId],
      });
      toast({
        title: "Students assigned",
        description: `${result.added} added, ${result.removed} removed.`,
      });
    },
    onError: (error) => {
      console.error("Error saving campaign students:", error);
      toast({
        title: "Error",
        description: "Failed to assign students. Please try again.",
        variant: "destructive",
      });
    },
  });
}

export function useStudentSelection(campaignId: string | undefined) {
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const { data: existingCampaignStudents } = useCampaignStudents(campaignId);
  const [initialized, setInitialized] = useState(false);

  // Initialize from existing data
  useMemo(() => {
    if (existingCampaignStudents && existingCampaignStudents.length > 0 && !initialized) {
      setSelectedStudentIds(existingCampaignStudents.map((cs) => cs.student_id));
      setInitialized(true);
    }
  }, [existingCampaignStudents, initialized]);

  const toggleStudent = (studentId: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const selectAll = (studentIds: string[]) => {
    setSelectedStudentIds(studentIds);
  };

  const deselectAll = () => {
    setSelectedStudentIds([]);
  };

  const isStudentSelected = (studentId: string) => {
    return selectedStudentIds.includes(studentId);
  };

  const existingStudentIds = existingCampaignStudents?.map((cs) => cs.student_id) || [];

  return {
    selectedStudentIds,
    toggleStudent,
    selectAll,
    deselectAll,
    isStudentSelected,
    existingStudentIds,
    setSelectedStudentIds,
  };
}

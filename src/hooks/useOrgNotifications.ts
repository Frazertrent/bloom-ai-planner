import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useOrgProfile } from "./useOrgData";

export interface OrgNotification {
  id: string;
  organization_id: string;
  title: string;
  message: string;
  notification_type: string;
  link_url: string | null;
  is_read: boolean;
  created_at: string;
}

export interface NotificationPreferences {
  notification_new_orders: boolean;
  notification_daily_summary: boolean;
  notification_campaign_alerts: boolean;
  notification_email: string | null;
}

export function useOrgNotifications() {
  const { data: org } = useOrgProfile();

  return useQuery({
    queryKey: ["org-notifications", org?.id],
    queryFn: async (): Promise<OrgNotification[]> => {
      if (!org?.id) return [];

      const { data, error } = await supabase
        .from("bf_notifications")
        .select("*")
        .eq("organization_id", org.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        console.error("Error fetching notifications:", error);
        return [];
      }

      return data || [];
    },
    enabled: !!org?.id,
  });
}

export function useUnreadNotificationCount() {
  const { data: org } = useOrgProfile();

  return useQuery({
    queryKey: ["org-notification-count", org?.id],
    queryFn: async (): Promise<number> => {
      if (!org?.id) return 0;

      const { count, error } = await supabase
        .from("bf_notifications")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", org.id)
        .eq("is_read", false);

      if (error) {
        console.error("Error fetching notification count:", error);
        return 0;
      }

      return count || 0;
    },
    enabled: !!org?.id,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  const { data: org } = useOrgProfile();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from("bf_notifications")
        .update({ is_read: true })
        .eq("id", notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org-notifications", org?.id] });
      queryClient.invalidateQueries({ queryKey: ["org-notification-count", org?.id] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  const { data: org } = useOrgProfile();

  return useMutation({
    mutationFn: async () => {
      if (!org?.id) throw new Error("No organization found");

      const { error } = await supabase
        .from("bf_notifications")
        .update({ is_read: true })
        .eq("organization_id", org.id)
        .eq("is_read", false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org-notifications", org?.id] });
      queryClient.invalidateQueries({ queryKey: ["org-notification-count", org?.id] });
    },
  });
}

export function useNotificationPreferences() {
  const { data: org } = useOrgProfile();

  return useQuery({
    queryKey: ["org-notification-preferences", org?.id],
    queryFn: async (): Promise<NotificationPreferences | null> => {
      if (!org?.id) return null;

      const { data, error } = await supabase
        .from("bf_organizations")
        .select("notification_new_orders, notification_daily_summary, notification_campaign_alerts, notification_email")
        .eq("id", org.id)
        .single();

      if (error) {
        console.error("Error fetching notification preferences:", error);
        return null;
      }

      return data as NotificationPreferences;
    },
    enabled: !!org?.id,
  });
}

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();
  const { data: org } = useOrgProfile();

  return useMutation({
    mutationFn: async (preferences: Partial<NotificationPreferences>) => {
      if (!org?.id) throw new Error("No organization found");

      const { error } = await supabase
        .from("bf_organizations")
        .update(preferences)
        .eq("id", org.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["org-notification-preferences", org?.id] });
      queryClient.invalidateQueries({ queryKey: ["org-profile", org?.user_id] });
    },
  });
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useFloristProfile } from "./useFloristData";

export interface FloristNotification {
  id: string;
  florist_id: string;
  title: string;
  message: string;
  notification_type: string;
  link_url: string | null;
  is_read: boolean;
  created_at: string;
}

export interface FloristNotificationPreferences {
  notification_new_orders: boolean;
  notification_fulfillment_reminders: boolean;
  notification_email: string | null;
}

export function useFloristNotifications() {
  const { data: florist } = useFloristProfile();

  return useQuery({
    queryKey: ["florist-notifications", florist?.id],
    queryFn: async (): Promise<FloristNotification[]> => {
      if (!florist?.id) return [];

      const { data, error } = await supabase
        .from("bf_florist_notifications")
        .select("*")
        .eq("florist_id", florist.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        console.error("Error fetching florist notifications:", error);
        return [];
      }

      return data || [];
    },
    enabled: !!florist?.id,
  });
}

export function useFloristUnreadNotificationCount() {
  const { data: florist } = useFloristProfile();

  return useQuery({
    queryKey: ["florist-notification-count", florist?.id],
    queryFn: async (): Promise<number> => {
      if (!florist?.id) return 0;

      const { count, error } = await supabase
        .from("bf_florist_notifications")
        .select("*", { count: "exact", head: true })
        .eq("florist_id", florist.id)
        .eq("is_read", false);

      if (error) {
        console.error("Error fetching florist notification count:", error);
        return 0;
      }

      return count || 0;
    },
    enabled: !!florist?.id,
  });
}

export function useMarkFloristNotificationRead() {
  const queryClient = useQueryClient();
  const { data: florist } = useFloristProfile();

  return useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from("bf_florist_notifications")
        .update({ is_read: true })
        .eq("id", notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["florist-notifications", florist?.id] });
      queryClient.invalidateQueries({ queryKey: ["florist-notification-count", florist?.id] });
    },
  });
}

export function useMarkAllFloristNotificationsRead() {
  const queryClient = useQueryClient();
  const { data: florist } = useFloristProfile();

  return useMutation({
    mutationFn: async () => {
      if (!florist?.id) throw new Error("No florist found");

      const { error } = await supabase
        .from("bf_florist_notifications")
        .update({ is_read: true })
        .eq("florist_id", florist.id)
        .eq("is_read", false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["florist-notifications", florist?.id] });
      queryClient.invalidateQueries({ queryKey: ["florist-notification-count", florist?.id] });
    },
  });
}

export function useFloristNotificationPreferences() {
  const { data: florist } = useFloristProfile();

  return useQuery({
    queryKey: ["florist-notification-preferences", florist?.id],
    queryFn: async (): Promise<FloristNotificationPreferences | null> => {
      if (!florist?.id) return null;

      const { data, error } = await supabase
        .from("bf_florists")
        .select("notification_new_orders, notification_fulfillment_reminders, notification_email")
        .eq("id", florist.id)
        .single();

      if (error) {
        console.error("Error fetching florist notification preferences:", error);
        return null;
      }

      return data as FloristNotificationPreferences;
    },
    enabled: !!florist?.id,
  });
}

export function useUpdateFloristNotificationPreferences() {
  const queryClient = useQueryClient();
  const { data: florist } = useFloristProfile();

  return useMutation({
    mutationFn: async (preferences: Partial<FloristNotificationPreferences>) => {
      if (!florist?.id) throw new Error("No florist found");

      const { error } = await supabase
        .from("bf_florists")
        .update(preferences)
        .eq("id", florist.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["florist-notification-preferences", florist?.id] });
      queryClient.invalidateQueries({ queryKey: ["florist-profile"] });
    },
  });
}

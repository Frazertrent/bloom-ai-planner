import { supabase } from "@/integrations/supabase/client";

export interface CreateNotificationParams {
  organizationId: string;
  title: string;
  message: string;
  notificationType: "order" | "campaign" | "alert" | "success" | "info";
  linkUrl?: string;
}

/**
 * Creates an in-app notification for an organization
 * This uses the service role through RLS policy that allows inserts
 */
export async function createNotification(params: CreateNotificationParams) {
  const { organizationId, title, message, notificationType, linkUrl } = params;

  const { error } = await supabase.from("bf_notifications").insert({
    organization_id: organizationId,
    title,
    message,
    notification_type: notificationType,
    link_url: linkUrl || null,
  });

  if (error) {
    console.error("Error creating notification:", error);
    // Don't throw - notifications are non-critical
  }
}

/**
 * Creates a notification for a new order
 */
export async function notifyNewOrder(params: {
  organizationId: string;
  campaignId: string;
  campaignName: string;
  orderNumber: string;
  customerName: string;
  studentName: string;
  amount: number;
}) {
  const { organizationId, campaignId, campaignName, orderNumber, customerName, studentName, amount } = params;

  await createNotification({
    organizationId,
    title: `New Order for ${campaignName}`,
    message: `${customerName} placed order ${orderNumber} ($${amount.toFixed(2)}) via ${studentName}'s link`,
    notificationType: "order",
    linkUrl: `/org/campaigns/${campaignId}`,
  });
}

/**
 * Creates a notification for campaign events
 */
export async function notifyCampaignEvent(params: {
  organizationId: string;
  campaignId: string;
  campaignName: string;
  eventType: "starting" | "ending" | "ended";
}) {
  const { organizationId, campaignId, campaignName, eventType } = params;

  const titles: Record<string, string> = {
    starting: `${campaignName} starts tomorrow!`,
    ending: `${campaignName} ends tomorrow!`,
    ended: `${campaignName} has ended - time to fulfill!`,
  };

  const messages: Record<string, string> = {
    starting: "Your campaign is starting tomorrow. Make sure all students have their links!",
    ending: "Your campaign ends tomorrow. Send a final reminder to maximize sales!",
    ended: "The campaign has ended. Review orders and prepare for fulfillment.",
  };

  await createNotification({
    organizationId,
    title: titles[eventType],
    message: messages[eventType],
    notificationType: eventType === "ended" ? "alert" : "campaign",
    linkUrl: `/org/campaigns/${campaignId}`,
  });
}

import { supabase } from "@/integrations/supabase/client";

// Organization Notifications

export interface CreateOrgNotificationParams {
  organizationId: string;
  title: string;
  message: string;
  notificationType: "order" | "campaign" | "alert" | "success" | "info";
  linkUrl?: string;
}

/**
 * Creates an in-app notification for an organization
 */
export async function createOrgNotification(params: CreateOrgNotificationParams) {
  const { organizationId, title, message, notificationType, linkUrl } = params;

  const { error } = await supabase.from("bf_notifications").insert({
    organization_id: organizationId,
    title,
    message,
    notification_type: notificationType,
    link_url: linkUrl || null,
  });

  if (error) {
    console.error("Error creating org notification:", error);
  }
}

/**
 * Creates a notification for a new order (organization)
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

  await createOrgNotification({
    organizationId,
    title: `New Order for ${campaignName}`,
    message: `${customerName} placed order ${orderNumber} ($${amount.toFixed(2)}) via ${studentName}'s link`,
    notificationType: "order",
    linkUrl: `/org/campaigns/${campaignId}`,
  });
}

/**
 * Creates a notification for campaign events (organization)
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

  await createOrgNotification({
    organizationId,
    title: titles[eventType],
    message: messages[eventType],
    notificationType: eventType === "ended" ? "alert" : "campaign",
    linkUrl: `/org/campaigns/${campaignId}`,
  });
}

// Florist Notifications

export interface CreateFloristNotificationParams {
  floristId: string;
  title: string;
  message: string;
  notificationType: "order" | "campaign" | "fulfillment" | "alert" | "success" | "info";
  linkUrl?: string;
}

/**
 * Creates an in-app notification for a florist
 */
export async function createFloristNotification(params: CreateFloristNotificationParams) {
  const { floristId, title, message, notificationType, linkUrl } = params;

  const { error } = await supabase.from("bf_florist_notifications").insert({
    florist_id: floristId,
    title,
    message,
    notification_type: notificationType,
    link_url: linkUrl || null,
  });

  if (error) {
    console.error("Error creating florist notification:", error);
  }
}

/**
 * Notifies florist of a new order
 */
export async function notifyFloristNewOrder(params: {
  floristId: string;
  campaignId: string;
  campaignName: string;
  orderNumber: string;
  customerName: string;
  amount: number;
  itemCount: number;
}) {
  const { floristId, campaignId, campaignName, orderNumber, customerName, amount, itemCount } = params;

  await createFloristNotification({
    floristId,
    title: `New Order: ${orderNumber}`,
    message: `${customerName} ordered ${itemCount} item(s) ($${amount.toFixed(2)}) for ${campaignName}`,
    notificationType: "order",
    linkUrl: `/florist/orders`,
  });
}

/**
 * Notifies florist of a new campaign invitation
 */
export async function notifyFloristCampaignInvitation(params: {
  floristId: string;
  campaignId: string;
  campaignName: string;
  organizationName: string;
  startDate: string;
  endDate: string;
}) {
  const { floristId, campaignId, campaignName, organizationName, startDate, endDate } = params;

  await createFloristNotification({
    floristId,
    title: `New Campaign: ${campaignName}`,
    message: `${organizationName} created a campaign (${startDate} - ${endDate}). Review and prepare your products!`,
    notificationType: "campaign",
    linkUrl: `/florist/campaigns/${campaignId}`,
  });
}

/**
 * Notifies florist of fulfillment reminder
 */
export async function notifyFloristFulfillmentReminder(params: {
  floristId: string;
  campaignId: string;
  campaignName: string;
  pickupDate: string;
  orderCount: number;
}) {
  const { floristId, campaignId, campaignName, pickupDate, orderCount } = params;

  await createFloristNotification({
    floristId,
    title: `Pickup Tomorrow: ${campaignName}`,
    message: `${orderCount} order(s) ready for pickup on ${pickupDate}. Ensure all items are prepared!`,
    notificationType: "fulfillment",
    linkUrl: `/florist/campaigns/${campaignId}`,
  });
}

/**
 * Notifies organization that orders are ready for pickup
 */
export async function notifyOrgOrdersReady(params: {
  organizationId: string;
  campaignId: string;
  campaignName: string;
  floristName: string;
  orderCount: number;
}) {
  const { organizationId, campaignId, campaignName, floristName, orderCount } = params;

  await createOrgNotification({
    organizationId,
    title: `Orders Ready: ${campaignName}`,
    message: `${orderCount} order(s) are ready for pickup from ${floristName}!`,
    notificationType: "success",
    linkUrl: `/org/campaigns/${campaignId}?tab=fulfillment`,
  });
}

/**
 * Notifies organization when ALL orders for a campaign are ready
 */
export async function notifyOrgAllOrdersReady(params: {
  organizationId: string;
  campaignId: string;
  campaignName: string;
  floristName: string;
  orderCount: number;
}) {
  const { organizationId, campaignId, campaignName, floristName, orderCount } = params;

  await createOrgNotification({
    organizationId,
    title: `🎉 All Orders Ready: ${campaignName}`,
    message: `All ${orderCount} orders are ready for pickup from ${floristName}! Time to collect!`,
    notificationType: "success",
    linkUrl: `/org/campaigns/${campaignId}?tab=fulfillment`,
  });
}

import { supabase } from "@/integrations/supabase/client";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  recipientName?: string;
}

interface TopSeller {
  name: string;
  totalSales: number;
  orderCount: number;
}

type EmailType = 'order_confirmation' | 'seller_welcome' | 'pickup_ready' | 'campaign_summary' | 'all_orders_ready' | 'florist_new_campaign';

interface BaseEmailData {
  type: EmailType;
  to: string;
  data: Record<string, any>;
}

export interface OrderConfirmationData {
  customerName: string;
  orderNumber: string;
  items: OrderItem[];
  subtotal: number;
  total: number;
  sellerName?: string;
  organizationName: string;
  campaignName: string;
  pickupDate?: string;
  pickupLocation?: string;
}

export interface SellerWelcomeData {
  sellerName: string;
  campaignName: string;
  organizationName: string;
  sellingLink: string;
  portalLink: string;
  startDate: string;
  endDate: string;
  pickupDate?: string;
  pickupLocation?: string;
}

export interface PickupReadyData {
  sellerName: string;
  campaignName: string;
  organizationName: string;
  orderCount: number;
  pickupDate: string;
  pickupLocation: string;
  portalLink: string;
}

export interface CampaignSummaryData {
  organizationName: string;
  campaignName: string;
  totalOrders: number;
  totalRevenue: number;
  organizationEarnings: number;
  topSellers: TopSeller[];
  dashboardLink: string;
  pickupDate?: string;
  pickupLocation?: string;
}

export interface AllOrdersReadyData {
  organizationName: string;
  campaignName: string;
  totalOrders: number;
  floristName: string;
  pickupDate?: string;
  pickupLocation?: string;
  dashboardLink: string;
}

export interface FloristNewCampaignData {
  floristName: string;
  organizationName: string;
  campaignName: string;
  startDate: string;
  endDate: string;
  pickupDate?: string;
  pickupLocation?: string;
  productCount: number;
  expectedOrders?: number;
  dashboardLink: string;
}

async function sendEmail(payload: BaseEmailData): Promise<boolean> {
  try {
    console.log(`Sending ${payload.type} email to ${payload.to}`);
    
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: payload,
    });

    if (error) {
      console.error(`Failed to send ${payload.type} email:`, error);
      return false;
    }

    console.log(`Successfully sent ${payload.type} email to ${payload.to}`);
    return true;
  } catch (error) {
    console.error(`Error sending ${payload.type} email:`, error);
    return false;
  }
}

export async function sendOrderConfirmationEmail(
  to: string,
  data: OrderConfirmationData
): Promise<boolean> {
  return sendEmail({
    type: 'order_confirmation',
    to,
    data,
  });
}

export async function sendSellerWelcomeEmail(
  to: string,
  data: SellerWelcomeData
): Promise<boolean> {
  return sendEmail({
    type: 'seller_welcome',
    to,
    data,
  });
}

export async function sendPickupReadyEmail(
  to: string,
  data: PickupReadyData
): Promise<boolean> {
  return sendEmail({
    type: 'pickup_ready',
    to,
    data,
  });
}

export async function sendCampaignSummaryEmail(
  to: string,
  data: CampaignSummaryData
): Promise<boolean> {
  return sendEmail({
    type: 'campaign_summary',
    to,
    data,
  });
}

export async function sendAllOrdersReadyEmail(
  to: string,
  data: AllOrdersReadyData
): Promise<boolean> {
  return sendEmail({
    type: 'all_orders_ready',
    to,
    data,
  });
}

export async function sendFloristNewCampaignEmail(
  to: string,
  data: FloristNewCampaignData
): Promise<boolean> {
  return sendEmail({
    type: 'florist_new_campaign',
    to,
    data,
  });
}

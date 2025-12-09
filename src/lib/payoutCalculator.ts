// Payout Calculator for BloomFundr campaigns

export interface OrderPayout {
  orderId: string;
  orderNumber: string;
  subtotal: number;
  processingFee: number;
  platformFee: number;
  floristPayout: number;
  orgPayout: number;
}

export interface PayoutBreakdown {
  totalRevenue: number;
  totalProcessingFees: number;
  totalPlatformFees: number;
  floristTotal: number;
  orgTotal: number;
  orderPayouts: OrderPayout[];
}

export interface OrderData {
  id: string;
  order_number: string;
  subtotal: number;
  processing_fee: number;
  platform_fee: number;
  payment_status: string;
}

export interface CampaignData {
  florist_margin_percent: number;
  organization_margin_percent: number;
  platform_fee_percent: number;
}

/**
 * Calculate payout breakdown for a campaign
 * Only considers paid orders
 */
export function calculateCampaignPayouts(
  orders: OrderData[],
  campaign: CampaignData
): PayoutBreakdown {
  // Filter to only paid orders
  const paidOrders = orders.filter(o => o.payment_status === 'paid');
  
  const orderPayouts: OrderPayout[] = paidOrders.map(order => {
    const subtotal = Number(order.subtotal);
    const processingFee = Number(order.processing_fee);
    const platformFee = Number(order.platform_fee);
    
    // Available for distribution = subtotal - fees
    const availableForDistribution = subtotal - processingFee - platformFee;
    
    // Calculate margins based on total margin percentage
    const totalMarginPercent = campaign.florist_margin_percent + campaign.organization_margin_percent;
    
    // Florist gets base cost + their margin
    // Organization gets their margin
    // We split the available amount proportionally based on margin percentages
    const floristShare = totalMarginPercent > 0 
      ? campaign.florist_margin_percent / totalMarginPercent
      : 0.5;
    const orgShare = totalMarginPercent > 0
      ? campaign.organization_margin_percent / totalMarginPercent
      : 0.5;
    
    // Florist gets base cost + florist margin portion
    // For simplicity, we calculate based on the actual retail price and margins
    const floristPayout = availableForDistribution * floristShare;
    const orgPayout = availableForDistribution * orgShare;
    
    return {
      orderId: order.id,
      orderNumber: order.order_number,
      subtotal,
      processingFee: roundToTwoDecimals(processingFee),
      platformFee: roundToTwoDecimals(platformFee),
      floristPayout: roundToTwoDecimals(floristPayout),
      orgPayout: roundToTwoDecimals(orgPayout),
    };
  });

  // Calculate totals
  const totalRevenue = orderPayouts.reduce((sum, o) => sum + o.subtotal, 0);
  const totalProcessingFees = orderPayouts.reduce((sum, o) => sum + o.processingFee, 0);
  const totalPlatformFees = orderPayouts.reduce((sum, o) => sum + o.platformFee, 0);
  const floristTotal = orderPayouts.reduce((sum, o) => sum + o.floristPayout, 0);
  const orgTotal = orderPayouts.reduce((sum, o) => sum + o.orgPayout, 0);

  return {
    totalRevenue: roundToTwoDecimals(totalRevenue),
    totalProcessingFees: roundToTwoDecimals(totalProcessingFees),
    totalPlatformFees: roundToTwoDecimals(totalPlatformFees),
    floristTotal: roundToTwoDecimals(floristTotal),
    orgTotal: roundToTwoDecimals(orgTotal),
    orderPayouts,
  };
}

/**
 * Calculate payout for a specific party (florist or org)
 */
export function calculatePartyPayout(
  orders: OrderData[],
  campaign: CampaignData,
  party: 'florist' | 'organization'
): number {
  const breakdown = calculateCampaignPayouts(orders, campaign);
  return party === 'florist' ? breakdown.floristTotal : breakdown.orgTotal;
}

function roundToTwoDecimals(num: number): number {
  return Math.round(num * 100) / 100;
}

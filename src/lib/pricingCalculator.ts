// Pricing Calculator for BloomFundr campaigns

export interface PricingBreakdown {
  baseCost: number;
  floristMarginPercent: number;
  orgMarginPercent: number;
  platformFeePercent: number;
  processingFeePercent: number;
  floristRevenue: number;
  orgRevenue: number;
  platformFee: number;
  processingFee: number;
  suggestedRetailPrice: number;
  minimumRetailPrice: number;
}

export interface ProductPricing {
  productId: string;
  baseCost: number;
  floristMarginPercent: number;
  orgMarginPercent: number;
  retailPrice: number;
  isCustomPrice: boolean;
}

/**
 * Calculate complete pricing breakdown for a product
 * 
 * Formula:
 * Retail = BaseCost + FloristRevenue + OrgRevenue + PlatformFee + ProcessingFee
 * 
 * Where:
 * - FloristRevenue = BaseCost * (floristMarginPercent / 100)
 * - OrgRevenue = BaseCost * (orgMarginPercent / 100)
 * - PlatformFee = Retail * (platformFeePercent / 100)
 * - ProcessingFee = Retail * (processingFeePercent / 100)
 * 
 * Solving for Retail:
 * Retail = (BaseCost * (1 + floristMargin + orgMargin)) / (1 - platformFee - processingFee)
 */
export function calculatePricing(
  baseCost: number,
  floristMarginPercent: number,
  orgMarginPercent: number,
  platformFeePercent: number = 10,
  processingFeePercent: number = 3
): PricingBreakdown {
  // Convert percentages to decimals
  const floristMargin = floristMarginPercent / 100;
  const orgMargin = orgMarginPercent / 100;
  const platformFee = platformFeePercent / 100;
  const processingFee = processingFeePercent / 100;

  // Calculate the base amount that needs to be covered
  const baseAmount = baseCost * (1 + floristMargin + orgMargin);

  // Calculate retail price that covers all fees
  // Retail - (Retail * platformFee) - (Retail * processingFee) = baseAmount
  // Retail * (1 - platformFee - processingFee) = baseAmount
  const suggestedRetailPrice = baseAmount / (1 - platformFee - processingFee);

  // Calculate individual components at the suggested price
  const floristRevenue = baseCost * floristMargin;
  const orgRevenue = baseCost * orgMargin;
  const platformFeeAmount = suggestedRetailPrice * platformFee;
  const processingFeeAmount = suggestedRetailPrice * processingFee;

  // Minimum retail price is just above cost to prevent losses
  const minimumRetailPrice = baseCost / (1 - platformFee - processingFee);

  return {
    baseCost,
    floristMarginPercent,
    orgMarginPercent,
    platformFeePercent,
    processingFeePercent,
    floristRevenue: roundToTwoDecimals(floristRevenue),
    orgRevenue: roundToTwoDecimals(orgRevenue),
    platformFee: roundToTwoDecimals(platformFeeAmount),
    processingFee: roundToTwoDecimals(processingFeeAmount),
    suggestedRetailPrice: roundToTwoDecimals(suggestedRetailPrice),
    minimumRetailPrice: roundToTwoDecimals(minimumRetailPrice),
  };
}

/**
 * Calculate actual revenue breakdown for a given retail price
 */
export function calculateRevenueAtPrice(
  baseCost: number,
  retailPrice: number,
  platformFeePercent: number = 10,
  processingFeePercent: number = 3
): {
  floristRevenue: number;
  orgRevenue: number;
  platformFee: number;
  processingFee: number;
  totalMargin: number;
  isProfitable: boolean;
} {
  const platformFee = retailPrice * (platformFeePercent / 100);
  const processingFee = retailPrice * (processingFeePercent / 100);
  const availableForMargins = retailPrice - baseCost - platformFee - processingFee;

  // Split available margin 60/40 between florist and org if positive
  const floristRevenue = availableForMargins > 0 ? availableForMargins * 0.6 : 0;
  const orgRevenue = availableForMargins > 0 ? availableForMargins * 0.4 : 0;

  return {
    floristRevenue: roundToTwoDecimals(floristRevenue),
    orgRevenue: roundToTwoDecimals(orgRevenue),
    platformFee: roundToTwoDecimals(platformFee),
    processingFee: roundToTwoDecimals(processingFee),
    totalMargin: roundToTwoDecimals(availableForMargins),
    isProfitable: availableForMargins > 0,
  };
}

/**
 * Calculate revenue projections at different sales volumes
 */
export function calculateRevenueProjections(
  products: ProductPricing[],
  volumes: number[] = [10, 50, 100]
): {
  volume: number;
  totalRevenue: number;
  floristRevenue: number;
  orgRevenue: number;
}[] {
  return volumes.map((volume) => {
    let totalRevenue = 0;
    let floristRevenue = 0;
    let orgRevenue = 0;

    products.forEach((product) => {
      const breakdown = calculatePricing(
        product.baseCost,
        product.floristMarginPercent,
        product.orgMarginPercent
      );
      
      // Use custom price or suggested price
      const price = product.isCustomPrice 
        ? product.retailPrice 
        : breakdown.suggestedRetailPrice;
      
      totalRevenue += price * volume;
      floristRevenue += breakdown.floristRevenue * volume;
      orgRevenue += breakdown.orgRevenue * volume;
    });

    // Average across products
    const productCount = products.length || 1;
    
    return {
      volume,
      totalRevenue: roundToTwoDecimals(totalRevenue / productCount),
      floristRevenue: roundToTwoDecimals(floristRevenue / productCount),
      orgRevenue: roundToTwoDecimals(orgRevenue / productCount),
    };
  });
}

function roundToTwoDecimals(num: number): number {
  return Math.round(num * 100) / 100;
}

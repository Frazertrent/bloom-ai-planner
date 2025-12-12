// Pricing Calculator for BloomFundr campaigns
// NEW MODEL: Florist sets their "Price Point" (what they receive), Org sets their profit %

export interface PricingBreakdown {
  floristPrice: number;         // What the florist receives per sale (their price point)
  orgProfitPercent: number;     // Org's profit percentage
  platformFeePercent: number;
  processingFeePercent: number;
  orgProfit: number;            // Dollar amount org earns
  platformFee: number;
  processingFee: number;
  suggestedRetailPrice: number;
  minimumRetailPrice: number;   // Minimum price to cover florist + fees (0% org profit)
}

export interface ProductPricing {
  productId: string;
  floristPrice: number;         // What florist receives (formerly baseCost)
  orgProfitPercent: number;     // Org's profit percentage
  retailPrice: number;
  isCustomPrice: boolean;
}

/**
 * Calculate complete pricing breakdown for a product
 * 
 * NEW FORMULA:
 * The florist's "Price Point" is what they receive - it's a fixed amount.
 * The retail price must cover:
 *   - Florist Price (fixed)
 *   - Org Profit (% of retail)
 *   - Platform Fee (% of retail)
 *   - Processing Fee (% of retail)
 * 
 * Solving for Retail:
 * Retail = FloristPrice / (1 - orgProfitPercent - platformFeePercent - processingFeePercent)
 */
export function calculatePricing(
  floristPrice: number,
  orgProfitPercent: number,
  platformFeePercent: number = 10,
  processingFeePercent: number = 3
): PricingBreakdown {
  // Convert percentages to decimals
  const orgProfit = orgProfitPercent / 100;
  const platformFee = platformFeePercent / 100;
  const processingFee = processingFeePercent / 100;

  // Total percentage taken from retail (org + platform + processing)
  const totalPercentages = orgProfit + platformFee + processingFee;

  // Ensure we don't divide by zero or negative
  if (totalPercentages >= 1) {
    // Invalid: percentages exceed 100%
    return {
      floristPrice,
      orgProfitPercent,
      platformFeePercent,
      processingFeePercent,
      orgProfit: 0,
      platformFee: 0,
      processingFee: 0,
      suggestedRetailPrice: floristPrice,
      minimumRetailPrice: floristPrice,
    };
  }

  // Calculate retail price: Florist Price / (1 - all percentages)
  const suggestedRetailPrice = floristPrice / (1 - totalPercentages);

  // Calculate individual components at the suggested price
  const orgProfitAmount = suggestedRetailPrice * orgProfit;
  const platformFeeAmount = suggestedRetailPrice * platformFee;
  const processingFeeAmount = suggestedRetailPrice * processingFee;

  // Minimum retail price is florist price plus fees (0% org profit)
  const minimumRetailPrice = floristPrice / (1 - platformFee - processingFee);

  return {
    floristPrice,
    orgProfitPercent,
    platformFeePercent,
    processingFeePercent,
    orgProfit: roundToTwoDecimals(orgProfitAmount),
    platformFee: roundToTwoDecimals(platformFeeAmount),
    processingFee: roundToTwoDecimals(processingFeeAmount),
    suggestedRetailPrice: roundToTwoDecimals(suggestedRetailPrice),
    minimumRetailPrice: roundToTwoDecimals(minimumRetailPrice),
  };
}

/**
 * Calculate actual revenue breakdown for a given retail price
 * Used when org sets a custom retail price
 */
export function calculateRevenueAtPrice(
  floristPrice: number,
  retailPrice: number,
  platformFeePercent: number = 10,
  processingFeePercent: number = 3
): {
  floristReceives: number;
  orgProfit: number;
  platformFee: number;
  processingFee: number;
  isProfitable: boolean;
} {
  const platformFee = retailPrice * (platformFeePercent / 100);
  const processingFee = retailPrice * (processingFeePercent / 100);
  
  // Org profit is whatever is left after florist, platform, and processing
  const orgProfit = retailPrice - floristPrice - platformFee - processingFee;

  return {
    floristReceives: roundToTwoDecimals(floristPrice),
    orgProfit: roundToTwoDecimals(Math.max(0, orgProfit)),
    platformFee: roundToTwoDecimals(platformFee),
    processingFee: roundToTwoDecimals(processingFee),
    isProfitable: orgProfit > 0,
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
        product.floristPrice,
        product.orgProfitPercent
      );
      
      // Use custom price or suggested price
      const price = product.isCustomPrice 
        ? product.retailPrice 
        : breakdown.suggestedRetailPrice;
      
      totalRevenue += price * volume;
      floristRevenue += product.floristPrice * volume;
      
      // Calculate org profit based on actual price
      const revenueAtPrice = calculateRevenueAtPrice(product.floristPrice, price);
      orgRevenue += revenueAtPrice.orgProfit * volume;
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

/**
 * Centralized link generation for BloomFundr
 * IMPORTANT: All order and campaign links must use these functions
 * to ensure consistent, correct routes that don't 404.
 * 
 * Route reference (from App.tsx):
 * - /order/:magicLinkCode - Order page for customers
 * - /join/:code - Seller self-registration page
 */

/**
 * Generate an order page link for a magic link code
 * Used for: student selling links, campaign-wide links
 */
export const generateOrderLink = (magicLinkCode: string): string => {
  return `${window.location.origin}/order/${magicLinkCode}`;
};

/**
 * Generate a seller self-registration link
 * Used for: self_register tracking mode campaigns
 */
export const generateSellerJoinLink = (selfRegisterCode: string): string => {
  return `${window.location.origin}/join/${selfRegisterCode}`;
};

/**
 * Generate a campaign-wide order link (for tracking_mode === 'none')
 * This uses the same route as individual order links
 */
export const generateCampaignLink = (campaignLinkCode: string): string => {
  return generateOrderLink(campaignLinkCode);
};

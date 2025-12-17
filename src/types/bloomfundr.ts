// BloomFundr Database Types

export type BFUserRole = 'florist' | 'org_admin' | 'org_member' | 'customer';

export type OrgType = 'school' | 'sports' | 'dance' | 'cheer' | 'church' | 'other';

export type ProductCategory = 'boutonniere' | 'corsage' | 'bouquet' | 'custom';

export type CampaignStatus = 'draft' | 'scheduled' | 'active' | 'closed' | 'fulfilled' | 'completed';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export type FulfillmentStatus = 'pending' | 'in_production' | 'ready' | 'picked_up';

export type EntryMethod = 'online' | 'manual';

export type PayoutStatus = 'pending' | 'processing' | 'completed' | 'failed';

export type RecipientType = 'florist' | 'organization';

export type TrackingMode = 'none' | 'individual' | 'self_register';

// User Profile
export interface BFUserProfile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  organization_id: string | null;
  created_at: string;
  updated_at: string;
}

// User Role
export interface BFUserRoleRecord {
  id: string;
  user_id: string;
  role: BFUserRole;
  created_at: string;
}

// Florist
export interface BFFlorist {
  id: string;
  user_id: string;
  business_name: string;
  business_address: string | null;
  business_phone: string | null;
  stripe_account_id: string | null;
  is_verified: boolean;
  notification_new_orders: boolean;
  notification_fulfillment_reminders: boolean;
  notification_email: string | null;
  created_at: string;
  updated_at: string;
}

// Florist Notification
export interface BFFloristNotification {
  id: string;
  florist_id: string;
  title: string;
  message: string;
  notification_type: string;
  link_url: string | null;
  is_read: boolean;
  created_at: string;
}

// Organization
export interface BFOrganization {
  id: string;
  user_id: string;
  name: string;
  org_type: OrgType;
  address: string | null;
  contact_phone: string | null;
  stripe_account_id: string | null;
  notification_new_orders: boolean;
  notification_daily_summary: boolean;
  notification_campaign_alerts: boolean;
  notification_email: string | null;
  created_at: string;
  updated_at: string;
}

// Notification
export interface BFNotification {
  id: string;
  organization_id: string;
  title: string;
  message: string;
  notification_type: string;
  link_url: string | null;
  is_read: boolean;
  created_at: string;
}

// Product
export interface BFProduct {
  id: string;
  florist_id: string;
  name: string;
  description: string | null;
  category: ProductCategory;
  base_cost: number;
  image_url: string | null;
  is_active: boolean;
  customization_options: CustomizationOptions | null;
  created_at: string;
  updated_at: string;
}

export interface CustomizationOptions {
  colors?: string[];
  ribbon_colors?: string[];
  add_ons?: { name: string; price: number }[];
}

// Campaign
export interface BFCampaign {
  id: string;
  organization_id: string;
  florist_id: string;
  name: string;
  description: string | null;
  start_date: string;
  end_date: string;
  pickup_date: string | null;
  pickup_location: string | null;
  status: CampaignStatus;
  florist_margin_percent: number;
  organization_margin_percent: number;
  platform_fee_percent: number;
  tracking_mode: 'none' | 'individual' | 'self_register';
  self_register_code: string | null;
  campaign_link_code: string | null;
  self_registration_open: boolean;
  created_at: string;
  updated_at: string;
}

// Campaign with relations
export interface BFCampaignWithRelations extends BFCampaign {
  organization?: BFOrganization;
  florist?: BFFlorist;
  campaign_products?: BFCampaignProductWithProduct[];
  orders?: BFOrder[];
}

// Campaign Product
export interface BFCampaignProduct {
  id: string;
  campaign_id: string;
  product_id: string;
  retail_price: number;
  max_quantity: number | null;
  created_at: string;
}

export interface BFCampaignProductWithProduct extends BFCampaignProduct {
  product?: BFProduct;
}

// Student
export interface BFStudent {
  id: string;
  organization_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  grade: string | null;
  team_group: string | null;
  unique_code: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Campaign Student
export interface BFCampaignStudent {
  id: string;
  campaign_id: string;
  student_id: string;
  magic_link_code: string;
  total_sales: number;
  order_count: number;
  created_at: string;
}

export interface BFCampaignStudentWithStudent extends BFCampaignStudent {
  student?: BFStudent;
}

// Customer
export interface BFCustomer {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  created_at: string;
}

// Order
export interface BFOrder {
  id: string;
  order_number: string;
  campaign_id: string;
  customer_id: string;
  attributed_student_id: string | null;
  subtotal: number;
  platform_fee: number;
  processing_fee: number;
  total: number;
  payment_status: PaymentStatus;
  stripe_payment_intent_id: string | null;
  paid_at: string | null;
  fulfillment_status: FulfillmentStatus;
  entry_method: EntryMethod;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface BFOrderWithRelations extends BFOrder {
  customer?: BFCustomer;
  campaign?: BFCampaign;
  attributed_student?: BFStudent;
  order_items?: BFOrderItemWithProduct[];
}

// Order Item
export interface BFOrderItem {
  id: string;
  order_id: string;
  campaign_product_id: string;
  quantity: number;
  unit_price: number;
  customizations: OrderCustomizations | null;
  recipient_name: string | null;
  created_at: string;
}

export interface OrderCustomizations {
  color?: string;
  ribbon_color?: string;
  add_ons?: string[];
  special_instructions?: string;
}

export interface BFOrderItemWithProduct extends BFOrderItem {
  campaign_product?: BFCampaignProductWithProduct;
}

// Payout
export interface BFPayout {
  id: string;
  campaign_id: string;
  recipient_type: RecipientType;
  recipient_id: string;
  amount: number;
  status: PayoutStatus;
  stripe_transfer_id: string | null;
  processed_at: string | null;
  created_at: string;
}

// Dashboard Stats
export interface FloristDashboardStats {
  total_products: number;
  active_campaigns: number;
  pending_orders: number;
  total_earnings: number;
}

export interface OrgDashboardStats {
  total_students: number;
  active_campaigns: number;
  total_orders: number;
  total_raised: number;
}

// Campaign Summary for Dashboard
export interface CampaignSummary {
  id: string;
  name: string;
  status: CampaignStatus;
  start_date: string;
  end_date: string;
  total_orders: number;
  total_sales: number;
  organization_name?: string;
  florist_name?: string;
}

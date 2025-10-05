// src/types/phase1.ts
// Type definitions for Phase 1 tables and enhanced fields

// ============================================================================
// ENUMS AND CONSTANTS
// ============================================================================

export const EVENT_PHASES = [
  'lead',
  'consultation',
  'design',
  'ordering',
  'processing',
  'production',
  'delivery',
  'closeout'
] as const;

export type EventPhase = typeof EVENT_PHASES[number];

export const ORDER_STATUS = [
  'draft',
  'pending',
  'confirmed',
  'ordered',
  'shipped',
  'delivered',
  'cancelled'
] as const;

export type OrderStatus = typeof ORDER_STATUS[number];

export const PRODUCTION_PHASES = [
  'receiving',
  'processing',
  'building',
  'quality_check',
  'packing'
] as const;

export type ProductionPhase = typeof PRODUCTION_PHASES[number];

export const PRODUCTION_STATUS = [
  'not_started',
  'in_progress',
  'completed',
  'on_hold',
  'issue'
] as const;

export type ProductionStatus = typeof PRODUCTION_STATUS[number];

export const DELIVERY_STATUS = [
  'scheduled',
  'loading',
  'in_transit',
  'arrived',
  'setting_up',
  'completed',
  'issue'
] as const;

export type DeliveryStatus = typeof DELIVERY_STATUS[number];

export const SUBSTITUTION_REASONS = [
  'unavailable',
  'poor_quality',
  'price',
  'seasonal',
  'client_request',
  'design_improvement',
  'other'
] as const;

export type SubstitutionReason = typeof SUBSTITUTION_REASONS[number];

export const RECONCILIATION_STATUS = [
  'draft',
  'in_progress',
  'completed',
  'approved'
] as const;

export type ReconciliationStatus = typeof RECONCILIATION_STATUS[number];

// ============================================================================
// ENHANCED EXISTING TABLE TYPES
// ============================================================================

export interface EnhancedEvent {
  id: string;
  organization_id: string;
  client_id: string;
  title: string;
  event_type: string;
  status: string;
  
  // Phase tracking (new)
  current_phase: EventPhase;
  order_deadline_date?: string;
  processing_date?: string;
  production_date?: string;
  
  // Dates
  consultation_date?: string;
  event_date: string;
  delivery_date?: string;
  setup_start_time?: string;
  event_start_time?: string;
  event_end_time?: string;
  
  // Event details
  venues: Array<{
    name: string;
    address?: string;
  }>;
  guest_count?: number;
  
  // Budget
  budget_target?: number;
  quoted_amount?: number;
  final_amount?: number;
  
  // Metadata
  created_at: string;
  updated_at: string;
}

export interface EnhancedConsultation {
  id: string;
  event_id: string;
  organization_id: string;
  consultation_date: string;
  audio_url?: string;
  transcript?: string;
  notes?: string;
  duration_minutes?: number;
  
  // Structured data (new)
  questionnaire_responses?: Record<string, string | number | boolean | null>;
  client_preferences?: Record<string, string | number | boolean | null>;
  venue_requirements?: Record<string, string | number | boolean | null>;
  key_points?: {
    colors?: string[];
    flowers?: string[];
    themes?: string[];
    special_requests?: string[];
  };
  
  created_at: string;
  updated_at: string;
}

export interface EnhancedTimelineTask {
  id: string;
  event_id: string;
  task_name: string;
  description?: string;
  
  // Phase tracking (new)
  phase?: EventPhase;
  task_type?: string;
  is_critical?: boolean;
  depends_on_task_ids?: string[];
  checklist?: Array<{
    item: string;
    completed: boolean;
  }>;
  weather_dependent?: boolean;
  
  // Dates and status
  start_date?: string;
  end_date?: string;
  order_by_date?: string;
  status: string;
  priority: string;
  assigned_to?: string;
  milestone: boolean;
  sort_order: number;
  
  created_at: string;
  updated_at: string;
}

export interface EnhancedFlowerCatalog {
  id: string;
  organization_id: string;
  name: string;
  variety?: string;
  color?: string;
  base_price: number;
  unit: string;
  
  // Enhanced tracking (new)
  seasonal_availability?: Record<string, boolean>;
  price_history?: Array<{
    date: string;
    price: number;
    vendor?: string;
  }>;
  processing_waste_factor?: number;
  processing_notes?: string;
  
  // Existing fields
  bulk_pricing?: {
    quantity: number;
    price: number;
  }[];
  seasonal_months?: string;
  is_year_round: boolean;
  availability_notes?: string;
  preferred_vendor?: string;
  vendor_sku?: string;
  lead_time_days?: number;
  color_hex?: string;
  image_url?: string;
  notes?: string;
  is_active: boolean;
  last_price_update?: string;
  
  created_at: string;
  updated_at: string;
}

// ============================================================================
// NEW TABLE TYPES
// ============================================================================

export interface FlowerOrder {
  id: string;
  organization_id: string;
  event_id?: string;
  vendor_name: string;
  vendor_contact?: string;
  order_number?: string;
  order_date: string;
  needed_by_date: string;
  delivery_date?: string;
  delivery_time?: string;
  status: OrderStatus;
  
  // Costs
  total_cost: number;
  tax_amount: number;
  shipping_cost: number;
  grand_total: number;
  
  // Payment
  payment_terms?: string;
  payment_status: 'unpaid' | 'deposit' | 'paid' | 'refunded';
  
  // Details
  delivery_instructions?: string;
  special_requests?: string;
  confirmed_by?: string;
  confirmed_at?: string;
  notes?: string;
  
  created_at: string;
  updated_at: string;
}

export interface FlowerOrderItem {
  id: string;
  order_id: string;
  catalog_item_id?: string;
  catalog_item_type?: string;
  item_name: string;
  variety?: string;
  color?: string;
  quantity: number;
  unit: string;
  unit_price: number;
  total_price: number;
  notes?: string;
  
  created_at: string;
  updated_at: string;
}

export interface ProductionTracking {
  id: string;
  organization_id: string;
  event_id: string;
  order_id?: string;
  phase: ProductionPhase;
  started_at: string;
  completed_at?: string;
  assigned_to?: string;
  status: ProductionStatus;
  
  // Environment
  location?: string;
  temperature_logged: boolean;
  temperature_value?: number;
  
  // Quality
  quality_notes?: string;
  issues?: Array<{
    type: string;
    description: string;
    quantity_affected?: number;
  }>;
  photos?: string[];
  
  // Progress tracking
  checklist?: Array<{
    item: string;
    completed: boolean;
  }>;
  actual_waste_percentage?: number;
  notes?: string;
  
  created_at: string;
  updated_at: string;
}

export interface DeliveryTracking {
  id: string;
  organization_id: string;
  event_id: string;
  delivery_date: string;
  
  // Times
  departure_time?: string;
  arrival_time?: string;
  setup_start_time?: string;
  setup_complete_time?: string;
  
  // Team
  driver_id?: string;
  setup_team?: string[];
  vehicle_used?: string;
  mileage_start?: number;
  mileage_end?: number;
  
  // Status
  status: DeliveryStatus;
  
  // Venue info
  venue_contact_name?: string;
  venue_contact_phone?: string;
  venue_access_notes?: string;
  parking_notes?: string;
  
  // Checklists
  load_checklist?: Array<{
    item: string;
    completed: boolean;
  }>;
  setup_checklist?: Array<{
    item: string;
    completed: boolean;
  }>;
  
  // Completion
  client_walkthrough_completed: boolean;
  client_signature_url?: string;
  photos_before?: string[];
  photos_after?: string[];
  
  // Issues
  issues?: Array<{
    type: string;
    description: string;
    resolved: boolean;
  }>;
  weather_conditions?: string;
  temperature_concerns: boolean;
  notes?: string;
  
  created_at: string;
  updated_at: string;
}

export interface EventFinancials {
  id: string;
  organization_id: string;
  event_id: string;
  
  // Revenue
  quoted_amount?: number;
  contract_amount?: number;
  deposit_amount?: number;
  deposit_received_date?: string;
  final_payment_amount?: number;
  final_payment_received_date?: string;
  total_revenue?: number;
  
  // Costs
  flower_cost: number;
  labor_cost: number;
  rental_cost: number;
  delivery_cost: number;
  supplies_cost: number;
  other_costs: number;
  total_costs: number;
  
  // Profitability
  gross_profit?: number;
  gross_margin_percentage?: number;
  net_profit?: number;
  net_margin_percentage?: number;
  
  // Variance
  budget_variance?: number;
  budget_variance_percentage?: number;
  
  // Time tracking
  estimated_hours?: number;
  actual_hours?: number;
  labor_efficiency_percentage?: number;
  
  // Status
  reconciliation_status: ReconciliationStatus;
  reconciled_by?: string;
  reconciled_at?: string;
  notes?: string;
  
  created_at: string;
  updated_at: string;
}

export interface SubstitutionMade {
  id: string;
  organization_id: string;
  event_id: string;
  
  // Original item
  original_item_id?: string;
  original_item_name: string;
  original_variety?: string;
  original_color?: string;
  
  // Substitute item
  substitute_item_id?: string;
  substitute_item_name: string;
  substitute_variety?: string;
  substitute_color?: string;
  
  // Reason
  reason: SubstitutionReason;
  reason_details?: string;
  
  // Impact
  quantity_affected?: number;
  original_unit_cost?: number;
  substitute_unit_cost?: number;
  cost_difference?: number;
  
  // Approval
  client_approved: boolean;
  approved_by?: string;
  approved_at?: string;
  
  // Tracking
  substituted_by?: string;
  substituted_at: string;
  photos?: string[];
  notes?: string;
  
  created_at: string;
  updated_at: string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export interface PhaseConfig {
  phase: EventPhase;
  label: string;
  description: string;
  minDaysBeforeEvent?: number;
  maxDaysBeforeEvent?: number;
  requiredTabs: string[];
  optionalTabs: string[];
  criticalAlerts: string[];
}

export const PHASE_CONFIGS: Record<EventPhase, PhaseConfig> = {
  lead: {
    phase: 'lead',
    label: 'Lead',
    description: 'Initial inquiry, no consultation scheduled yet',
    minDaysBeforeEvent: 90,
    requiredTabs: ['overview'],
    optionalTabs: ['budget', 'timeline'],
    criticalAlerts: ['Schedule consultation']
  },
  consultation: {
    phase: 'consultation',
    label: 'Consultation',
    description: 'Consultation scheduled or completed, gathering requirements',
    minDaysBeforeEvent: 75,
    requiredTabs: ['overview', 'budget'],
    optionalTabs: ['timeline', 'team'],
    criticalAlerts: ['Complete consultation notes', 'Create initial budget']
  },
  design: {
    phase: 'design',
    label: 'Design',
    description: 'Creating design concepts and finalizing plans',
    minDaysBeforeEvent: 14,
    requiredTabs: ['overview', 'budget', 'timeline'],
    optionalTabs: ['team'],
    criticalAlerts: ['Finalize design', 'Get client approval', 'Set order deadline']
  },
  ordering: {
    phase: 'ordering',
    label: 'Ordering',
    description: 'Placing orders with vendors',
    maxDaysBeforeEvent: 14,
    minDaysBeforeEvent: 5,
    requiredTabs: ['overview', 'budget', 'timeline', 'orders'],
    optionalTabs: ['team'],
    criticalAlerts: ['Order by deadline approaching', 'Confirm vendor orders']
  },
  processing: {
    phase: 'processing',
    label: 'Processing',
    description: 'Receiving and processing flowers',
    maxDaysBeforeEvent: 5,
    minDaysBeforeEvent: 2,
    requiredTabs: ['overview', 'timeline', 'production', 'team'],
    optionalTabs: ['budget', 'orders'],
    criticalAlerts: ['Log flower receipt', 'Track processing progress', 'Monitor temperature']
  },
  production: {
    phase: 'production',
    label: 'Production',
    description: 'Building arrangements and bouquets',
    maxDaysBeforeEvent: 2,
    minDaysBeforeEvent: 0,
    requiredTabs: ['overview', 'timeline', 'production', 'team'],
    optionalTabs: ['delivery'],
    criticalAlerts: ['Complete all arrangements', 'Quality check', 'Prepare for delivery']
  },
  delivery: {
    phase: 'delivery',
    label: 'Delivery',
    description: 'Setup and delivery day',
    maxDaysBeforeEvent: 0,
    requiredTabs: ['overview', 'timeline', 'delivery', 'team'],
    optionalTabs: ['production'],
    criticalAlerts: ['Load vehicle', 'Arrive on time', 'Complete setup', 'Get client signature']
  },
  closeout: {
    phase: 'closeout',
    label: 'Closeout',
    description: 'Event completed, reconciliation and follow-up',
    requiredTabs: ['overview', 'financials'],
    optionalTabs: ['timeline', 'team'],
    criticalAlerts: ['Reconcile financials', 'Collect final payment', 'Request testimonial']
  }
};
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      activity_feed: {
        Row: {
          activity_description: string | null
          activity_title: string
          activity_type: string
          client_name: string | null
          created_at: string | null
          event_name: string | null
          icon_name: string | null
          id: string
          is_pinned: boolean | null
          is_read: boolean | null
          organization_id: string
          priority: string | null
          related_entity_id: string | null
          related_entity_type: string | null
          user_id: string | null
        }
        Insert: {
          activity_description?: string | null
          activity_title: string
          activity_type: string
          client_name?: string | null
          created_at?: string | null
          event_name?: string | null
          icon_name?: string | null
          id?: string
          is_pinned?: boolean | null
          is_read?: boolean | null
          organization_id: string
          priority?: string | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          user_id?: string | null
        }
        Update: {
          activity_description?: string | null
          activity_title?: string
          activity_type?: string
          client_name?: string | null
          created_at?: string | null
          event_name?: string | null
          icon_name?: string | null
          id?: string
          is_pinned?: boolean | null
          is_read?: boolean | null
          organization_id?: string
          priority?: string | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_feed_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_feed_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_logs: {
        Row: {
          action: string
          created_at: string | null
          description: string | null
          entity_id: string
          entity_type: string
          id: string
          ip_address: unknown | null
          metadata: Json | null
          new_values: Json | null
          old_values: Json | null
          organization_id: string
          session_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          description?: string | null
          entity_id: string
          entity_type: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          organization_id: string
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          description?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          organization_id?: string
          session_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_items: {
        Row: {
          actual_total: number | null
          actual_unit_cost: number | null
          budget_id: string
          category: string
          client_price: number | null
          created_at: string | null
          description: string
          estimated_total: number | null
          estimated_unit_cost: number | null
          id: string
          is_approved: boolean | null
          is_optional: boolean | null
          linked_order_item_id: string | null
          linked_task_id: string | null
          markup_percentage: number | null
          notes: string | null
          organization_id: string
          quantity: number | null
          subcategory: string | null
          unit_description: string | null
          updated_at: string | null
        }
        Insert: {
          actual_total?: number | null
          actual_unit_cost?: number | null
          budget_id: string
          category: string
          client_price?: number | null
          created_at?: string | null
          description: string
          estimated_total?: number | null
          estimated_unit_cost?: number | null
          id?: string
          is_approved?: boolean | null
          is_optional?: boolean | null
          linked_order_item_id?: string | null
          linked_task_id?: string | null
          markup_percentage?: number | null
          notes?: string | null
          organization_id: string
          quantity?: number | null
          subcategory?: string | null
          unit_description?: string | null
          updated_at?: string | null
        }
        Update: {
          actual_total?: number | null
          actual_unit_cost?: number | null
          budget_id?: string
          category?: string
          client_price?: number | null
          created_at?: string | null
          description?: string
          estimated_total?: number | null
          estimated_unit_cost?: number | null
          id?: string
          is_approved?: boolean | null
          is_optional?: boolean | null
          linked_order_item_id?: string | null
          linked_task_id?: string | null
          markup_percentage?: number | null
          notes?: string | null
          organization_id?: string
          quantity?: number | null
          subcategory?: string | null
          unit_description?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "budget_items_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "budget_summary"
            referencedColumns: ["budget_id"]
          },
          {
            foreignKeyName: "budget_items_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "budgets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_items_linked_order_item_id_fkey"
            columns: ["linked_order_item_id"]
            isOneToOne: false
            referencedRelation: "order_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_items_linked_task_id_fkey"
            columns: ["linked_task_id"]
            isOneToOne: false
            referencedRelation: "schedule_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      budgets: {
        Row: {
          created_at: string | null
          event_id: string
          id: string
          organization_id: string
          profit_margin_target: number | null
          status: string | null
          total_actual_cost: number | null
          total_budget: number | null
          total_estimated_cost: number | null
          updated_at: string | null
          version: number | null
        }
        Insert: {
          created_at?: string | null
          event_id: string
          id?: string
          organization_id: string
          profit_margin_target?: number | null
          status?: string | null
          total_actual_cost?: number | null
          total_budget?: number | null
          total_estimated_cost?: number | null
          updated_at?: string | null
          version?: number | null
        }
        Update: {
          created_at?: string | null
          event_id?: string
          id?: string
          organization_id?: string
          profit_margin_target?: number | null
          status?: string | null
          total_actual_cost?: number | null
          total_budget?: number | null
          total_estimated_cost?: number | null
          updated_at?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "budgets_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "event_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budgets_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budgets_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      client_status_history: {
        Row: {
          change_reason: string | null
          changed_by: string | null
          client_id: string
          created_at: string | null
          follow_up_date: string | null
          id: string
          lead_source: string | null
          lead_temperature: string | null
          new_status: string
          old_status: string | null
          organization_id: string
        }
        Insert: {
          change_reason?: string | null
          changed_by?: string | null
          client_id: string
          created_at?: string | null
          follow_up_date?: string | null
          id?: string
          lead_source?: string | null
          lead_temperature?: string | null
          new_status: string
          old_status?: string | null
          organization_id: string
        }
        Update: {
          change_reason?: string | null
          changed_by?: string | null
          client_id?: string
          created_at?: string | null
          follow_up_date?: string | null
          id?: string
          lead_source?: string | null
          lead_temperature?: string | null
          new_status?: string
          old_status?: string | null
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_status_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_status_history_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_status_history_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: Json | null
          client_type: string | null
          created_at: string | null
          email: string | null
          events_count: number | null
          first_name: string
          id: string
          last_name: string
          notes: string | null
          organization_id: string
          phone: string | null
          referral_source: string | null
          status: string | null
          total_spent: number | null
          updated_at: string | null
        }
        Insert: {
          address?: Json | null
          client_type?: string | null
          created_at?: string | null
          email?: string | null
          events_count?: number | null
          first_name: string
          id?: string
          last_name: string
          notes?: string | null
          organization_id: string
          phone?: string | null
          referral_source?: string | null
          status?: string | null
          total_spent?: number | null
          updated_at?: string | null
        }
        Update: {
          address?: Json | null
          client_type?: string | null
          created_at?: string | null
          email?: string | null
          events_count?: number | null
          first_name?: string
          id?: string
          last_name?: string
          notes?: string | null
          organization_id?: string
          phone?: string | null
          referral_source?: string | null
          status?: string | null
          total_spent?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      consultation_queue: {
        Row: {
          actual_processing_time: number | null
          consultation_id: string
          created_at: string | null
          estimated_processing_time: number | null
          extraction_status: string | null
          id: string
          last_error: string | null
          organization_id: string
          planning_status: string | null
          priority: string | null
          queue_position: number | null
          retry_count: number | null
          transcription_status: string | null
          updated_at: string | null
        }
        Insert: {
          actual_processing_time?: number | null
          consultation_id: string
          created_at?: string | null
          estimated_processing_time?: number | null
          extraction_status?: string | null
          id?: string
          last_error?: string | null
          organization_id: string
          planning_status?: string | null
          priority?: string | null
          queue_position?: number | null
          retry_count?: number | null
          transcription_status?: string | null
          updated_at?: string | null
        }
        Update: {
          actual_processing_time?: number | null
          consultation_id?: string
          created_at?: string | null
          estimated_processing_time?: number | null
          extraction_status?: string | null
          id?: string
          last_error?: string | null
          organization_id?: string
          planning_status?: string | null
          priority?: string | null
          queue_position?: number | null
          retry_count?: number | null
          transcription_status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consultation_queue_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultation_queue_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      consultations: {
        Row: {
          ai_model_version: string | null
          ai_processing_status: string | null
          audio_url: string
          consultation_type: string | null
          created_at: string | null
          duration_seconds: number | null
          error_message: string | null
          event_id: string
          file_name: string | null
          file_size: number | null
          id: string
          mime_type: string | null
          organization_id: string
          processing_completed_at: string | null
          processing_cost: number | null
          processing_started_at: string | null
          status: string | null
          transcription_cost: number | null
          updated_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          ai_model_version?: string | null
          ai_processing_status?: string | null
          audio_url: string
          consultation_type?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          error_message?: string | null
          event_id: string
          file_name?: string | null
          file_size?: number | null
          id?: string
          mime_type?: string | null
          organization_id: string
          processing_completed_at?: string | null
          processing_cost?: number | null
          processing_started_at?: string | null
          status?: string | null
          transcription_cost?: number | null
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          ai_model_version?: string | null
          ai_processing_status?: string | null
          audio_url?: string
          consultation_type?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          error_message?: string | null
          event_id?: string
          file_name?: string | null
          file_size?: number | null
          id?: string
          mime_type?: string | null
          organization_id?: string
          processing_completed_at?: string | null
          processing_cost?: number | null
          processing_started_at?: string | null
          status?: string | null
          transcription_cost?: number | null
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consultations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "event_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consultations_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      dashboard_stats: {
        Row: {
          active_events: number | null
          calculated_at: string | null
          completed_events: number | null
          created_at: string | null
          id: string
          new_clients: number | null
          new_events: number | null
          organization_id: string
          pending_consultations: number | null
          period_end: string
          period_start: string
          period_type: string
          processed_consultations: number | null
          revenue_change_percent: number | null
          total_clients: number | null
          total_revenue: number | null
          updated_at: string | null
        }
        Insert: {
          active_events?: number | null
          calculated_at?: string | null
          completed_events?: number | null
          created_at?: string | null
          id?: string
          new_clients?: number | null
          new_events?: number | null
          organization_id: string
          pending_consultations?: number | null
          period_end: string
          period_start: string
          period_type: string
          processed_consultations?: number | null
          revenue_change_percent?: number | null
          total_clients?: number | null
          total_revenue?: number | null
          updated_at?: string | null
        }
        Update: {
          active_events?: number | null
          calculated_at?: string | null
          completed_events?: number | null
          created_at?: string | null
          id?: string
          new_clients?: number | null
          new_events?: number | null
          organization_id?: string
          pending_consultations?: number | null
          period_end?: string
          period_start?: string
          period_type?: string
          processed_consultations?: number | null
          revenue_change_percent?: number | null
          total_clients?: number | null
          total_revenue?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dashboard_stats_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      design_recipes: {
        Row: {
          avg_rating: number | null
          base_stem_counts: Json
          category: string | null
          cost_per_unit: number | null
          created_at: string | null
          created_by: string | null
          description: string | null
          difficulty_level: number | null
          id: string
          is_public: boolean | null
          is_template: boolean | null
          labor_minutes: number | null
          name: string
          organization_id: string
          scaling_factors: Json | null
          seasonal_substitutions: Json | null
          times_used: number | null
          updated_at: string | null
        }
        Insert: {
          avg_rating?: number | null
          base_stem_counts?: Json
          category?: string | null
          cost_per_unit?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty_level?: number | null
          id?: string
          is_public?: boolean | null
          is_template?: boolean | null
          labor_minutes?: number | null
          name: string
          organization_id: string
          scaling_factors?: Json | null
          seasonal_substitutions?: Json | null
          times_used?: number | null
          updated_at?: string | null
        }
        Update: {
          avg_rating?: number | null
          base_stem_counts?: Json
          category?: string | null
          cost_per_unit?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty_level?: number | null
          id?: string
          is_public?: boolean | null
          is_template?: boolean | null
          labor_minutes?: number | null
          name?: string
          organization_id?: string
          scaling_factors?: Json | null
          seasonal_substitutions?: Json | null
          times_used?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "design_recipes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "design_recipes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      event_progress: {
        Row: {
          consultation_complete: boolean | null
          consultation_completed_at: string | null
          created_at: string | null
          designs_finalized: boolean | null
          designs_finalized_at: string | null
          event_completed: boolean | null
          event_completed_at: string | null
          event_id: string
          id: string
          orders_placed: boolean | null
          orders_placed_at: string | null
          organization_id: string
          overall_progress: number | null
          proposal_approved: boolean | null
          proposal_approved_at: string | null
          setup_scheduled: boolean | null
          setup_scheduled_at: string | null
          updated_at: string | null
        }
        Insert: {
          consultation_complete?: boolean | null
          consultation_completed_at?: string | null
          created_at?: string | null
          designs_finalized?: boolean | null
          designs_finalized_at?: string | null
          event_completed?: boolean | null
          event_completed_at?: string | null
          event_id: string
          id?: string
          orders_placed?: boolean | null
          orders_placed_at?: string | null
          organization_id: string
          overall_progress?: number | null
          proposal_approved?: boolean | null
          proposal_approved_at?: string | null
          setup_scheduled?: boolean | null
          setup_scheduled_at?: string | null
          updated_at?: string | null
        }
        Update: {
          consultation_complete?: boolean | null
          consultation_completed_at?: string | null
          created_at?: string | null
          designs_finalized?: boolean | null
          designs_finalized_at?: string | null
          event_completed?: boolean | null
          event_completed_at?: string | null
          event_id?: string
          id?: string
          orders_placed?: boolean | null
          orders_placed_at?: string | null
          organization_id?: string
          overall_progress?: number | null
          proposal_approved?: boolean | null
          proposal_approved_at?: string | null
          setup_scheduled?: boolean | null
          setup_scheduled_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_progress_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: true
            referencedRelation: "event_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_progress_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: true
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_progress_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      event_team_assignments: {
        Row: {
          actual_hours: number | null
          created_at: string | null
          estimated_hours: number | null
          event_id: string
          hourly_rate: number | null
          id: string
          notes: string | null
          organization_id: string
          responsibilities: Json | null
          role: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          actual_hours?: number | null
          created_at?: string | null
          estimated_hours?: number | null
          event_id: string
          hourly_rate?: number | null
          id?: string
          notes?: string | null
          organization_id: string
          responsibilities?: Json | null
          role: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          actual_hours?: number | null
          created_at?: string | null
          estimated_hours?: number | null
          event_id?: string
          hourly_rate?: number | null
          id?: string
          notes?: string | null
          organization_id?: string
          responsibilities?: Json | null
          role?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_team_assignments_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "event_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_team_assignments_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_team_assignments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_team_assignments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          assigned_florist_id: string | null
          budget_target: number | null
          client_id: string
          color_palette: Json | null
          consultation_date: string | null
          created_at: string | null
          custom_fields: Json | null
          delivery_address: Json | null
          delivery_date: string | null
          deposit_amount: number | null
          deposit_paid: boolean | null
          design_inspiration: string | null
          event_date: string
          event_end_time: string | null
          event_start_time: string | null
          event_type: string | null
          final_amount: number | null
          final_payment_received: boolean | null
          flowers_to_avoid: Json | null
          guest_count: number | null
          id: string
          must_have_flowers: Json | null
          organization_id: string
          priority: string | null
          quoted_amount: number | null
          setup_start_time: string | null
          special_instructions: string | null
          status: string | null
          style_preferences: Json | null
          tags: Json | null
          title: string
          updated_at: string | null
          venues: Json
        }
        Insert: {
          assigned_florist_id?: string | null
          budget_target?: number | null
          client_id: string
          color_palette?: Json | null
          consultation_date?: string | null
          created_at?: string | null
          custom_fields?: Json | null
          delivery_address?: Json | null
          delivery_date?: string | null
          deposit_amount?: number | null
          deposit_paid?: boolean | null
          design_inspiration?: string | null
          event_date: string
          event_end_time?: string | null
          event_start_time?: string | null
          event_type?: string | null
          final_amount?: number | null
          final_payment_received?: boolean | null
          flowers_to_avoid?: Json | null
          guest_count?: number | null
          id?: string
          must_have_flowers?: Json | null
          organization_id: string
          priority?: string | null
          quoted_amount?: number | null
          setup_start_time?: string | null
          special_instructions?: string | null
          status?: string | null
          style_preferences?: Json | null
          tags?: Json | null
          title: string
          updated_at?: string | null
          venues?: Json
        }
        Update: {
          assigned_florist_id?: string | null
          budget_target?: number | null
          client_id?: string
          color_palette?: Json | null
          consultation_date?: string | null
          created_at?: string | null
          custom_fields?: Json | null
          delivery_address?: Json | null
          delivery_date?: string | null
          deposit_amount?: number | null
          deposit_paid?: boolean | null
          design_inspiration?: string | null
          event_date?: string
          event_end_time?: string | null
          event_start_time?: string | null
          event_type?: string | null
          final_amount?: number | null
          final_payment_received?: boolean | null
          flowers_to_avoid?: Json | null
          guest_count?: number | null
          id?: string
          must_have_flowers?: Json | null
          organization_id?: string
          priority?: string | null
          quoted_amount?: number | null
          setup_start_time?: string | null
          special_instructions?: string | null
          status?: string | null
          style_preferences?: Json | null
          tags?: Json | null
          title?: string
          updated_at?: string | null
          venues?: Json
        }
        Relationships: [
          {
            foreignKeyName: "events_assigned_florist_id_fkey"
            columns: ["assigned_florist_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_campaigns: {
        Row: {
          campaign_type: string | null
          clicks: number | null
          content: Json | null
          conversions: number | null
          created_at: string | null
          end_date: string | null
          id: string
          name: string
          opens: number | null
          organization_id: string
          start_date: string | null
          status: string | null
          target_audience: Json | null
          updated_at: string | null
        }
        Insert: {
          campaign_type?: string | null
          clicks?: number | null
          content?: Json | null
          conversions?: number | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          name: string
          opens?: number | null
          organization_id: string
          start_date?: string | null
          status?: string | null
          target_audience?: Json | null
          updated_at?: string | null
        }
        Update: {
          campaign_type?: string | null
          clicks?: number | null
          content?: Json | null
          conversions?: number | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          name?: string
          opens?: number | null
          organization_id?: string
          start_date?: string | null
          status?: string | null
          target_audience?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketing_campaigns_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_label: string | null
          action_url: string | null
          category: string | null
          created_at: string | null
          delivery_method: string | null
          expires_at: string | null
          id: string
          is_read: boolean | null
          message: string
          notification_type: string
          organization_id: string
          read_at: string | null
          related_entity_id: string | null
          related_entity_type: string | null
          scheduled_for: string | null
          sent_at: string | null
          title: string
          user_id: string | null
        }
        Insert: {
          action_label?: string | null
          action_url?: string | null
          category?: string | null
          created_at?: string | null
          delivery_method?: string | null
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          notification_type: string
          organization_id: string
          read_at?: string | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          scheduled_for?: string | null
          sent_at?: string | null
          title: string
          user_id?: string | null
        }
        Update: {
          action_label?: string | null
          action_url?: string | null
          category?: string | null
          created_at?: string | null
          delivery_method?: string | null
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          notification_type?: string
          organization_id?: string
          read_at?: string | null
          related_entity_id?: string | null
          related_entity_type?: string | null
          scheduled_for?: string | null
          sent_at?: string | null
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          color: string | null
          created_at: string | null
          grade: string | null
          id: string
          name: string
          notes: string | null
          order_id: string
          organization_id: string
          quantity_ordered: number
          quantity_received: number | null
          quantity_used: number | null
          quantity_wasted: number | null
          sku: string | null
          substitution_for_item_id: string | null
          total_cost: number | null
          unit_cost: number | null
          unit_type: string | null
          updated_at: string | null
          variety: string | null
          waste_reason: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          grade?: string | null
          id?: string
          name: string
          notes?: string | null
          order_id: string
          organization_id: string
          quantity_ordered: number
          quantity_received?: number | null
          quantity_used?: number | null
          quantity_wasted?: number | null
          sku?: string | null
          substitution_for_item_id?: string | null
          total_cost?: number | null
          unit_cost?: number | null
          unit_type?: string | null
          updated_at?: string | null
          variety?: string | null
          waste_reason?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          grade?: string | null
          id?: string
          name?: string
          notes?: string | null
          order_id?: string
          organization_id?: string
          quantity_ordered?: number
          quantity_received?: number | null
          quantity_used?: number | null
          quantity_wasted?: number | null
          sku?: string | null
          substitution_for_item_id?: string | null
          total_cost?: number | null
          unit_cost?: number | null
          unit_type?: string | null
          updated_at?: string | null
          variety?: string | null
          waste_reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_substitution_for_item_id_fkey"
            columns: ["substitution_for_item_id"]
            isOneToOne: false
            referencedRelation: "order_items"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          actual_delivery_date: string | null
          confirmed_delivery_date: string | null
          created_at: string | null
          event_id: string
          id: string
          notes: string | null
          order_date: string | null
          order_number: string | null
          order_type: string | null
          organization_id: string
          requested_delivery_date: string | null
          shipping_cost: number | null
          special_instructions: string | null
          status: string | null
          subtotal: number | null
          supplier_name: string | null
          tax_amount: number | null
          total_amount: number | null
          updated_at: string | null
        }
        Insert: {
          actual_delivery_date?: string | null
          confirmed_delivery_date?: string | null
          created_at?: string | null
          event_id: string
          id?: string
          notes?: string | null
          order_date?: string | null
          order_number?: string | null
          order_type?: string | null
          organization_id: string
          requested_delivery_date?: string | null
          shipping_cost?: number | null
          special_instructions?: string | null
          status?: string | null
          subtotal?: number | null
          supplier_name?: string | null
          tax_amount?: number | null
          total_amount?: number | null
          updated_at?: string | null
        }
        Update: {
          actual_delivery_date?: string | null
          confirmed_delivery_date?: string | null
          created_at?: string | null
          event_id?: string
          id?: string
          notes?: string | null
          order_date?: string | null
          order_number?: string | null
          order_type?: string | null
          organization_id?: string
          requested_delivery_date?: string | null
          shipping_cost?: number | null
          special_instructions?: string | null
          status?: string | null
          subtotal?: number | null
          supplier_name?: string | null
          tax_amount?: number | null
          total_amount?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "event_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          address: Json | null
          business_settings: Json | null
          created_at: string | null
          email: string | null
          id: string
          logo_url: string | null
          name: string
          phone: string | null
          plan: string | null
          slug: string
          subscription_status: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address?: Json | null
          business_settings?: Json | null
          created_at?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          name: string
          phone?: string | null
          plan?: string | null
          slug: string
          subscription_status?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: Json | null
          business_settings?: Json | null
          created_at?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          phone?: string | null
          plan?: string | null
          slug?: string
          subscription_status?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      photo_collections: {
        Row: {
          client_access: boolean | null
          client_download_allowed: boolean | null
          collection_type: string | null
          cover_photo_id: string | null
          created_at: string | null
          description: string | null
          event_id: string | null
          id: string
          is_featured: boolean | null
          is_public: boolean | null
          name: string
          organization_id: string
          photo_count: number | null
          tags: Json | null
          total_size_bytes: number | null
          updated_at: string | null
        }
        Insert: {
          client_access?: boolean | null
          client_download_allowed?: boolean | null
          collection_type?: string | null
          cover_photo_id?: string | null
          created_at?: string | null
          description?: string | null
          event_id?: string | null
          id?: string
          is_featured?: boolean | null
          is_public?: boolean | null
          name: string
          organization_id: string
          photo_count?: number | null
          tags?: Json | null
          total_size_bytes?: number | null
          updated_at?: string | null
        }
        Update: {
          client_access?: boolean | null
          client_download_allowed?: boolean | null
          collection_type?: string | null
          cover_photo_id?: string | null
          created_at?: string | null
          description?: string | null
          event_id?: string | null
          id?: string
          is_featured?: boolean | null
          is_public?: boolean | null
          name?: string
          organization_id?: string
          photo_count?: number | null
          tags?: Json | null
          total_size_bytes?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_cover_photo"
            columns: ["cover_photo_id"]
            isOneToOne: false
            referencedRelation: "photos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photo_collections_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "event_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photo_collections_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photo_collections_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      photo_metadata: {
        Row: {
          ai_generated_tags: Json | null
          analysis_completed: boolean | null
          analysis_date: string | null
          color_palette: Json | null
          composition_score: number | null
          confidence_scores: Json | null
          created_at: string | null
          dominant_colors: Json | null
          id: string
          lighting_quality: string | null
          marketing_potential: string | null
          organization_id: string
          photo_id: string
          portfolio_quality: boolean | null
          social_media_ready: boolean | null
          technical_quality: string | null
          updated_at: string | null
        }
        Insert: {
          ai_generated_tags?: Json | null
          analysis_completed?: boolean | null
          analysis_date?: string | null
          color_palette?: Json | null
          composition_score?: number | null
          confidence_scores?: Json | null
          created_at?: string | null
          dominant_colors?: Json | null
          id?: string
          lighting_quality?: string | null
          marketing_potential?: string | null
          organization_id: string
          photo_id: string
          portfolio_quality?: boolean | null
          social_media_ready?: boolean | null
          technical_quality?: string | null
          updated_at?: string | null
        }
        Update: {
          ai_generated_tags?: Json | null
          analysis_completed?: boolean | null
          analysis_date?: string | null
          color_palette?: Json | null
          composition_score?: number | null
          confidence_scores?: Json | null
          created_at?: string | null
          dominant_colors?: Json | null
          id?: string
          lighting_quality?: string | null
          marketing_potential?: string | null
          organization_id?: string
          photo_id?: string
          portfolio_quality?: boolean | null
          social_media_ready?: boolean | null
          technical_quality?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "photo_metadata_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photo_metadata_photo_id_fkey"
            columns: ["photo_id"]
            isOneToOne: true
            referencedRelation: "photos"
            referencedColumns: ["id"]
          },
        ]
      }
      photos: {
        Row: {
          alt_text: string | null
          aspect_ratio: number | null
          camera_model: string | null
          category: string | null
          client_approved: boolean | null
          collection_id: string | null
          created_at: string | null
          description: string | null
          download_count: number | null
          event_id: string | null
          file_name: string
          file_size: number | null
          file_url: string
          height: number | null
          id: string
          last_accessed_at: string | null
          location: Json | null
          marketing_approved: boolean | null
          mime_type: string | null
          organization_id: string
          original_name: string | null
          social_media_approved: boolean | null
          tags: Json | null
          taken_at: string | null
          thumbnail_url: string | null
          title: string | null
          updated_at: string | null
          uploaded_by: string | null
          view_count: number | null
          width: number | null
        }
        Insert: {
          alt_text?: string | null
          aspect_ratio?: number | null
          camera_model?: string | null
          category?: string | null
          client_approved?: boolean | null
          collection_id?: string | null
          created_at?: string | null
          description?: string | null
          download_count?: number | null
          event_id?: string | null
          file_name: string
          file_size?: number | null
          file_url: string
          height?: number | null
          id?: string
          last_accessed_at?: string | null
          location?: Json | null
          marketing_approved?: boolean | null
          mime_type?: string | null
          organization_id: string
          original_name?: string | null
          social_media_approved?: boolean | null
          tags?: Json | null
          taken_at?: string | null
          thumbnail_url?: string | null
          title?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
          view_count?: number | null
          width?: number | null
        }
        Update: {
          alt_text?: string | null
          aspect_ratio?: number | null
          camera_model?: string | null
          category?: string | null
          client_approved?: boolean | null
          collection_id?: string | null
          created_at?: string | null
          description?: string | null
          download_count?: number | null
          event_id?: string | null
          file_name?: string
          file_size?: number | null
          file_url?: string
          height?: number | null
          id?: string
          last_accessed_at?: string | null
          location?: Json | null
          marketing_approved?: boolean | null
          mime_type?: string | null
          organization_id?: string
          original_name?: string | null
          social_media_approved?: boolean | null
          tags?: Json | null
          taken_at?: string | null
          thumbnail_url?: string | null
          title?: string | null
          updated_at?: string | null
          uploaded_by?: string | null
          view_count?: number | null
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "photos_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "photo_collection_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photos_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "photo_collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photos_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "event_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photos_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photos_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photos_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      schedule_tasks: {
        Row: {
          actual_cost: number | null
          assigned_to: string | null
          category: string | null
          completed_at: string | null
          completion_percentage: number | null
          created_at: string | null
          depends_on: Json | null
          description: string | null
          duration_minutes: number | null
          end_time: string | null
          estimated_cost: number | null
          id: string
          location: string | null
          notes: string | null
          organization_id: string
          priority: string | null
          required_team_size: number | null
          schedule_id: string
          start_time: string
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          actual_cost?: number | null
          assigned_to?: string | null
          category?: string | null
          completed_at?: string | null
          completion_percentage?: number | null
          created_at?: string | null
          depends_on?: Json | null
          description?: string | null
          duration_minutes?: number | null
          end_time?: string | null
          estimated_cost?: number | null
          id?: string
          location?: string | null
          notes?: string | null
          organization_id: string
          priority?: string | null
          required_team_size?: number | null
          schedule_id: string
          start_time: string
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          actual_cost?: number | null
          assigned_to?: string | null
          category?: string | null
          completed_at?: string | null
          completion_percentage?: number | null
          created_at?: string | null
          depends_on?: Json | null
          description?: string | null
          duration_minutes?: number | null
          end_time?: string | null
          estimated_cost?: number | null
          id?: string
          location?: string | null
          notes?: string | null
          organization_id?: string
          priority?: string | null
          required_team_size?: number | null
          schedule_id?: string
          start_time?: string
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "schedule_tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_tasks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_tasks_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      schedules: {
        Row: {
          created_at: string | null
          description: string | null
          event_id: string
          id: string
          name: string | null
          organization_id: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          event_id: string
          id?: string
          name?: string | null
          organization_id: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          event_id?: string
          id?: string
          name?: string | null
          organization_id?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "schedules_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "event_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedules_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedules_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      testimonials: {
        Row: {
          client_id: string | null
          client_name: string
          created_at: string | null
          event_id: string | null
          event_name: string | null
          id: string
          is_approved: boolean | null
          marketing_approved: boolean | null
          organization_id: string
          photo_provided: boolean | null
          platform: string | null
          rating: number | null
          review_date: string | null
          review_text: string
          social_media_approved: boolean | null
          updated_at: string | null
        }
        Insert: {
          client_id?: string | null
          client_name: string
          created_at?: string | null
          event_id?: string | null
          event_name?: string | null
          id?: string
          is_approved?: boolean | null
          marketing_approved?: boolean | null
          organization_id: string
          photo_provided?: boolean | null
          platform?: string | null
          rating?: number | null
          review_date?: string | null
          review_text: string
          social_media_approved?: boolean | null
          updated_at?: string | null
        }
        Update: {
          client_id?: string | null
          client_name?: string
          created_at?: string | null
          event_id?: string | null
          event_name?: string | null
          id?: string
          is_approved?: boolean | null
          marketing_approved?: boolean | null
          organization_id?: string
          photo_provided?: boolean | null
          platform?: string | null
          rating?: number | null
          review_date?: string | null
          review_text?: string
          social_media_approved?: boolean | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "testimonials_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "testimonials_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "event_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "testimonials_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "testimonials_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      time_entries: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          billable_hours: number | null
          break_minutes: number | null
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          end_time: string | null
          event_id: string | null
          hourly_rate: number | null
          id: string
          is_billable: boolean | null
          location: string | null
          organization_id: string
          start_time: string
          status: string | null
          task_id: string | null
          total_amount: number | null
          updated_at: string | null
          user_id: string
          work_type: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          billable_hours?: number | null
          break_minutes?: number | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          end_time?: string | null
          event_id?: string | null
          hourly_rate?: number | null
          id?: string
          is_billable?: boolean | null
          location?: string | null
          organization_id: string
          start_time: string
          status?: string | null
          task_id?: string | null
          total_amount?: number | null
          updated_at?: string | null
          user_id: string
          work_type?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          billable_hours?: number | null
          break_minutes?: number | null
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          end_time?: string | null
          event_id?: string | null
          hourly_rate?: number | null
          id?: string
          is_billable?: boolean | null
          location?: string | null
          organization_id?: string
          start_time?: string
          status?: string | null
          task_id?: string | null
          total_amount?: number | null
          updated_at?: string | null
          user_id?: string
          work_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "time_entries_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "event_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "schedule_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "time_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      transcripts: {
        Row: {
          clarity_score: number | null
          confidence_scores: Json | null
          consultation_id: string
          created_at: string | null
          extracted_entities: Json | null
          extraction_accuracy: number | null
          full_text: string
          id: string
          organization_id: string
          segments: Json | null
          speaker_labels: Json | null
          structured_brief: Json | null
          updated_at: string | null
          word_count: number | null
        }
        Insert: {
          clarity_score?: number | null
          confidence_scores?: Json | null
          consultation_id: string
          created_at?: string | null
          extracted_entities?: Json | null
          extraction_accuracy?: number | null
          full_text: string
          id?: string
          organization_id: string
          segments?: Json | null
          speaker_labels?: Json | null
          structured_brief?: Json | null
          updated_at?: string | null
          word_count?: number | null
        }
        Update: {
          clarity_score?: number | null
          confidence_scores?: Json | null
          consultation_id?: string
          created_at?: string | null
          extracted_entities?: Json | null
          extraction_accuracy?: number | null
          full_text?: string
          id?: string
          organization_id?: string
          segments?: Json | null
          speaker_labels?: Json | null
          structured_brief?: Json | null
          updated_at?: string | null
          word_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "transcripts_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transcripts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          availability_schedule: Json | null
          avatar: string | null
          bio: string | null
          certifications: Json | null
          created_at: string | null
          email: string
          first_name: string | null
          hire_date: string | null
          hourly_rate: number | null
          hours_this_period: number | null
          id: string
          job_title: string | null
          last_active_at: string | null
          last_name: string | null
          name: string | null
          next_assignment: string | null
          organization_id: string | null
          permissions: Json | null
          phone: string | null
          rating: number | null
          role: string | null
          skills: Json | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          availability_schedule?: Json | null
          avatar?: string | null
          bio?: string | null
          certifications?: Json | null
          created_at?: string | null
          email: string
          first_name?: string | null
          hire_date?: string | null
          hourly_rate?: number | null
          hours_this_period?: number | null
          id: string
          job_title?: string | null
          last_active_at?: string | null
          last_name?: string | null
          name?: string | null
          next_assignment?: string | null
          organization_id?: string | null
          permissions?: Json | null
          phone?: string | null
          rating?: number | null
          role?: string | null
          skills?: Json | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          availability_schedule?: Json | null
          avatar?: string | null
          bio?: string | null
          certifications?: Json | null
          created_at?: string | null
          email?: string
          first_name?: string | null
          hire_date?: string | null
          hourly_rate?: number | null
          hours_this_period?: number | null
          id?: string
          job_title?: string | null
          last_active_at?: string | null
          last_name?: string | null
          name?: string | null
          next_assignment?: string | null
          organization_id?: string | null
          permissions?: Json | null
          phone?: string | null
          rating?: number | null
          role?: string | null
          skills?: Json | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      venue_partnerships: {
        Row: {
          commission_rate: number | null
          coordinator_email: string | null
          coordinator_name: string | null
          coordinator_phone: string | null
          created_at: string | null
          events_count: number | null
          id: string
          last_contact_date: string | null
          next_followup_date: string | null
          notes: string | null
          organization_id: string
          relationship_status: string | null
          updated_at: string | null
          venue_name: string
        }
        Insert: {
          commission_rate?: number | null
          coordinator_email?: string | null
          coordinator_name?: string | null
          coordinator_phone?: string | null
          created_at?: string | null
          events_count?: number | null
          id?: string
          last_contact_date?: string | null
          next_followup_date?: string | null
          notes?: string | null
          organization_id: string
          relationship_status?: string | null
          updated_at?: string | null
          venue_name: string
        }
        Update: {
          commission_rate?: number | null
          coordinator_email?: string | null
          coordinator_name?: string | null
          coordinator_phone?: string | null
          created_at?: string | null
          events_count?: number | null
          id?: string
          last_contact_date?: string | null
          next_followup_date?: string | null
          notes?: string | null
          organization_id?: string
          relationship_status?: string | null
          updated_at?: string | null
          venue_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "venue_partnerships_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      budget_summary: {
        Row: {
          budget_id: string | null
          created_at: string | null
          event_id: string | null
          line_item_count: number | null
          organization_id: string | null
          status: string | null
          total_actual: number | null
          total_budget: number | null
          total_client_price: number | null
          total_estimated: number | null
          updated_at: string | null
          version: number | null
        }
        Relationships: [
          {
            foreignKeyName: "budgets_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "event_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budgets_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budgets_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      event_summary: {
        Row: {
          assigned_florist: string | null
          budget_target: number | null
          client_email: string | null
          client_name: string | null
          client_phone: string | null
          created_at: string | null
          deposit_paid: boolean | null
          event_date: string | null
          event_type: string | null
          final_amount: number | null
          final_payment_received: boolean | null
          guest_count: number | null
          id: string | null
          organization_id: string | null
          quoted_amount: number | null
          status: string | null
          title: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      photo_collection_summary: {
        Row: {
          client_access: boolean | null
          collection_type: string | null
          cover_photo_url: string | null
          created_at: string | null
          event_id: string | null
          event_title: string | null
          id: string | null
          is_featured: boolean | null
          is_public: boolean | null
          name: string | null
          organization_id: string | null
          photo_count: number | null
          total_size_bytes: number | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "photo_collections_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "event_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photo_collections_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "photo_collections_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      table_sizes: {
        Row: {
          attname: unknown | null
          correlation: number | null
          n_distinct: number | null
          schemaname: unknown | null
          tablename: unknown | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_event_progress: {
        Args: { event_uuid: string }
        Returns: number
      }
      get_user_organization_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      refresh_dashboard_stats: {
        Args: { org_id: string; stat_period: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

// Add these interfaces to your existing types.ts file

export interface Consultation {
  id: string;
  event_id: string;
  consultation_date: string;
  audio_url?: string;
  transcript?: string;
  notes?: string;
  duration_minutes?: number;
  key_points?: {
    colors?: string[];
    flowers?: string[];
    themes?: string[];
    special_requests?: string[];
  };
  created_at: string;
  updated_at: string;
}

export interface Quote {
  id: string;
  event_id: string;
  version_number: number;
  quote_date: string;
  total_amount: number;
  status: 'draft' | 'sent' | 'approved' | 'rejected' | 'superseded';
  notes?: string;
  is_final: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
  budget_lines?: BudgetLine[];
}

export interface BudgetLine {
  id: string;
  quote_id: string;
  category: 'flowers' | 'labor' | 'rentals' | 'delivery' | 'setup' | 'other';
  item_name: string;
  description?: string;
  quantity: number;
  unit_price: number;
  markup_percentage: number;
  total_price: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  event_id: string;
  amount: number;
  payment_date: string;
  payment_method: 'cash' | 'check' | 'credit_card' | 'bank_transfer' | 'other';
  reference_number?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface TimelineTask {
  id: string;
  event_id: string;
  task_name: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  order_by_date?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assigned_to?: string;
  dependencies?: string[];
  milestone: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface StaffAssignment {
  id: string;
  event_id: string;
  user_id?: string;
  role: 'lead_designer' | 'assistant' | 'driver' | 'setup_crew' | 'other';
  hourly_rate?: number;
  estimated_hours?: number;
  actual_hours?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface StaffAvailability {
  id: string;
  user_id?: string;
  available_date: string;
  start_time?: string;
  end_time?: string;
  all_day: boolean;
  notes?: string;
  created_at: string;
}

export interface EventDesign {
  id: string;
  event_id: string;
  color_scheme?: string[];
  style?: 'modern' | 'classic' | 'rustic' | 'romantic' | 'bohemian' | 'minimalist' | 'garden' | 'vintage' | 'elegant' | 'maximalist' | 'mountain' | 'other';
  key_flowers?: string[];
  inspiration_images?: string[];
  special_requirements?: string;
  created_at: string;
  updated_at: string;
}
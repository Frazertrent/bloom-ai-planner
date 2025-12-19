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
          ip_address: unknown
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
          ip_address?: unknown
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
          ip_address?: unknown
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
      bf_campaign_products: {
        Row: {
          campaign_id: string
          created_at: string | null
          id: string
          max_quantity: number | null
          org_profit_percent: number | null
          product_id: string
          retail_price: number
        }
        Insert: {
          campaign_id: string
          created_at?: string | null
          id?: string
          max_quantity?: number | null
          org_profit_percent?: number | null
          product_id: string
          retail_price: number
        }
        Update: {
          campaign_id?: string
          created_at?: string | null
          id?: string
          max_quantity?: number | null
          org_profit_percent?: number | null
          product_id?: string
          retail_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "bf_campaign_products_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "bf_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bf_campaign_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "bf_products"
            referencedColumns: ["id"]
          },
        ]
      }
      bf_campaign_students: {
        Row: {
          campaign_id: string
          created_at: string | null
          id: string
          magic_link_code: string
          order_count: number | null
          personal_goal: number | null
          student_id: string
          total_sales: number | null
        }
        Insert: {
          campaign_id: string
          created_at?: string | null
          id?: string
          magic_link_code: string
          order_count?: number | null
          personal_goal?: number | null
          student_id: string
          total_sales?: number | null
        }
        Update: {
          campaign_id?: string
          created_at?: string | null
          id?: string
          magic_link_code?: string
          order_count?: number | null
          personal_goal?: number | null
          student_id?: string
          total_sales?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "bf_campaign_students_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "bf_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bf_campaign_students_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "bf_students"
            referencedColumns: ["id"]
          },
        ]
      }
      bf_campaigns: {
        Row: {
          campaign_link_code: string | null
          created_at: string | null
          description: string | null
          end_date: string
          florist_id: string
          florist_margin_percent: number
          id: string
          name: string
          organization_id: string
          organization_margin_percent: number
          pickup_date: string | null
          pickup_location: string | null
          platform_fee_percent: number | null
          self_register_code: string | null
          self_registration_open: boolean | null
          start_date: string
          status: string
          tracking_mode: string | null
          updated_at: string | null
        }
        Insert: {
          campaign_link_code?: string | null
          created_at?: string | null
          description?: string | null
          end_date: string
          florist_id: string
          florist_margin_percent: number
          id?: string
          name: string
          organization_id: string
          organization_margin_percent: number
          pickup_date?: string | null
          pickup_location?: string | null
          platform_fee_percent?: number | null
          self_register_code?: string | null
          self_registration_open?: boolean | null
          start_date: string
          status?: string
          tracking_mode?: string | null
          updated_at?: string | null
        }
        Update: {
          campaign_link_code?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string
          florist_id?: string
          florist_margin_percent?: number
          id?: string
          name?: string
          organization_id?: string
          organization_margin_percent?: number
          pickup_date?: string | null
          pickup_location?: string | null
          platform_fee_percent?: number | null
          self_register_code?: string | null
          self_registration_open?: boolean | null
          start_date?: string
          status?: string
          tracking_mode?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bf_campaigns_florist_id_fkey"
            columns: ["florist_id"]
            isOneToOne: false
            referencedRelation: "bf_florists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bf_campaigns_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "bf_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      bf_customers: {
        Row: {
          created_at: string | null
          email: string
          full_name: string
          id: string
          phone: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          phone?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
        }
        Relationships: []
      }
      bf_florist_notifications: {
        Row: {
          created_at: string
          florist_id: string
          id: string
          is_read: boolean
          link_url: string | null
          message: string
          notification_type: string
          title: string
        }
        Insert: {
          created_at?: string
          florist_id: string
          id?: string
          is_read?: boolean
          link_url?: string | null
          message: string
          notification_type?: string
          title: string
        }
        Update: {
          created_at?: string
          florist_id?: string
          id?: string
          is_read?: boolean
          link_url?: string | null
          message?: string
          notification_type?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "bf_florist_notifications_florist_id_fkey"
            columns: ["florist_id"]
            isOneToOne: false
            referencedRelation: "bf_florists"
            referencedColumns: ["id"]
          },
        ]
      }
      bf_florists: {
        Row: {
          business_address: string | null
          business_name: string
          business_phone: string | null
          city: string | null
          created_at: string | null
          id: string
          is_verified: boolean | null
          notification_email: string | null
          notification_fulfillment_reminders: boolean | null
          notification_new_orders: boolean | null
          state: string | null
          stripe_account_id: string | null
          total_lifetime_earnings: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          business_address?: string | null
          business_name: string
          business_phone?: string | null
          city?: string | null
          created_at?: string | null
          id?: string
          is_verified?: boolean | null
          notification_email?: string | null
          notification_fulfillment_reminders?: boolean | null
          notification_new_orders?: boolean | null
          state?: string | null
          stripe_account_id?: string | null
          total_lifetime_earnings?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          business_address?: string | null
          business_name?: string
          business_phone?: string | null
          city?: string | null
          created_at?: string | null
          id?: string
          is_verified?: boolean | null
          notification_email?: string | null
          notification_fulfillment_reminders?: boolean | null
          notification_new_orders?: boolean | null
          state?: string | null
          stripe_account_id?: string | null
          total_lifetime_earnings?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      bf_notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          link_url: string | null
          message: string
          notification_type: string
          organization_id: string
          title: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          link_url?: string | null
          message: string
          notification_type?: string
          organization_id: string
          title: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          link_url?: string | null
          message?: string
          notification_type?: string
          organization_id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "bf_notifications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "bf_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      bf_order_items: {
        Row: {
          campaign_product_id: string
          created_at: string | null
          customizations: Json | null
          id: string
          order_id: string
          quantity: number
          recipient_name: string | null
          unit_price: number
        }
        Insert: {
          campaign_product_id: string
          created_at?: string | null
          customizations?: Json | null
          id?: string
          order_id: string
          quantity?: number
          recipient_name?: string | null
          unit_price: number
        }
        Update: {
          campaign_product_id?: string
          created_at?: string | null
          customizations?: Json | null
          id?: string
          order_id?: string
          quantity?: number
          recipient_name?: string | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "bf_order_items_campaign_product_id_fkey"
            columns: ["campaign_product_id"]
            isOneToOne: false
            referencedRelation: "bf_campaign_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bf_order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "bf_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      bf_orders: {
        Row: {
          attributed_student_id: string | null
          campaign_id: string
          created_at: string | null
          customer_id: string
          customer_name: string | null
          entry_method: string
          fulfillment_status: string
          id: string
          notes: string | null
          order_number: string
          paid_at: string | null
          payment_status: string
          platform_fee: number
          processing_fee: number
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          subtotal: number
          total: number
          updated_at: string | null
        }
        Insert: {
          attributed_student_id?: string | null
          campaign_id: string
          created_at?: string | null
          customer_id: string
          customer_name?: string | null
          entry_method?: string
          fulfillment_status?: string
          id?: string
          notes?: string | null
          order_number?: string
          paid_at?: string | null
          payment_status?: string
          platform_fee?: number
          processing_fee?: number
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          subtotal: number
          total: number
          updated_at?: string | null
        }
        Update: {
          attributed_student_id?: string | null
          campaign_id?: string
          created_at?: string | null
          customer_id?: string
          customer_name?: string | null
          entry_method?: string
          fulfillment_status?: string
          id?: string
          notes?: string | null
          order_number?: string
          paid_at?: string | null
          payment_status?: string
          platform_fee?: number
          processing_fee?: number
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          subtotal?: number
          total?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bf_orders_attributed_student_id_fkey"
            columns: ["attributed_student_id"]
            isOneToOne: false
            referencedRelation: "bf_students"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bf_orders_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "bf_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bf_orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "bf_customers"
            referencedColumns: ["id"]
          },
        ]
      }
      bf_organizations: {
        Row: {
          address: string | null
          contact_phone: string | null
          created_at: string | null
          id: string
          name: string
          notification_campaign_alerts: boolean | null
          notification_daily_summary: boolean | null
          notification_email: string | null
          notification_new_orders: boolean | null
          org_type: string
          stripe_account_id: string | null
          total_lifetime_earnings: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          name: string
          notification_campaign_alerts?: boolean | null
          notification_daily_summary?: boolean | null
          notification_email?: string | null
          notification_new_orders?: boolean | null
          org_type: string
          stripe_account_id?: string | null
          total_lifetime_earnings?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          name?: string
          notification_campaign_alerts?: boolean | null
          notification_daily_summary?: boolean | null
          notification_email?: string | null
          notification_new_orders?: boolean | null
          org_type?: string
          stripe_account_id?: string | null
          total_lifetime_earnings?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      bf_payouts: {
        Row: {
          amount: number
          campaign_id: string
          created_at: string | null
          id: string
          processed_at: string | null
          recipient_id: string
          recipient_type: string
          status: string
          stripe_transfer_id: string | null
        }
        Insert: {
          amount: number
          campaign_id: string
          created_at?: string | null
          id?: string
          processed_at?: string | null
          recipient_id: string
          recipient_type: string
          status?: string
          stripe_transfer_id?: string | null
        }
        Update: {
          amount?: number
          campaign_id?: string
          created_at?: string | null
          id?: string
          processed_at?: string | null
          recipient_id?: string
          recipient_type?: string
          status?: string
          stripe_transfer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bf_payouts_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "bf_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      bf_products: {
        Row: {
          base_cost: number
          category: string
          created_at: string | null
          customization_options: Json | null
          description: string | null
          florist_id: string
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          base_cost: number
          category: string
          created_at?: string | null
          customization_options?: Json | null
          description?: string | null
          florist_id: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          base_cost?: number
          category?: string
          created_at?: string | null
          customization_options?: Json | null
          description?: string | null
          florist_id?: string
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bf_products_florist_id_fkey"
            columns: ["florist_id"]
            isOneToOne: false
            referencedRelation: "bf_florists"
            referencedColumns: ["id"]
          },
        ]
      }
      bf_students: {
        Row: {
          created_at: string | null
          email: string | null
          grade: string | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string
          phone: string | null
          team_group: string | null
          unique_code: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          grade?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_id: string
          phone?: string | null
          team_group?: string | null
          unique_code: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          grade?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string
          phone?: string | null
          team_group?: string | null
          unique_code?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bf_students_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "bf_organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      bf_user_profiles: {
        Row: {
          created_at: string | null
          email: string
          full_name: string
          id: string
          organization_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name: string
          id?: string
          organization_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          organization_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bf_user_profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      bf_user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["bf_user_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["bf_user_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["bf_user_role"]
          user_id?: string
        }
        Relationships: []
      }
      budget_items: {
        Row: {
          actual_total: number | null
          actual_unit_cost: number | null
          budget_id: string
          catalog_item_id: string | null
          catalog_item_type: string | null
          category: string
          client_price: number | null
          cost_price: number | null
          created_at: string | null
          description: string
          estimated_total: number | null
          estimated_unit_cost: number | null
          hierarchy_path: string | null
          id: string
          is_approved: boolean | null
          is_optional: boolean | null
          item_name: string | null
          linked_order_item_id: string | null
          linked_task_id: string | null
          markup_percentage: number | null
          notes: string | null
          organization_id: string
          quantity: number | null
          recipe_id: string | null
          subcategory: string | null
          unit_description: string | null
          updated_at: string | null
          vendor: string | null
          waste_factor: number | null
        }
        Insert: {
          actual_total?: number | null
          actual_unit_cost?: number | null
          budget_id: string
          catalog_item_id?: string | null
          catalog_item_type?: string | null
          category: string
          client_price?: number | null
          cost_price?: number | null
          created_at?: string | null
          description: string
          estimated_total?: number | null
          estimated_unit_cost?: number | null
          hierarchy_path?: string | null
          id?: string
          is_approved?: boolean | null
          is_optional?: boolean | null
          item_name?: string | null
          linked_order_item_id?: string | null
          linked_task_id?: string | null
          markup_percentage?: number | null
          notes?: string | null
          organization_id: string
          quantity?: number | null
          recipe_id?: string | null
          subcategory?: string | null
          unit_description?: string | null
          updated_at?: string | null
          vendor?: string | null
          waste_factor?: number | null
        }
        Update: {
          actual_total?: number | null
          actual_unit_cost?: number | null
          budget_id?: string
          catalog_item_id?: string | null
          catalog_item_type?: string | null
          category?: string
          client_price?: number | null
          cost_price?: number | null
          created_at?: string | null
          description?: string
          estimated_total?: number | null
          estimated_unit_cost?: number | null
          hierarchy_path?: string | null
          id?: string
          is_approved?: boolean | null
          is_optional?: boolean | null
          item_name?: string | null
          linked_order_item_id?: string | null
          linked_task_id?: string | null
          markup_percentage?: number | null
          notes?: string | null
          organization_id?: string
          quantity?: number | null
          recipe_id?: string | null
          subcategory?: string | null
          unit_description?: string | null
          updated_at?: string | null
          vendor?: string | null
          waste_factor?: number | null
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
          {
            foreignKeyName: "budget_items_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "design_recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_lines: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          id: string
          item_name: string
          markup_percentage: number | null
          quantity: number | null
          quote_id: string
          sort_order: number | null
          total_price: number | null
          unit_price: number
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          item_name: string
          markup_percentage?: number | null
          quantity?: number | null
          quote_id: string
          sort_order?: number | null
          total_price?: number | null
          unit_price: number
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          item_name?: string
          markup_percentage?: number | null
          quantity?: number | null
          quote_id?: string
          sort_order?: number | null
          total_price?: number | null
          unit_price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "budget_lines_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
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
          accessibility_needs: string | null
          ai_model_version: string | null
          ai_processing_status: string | null
          allergy_concerns: string | null
          audio_url: string | null
          bridal_party_size: Json | null
          budget_flexibility: string | null
          budget_max: number | null
          budget_min: number | null
          budget_priorities: string | null
          budget_target: number | null
          ceremony_breakdown_time: string | null
          ceremony_location: string | null
          ceremony_setup_time: string | null
          client_preferences: Json | null
          color_palette: Json | null
          consultation_date: string | null
          consultation_type: string | null
          created_at: string | null
          duration_minutes: number | null
          duration_seconds: number | null
          error_message: string | null
          event_id: string
          file_name: string | null
          file_size: number | null
          flowers_to_avoid: string[] | null
          follow_up_items: string[] | null
          guest_count: number | null
          id: string
          key_points: Json | null
          mime_type: string | null
          must_have_flowers: string[] | null
          next_meeting_date: string | null
          notes: string | null
          organization_id: string
          pieces_needed: Json | null
          prep_checklist: Json | null
          processing_completed_at: string | null
          processing_cost: number | null
          processing_started_at: string | null
          proposal_id: string | null
          questionnaire_responses: Json | null
          reception_breakdown_time: string | null
          reception_location: string | null
          reception_setup_time: string | null
          referral_source: string | null
          religious_cultural_notes: string | null
          status: string | null
          style_keywords: string[] | null
          sustainability_preferences: string | null
          table_count: number | null
          transcript: string | null
          transcription_cost: number | null
          updated_at: string | null
          uploaded_by: string | null
          venue_requirements: Json | null
          venue_restrictions: string | null
        }
        Insert: {
          accessibility_needs?: string | null
          ai_model_version?: string | null
          ai_processing_status?: string | null
          allergy_concerns?: string | null
          audio_url?: string | null
          bridal_party_size?: Json | null
          budget_flexibility?: string | null
          budget_max?: number | null
          budget_min?: number | null
          budget_priorities?: string | null
          budget_target?: number | null
          ceremony_breakdown_time?: string | null
          ceremony_location?: string | null
          ceremony_setup_time?: string | null
          client_preferences?: Json | null
          color_palette?: Json | null
          consultation_date?: string | null
          consultation_type?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          duration_seconds?: number | null
          error_message?: string | null
          event_id: string
          file_name?: string | null
          file_size?: number | null
          flowers_to_avoid?: string[] | null
          follow_up_items?: string[] | null
          guest_count?: number | null
          id?: string
          key_points?: Json | null
          mime_type?: string | null
          must_have_flowers?: string[] | null
          next_meeting_date?: string | null
          notes?: string | null
          organization_id: string
          pieces_needed?: Json | null
          prep_checklist?: Json | null
          processing_completed_at?: string | null
          processing_cost?: number | null
          processing_started_at?: string | null
          proposal_id?: string | null
          questionnaire_responses?: Json | null
          reception_breakdown_time?: string | null
          reception_location?: string | null
          reception_setup_time?: string | null
          referral_source?: string | null
          religious_cultural_notes?: string | null
          status?: string | null
          style_keywords?: string[] | null
          sustainability_preferences?: string | null
          table_count?: number | null
          transcript?: string | null
          transcription_cost?: number | null
          updated_at?: string | null
          uploaded_by?: string | null
          venue_requirements?: Json | null
          venue_restrictions?: string | null
        }
        Update: {
          accessibility_needs?: string | null
          ai_model_version?: string | null
          ai_processing_status?: string | null
          allergy_concerns?: string | null
          audio_url?: string | null
          bridal_party_size?: Json | null
          budget_flexibility?: string | null
          budget_max?: number | null
          budget_min?: number | null
          budget_priorities?: string | null
          budget_target?: number | null
          ceremony_breakdown_time?: string | null
          ceremony_location?: string | null
          ceremony_setup_time?: string | null
          client_preferences?: Json | null
          color_palette?: Json | null
          consultation_date?: string | null
          consultation_type?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          duration_seconds?: number | null
          error_message?: string | null
          event_id?: string
          file_name?: string | null
          file_size?: number | null
          flowers_to_avoid?: string[] | null
          follow_up_items?: string[] | null
          guest_count?: number | null
          id?: string
          key_points?: Json | null
          mime_type?: string | null
          must_have_flowers?: string[] | null
          next_meeting_date?: string | null
          notes?: string | null
          organization_id?: string
          pieces_needed?: Json | null
          prep_checklist?: Json | null
          processing_completed_at?: string | null
          processing_cost?: number | null
          processing_started_at?: string | null
          proposal_id?: string | null
          questionnaire_responses?: Json | null
          reception_breakdown_time?: string | null
          reception_location?: string | null
          reception_setup_time?: string | null
          referral_source?: string | null
          religious_cultural_notes?: string | null
          status?: string | null
          style_keywords?: string[] | null
          sustainability_preferences?: string | null
          table_count?: number | null
          transcript?: string | null
          transcription_cost?: number | null
          updated_at?: string | null
          uploaded_by?: string | null
          venue_requirements?: Json | null
          venue_restrictions?: string | null
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
            foreignKeyName: "consultations_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
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
      delivery_tracking: {
        Row: {
          arrival_time: string | null
          client_signature_url: string | null
          client_walkthrough_completed: boolean | null
          created_at: string | null
          delivery_date: string
          departure_time: string | null
          driver_id: string | null
          event_id: string
          id: string
          issues: Json | null
          load_checklist: Json | null
          mileage_end: number | null
          mileage_start: number | null
          notes: string | null
          organization_id: string
          parking_notes: string | null
          photos_after: Json | null
          photos_before: Json | null
          setup_checklist: Json | null
          setup_complete_time: string | null
          setup_start_time: string | null
          setup_team: Json | null
          status: string | null
          temperature_concerns: boolean | null
          updated_at: string | null
          vehicle_used: string | null
          venue_access_notes: string | null
          venue_contact_name: string | null
          venue_contact_phone: string | null
          weather_conditions: string | null
        }
        Insert: {
          arrival_time?: string | null
          client_signature_url?: string | null
          client_walkthrough_completed?: boolean | null
          created_at?: string | null
          delivery_date: string
          departure_time?: string | null
          driver_id?: string | null
          event_id: string
          id?: string
          issues?: Json | null
          load_checklist?: Json | null
          mileage_end?: number | null
          mileage_start?: number | null
          notes?: string | null
          organization_id: string
          parking_notes?: string | null
          photos_after?: Json | null
          photos_before?: Json | null
          setup_checklist?: Json | null
          setup_complete_time?: string | null
          setup_start_time?: string | null
          setup_team?: Json | null
          status?: string | null
          temperature_concerns?: boolean | null
          updated_at?: string | null
          vehicle_used?: string | null
          venue_access_notes?: string | null
          venue_contact_name?: string | null
          venue_contact_phone?: string | null
          weather_conditions?: string | null
        }
        Update: {
          arrival_time?: string | null
          client_signature_url?: string | null
          client_walkthrough_completed?: boolean | null
          created_at?: string | null
          delivery_date?: string
          departure_time?: string | null
          driver_id?: string | null
          event_id?: string
          id?: string
          issues?: Json | null
          load_checklist?: Json | null
          mileage_end?: number | null
          mileage_start?: number | null
          notes?: string | null
          organization_id?: string
          parking_notes?: string | null
          photos_after?: Json | null
          photos_before?: Json | null
          setup_checklist?: Json | null
          setup_complete_time?: string | null
          setup_start_time?: string | null
          setup_team?: Json | null
          status?: string | null
          temperature_concerns?: boolean | null
          updated_at?: string | null
          vehicle_used?: string | null
          venue_access_notes?: string | null
          venue_contact_name?: string | null
          venue_contact_phone?: string | null
          weather_conditions?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "delivery_tracking_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_tracking_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "event_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_tracking_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delivery_tracking_organization_id_fkey"
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
      event_design: {
        Row: {
          color_scheme: Json | null
          created_at: string | null
          custom_flowers: Json | null
          event_id: string
          id: string
          inspiration_images: Json | null
          key_flowers: Json | null
          piece_types: Json | null
          recipe_items: Json | null
          required_pieces: Json | null
          selected_recipes: Json | null
          special_requirements: string | null
          style: string | null
          updated_at: string | null
        }
        Insert: {
          color_scheme?: Json | null
          created_at?: string | null
          custom_flowers?: Json | null
          event_id: string
          id?: string
          inspiration_images?: Json | null
          key_flowers?: Json | null
          piece_types?: Json | null
          recipe_items?: Json | null
          required_pieces?: Json | null
          selected_recipes?: Json | null
          special_requirements?: string | null
          style?: string | null
          updated_at?: string | null
        }
        Update: {
          color_scheme?: Json | null
          created_at?: string | null
          custom_flowers?: Json | null
          event_id?: string
          id?: string
          inspiration_images?: Json | null
          key_flowers?: Json | null
          piece_types?: Json | null
          recipe_items?: Json | null
          required_pieces?: Json | null
          selected_recipes?: Json | null
          special_requirements?: string | null
          style?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_design_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: true
            referencedRelation: "event_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_design_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: true
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_financials: {
        Row: {
          actual_hours: number | null
          budget_variance: number | null
          budget_variance_percentage: number | null
          contract_amount: number | null
          created_at: string | null
          delivery_cost: number | null
          deposit_amount: number | null
          deposit_received_date: string | null
          estimated_hours: number | null
          event_id: string
          final_payment_amount: number | null
          final_payment_received_date: string | null
          flower_cost: number | null
          gross_margin_percentage: number | null
          gross_profit: number | null
          id: string
          labor_cost: number | null
          labor_efficiency_percentage: number | null
          net_margin_percentage: number | null
          net_profit: number | null
          notes: string | null
          organization_id: string
          other_costs: number | null
          quoted_amount: number | null
          reconciled_at: string | null
          reconciled_by: string | null
          reconciliation_status: string | null
          rental_cost: number | null
          supplies_cost: number | null
          total_costs: number | null
          total_revenue: number | null
          updated_at: string | null
        }
        Insert: {
          actual_hours?: number | null
          budget_variance?: number | null
          budget_variance_percentage?: number | null
          contract_amount?: number | null
          created_at?: string | null
          delivery_cost?: number | null
          deposit_amount?: number | null
          deposit_received_date?: string | null
          estimated_hours?: number | null
          event_id: string
          final_payment_amount?: number | null
          final_payment_received_date?: string | null
          flower_cost?: number | null
          gross_margin_percentage?: number | null
          gross_profit?: number | null
          id?: string
          labor_cost?: number | null
          labor_efficiency_percentage?: number | null
          net_margin_percentage?: number | null
          net_profit?: number | null
          notes?: string | null
          organization_id: string
          other_costs?: number | null
          quoted_amount?: number | null
          reconciled_at?: string | null
          reconciled_by?: string | null
          reconciliation_status?: string | null
          rental_cost?: number | null
          supplies_cost?: number | null
          total_costs?: number | null
          total_revenue?: number | null
          updated_at?: string | null
        }
        Update: {
          actual_hours?: number | null
          budget_variance?: number | null
          budget_variance_percentage?: number | null
          contract_amount?: number | null
          created_at?: string | null
          delivery_cost?: number | null
          deposit_amount?: number | null
          deposit_received_date?: string | null
          estimated_hours?: number | null
          event_id?: string
          final_payment_amount?: number | null
          final_payment_received_date?: string | null
          flower_cost?: number | null
          gross_margin_percentage?: number | null
          gross_profit?: number | null
          id?: string
          labor_cost?: number | null
          labor_efficiency_percentage?: number | null
          net_margin_percentage?: number | null
          net_profit?: number | null
          notes?: string | null
          organization_id?: string
          other_costs?: number | null
          quoted_amount?: number | null
          reconciled_at?: string | null
          reconciled_by?: string | null
          reconciliation_status?: string | null
          rental_cost?: number | null
          supplies_cost?: number | null
          total_costs?: number | null
          total_revenue?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_financials_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "event_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_financials_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_financials_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_financials_reconciled_by_fkey"
            columns: ["reconciled_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
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
          current_phase: string | null
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
          order_deadline_date: string | null
          organization_id: string
          priority: string | null
          processing_date: string | null
          production_date: string | null
          proposal_id: string | null
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
          current_phase?: string | null
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
          order_deadline_date?: string | null
          organization_id: string
          priority?: string | null
          processing_date?: string | null
          production_date?: string | null
          proposal_id?: string | null
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
          current_phase?: string | null
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
          order_deadline_date?: string | null
          organization_id?: string
          priority?: string | null
          processing_date?: string | null
          production_date?: string | null
          proposal_id?: string | null
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
          {
            foreignKeyName: "events_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      flower_catalog: {
        Row: {
          availability_notes: string | null
          base_price: number
          bulk_pricing: Json | null
          color: string | null
          color_hex: string | null
          created_at: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_year_round: boolean | null
          last_price_update: string | null
          lead_time_days: number | null
          name: string
          notes: string | null
          organization_id: string
          preferred_vendor: string | null
          price_history: Json | null
          processing_notes: string | null
          processing_waste_factor: number | null
          seasonal_availability: Json | null
          seasonal_months: string | null
          unit: string | null
          updated_at: string | null
          variety: string | null
          vendor_sku: string | null
        }
        Insert: {
          availability_notes?: string | null
          base_price: number
          bulk_pricing?: Json | null
          color?: string | null
          color_hex?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_year_round?: boolean | null
          last_price_update?: string | null
          lead_time_days?: number | null
          name: string
          notes?: string | null
          organization_id: string
          preferred_vendor?: string | null
          price_history?: Json | null
          processing_notes?: string | null
          processing_waste_factor?: number | null
          seasonal_availability?: Json | null
          seasonal_months?: string | null
          unit?: string | null
          updated_at?: string | null
          variety?: string | null
          vendor_sku?: string | null
        }
        Update: {
          availability_notes?: string | null
          base_price?: number
          bulk_pricing?: Json | null
          color?: string | null
          color_hex?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_year_round?: boolean | null
          last_price_update?: string | null
          lead_time_days?: number | null
          name?: string
          notes?: string | null
          organization_id?: string
          preferred_vendor?: string | null
          price_history?: Json | null
          processing_notes?: string | null
          processing_waste_factor?: number | null
          seasonal_availability?: Json | null
          seasonal_months?: string | null
          unit?: string | null
          updated_at?: string | null
          variety?: string | null
          vendor_sku?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "flower_catalog_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      flower_order_items: {
        Row: {
          catalog_item_id: string | null
          catalog_item_type: string | null
          color: string | null
          created_at: string | null
          id: string
          item_name: string
          notes: string | null
          order_id: string
          quantity: number
          total_price: number
          unit: string | null
          unit_price: number
          updated_at: string | null
          variety: string | null
        }
        Insert: {
          catalog_item_id?: string | null
          catalog_item_type?: string | null
          color?: string | null
          created_at?: string | null
          id?: string
          item_name: string
          notes?: string | null
          order_id: string
          quantity: number
          total_price: number
          unit?: string | null
          unit_price: number
          updated_at?: string | null
          variety?: string | null
        }
        Update: {
          catalog_item_id?: string | null
          catalog_item_type?: string | null
          color?: string | null
          created_at?: string | null
          id?: string
          item_name?: string
          notes?: string | null
          order_id?: string
          quantity?: number
          total_price?: number
          unit?: string | null
          unit_price?: number
          updated_at?: string | null
          variety?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "flower_order_items_catalog_item_id_fkey"
            columns: ["catalog_item_id"]
            isOneToOne: false
            referencedRelation: "flower_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flower_order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "flower_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      flower_orders: {
        Row: {
          confirmed_at: string | null
          confirmed_by: string | null
          created_at: string | null
          delivery_date: string | null
          delivery_instructions: string | null
          delivery_time: string | null
          event_id: string | null
          grand_total: number | null
          id: string
          needed_by_date: string
          notes: string | null
          order_date: string
          order_number: string | null
          organization_id: string
          payment_status: string | null
          payment_terms: string | null
          shipping_cost: number | null
          special_requests: string | null
          status: string | null
          tax_amount: number | null
          total_cost: number | null
          updated_at: string | null
          vendor_contact: string | null
          vendor_name: string
        }
        Insert: {
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string | null
          delivery_date?: string | null
          delivery_instructions?: string | null
          delivery_time?: string | null
          event_id?: string | null
          grand_total?: number | null
          id?: string
          needed_by_date: string
          notes?: string | null
          order_date?: string
          order_number?: string | null
          organization_id: string
          payment_status?: string | null
          payment_terms?: string | null
          shipping_cost?: number | null
          special_requests?: string | null
          status?: string | null
          tax_amount?: number | null
          total_cost?: number | null
          updated_at?: string | null
          vendor_contact?: string | null
          vendor_name: string
        }
        Update: {
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string | null
          delivery_date?: string | null
          delivery_instructions?: string | null
          delivery_time?: string | null
          event_id?: string | null
          grand_total?: number | null
          id?: string
          needed_by_date?: string
          notes?: string | null
          order_date?: string
          order_number?: string | null
          organization_id?: string
          payment_status?: string | null
          payment_terms?: string | null
          shipping_cost?: number | null
          special_requests?: string | null
          status?: string | null
          tax_amount?: number | null
          total_cost?: number | null
          updated_at?: string | null
          vendor_contact?: string | null
          vendor_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "flower_orders_confirmed_by_fkey"
            columns: ["confirmed_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flower_orders_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "event_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flower_orders_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "flower_orders_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      hard_goods_catalog: {
        Row: {
          bulk_pricing: Json | null
          category: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          last_price_update: string | null
          name: string
          notes: string | null
          organization_id: string
          preferred_vendor: string | null
          purchase_price: number | null
          rental_price: number | null
          size_dimensions: string | null
          sku: string | null
          unit: string | null
          updated_at: string | null
          vendor_sku: string | null
        }
        Insert: {
          bulk_pricing?: Json | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          last_price_update?: string | null
          name: string
          notes?: string | null
          organization_id: string
          preferred_vendor?: string | null
          purchase_price?: number | null
          rental_price?: number | null
          size_dimensions?: string | null
          sku?: string | null
          unit?: string | null
          updated_at?: string | null
          vendor_sku?: string | null
        }
        Update: {
          bulk_pricing?: Json | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          last_price_update?: string | null
          name?: string
          notes?: string | null
          organization_id?: string
          preferred_vendor?: string | null
          purchase_price?: number | null
          rental_price?: number | null
          size_dimensions?: string | null
          sku?: string | null
          unit?: string | null
          updated_at?: string | null
          vendor_sku?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hard_goods_catalog_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      labor_rates_catalog: {
        Row: {
          category: string | null
          created_at: string | null
          default_for_category: boolean | null
          description: string | null
          hourly_rate: number
          id: string
          is_active: boolean | null
          minimum_hours: number | null
          name: string
          organization_id: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          default_for_category?: boolean | null
          description?: string | null
          hourly_rate: number
          id?: string
          is_active?: boolean | null
          minimum_hours?: number | null
          name: string
          organization_id: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          default_for_category?: boolean | null
          description?: string | null
          hourly_rate?: number
          id?: string
          is_active?: boolean | null
          minimum_hours?: number | null
          name?: string
          organization_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "labor_rates_catalog_organization_id_fkey"
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
          budget_band_settings: Json | null
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
          budget_band_settings?: Json | null
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
          budget_band_settings?: Json | null
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
      payments: {
        Row: {
          amount: number
          created_at: string | null
          event_id: string
          id: string
          notes: string | null
          payment_date: string
          payment_method: string | null
          reference_number: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          event_id: string
          id?: string
          notes?: string | null
          payment_date: string
          payment_method?: string | null
          reference_number?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          event_id?: string
          id?: string
          notes?: string | null
          payment_date?: string
          payment_method?: string | null
          reference_number?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "event_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
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
      production_tracking: {
        Row: {
          actual_waste_percentage: number | null
          assigned_to: string | null
          checklist: Json | null
          completed_at: string | null
          created_at: string | null
          event_id: string
          id: string
          issues: Json | null
          location: string | null
          notes: string | null
          order_id: string | null
          organization_id: string
          phase: string
          photos: Json | null
          quality_notes: string | null
          started_at: string | null
          status: string | null
          temperature_logged: boolean | null
          temperature_value: number | null
          updated_at: string | null
        }
        Insert: {
          actual_waste_percentage?: number | null
          assigned_to?: string | null
          checklist?: Json | null
          completed_at?: string | null
          created_at?: string | null
          event_id: string
          id?: string
          issues?: Json | null
          location?: string | null
          notes?: string | null
          order_id?: string | null
          organization_id: string
          phase: string
          photos?: Json | null
          quality_notes?: string | null
          started_at?: string | null
          status?: string | null
          temperature_logged?: boolean | null
          temperature_value?: number | null
          updated_at?: string | null
        }
        Update: {
          actual_waste_percentage?: number | null
          assigned_to?: string | null
          checklist?: Json | null
          completed_at?: string | null
          created_at?: string | null
          event_id?: string
          id?: string
          issues?: Json | null
          location?: string | null
          notes?: string | null
          order_id?: string | null
          organization_id?: string
          phase?: string
          photos?: Json | null
          quality_notes?: string | null
          started_at?: string | null
          status?: string | null
          temperature_logged?: boolean | null
          temperature_value?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "production_tracking_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_tracking_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "event_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_tracking_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_tracking_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "flower_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "production_tracking_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      proposal_activity: {
        Row: {
          activity_type: string
          actor: string | null
          actor_email: string | null
          actor_name: string | null
          actor_user_id: string | null
          created_at: string | null
          details: Json | null
          id: string
          ip_address: unknown
          proposal_id: string
          user_agent: string | null
        }
        Insert: {
          activity_type: string
          actor?: string | null
          actor_email?: string | null
          actor_name?: string | null
          actor_user_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown
          proposal_id: string
          user_agent?: string | null
        }
        Update: {
          activity_type?: string
          actor?: string | null
          actor_email?: string | null
          actor_name?: string | null
          actor_user_id?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown
          proposal_id?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proposal_activity_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      proposal_feedback: {
        Row: {
          created_at: string | null
          feedback_text: string | null
          feedback_type: string | null
          florist_response: string | null
          id: string
          ip_address: unknown
          proposal_id: string
          requested_changes: Json | null
          responded_at: string | null
          responded_by: string | null
          status: string | null
          submitted_by_email: string | null
          submitted_by_name: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string | null
          feedback_text?: string | null
          feedback_type?: string | null
          florist_response?: string | null
          id?: string
          ip_address?: unknown
          proposal_id: string
          requested_changes?: Json | null
          responded_at?: string | null
          responded_by?: string | null
          status?: string | null
          submitted_by_email?: string | null
          submitted_by_name?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string | null
          feedback_text?: string | null
          feedback_type?: string | null
          florist_response?: string | null
          id?: string
          ip_address?: unknown
          proposal_id?: string
          requested_changes?: Json | null
          responded_at?: string | null
          responded_by?: string | null
          status?: string | null
          submitted_by_email?: string | null
          submitted_by_name?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proposal_feedback_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      proposal_recipes: {
        Row: {
          client_price_per_unit: number | null
          client_price_total: number | null
          container_cost: number | null
          containers: Json | null
          created_at: string | null
          design_notes: string | null
          flowers: Json | null
          id: string
          internal_cost_per_unit: number | null
          internal_cost_total: number | null
          labor_cost: number | null
          labor_minutes: number | null
          material_cost: number | null
          organization_id: string
          proposal_id: string
          quantity: number | null
          recipe_name: string
          recipe_template_id: string | null
          recipe_type: string | null
          sort_order: number | null
          supplies: Json | null
          supplies_cost: number | null
          tier: string | null
          updated_at: string | null
          waste_factor: number | null
        }
        Insert: {
          client_price_per_unit?: number | null
          client_price_total?: number | null
          container_cost?: number | null
          containers?: Json | null
          created_at?: string | null
          design_notes?: string | null
          flowers?: Json | null
          id?: string
          internal_cost_per_unit?: number | null
          internal_cost_total?: number | null
          labor_cost?: number | null
          labor_minutes?: number | null
          material_cost?: number | null
          organization_id: string
          proposal_id: string
          quantity?: number | null
          recipe_name: string
          recipe_template_id?: string | null
          recipe_type?: string | null
          sort_order?: number | null
          supplies?: Json | null
          supplies_cost?: number | null
          tier?: string | null
          updated_at?: string | null
          waste_factor?: number | null
        }
        Update: {
          client_price_per_unit?: number | null
          client_price_total?: number | null
          container_cost?: number | null
          containers?: Json | null
          created_at?: string | null
          design_notes?: string | null
          flowers?: Json | null
          id?: string
          internal_cost_per_unit?: number | null
          internal_cost_total?: number | null
          labor_cost?: number | null
          labor_minutes?: number | null
          material_cost?: number | null
          organization_id?: string
          proposal_id?: string
          quantity?: number | null
          recipe_name?: string
          recipe_template_id?: string | null
          recipe_type?: string | null
          sort_order?: number | null
          supplies?: Json | null
          supplies_cost?: number | null
          tier?: string | null
          updated_at?: string | null
          waste_factor?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "proposal_recipes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposal_recipes_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposal_recipes_recipe_template_id_fkey"
            columns: ["recipe_template_id"]
            isOneToOne: false
            referencedRelation: "recipe_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      proposals: {
        Row: {
          approved_at: string | null
          approved_by_email: string | null
          approved_by_name: string | null
          client_budget_flexible: boolean | null
          client_budget_max: number | null
          client_budget_min: number | null
          client_quote_total: number | null
          consultation_id: string | null
          created_at: string | null
          created_by: string | null
          delivery_fee: number | null
          event_id: string | null
          expired_at: string | null
          id: string
          internal_cost_total: number | null
          internal_notes: string | null
          last_viewed_at: string | null
          line_items: Json | null
          markup_type: string | null
          markup_value: number | null
          organization_id: string
          payment_schedule: Json | null
          pdf_generated_at: string | null
          pdf_url: string | null
          previous_version_id: string | null
          public_link_token: string | null
          rejected_at: string | null
          rejection_reason: string | null
          sent_at: string | null
          sent_to_email: string | null
          setup_fee: number | null
          signature_data: Json | null
          signed_by_client: boolean | null
          status: string | null
          teardown_fee: number | null
          terms_and_conditions: string | null
          updated_at: string | null
          valid_until: string | null
          version: number | null
          view_count: number | null
          viewed_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by_email?: string | null
          approved_by_name?: string | null
          client_budget_flexible?: boolean | null
          client_budget_max?: number | null
          client_budget_min?: number | null
          client_quote_total?: number | null
          consultation_id?: string | null
          created_at?: string | null
          created_by?: string | null
          delivery_fee?: number | null
          event_id?: string | null
          expired_at?: string | null
          id?: string
          internal_cost_total?: number | null
          internal_notes?: string | null
          last_viewed_at?: string | null
          line_items?: Json | null
          markup_type?: string | null
          markup_value?: number | null
          organization_id: string
          payment_schedule?: Json | null
          pdf_generated_at?: string | null
          pdf_url?: string | null
          previous_version_id?: string | null
          public_link_token?: string | null
          rejected_at?: string | null
          rejection_reason?: string | null
          sent_at?: string | null
          sent_to_email?: string | null
          setup_fee?: number | null
          signature_data?: Json | null
          signed_by_client?: boolean | null
          status?: string | null
          teardown_fee?: number | null
          terms_and_conditions?: string | null
          updated_at?: string | null
          valid_until?: string | null
          version?: number | null
          view_count?: number | null
          viewed_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by_email?: string | null
          approved_by_name?: string | null
          client_budget_flexible?: boolean | null
          client_budget_max?: number | null
          client_budget_min?: number | null
          client_quote_total?: number | null
          consultation_id?: string | null
          created_at?: string | null
          created_by?: string | null
          delivery_fee?: number | null
          event_id?: string | null
          expired_at?: string | null
          id?: string
          internal_cost_total?: number | null
          internal_notes?: string | null
          last_viewed_at?: string | null
          line_items?: Json | null
          markup_type?: string | null
          markup_value?: number | null
          organization_id?: string
          payment_schedule?: Json | null
          pdf_generated_at?: string | null
          pdf_url?: string | null
          previous_version_id?: string | null
          public_link_token?: string | null
          rejected_at?: string | null
          rejection_reason?: string | null
          sent_at?: string | null
          sent_to_email?: string | null
          setup_fee?: number | null
          signature_data?: Json | null
          signed_by_client?: boolean | null
          status?: string | null
          teardown_fee?: number | null
          terms_and_conditions?: string | null
          updated_at?: string | null
          valid_until?: string | null
          version?: number | null
          view_count?: number | null
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proposals_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "event_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_previous_version_id_fkey"
            columns: ["previous_version_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          created_at: string | null
          created_by: string | null
          event_id: string
          id: string
          is_final: boolean | null
          notes: string | null
          quote_date: string
          status: string | null
          total_amount: number
          updated_at: string | null
          version_number: number
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          event_id: string
          id?: string
          is_final?: boolean | null
          notes?: string | null
          quote_date: string
          status?: string | null
          total_amount: number
          updated_at?: string | null
          version_number: number
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          event_id?: string
          id?: string
          is_final?: boolean | null
          notes?: string | null
          quote_date?: string
          status?: string | null
          total_amount?: number
          updated_at?: string | null
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "quotes_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "event_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_ingredients: {
        Row: {
          catalog_item_id: string
          catalog_item_type: string
          created_at: string | null
          id: string
          notes: string | null
          quantity: number
          recipe_id: string
        }
        Insert: {
          catalog_item_id: string
          catalog_item_type: string
          created_at?: string | null
          id?: string
          notes?: string | null
          quantity: number
          recipe_id: string
        }
        Update: {
          catalog_item_id?: string
          catalog_item_type?: string
          created_at?: string | null
          id?: string
          notes?: string | null
          quantity?: number
          recipe_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipe_ingredients_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipe_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      recipe_templates: {
        Row: {
          base_labor_hours: number | null
          category: string | null
          created_at: string | null
          description: string | null
          estimated_cost: number | null
          estimated_labor_hours: number | null
          event_id: string | null
          id: string
          is_active: boolean | null
          name: string
          notes: string | null
          organization_id: string
          type: string
          typical_client_price: number | null
          updated_at: string | null
        }
        Insert: {
          base_labor_hours?: number | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          estimated_cost?: number | null
          estimated_labor_hours?: number | null
          event_id?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          notes?: string | null
          organization_id: string
          type?: string
          typical_client_price?: number | null
          updated_at?: string | null
        }
        Update: {
          base_labor_hours?: number | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          estimated_cost?: number | null
          estimated_labor_hours?: number | null
          event_id?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          notes?: string | null
          organization_id?: string
          type?: string
          typical_client_price?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recipe_templates_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "event_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_templates_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
      staff_assignments: {
        Row: {
          actual_hours: number | null
          created_at: string | null
          estimated_hours: number | null
          event_id: string
          hourly_rate: number | null
          id: string
          notes: string | null
          role: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          actual_hours?: number | null
          created_at?: string | null
          estimated_hours?: number | null
          event_id: string
          hourly_rate?: number | null
          id?: string
          notes?: string | null
          role: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          actual_hours?: number | null
          created_at?: string | null
          estimated_hours?: number | null
          event_id?: string
          hourly_rate?: number | null
          id?: string
          notes?: string | null
          role?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_assignments_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "event_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_assignments_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_availability: {
        Row: {
          all_day: boolean | null
          available_date: string
          created_at: string | null
          end_time: string | null
          id: string
          notes: string | null
          start_time: string | null
          user_id: string | null
        }
        Insert: {
          all_day?: boolean | null
          available_date: string
          created_at?: string | null
          end_time?: string | null
          id?: string
          notes?: string | null
          start_time?: string | null
          user_id?: string | null
        }
        Update: {
          all_day?: boolean | null
          available_date?: string
          created_at?: string | null
          end_time?: string | null
          id?: string
          notes?: string | null
          start_time?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      substitutions_made: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          client_approved: boolean | null
          cost_difference: number | null
          created_at: string | null
          event_id: string
          id: string
          notes: string | null
          organization_id: string
          original_color: string | null
          original_item_id: string | null
          original_item_name: string
          original_unit_cost: number | null
          original_variety: string | null
          photos: Json | null
          quantity_affected: number | null
          reason: string | null
          reason_details: string | null
          substitute_color: string | null
          substitute_item_id: string | null
          substitute_item_name: string
          substitute_unit_cost: number | null
          substitute_variety: string | null
          substituted_at: string | null
          substituted_by: string | null
          updated_at: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          client_approved?: boolean | null
          cost_difference?: number | null
          created_at?: string | null
          event_id: string
          id?: string
          notes?: string | null
          organization_id: string
          original_color?: string | null
          original_item_id?: string | null
          original_item_name: string
          original_unit_cost?: number | null
          original_variety?: string | null
          photos?: Json | null
          quantity_affected?: number | null
          reason?: string | null
          reason_details?: string | null
          substitute_color?: string | null
          substitute_item_id?: string | null
          substitute_item_name: string
          substitute_unit_cost?: number | null
          substitute_variety?: string | null
          substituted_at?: string | null
          substituted_by?: string | null
          updated_at?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          client_approved?: boolean | null
          cost_difference?: number | null
          created_at?: string | null
          event_id?: string
          id?: string
          notes?: string | null
          organization_id?: string
          original_color?: string | null
          original_item_id?: string | null
          original_item_name?: string
          original_unit_cost?: number | null
          original_variety?: string | null
          photos?: Json | null
          quantity_affected?: number | null
          reason?: string | null
          reason_details?: string | null
          substitute_color?: string | null
          substitute_item_id?: string | null
          substitute_item_name?: string
          substitute_unit_cost?: number | null
          substitute_variety?: string | null
          substituted_at?: string | null
          substituted_by?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "substitutions_made_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "substitutions_made_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "event_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "substitutions_made_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "substitutions_made_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "substitutions_made_original_item_id_fkey"
            columns: ["original_item_id"]
            isOneToOne: false
            referencedRelation: "flower_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "substitutions_made_substitute_item_id_fkey"
            columns: ["substitute_item_id"]
            isOneToOne: false
            referencedRelation: "flower_catalog"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "substitutions_made_substituted_by_fkey"
            columns: ["substituted_by"]
            isOneToOne: false
            referencedRelation: "user_profiles"
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
      timeline_tasks: {
        Row: {
          assigned_to: string | null
          checklist: Json | null
          created_at: string | null
          dependencies: Json | null
          depends_on_task_ids: string[] | null
          description: string | null
          end_date: string | null
          event_id: string
          id: string
          is_critical: boolean | null
          milestone: boolean | null
          order_by_date: string | null
          phase: string | null
          priority: string | null
          sort_order: number | null
          start_date: string | null
          status: string | null
          task_name: string
          task_type: string | null
          updated_at: string | null
          weather_dependent: boolean | null
        }
        Insert: {
          assigned_to?: string | null
          checklist?: Json | null
          created_at?: string | null
          dependencies?: Json | null
          depends_on_task_ids?: string[] | null
          description?: string | null
          end_date?: string | null
          event_id: string
          id?: string
          is_critical?: boolean | null
          milestone?: boolean | null
          order_by_date?: string | null
          phase?: string | null
          priority?: string | null
          sort_order?: number | null
          start_date?: string | null
          status?: string | null
          task_name: string
          task_type?: string | null
          updated_at?: string | null
          weather_dependent?: boolean | null
        }
        Update: {
          assigned_to?: string | null
          checklist?: Json | null
          created_at?: string | null
          dependencies?: Json | null
          depends_on_task_ids?: string[] | null
          description?: string | null
          end_date?: string | null
          event_id?: string
          id?: string
          is_critical?: boolean | null
          milestone?: boolean | null
          order_by_date?: string | null
          phase?: string | null
          priority?: string | null
          sort_order?: number | null
          start_date?: string | null
          status?: string | null
          task_name?: string
          task_type?: string | null
          updated_at?: string | null
          weather_dependent?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "timeline_tasks_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "event_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "timeline_tasks_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
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
          attname: unknown
          correlation: number | null
          n_distinct: number | null
          schemaname: unknown
          tablename: unknown
        }
        Relationships: []
      }
    }
    Functions: {
      bf_generate_order_number: { Args: never; Returns: string }
      bf_get_user_florist_id: { Args: never; Returns: string }
      bf_get_user_organization_id: { Args: never; Returns: string }
      bf_get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["bf_user_role"]
      }
      bf_has_role: {
        Args: {
          _role: Database["public"]["Enums"]["bf_user_role"]
          _user_id: string
        }
        Returns: boolean
      }
      bf_user_can_access_campaign: {
        Args: { campaign_uuid: string }
        Returns: boolean
      }
      calculate_event_progress: {
        Args: { event_uuid: string }
        Returns: number
      }
      get_latest_quote: { Args: { p_event_id: string }; Returns: string }
      get_total_paid: { Args: { p_event_id: string }; Returns: number }
      get_user_organization_id: { Args: never; Returns: string }
      refresh_dashboard_stats: {
        Args: { org_id: string; stat_period: string }
        Returns: undefined
      }
    }
    Enums: {
      bf_user_role: "florist" | "org_admin" | "org_member" | "customer"
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
    Enums: {
      bf_user_role: ["florist", "org_admin", "org_member", "customer"],
    },
  },
} as const

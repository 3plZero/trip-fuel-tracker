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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      building_maintenance_checklists: {
        Row: {
          building_id: string | null
          checklist_month: string
          checklist_year: number
          created_at: string | null
          created_by: string | null
          id: string
          location: string | null
          performed_by: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          building_id?: string | null
          checklist_month: string
          checklist_year: number
          created_at?: string | null
          created_by?: string | null
          id?: string
          location?: string | null
          performed_by?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          building_id?: string | null
          checklist_month?: string
          checklist_year?: number
          created_at?: string | null
          created_by?: string | null
          id?: string
          location?: string | null
          performed_by?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "building_maintenance_checklists_building_id_fkey"
            columns: ["building_id"]
            isOneToOne: false
            referencedRelation: "buildings"
            referencedColumns: ["id"]
          },
        ]
      }
      building_maintenance_checks: {
        Row: {
          check_category: string
          check_item: string
          checklist_id: string
          id: string
          remarks: string | null
          week_1: boolean | null
          week_2: boolean | null
          week_3: boolean | null
          week_4: boolean | null
        }
        Insert: {
          check_category: string
          check_item: string
          checklist_id: string
          id?: string
          remarks?: string | null
          week_1?: boolean | null
          week_2?: boolean | null
          week_3?: boolean | null
          week_4?: boolean | null
        }
        Update: {
          check_category?: string
          check_item?: string
          checklist_id?: string
          id?: string
          remarks?: string | null
          week_1?: boolean | null
          week_2?: boolean | null
          week_3?: boolean | null
          week_4?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "building_maintenance_checks_checklist_id_fkey"
            columns: ["checklist_id"]
            isOneToOne: false
            referencedRelation: "building_maintenance_checklists"
            referencedColumns: ["id"]
          },
        ]
      }
      buildings: {
        Row: {
          building_name: string
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          location: string | null
          updated_at: string | null
        }
        Insert: {
          building_name: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          updated_at?: string | null
        }
        Update: {
          building_name?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          location?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      drivers: {
        Row: {
          address: string | null
          birthdate: string | null
          created_at: string | null
          full_name: string
          height: number | null
          id: string
          is_active: boolean | null
          license_image_url: string | null
          license_no: string | null
          nationality: string | null
          sex: string | null
          updated_at: string | null
          weight: number | null
        }
        Insert: {
          address?: string | null
          birthdate?: string | null
          created_at?: string | null
          full_name: string
          height?: number | null
          id?: string
          is_active?: boolean | null
          license_image_url?: string | null
          license_no?: string | null
          nationality?: string | null
          sex?: string | null
          updated_at?: string | null
          weight?: number | null
        }
        Update: {
          address?: string | null
          birthdate?: string | null
          created_at?: string | null
          full_name?: string
          height?: number | null
          id?: string
          is_active?: boolean | null
          license_image_url?: string | null
          license_no?: string | null
          nationality?: string | null
          sex?: string | null
          updated_at?: string | null
          weight?: number | null
        }
        Relationships: []
      }
      generator_maintenance_checklists: {
        Row: {
          checklist_month: string
          created_at: string | null
          created_by: string | null
          generator_id: string | null
          id: string
          monitoring_notes: string | null
          performed_by: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          checklist_month: string
          created_at?: string | null
          created_by?: string | null
          generator_id?: string | null
          id?: string
          monitoring_notes?: string | null
          performed_by?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          checklist_month?: string
          created_at?: string | null
          created_by?: string | null
          generator_id?: string | null
          id?: string
          monitoring_notes?: string | null
          performed_by?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "generator_maintenance_checklists_generator_id_fkey"
            columns: ["generator_id"]
            isOneToOne: false
            referencedRelation: "generators"
            referencedColumns: ["id"]
          },
        ]
      }
      generator_maintenance_checks: {
        Row: {
          check_item: string
          checklist_id: string
          id: string
          remarks: string | null
          week_2: boolean | null
          week_4: boolean | null
        }
        Insert: {
          check_item: string
          checklist_id: string
          id?: string
          remarks?: string | null
          week_2?: boolean | null
          week_4?: boolean | null
        }
        Update: {
          check_item?: string
          checklist_id?: string
          id?: string
          remarks?: string | null
          week_2?: boolean | null
          week_4?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "generator_maintenance_checks_checklist_id_fkey"
            columns: ["checklist_id"]
            isOneToOne: false
            referencedRelation: "generator_maintenance_checklists"
            referencedColumns: ["id"]
          },
        ]
      }
      generators: {
        Row: {
          created_at: string | null
          equipment_name: string
          id: string
          is_active: boolean | null
          location: string | null
          serial_no: string | null
          type_model_no: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          equipment_name: string
          id?: string
          is_active?: boolean | null
          location?: string | null
          serial_no?: string | null
          type_model_no?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          equipment_name?: string
          id?: string
          is_active?: boolean | null
          location?: string | null
          serial_no?: string | null
          type_model_no?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      inventory_categories: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      inventory_item_images: {
        Row: {
          created_at: string | null
          id: string
          image_url: string
          item_id: string
          sort_order: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_url: string
          item_id: string
          sort_order?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          image_url?: string
          item_id?: string
          sort_order?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_item_images_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_items: {
        Row: {
          accountability_document: string | null
          accountable_person: string | null
          brand_model: string | null
          category_id: string | null
          condition: string | null
          created_at: string | null
          created_by: string | null
          current_location: string | null
          date_received: string | null
          description: string | null
          id: string
          name: string
          product_id: string
          property_from: string | null
          property_number: string | null
          property_tag: string | null
          quantity: number | null
          remarks: string | null
          serial_number: string | null
          status: string | null
          total_cost: number | null
          unit_cost: number | null
          updated_at: string | null
          utilization_status: string | null
        }
        Insert: {
          accountability_document?: string | null
          accountable_person?: string | null
          brand_model?: string | null
          category_id?: string | null
          condition?: string | null
          created_at?: string | null
          created_by?: string | null
          current_location?: string | null
          date_received?: string | null
          description?: string | null
          id?: string
          name: string
          product_id: string
          property_from?: string | null
          property_number?: string | null
          property_tag?: string | null
          quantity?: number | null
          remarks?: string | null
          serial_number?: string | null
          status?: string | null
          total_cost?: number | null
          unit_cost?: number | null
          updated_at?: string | null
          utilization_status?: string | null
        }
        Update: {
          accountability_document?: string | null
          accountable_person?: string | null
          brand_model?: string | null
          category_id?: string | null
          condition?: string | null
          created_at?: string | null
          created_by?: string | null
          current_location?: string | null
          date_received?: string | null
          description?: string | null
          id?: string
          name?: string
          product_id?: string
          property_from?: string | null
          property_number?: string | null
          property_tag?: string | null
          quantity?: number | null
          remarks?: string | null
          serial_number?: string | null
          status?: string | null
          total_cost?: number | null
          unit_cost?: number | null
          updated_at?: string | null
          utilization_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "inventory_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          full_name: string | null
          id: string
          position: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          full_name?: string | null
          id: string
          position?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          full_name?: string | null
          id?: string
          position?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      travel_order_expenses: {
        Row: {
          amount: number | null
          expense_category: string
          id: string
          is_actual: boolean | null
          is_per_diem: boolean | null
          travel_order_id: string
        }
        Insert: {
          amount?: number | null
          expense_category: string
          id?: string
          is_actual?: boolean | null
          is_per_diem?: boolean | null
          travel_order_id: string
        }
        Update: {
          amount?: number | null
          expense_category?: string
          id?: string
          is_actual?: boolean | null
          is_per_diem?: boolean | null
          travel_order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "travel_order_expenses_travel_order_id_fkey"
            columns: ["travel_order_id"]
            isOneToOne: false
            referencedRelation: "travel_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      travel_order_personnel: {
        Row: {
          division_agency: string | null
          id: string
          name: string
          position: string | null
          sort_order: number | null
          travel_order_id: string
        }
        Insert: {
          division_agency?: string | null
          id?: string
          name: string
          position?: string | null
          sort_order?: number | null
          travel_order_id: string
        }
        Update: {
          division_agency?: string | null
          id?: string
          name?: string
          position?: string | null
          sort_order?: number | null
          travel_order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "travel_order_personnel_travel_order_id_fkey"
            columns: ["travel_order_id"]
            isOneToOne: false
            referencedRelation: "travel_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      travel_orders: {
        Row: {
          approved_by: string | null
          approved_by_position: string | null
          created_at: string | null
          created_by: string | null
          destinations: string | null
          expense_type: string | null
          expense_type_other: string | null
          has_actual_expenses: boolean | null
          has_per_diem: boolean | null
          id: string
          inclusive_dates_end: string | null
          inclusive_dates_start: string | null
          order_date: string
          purpose: string | null
          remarks: string | null
          status: string | null
          transportation_type: string | null
          travel_order_no: string
          updated_at: string | null
        }
        Insert: {
          approved_by?: string | null
          approved_by_position?: string | null
          created_at?: string | null
          created_by?: string | null
          destinations?: string | null
          expense_type?: string | null
          expense_type_other?: string | null
          has_actual_expenses?: boolean | null
          has_per_diem?: boolean | null
          id?: string
          inclusive_dates_end?: string | null
          inclusive_dates_start?: string | null
          order_date?: string
          purpose?: string | null
          remarks?: string | null
          status?: string | null
          transportation_type?: string | null
          travel_order_no: string
          updated_at?: string | null
        }
        Update: {
          approved_by?: string | null
          approved_by_position?: string | null
          created_at?: string | null
          created_by?: string | null
          destinations?: string | null
          expense_type?: string | null
          expense_type_other?: string | null
          has_actual_expenses?: boolean | null
          has_per_diem?: boolean | null
          id?: string
          inclusive_dates_end?: string | null
          inclusive_dates_start?: string | null
          order_date?: string
          purpose?: string | null
          remarks?: string | null
          status?: string | null
          transportation_type?: string | null
          travel_order_no?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      trip_details: {
        Row: {
          arrival_place: string | null
          arrival_time: string | null
          departure_place: string | null
          departure_time: string | null
          id: string
          odometer_end: number | null
          odometer_initial: number | null
          sort_order: number | null
          trip_date: string | null
          trip_no: number
          trip_ticket_id: string
        }
        Insert: {
          arrival_place?: string | null
          arrival_time?: string | null
          departure_place?: string | null
          departure_time?: string | null
          id?: string
          odometer_end?: number | null
          odometer_initial?: number | null
          sort_order?: number | null
          trip_date?: string | null
          trip_no: number
          trip_ticket_id: string
        }
        Update: {
          arrival_place?: string | null
          arrival_time?: string | null
          departure_place?: string | null
          departure_time?: string | null
          id?: string
          odometer_end?: number | null
          odometer_initial?: number | null
          sort_order?: number | null
          trip_date?: string | null
          trip_no?: number
          trip_ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_details_trip_ticket_id_fkey"
            columns: ["trip_ticket_id"]
            isOneToOne: false
            referencedRelation: "trip_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_ticket_destinations: {
        Row: {
          destination: string
          id: string
          sort_order: number | null
          trip_ticket_id: string
        }
        Insert: {
          destination: string
          id?: string
          sort_order?: number | null
          trip_ticket_id: string
        }
        Update: {
          destination?: string
          id?: string
          sort_order?: number | null
          trip_ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_ticket_destinations_trip_ticket_id_fkey"
            columns: ["trip_ticket_id"]
            isOneToOne: false
            referencedRelation: "trip_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_ticket_passengers: {
        Row: {
          id: string
          passenger_name: string
          sort_order: number | null
          trip_ticket_id: string
        }
        Insert: {
          id?: string
          passenger_name: string
          sort_order?: number | null
          trip_ticket_id: string
        }
        Update: {
          id?: string
          passenger_name?: string
          sort_order?: number | null
          trip_ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trip_ticket_passengers_trip_ticket_id_fkey"
            columns: ["trip_ticket_id"]
            isOneToOne: false
            referencedRelation: "trip_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_tickets: {
        Row: {
          balance_tank_end: number | null
          balance_tank_start: number | null
          brake_fluid_used: number | null
          created_at: string | null
          created_by: string | null
          driver_id: string | null
          gasoline_used: number | null
          gear_oil_used: number | null
          grease_used: number | null
          id: string
          issued_from_stock: number | null
          motor_oil_used: number | null
          purchased_outside: number | null
          purpose: string | null
          status: string | null
          ticket_date: string
          total_distance: number | null
          tr_no: string
          updated_at: string | null
          vehicle_id: string | null
        }
        Insert: {
          balance_tank_end?: number | null
          balance_tank_start?: number | null
          brake_fluid_used?: number | null
          created_at?: string | null
          created_by?: string | null
          driver_id?: string | null
          gasoline_used?: number | null
          gear_oil_used?: number | null
          grease_used?: number | null
          id?: string
          issued_from_stock?: number | null
          motor_oil_used?: number | null
          purchased_outside?: number | null
          purpose?: string | null
          status?: string | null
          ticket_date?: string
          total_distance?: number | null
          tr_no: string
          updated_at?: string | null
          vehicle_id?: string | null
        }
        Update: {
          balance_tank_end?: number | null
          balance_tank_start?: number | null
          brake_fluid_used?: number | null
          created_at?: string | null
          created_by?: string | null
          driver_id?: string | null
          gasoline_used?: number | null
          gear_oil_used?: number | null
          grease_used?: number | null
          id?: string
          issued_from_stock?: number | null
          motor_oil_used?: number | null
          purchased_outside?: number | null
          purpose?: string | null
          status?: string | null
          ticket_date?: string
          total_distance?: number | null
          tr_no?: string
          updated_at?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trip_tickets_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trip_tickets_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vehicle_maintenance_checklists: {
        Row: {
          checklist_month: string
          created_at: string | null
          created_by: string | null
          id: string
          location: string | null
          performed_by: string | null
          status: string | null
          updated_at: string | null
          vehicle_id: string | null
        }
        Insert: {
          checklist_month: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          location?: string | null
          performed_by?: string | null
          status?: string | null
          updated_at?: string | null
          vehicle_id?: string | null
        }
        Update: {
          checklist_month?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          location?: string | null
          performed_by?: string | null
          status?: string | null
          updated_at?: string | null
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_maintenance_checklists_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_maintenance_checks: {
        Row: {
          check_category: string
          check_item: string
          checklist_id: string
          day_1: boolean | null
          day_2: boolean | null
          day_3: boolean | null
          day_4: boolean | null
          day_5: boolean | null
          id: string
          remarks: string | null
        }
        Insert: {
          check_category: string
          check_item: string
          checklist_id: string
          day_1?: boolean | null
          day_2?: boolean | null
          day_3?: boolean | null
          day_4?: boolean | null
          day_5?: boolean | null
          id?: string
          remarks?: string | null
        }
        Update: {
          check_category?: string
          check_item?: string
          checklist_id?: string
          day_1?: boolean | null
          day_2?: boolean | null
          day_3?: boolean | null
          day_4?: boolean | null
          day_5?: boolean | null
          id?: string
          remarks?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vehicle_maintenance_checks_checklist_id_fkey"
            columns: ["checklist_id"]
            isOneToOne: false
            referencedRelation: "vehicle_maintenance_checklists"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicles: {
        Row: {
          body_type: string | null
          chassis_no: string | null
          color: string | null
          cr_no: string | null
          created_at: string | null
          description: string | null
          encumbered_to: string | null
          engine_no: string | null
          file_no: string | null
          fuel_type: string | null
          gross_weight: number | null
          id: string
          is_active: boolean | null
          last_location_lat: number | null
          last_location_lng: number | null
          last_location_name: string | null
          last_location_updated_at: string | null
          make_brand: string | null
          max_power: string | null
          mv_file_no: string | null
          net_weight: number | null
          or_date: string | null
          or_no: string | null
          owner_address: string | null
          owner_name: string | null
          passenger_capacity: number | null
          piston_displacement: string | null
          plate_no: string
          registration_classification: string | null
          registration_image_url: string | null
          remarks: string | null
          series: string | null
          updated_at: string | null
          vehicle_category: string | null
          vehicle_type: string | null
          year_model: string | null
          year_rebuilt: string | null
        }
        Insert: {
          body_type?: string | null
          chassis_no?: string | null
          color?: string | null
          cr_no?: string | null
          created_at?: string | null
          description?: string | null
          encumbered_to?: string | null
          engine_no?: string | null
          file_no?: string | null
          fuel_type?: string | null
          gross_weight?: number | null
          id?: string
          is_active?: boolean | null
          last_location_lat?: number | null
          last_location_lng?: number | null
          last_location_name?: string | null
          last_location_updated_at?: string | null
          make_brand?: string | null
          max_power?: string | null
          mv_file_no?: string | null
          net_weight?: number | null
          or_date?: string | null
          or_no?: string | null
          owner_address?: string | null
          owner_name?: string | null
          passenger_capacity?: number | null
          piston_displacement?: string | null
          plate_no: string
          registration_classification?: string | null
          registration_image_url?: string | null
          remarks?: string | null
          series?: string | null
          updated_at?: string | null
          vehicle_category?: string | null
          vehicle_type?: string | null
          year_model?: string | null
          year_rebuilt?: string | null
        }
        Update: {
          body_type?: string | null
          chassis_no?: string | null
          color?: string | null
          cr_no?: string | null
          created_at?: string | null
          description?: string | null
          encumbered_to?: string | null
          engine_no?: string | null
          file_no?: string | null
          fuel_type?: string | null
          gross_weight?: number | null
          id?: string
          is_active?: boolean | null
          last_location_lat?: number | null
          last_location_lng?: number | null
          last_location_name?: string | null
          last_location_updated_at?: string | null
          make_brand?: string | null
          max_power?: string | null
          mv_file_no?: string | null
          net_weight?: number | null
          or_date?: string | null
          or_no?: string | null
          owner_address?: string | null
          owner_name?: string | null
          passenger_capacity?: number | null
          piston_displacement?: string | null
          plate_no?: string
          registration_classification?: string | null
          registration_image_url?: string | null
          remarks?: string | null
          series?: string | null
          updated_at?: string | null
          vehicle_category?: string | null
          vehicle_type?: string | null
          year_model?: string | null
          year_rebuilt?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_product_id: { Args: never; Returns: string }
      generate_tr_no: { Args: never; Returns: string }
      generate_travel_order_no: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const

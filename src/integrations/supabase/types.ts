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
      vehicles: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          plate_no: string
          updated_at: string | null
          vehicle_type: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          plate_no: string
          updated_at?: string | null
          vehicle_type?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          plate_no?: string
          updated_at?: string | null
          vehicle_type?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_tr_no: { Args: never; Returns: string }
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

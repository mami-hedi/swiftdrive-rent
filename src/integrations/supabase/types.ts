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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          actor_email: string | null
          actor_id: string | null
          created_at: string
          entity_id: string | null
          entity_label: string | null
          entity_type: string
          id: string
          metadata: Json
          new_value: string | null
          old_value: string | null
          reason: string | null
        }
        Insert: {
          action: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_label?: string | null
          entity_type: string
          id?: string
          metadata?: Json
          new_value?: string | null
          old_value?: string | null
          reason?: string | null
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_label?: string | null
          entity_type?: string
          id?: string
          metadata?: Json
          new_value?: string | null
          old_value?: string | null
          reason?: string | null
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          handled: boolean
          id: string
          message: string
          name: string
          phone: string | null
          subject: string | null
        }
        Insert: {
          created_at?: string
          email: string
          handled?: boolean
          id?: string
          message: string
          name: string
          phone?: string | null
          subject?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          handled?: boolean
          id?: string
          message?: string
          name?: string
          phone?: string | null
          subject?: string | null
        }
        Relationships: []
      }
      locations: {
        Row: {
          active: boolean
          address: string | null
          created_at: string
          id: string
          name: string
        }
        Insert: {
          active?: boolean
          address?: string | null
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          active?: boolean
          address?: string | null
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          license_number: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          license_number?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          license_number?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      rental_options: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          id: string
          name: string
          price_per_day: number
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          name: string
          price_per_day: number
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          price_per_day?: number
        }
        Relationships: []
      }
      reservation_options: {
        Row: {
          created_at: string
          id: string
          name: string
          option_id: string | null
          price_per_day: number
          reservation_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          option_id?: string | null
          price_per_day: number
          reservation_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          option_id?: string | null
          price_per_day?: number
          reservation_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservation_options_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "rental_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservation_options_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      reservations: {
        Row: {
          address: string | null
          cancellation_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          confirmed_at: string | null
          created_at: string
          daily_rate: number
          days: number
          dropoff_location: string
          email: string
          end_at: string
          first_name: string
          id: string
          last_name: string
          license_number: string | null
          notes: string | null
          options_total: number
          phone: string
          pickup_location: string
          receipt_number: string
          reference: string
          start_at: string
          status: Database["public"]["Enums"]["reservation_status"]
          total: number
          updated_at: string
          user_id: string | null
          vehicle_id: string
        }
        Insert: {
          address?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          confirmed_at?: string | null
          created_at?: string
          daily_rate: number
          days: number
          dropoff_location: string
          email: string
          end_at: string
          first_name: string
          id?: string
          last_name: string
          license_number?: string | null
          notes?: string | null
          options_total?: number
          phone: string
          pickup_location: string
          receipt_number?: string
          reference?: string
          start_at: string
          status?: Database["public"]["Enums"]["reservation_status"]
          total: number
          updated_at?: string
          user_id?: string | null
          vehicle_id: string
        }
        Update: {
          address?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          confirmed_at?: string | null
          created_at?: string
          daily_rate?: number
          days?: number
          dropoff_location?: string
          email?: string
          end_at?: string
          first_name?: string
          id?: string
          last_name?: string
          license_number?: string | null
          notes?: string | null
          options_total?: number
          phone?: string
          pickup_location?: string
          receipt_number?: string
          reference?: string
          start_at?: string
          status?: Database["public"]["Enums"]["reservation_status"]
          total?: number
          updated_at?: string
          user_id?: string | null
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservations_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      seasonal_rates: {
        Row: {
          created_at: string
          daily_price: number | null
          end_date: string
          id: string
          multiplier: number
          name: string
          start_date: string
          vehicle_id: string | null
        }
        Insert: {
          created_at?: string
          daily_price?: number | null
          end_date: string
          id?: string
          multiplier?: number
          name: string
          start_date: string
          vehicle_id?: string | null
        }
        Update: {
          created_at?: string
          daily_price?: number | null
          end_date?: string
          id?: string
          multiplier?: number
          name?: string
          start_date?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "seasonal_rates_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          address: string | null
          company_name: string
          currency: string
          email: string | null
          facebook: string | null
          id: number
          instagram: string | null
          linkedin: string | null
          logo_url: string | null
          opening_hours: string | null
          phone: string | null
          terms: string | null
          updated_at: string
          vat_rate: number
        }
        Insert: {
          address?: string | null
          company_name?: string
          currency?: string
          email?: string | null
          facebook?: string | null
          id?: number
          instagram?: string | null
          linkedin?: string | null
          logo_url?: string | null
          opening_hours?: string | null
          phone?: string | null
          terms?: string | null
          updated_at?: string
          vat_rate?: number
        }
        Update: {
          address?: string | null
          company_name?: string
          currency?: string
          email?: string | null
          facebook?: string | null
          id?: number
          instagram?: string | null
          linkedin?: string | null
          logo_url?: string | null
          opening_hours?: string | null
          phone?: string | null
          terms?: string | null
          updated_at?: string
          vat_rate?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          brand: string
          category: string
          created_at: string
          daily_price: number
          description: string | null
          doors: number
          features: string[]
          fuel: string
          id: string
          images: string[]
          luggage: number
          mileage: number
          model: string
          monthly_price: number | null
          seats: number
          status: Database["public"]["Enums"]["vehicle_status"]
          transmission: string
          updated_at: string
          weekly_price: number | null
          year: number
        }
        Insert: {
          brand: string
          category: string
          created_at?: string
          daily_price: number
          description?: string | null
          doors?: number
          features?: string[]
          fuel: string
          id?: string
          images?: string[]
          luggage?: number
          mileage?: number
          model: string
          monthly_price?: number | null
          seats?: number
          status?: Database["public"]["Enums"]["vehicle_status"]
          transmission: string
          updated_at?: string
          weekly_price?: number | null
          year: number
        }
        Update: {
          brand?: string
          category?: string
          created_at?: string
          daily_price?: number
          description?: string | null
          doors?: number
          features?: string[]
          fuel?: string
          id?: string
          images?: string[]
          luggage?: number
          mileage?: number
          model?: string
          monthly_price?: number | null
          seats?: number
          status?: Database["public"]["Enums"]["vehicle_status"]
          transmission?: string
          updated_at?: string
          weekly_price?: number | null
          year?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      available_vehicle_ids: {
        Args: { _end: string; _start: string }
        Returns: {
          vehicle_id: string
        }[]
      }
      create_public_reservation: {
        Args: { _options?: Json; _payload: Json }
        Returns: string
      }
      get_public_reservation: {
        Args: { _email: string; _reference: string }
        Returns: Json
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
      next_receipt_number: { Args: never; Returns: string }
      vehicle_busy_ranges: {
        Args: { _vehicle_id: string }
        Returns: {
          end_at: string
          start_at: string
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "manager" | "client"
      reservation_status:
        | "pending"
        | "confirmed"
        | "ongoing"
        | "completed"
        | "cancelled"
      vehicle_status: "available" | "rented" | "maintenance" | "disabled"
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
      app_role: ["admin", "manager", "client"],
      reservation_status: [
        "pending",
        "confirmed",
        "ongoing",
        "completed",
        "cancelled",
      ],
      vehicle_status: ["available", "rented", "maintenance", "disabled"],
    },
  },
} as const

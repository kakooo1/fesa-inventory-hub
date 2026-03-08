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
      inventory_items: {
        Row: {
          available_quantity: number
          category: Database["public"]["Enums"]["item_category"]
          created_at: string
          description: string | null
          id: string
          location: string
          min_stock: number
          name: string
          quantity: number
          unit: string
          updated_at: string
        }
        Insert: {
          available_quantity?: number
          category: Database["public"]["Enums"]["item_category"]
          created_at?: string
          description?: string | null
          id?: string
          location: string
          min_stock?: number
          name: string
          quantity?: number
          unit?: string
          updated_at?: string
        }
        Update: {
          available_quantity?: number
          category?: Database["public"]["Enums"]["item_category"]
          created_at?: string
          description?: string | null
          id?: string
          location?: string
          min_stock?: number
          name?: string
          quantity?: number
          unit?: string
          updated_at?: string
        }
        Relationships: []
      }
      loans: {
        Row: {
          borrowed_at: string
          borrowed_by: string
          created_by: string | null
          expected_return: string
          id: string
          item_id: string
          notes: string | null
          quantity: number
          returned_at: string | null
        }
        Insert: {
          borrowed_at?: string
          borrowed_by: string
          created_by?: string | null
          expected_return: string
          id?: string
          item_id: string
          notes?: string | null
          quantity?: number
          returned_at?: string | null
        }
        Update: {
          borrowed_at?: string
          borrowed_by?: string
          created_by?: string | null
          expected_return?: string
          id?: string
          item_id?: string
          notes?: string | null
          quantity?: number
          returned_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "loans_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenances: {
        Row: {
          cost: number
          created_by: string | null
          date: string
          description: string
          id: string
          km_at_maintenance: number
          performed_by: string
          type: string
          vehicle_id: string
        }
        Insert: {
          cost?: number
          created_by?: string | null
          date?: string
          description: string
          id?: string
          km_at_maintenance: number
          performed_by: string
          type: string
          vehicle_id: string
        }
        Update: {
          cost?: number
          created_by?: string | null
          date?: string
          description?: string
          id?: string
          km_at_maintenance?: number
          performed_by?: string
          type?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenances_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          active: boolean
          created_at: string
          email: string
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          email: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          email?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
          assigned_to: string | null
          brand: string
          created_at: string
          current_km: number
          id: string
          last_maintenance: string | null
          model: string
          next_maintenance_km: number | null
          plate: string
          status: Database["public"]["Enums"]["vehicle_status"]
          updated_at: string
          year: number
        }
        Insert: {
          assigned_to?: string | null
          brand: string
          created_at?: string
          current_km?: number
          id?: string
          last_maintenance?: string | null
          model: string
          next_maintenance_km?: number | null
          plate: string
          status?: Database["public"]["Enums"]["vehicle_status"]
          updated_at?: string
          year: number
        }
        Update: {
          assigned_to?: string | null
          brand?: string
          created_at?: string
          current_km?: number
          id?: string
          last_maintenance?: string | null
          model?: string
          next_maintenance_km?: number | null
          plate?: string
          status?: Database["public"]["Enums"]["vehicle_status"]
          updated_at?: string
          year?: number
        }
        Relationships: []
      }
      material_requests: {
        Row: {
          id: string
          requester_id: string
          request_date: string
          status: Database["public"]["Enums"]["request_status"]
          approved_by: string | null
          approved_date: string | null
          rejected_by: string | null
          rejected_date: string | null
          notes: string | null
          ready_for_pickup: boolean
          marked_ready_by: string | null
          marked_ready_at: string | null
          picked_up_by: string | null
          picked_up_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          requester_id: string
          request_date?: string
          status?: Database["public"]["Enums"]["request_status"]
          approved_by?: string | null
          approved_date?: string | null
          rejected_by?: string | null
          rejected_date?: string | null
          notes?: string | null
          ready_for_pickup?: boolean
          marked_ready_by?: string | null
          marked_ready_at?: string | null
          picked_up_by?: string | null
          picked_up_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          requester_id?: string
          request_date?: string
          status?: Database["public"]["Enums"]["request_status"]
          approved_by?: string | null
          approved_date?: string | null
          rejected_by?: string | null
          rejected_date?: string | null
          notes?: string | null
          ready_for_pickup?: boolean
          marked_ready_by?: string | null
          marked_ready_at?: string | null
          picked_up_by?: string | null
          picked_up_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "material_requests_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          }
        ]
      }
      material_request_items: {
        Row: {
          id: string
          request_id: string
          material_id: string
          quantity_requested: number
          quantity_approved: number | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          request_id: string
          material_id: string
          quantity_requested: number
          quantity_approved?: number | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          request_id?: string
          material_id?: string
          quantity_requested?: number
          quantity_approved?: number | null
          notes?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "material_request_items_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "material_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "material_request_items_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          }
        ]
      }
      stock_history: {
        Row: {
          id: string
          material_id: string
          quantity_change: number
          previous_quantity: number
          new_quantity: number
          change_type: string
          changed_by: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          material_id: string
          quantity_change: number
          previous_quantity: number
          new_quantity: number
          change_type: string
          changed_by?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          material_id?: string
          quantity_change?: number
          previous_quantity?: number
          new_quantity?: number
          change_type?: string
          changed_by?: string | null
          notes?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_history_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "inventory_items"
            referencedColumns: ["id"]
          }
        ]
      }
      notifications: {
        Row: {
          id: string
          recipient_role: Database["public"]["Enums"]["app_role"]
          recipient_id: string | null
          title: string
          message: string
          read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          recipient_role: Database["public"]["Enums"]["app_role"]
          recipient_id?: string | null
          title: string
          message: string
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          recipient_role?: Database["public"]["Enums"]["app_role"]
          recipient_id?: string | null
          title?: string
          message?: string
          read?: boolean
          created_at?: string
        }
        Relationships: []
      }
      equipment_repairs: {
        Row: {
          id: string
          equipment_name: string
          source: Database["public"]["Enums"]["repair_source"]
          description: string | null
          status: Database["public"]["Enums"]["repair_status"]
          entry_date: string
          estimated_repair_date: string | null
          completion_date: string | null
          technician_assigned_to: string | null
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          equipment_name: string
          source: Database["public"]["Enums"]["repair_source"]
          description?: string | null
          status?: Database["public"]["Enums"]["repair_status"]
          entry_date?: string
          estimated_repair_date?: string | null
          completion_date?: string | null
          technician_assigned_to?: string | null
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          equipment_name?: string
          source?: Database["public"]["Enums"]["repair_source"]
          description?: string | null
          status?: Database["public"]["Enums"]["repair_status"]
          entry_date?: string
          estimated_repair_date?: string | null
          completion_date?: string | null
          technician_assigned_to?: string | null
          created_by?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "equipment_repairs_technician_assigned_to_fkey"
            columns: ["technician_assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "equipment_repairs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "supervisor" | "technician" | "bodeguero"
      item_category: "material" | "tool" | "equipment" | "clothing" | "epp"
      item_status: "available" | "borrowed" | "maintenance"
      vehicle_status: "ok" | "maintenance" | "inactive"
      request_status: "pending" | "approved" | "rejected" | "dispatched" | "returned"
      repair_status: "ingresado" | "en_reparacion" | "reparado" | "no_reparable"
      repair_source: "interno" | "externo"
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
      app_role: ["admin", "supervisor", "technician", "bodeguero"],
      item_category: ["material", "tool", "equipment", "clothing", "epp"],
      item_status: ["available", "borrowed", "maintenance"],
      vehicle_status: ["ok", "maintenance", "inactive"],
      request_status: ["pending", "approved", "rejected", "dispatched", "returned"],
      repair_status: ["ingresado", "en_reparacion", "reparado", "no_reparable"],
      repair_source: ["interno", "externo"],
    },
  },
} as const

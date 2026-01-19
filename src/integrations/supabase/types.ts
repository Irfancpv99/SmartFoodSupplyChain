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
      blockchain_records: {
        Row: {
          block_number: number | null
          created_at: string
          data_hash: string
          id: string
          metadata: Json | null
          previous_hash: string | null
          record_type: string
          reference_id: string
          reference_table: string
          status: string | null
          timestamp: string
          tx_id: string | null
        }
        Insert: {
          block_number?: number | null
          created_at?: string
          data_hash: string
          id?: string
          metadata?: Json | null
          previous_hash?: string | null
          record_type: string
          reference_id: string
          reference_table: string
          status?: string | null
          timestamp?: string
          tx_id?: string | null
        }
        Update: {
          block_number?: number | null
          created_at?: string
          data_hash?: string
          id?: string
          metadata?: Json | null
          previous_hash?: string | null
          record_type?: string
          reference_id?: string
          reference_table?: string
          status?: string | null
          timestamp?: string
          tx_id?: string | null
        }
        Relationships: []
      }
      documents: {
        Row: {
          blockchain_anchored_at: string | null
          blockchain_tx_id: string | null
          created_at: string
          ddt_number: string
          delivery_date: string | null
          file_hash: string | null
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string
          id: string
          metadata: Json | null
          rejection_reason: string | null
          school_id: string | null
          status: Database["public"]["Enums"]["verification_status"] | null
          updated_at: string
          upload_date: string
          vendor_id: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          blockchain_anchored_at?: string | null
          blockchain_tx_id?: string | null
          created_at?: string
          ddt_number: string
          delivery_date?: string | null
          file_hash?: string | null
          file_name: string
          file_path: string
          file_size?: number | null
          file_type: string
          id?: string
          metadata?: Json | null
          rejection_reason?: string | null
          school_id?: string | null
          status?: Database["public"]["Enums"]["verification_status"] | null
          updated_at?: string
          upload_date?: string
          vendor_id: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          blockchain_anchored_at?: string | null
          blockchain_tx_id?: string | null
          created_at?: string
          ddt_number?: string
          delivery_date?: string | null
          file_hash?: string | null
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string
          id?: string
          metadata?: Json | null
          rejection_reason?: string | null
          school_id?: string | null
          status?: Database["public"]["Enums"]["verification_status"] | null
          updated_at?: string
          upload_date?: string
          vendor_id?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "public_menus"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "documents_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "public_schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "public_vendors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      ingredients: {
        Row: {
          created_at: string
          document_id: string | null
          expiry_date: string | null
          id: string
          lot_number: string | null
          name: string
          origin: string | null
          product_id: string | null
          quantity: number | null
          unit: string | null
        }
        Insert: {
          created_at?: string
          document_id?: string | null
          expiry_date?: string | null
          id?: string
          lot_number?: string | null
          name: string
          origin?: string | null
          product_id?: string | null
          quantity?: number | null
          unit?: string | null
        }
        Update: {
          created_at?: string
          document_id?: string | null
          expiry_date?: string | null
          id?: string
          lot_number?: string | null
          name?: string
          origin?: string | null
          product_id?: string | null
          quantity?: number | null
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ingredients_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ingredients_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "public_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ingredients_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_item_ingredients: {
        Row: {
          created_at: string
          id: string
          ingredient_id: string
          menu_item_id: string
          quantity: number | null
          unit: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          ingredient_id: string
          menu_item_id: string
          quantity?: number | null
          unit?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          ingredient_id?: string
          menu_item_id?: string
          quantity?: number | null
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_item_ingredients_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_item_ingredients_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "public_ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_item_ingredients_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_item_ingredients_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "public_menu_items"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_items: {
        Row: {
          allergens: string[] | null
          category: string | null
          created_at: string
          description: string | null
          id: string
          menu_id: string
          name: string
          nutritional_info: Json | null
          order_index: number | null
        }
        Insert: {
          allergens?: string[] | null
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          menu_id: string
          name: string
          nutritional_info?: Json | null
          order_index?: number | null
        }
        Update: {
          allergens?: string[] | null
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          menu_id?: string
          name?: string
          nutritional_info?: Json | null
          order_index?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_menu_id_fkey"
            columns: ["menu_id"]
            isOneToOne: false
            referencedRelation: "menus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_items_menu_id_fkey"
            columns: ["menu_id"]
            isOneToOne: false
            referencedRelation: "public_menus"
            referencedColumns: ["id"]
          },
        ]
      }
      menus: {
        Row: {
          created_at: string
          created_by: string | null
          date: string
          description: string | null
          id: string
          is_published: boolean | null
          meal_type: string | null
          menu_id: string
          name: string
          qr_code_url: string | null
          school_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          date: string
          description?: string | null
          id?: string
          is_published?: boolean | null
          meal_type?: string | null
          menu_id: string
          name: string
          qr_code_url?: string | null
          school_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          date?: string
          description?: string | null
          id?: string
          is_published?: boolean | null
          meal_type?: string | null
          menu_id?: string
          name?: string
          qr_code_url?: string | null
          school_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "menus_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "public_menus"
            referencedColumns: ["school_id"]
          },
          {
            foreignKeyName: "menus_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "public_schools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menus_school_id_fkey"
            columns: ["school_id"]
            isOneToOne: false
            referencedRelation: "schools"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string | null
          certifications: string[] | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          origin: string | null
          unit: string | null
          updated_at: string
          vendor_id: string
        }
        Insert: {
          category?: string | null
          certifications?: string[] | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          origin?: string | null
          unit?: string | null
          updated_at?: string
          vendor_id: string
        }
        Update: {
          category?: string | null
          certifications?: string[] | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          origin?: string | null
          unit?: string | null
          updated_at?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "public_vendors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      schools: {
        Row: {
          address: string | null
          admin_user_id: string | null
          city: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          id: string
          name: string
          postal_code: string | null
          province: string | null
          student_count: number | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          admin_user_id?: string | null
          city?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          name: string
          postal_code?: string | null
          province?: string | null
          student_count?: number | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          admin_user_id?: string | null
          city?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          name?: string
          postal_code?: string | null
          province?: string | null
          student_count?: number | null
          updated_at?: string
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
      vendors: {
        Row: {
          address: string | null
          business_name: string | null
          certifications: string[] | null
          city: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          id: string
          is_verified: boolean | null
          name: string
          postal_code: string | null
          province: string | null
          updated_at: string
          user_id: string | null
          vat_number: string | null
        }
        Insert: {
          address?: string | null
          business_name?: string | null
          certifications?: string[] | null
          city?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          is_verified?: boolean | null
          name: string
          postal_code?: string | null
          province?: string | null
          updated_at?: string
          user_id?: string | null
          vat_number?: string | null
        }
        Update: {
          address?: string | null
          business_name?: string | null
          certifications?: string[] | null
          city?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          is_verified?: boolean | null
          name?: string
          postal_code?: string | null
          province?: string | null
          updated_at?: string
          user_id?: string | null
          vat_number?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      public_documents: {
        Row: {
          blockchain_tx_id: string | null
          ddt_number: string | null
          delivery_date: string | null
          id: string | null
          status: Database["public"]["Enums"]["verification_status"] | null
          vendor_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "public_vendors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      public_ingredients: {
        Row: {
          document_id: string | null
          expiry_date: string | null
          id: string | null
          lot_number: string | null
          name: string | null
          origin: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ingredients_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ingredients_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "public_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      public_menu_item_ingredients: {
        Row: {
          id: string | null
          ingredient_id: string | null
          menu_item_id: string | null
          quantity: number | null
          unit: string | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_item_ingredients_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_item_ingredients_ingredient_id_fkey"
            columns: ["ingredient_id"]
            isOneToOne: false
            referencedRelation: "public_ingredients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_item_ingredients_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_item_ingredients_menu_item_id_fkey"
            columns: ["menu_item_id"]
            isOneToOne: false
            referencedRelation: "public_menu_items"
            referencedColumns: ["id"]
          },
        ]
      }
      public_menu_items: {
        Row: {
          allergens: string[] | null
          category: string | null
          description: string | null
          id: string | null
          menu_id: string | null
          name: string | null
          order_index: number | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_menu_id_fkey"
            columns: ["menu_id"]
            isOneToOne: false
            referencedRelation: "menus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "menu_items_menu_id_fkey"
            columns: ["menu_id"]
            isOneToOne: false
            referencedRelation: "public_menus"
            referencedColumns: ["id"]
          },
        ]
      }
      public_menus: {
        Row: {
          created_at: string | null
          date: string | null
          description: string | null
          id: string | null
          is_published: boolean | null
          meal_type: string | null
          menu_id: string | null
          name: string | null
          school_city: string | null
          school_id: string | null
          school_name: string | null
          school_province: string | null
        }
        Relationships: []
      }
      public_schools: {
        Row: {
          city: string | null
          id: string | null
          name: string | null
          province: string | null
        }
        Relationships: []
      }
      public_vendors: {
        Row: {
          business_name: string | null
          city: string | null
          id: string | null
          name: string | null
          province: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      generate_ddt_number: { Args: never; Returns: string }
      get_user_school_id: { Args: { _user_id: string }; Returns: string }
      get_user_vendor_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "school_admin" | "vendor"
      verification_status: "pending" | "verified" | "rejected" | "expired"
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
      app_role: ["admin", "school_admin", "vendor"],
      verification_status: ["pending", "verified", "rejected", "expired"],
    },
  },
} as const

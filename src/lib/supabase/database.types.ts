export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      company_settings: {
        Row: {
          id: string;
          user_id: string;
          company_name: string | null;
          company_address: string | null;
          company_phone: string | null;
          company_website: string | null;
          logo_path: string | null;
          default_engineer_name: string | null;
          default_report_email: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          company_name?: string | null;
          company_address?: string | null;
          company_phone?: string | null;
          company_website?: string | null;
          logo_path?: string | null;
          default_engineer_name?: string | null;
          default_report_email?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          company_name?: string | null;
          company_address?: string | null;
          company_phone?: string | null;
          company_website?: string | null;
          logo_path?: string | null;
          default_engineer_name?: string | null;
          default_report_email?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      surveys: {
        Row: {
          id: string;
          user_id: string;
          reference_number: string | null;
          property_address: string | null;
          property_type: string | null;
          storeys: number | null;
          has_garage: boolean | null;
          garage_type: string | null;
          attachment_type: string | null;
          construction_type: string | null;
          instructing_party: string | null;
          engineer_name: string | null;
          current_step: number;
          status: string;
          executive_summary: string | null;
          introduction: string | null;
          conclusions: string | null;
          recommendations: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          reference_number?: string | null;
          property_address?: string | null;
          property_type?: string | null;
          storeys?: number | null;
          has_garage?: boolean | null;
          garage_type?: string | null;
          attachment_type?: string | null;
          construction_type?: string | null;
          instructing_party?: string | null;
          engineer_name?: string | null;
          current_step?: number;
          status?: string;
          executive_summary?: string | null;
          introduction?: string | null;
          conclusions?: string | null;
          recommendations?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          reference_number?: string | null;
          property_address?: string | null;
          property_type?: string | null;
          storeys?: number | null;
          has_garage?: boolean | null;
          garage_type?: string | null;
          attachment_type?: string | null;
          construction_type?: string | null;
          instructing_party?: string | null;
          engineer_name?: string | null;
          current_step?: number;
          status?: string;
          executive_summary?: string | null;
          introduction?: string | null;
          conclusions?: string | null;
          recommendations?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      survey_areas: {
        Row: {
          id: string;
          survey_id: string;
          user_id: string;
          name: string;
          area_type: string;
          condition_rating: string | null;
          notes: string | null;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          survey_id: string;
          user_id: string;
          name: string;
          area_type: string;
          condition_rating?: string | null;
          notes?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          survey_id?: string;
          user_id?: string;
          name?: string;
          area_type?: string;
          condition_rating?: string | null;
          notes?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      survey_photos: {
        Row: {
          id: string;
          survey_id: string;
          area_id: string | null;
          user_id: string;
          storage_path: string | null;
          photo_url: string | null;
          cloudinary_public_id: string | null;
          width: number | null;
          height: number | null;
          caption: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          survey_id: string;
          area_id?: string | null;
          user_id: string;
          storage_path?: string | null;
          photo_url?: string | null;
          cloudinary_public_id?: string | null;
          width?: number | null;
          height?: number | null;
          caption?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          survey_id?: string;
          area_id?: string | null;
          user_id?: string;
          storage_path?: string | null;
          photo_url?: string | null;
          cloudinary_public_id?: string | null;
          width?: number | null;
          height?: number | null;
          caption?: string | null;
          sort_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

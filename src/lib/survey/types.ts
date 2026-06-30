export type ConditionRating =
  | "observation"
  | "monitor"
  | "defect"
  | "significant";

export type AreaType = "internal" | "external";

export type SurveyStep = 0 | 1 | 2 | 3;

export type SurveyStatus = "draft" | "in_progress" | "complete";

export interface Profile {
  id: string;
  full_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface CompanySettings {
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
}

export interface Survey {
  id: string;
  user_id: string;
  reference_number: string | null;
  property_address: string | null;
  property_type: string | null;
  storeys: number | null;
  has_garage: boolean | null;
  attachment_type: string | null;
  construction_type: string | null;
  instructing_party: string | null;
  engineer_name: string | null;
  current_step: number;
  status: SurveyStatus;
  executive_summary: string | null;
  introduction: string | null;
  conclusions: string | null;
  recommendations: string | null;
  created_at: string;
  updated_at: string;
}

export interface SurveyArea {
  id: string;
  survey_id: string;
  user_id: string;
  name: string;
  area_type: AreaType;
  condition_rating: ConditionRating | null;
  notes: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface SurveyPhoto {
  id: string;
  survey_id: string;
  area_id: string | null;
  user_id: string;
  storage_path: string;
  caption: string | null;
  sort_order: number;
  created_at: string;
}

export interface SurveyWithRelations extends Survey {
  survey_areas: SurveyArea[];
  survey_photos: SurveyPhoto[];
}

export interface SurveyListItem {
  id: string;
  property_address: string | null;
  reference_number: string | null;
  updated_at: string;
  area_count: number;
}

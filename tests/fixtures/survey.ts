import type { CompanySettings, Survey, SurveyArea, SurveyPhoto } from "@/lib/survey/types";

export const TEST_USER_ID = "11111111-1111-4111-8111-111111111111";
export const TEST_SURVEY_ID = "22222222-2222-4222-8222-222222222222";
export const TEST_AREA_ID = "33333333-3333-4333-8333-333333333333";
export const TEST_PHOTO_ID = "44444444-4444-4444-8444-444444444444";

export const baseSurvey: Survey = {
  id: TEST_SURVEY_ID,
  user_id: TEST_USER_ID,
  reference_number: "REF-001",
  property_address: "12 Example Street",
  property_type: "Detached house",
  storeys: 2,
  has_garage: true,
  garage_type: "Detached garage",
  attachment_type: "Detached",
  construction_type: "Cavity masonry",
  instructing_party: "Homeowner",
  engineer_name: "A. Engineer",
  current_step: 3,
  status: "complete",
  executive_summary: "Executive summary text.",
  introduction: "Introduction text.",
  conclusions: "Conclusions text.",
  recommendations: "1. Review this report.",
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
};

export const baseCompany: CompanySettings = {
  id: "company-1",
  user_id: TEST_USER_ID,
  company_name: "Example Surveyors Ltd",
  company_address: "1 Survey Lane",
  company_phone: "01234 567890",
  company_website: "https://example.com",
  logo_path: null,
  default_engineer_name: "A. Engineer",
  default_report_email: "reports@example.com",
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
};

export function makeArea(
  overrides: Partial<SurveyArea> & Pick<SurveyArea, "name" | "condition_rating">,
): SurveyArea {
  return {
    id: TEST_AREA_ID,
    survey_id: TEST_SURVEY_ID,
    user_id: TEST_USER_ID,
    area_type: "internal",
    notes: "Crack noted above window.",
    sort_order: 0,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

export function makePhoto(overrides: Partial<SurveyPhoto> = {}): SurveyPhoto {
  return {
    id: TEST_PHOTO_ID,
    survey_id: TEST_SURVEY_ID,
    area_id: TEST_AREA_ID,
    user_id: TEST_USER_ID,
    storage_path: null,
    photo_url: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
    cloudinary_public_id: "surveys/demo/sample",
    width: 800,
    height: 600,
    caption: "Sample crack photo",
    sort_order: 0,
    created_at: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getCompanySettings: vi.fn(),
  getSurveyWithRelations: vi.fn(),
  requireUser: vi.fn(),
  createClient: vi.fn(),
  buildSurveyDocx: vi.fn(),
  getReportFilename: vi.fn(),
}));

vi.mock("@/lib/actions/survey-actions", () => ({
  getCompanySettings: mocks.getCompanySettings,
  getSurveyWithRelations: mocks.getSurveyWithRelations,
}));

vi.mock("@/lib/supabase/server", () => ({
  requireUser: mocks.requireUser,
  createClient: mocks.createClient,
}));

vi.mock("@/lib/report/build-docx", () => ({
  buildSurveyDocx: mocks.buildSurveyDocx,
  getReportFilename: mocks.getReportFilename,
}));

import { buildSurveyReportBuffer, sendSurveyReportEmail } from "@/lib/report/email-report";
import { baseSurvey } from "../fixtures/survey";

describe("email report helpers", () => {
  beforeEach(() => {
    mocks.requireUser.mockResolvedValue({ id: baseSurvey.user_id });
    mocks.getCompanySettings.mockResolvedValue({
      default_report_email: "reports@example.com",
      logo_path: null,
    });
    mocks.getSurveyWithRelations.mockResolvedValue({
      ...baseSurvey,
      survey_areas: [],
      survey_photos: [],
    });
    mocks.createClient.mockResolvedValue({
      storage: {
        from: vi.fn().mockReturnValue({
          download: vi.fn().mockResolvedValue({ data: null }),
        }),
      },
    });
    mocks.buildSurveyDocx.mockResolvedValue(Buffer.from("docx-content"));
    mocks.getReportFilename.mockReturnValue("report.docx");
  });

  it("builds a report buffer for an authenticated survey", async () => {
    const result = await buildSurveyReportBuffer(baseSurvey.id);

    expect(result.filename).toBe("report.docx");
    expect(Buffer.isBuffer(result.buffer)).toBe(true);
    expect(result.survey.id).toBe(baseSurvey.id);
  });

  it("requires email service configuration before sending", async () => {
    delete process.env.RESEND_API_KEY;
    delete process.env.RESEND_FROM_EMAIL;

    await expect(sendSurveyReportEmail(baseSurvey.id)).rejects.toThrow(
      "Email service is not configured.",
    );
  });
});

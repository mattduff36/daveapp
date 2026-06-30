import { describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/surveys/[id]/email/route";

const sendSurveyReportEmail = vi.fn();

vi.mock("@/lib/report/email-report", () => ({
  sendSurveyReportEmail: (...args: unknown[]) => sendSurveyReportEmail(...args),
}));

describe("POST /api/surveys/[id]/email", () => {
  it("returns success when the report email sends", async () => {
    sendSurveyReportEmail.mockResolvedValueOnce({ success: true });

    const response = await POST(new Request("http://localhost/api/surveys/abc/email"), {
      params: Promise.resolve({ id: "abc" }),
    });
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.success).toBe(true);
    expect(sendSurveyReportEmail).toHaveBeenCalledWith("abc");
  });

  it("returns a JSON error when email sending fails", async () => {
    sendSurveyReportEmail.mockRejectedValueOnce(
      new Error("Default report email is not configured in company settings."),
    );

    const response = await POST(new Request("http://localhost/api/surveys/abc/email"), {
      params: Promise.resolve({ id: "abc" }),
    });
    const payload = await response.json();

    expect(response.status).toBe(500);
    expect(payload.error).toContain("Default report email");
  });
});

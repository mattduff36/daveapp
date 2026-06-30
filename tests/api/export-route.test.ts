import { describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/surveys/[id]/export/route";

const buildSurveyReportBuffer = vi.fn();

vi.mock("@/lib/report/email-report", () => ({
  buildSurveyReportBuffer: (...args: unknown[]) =>
    buildSurveyReportBuffer(...args),
}));

describe("GET /api/surveys/[id]/export", () => {
  it("returns a Word document when export succeeds", async () => {
    buildSurveyReportBuffer.mockResolvedValueOnce({
      buffer: Buffer.from("docx-content"),
      filename: "12-example-street-ref-001.docx",
    });

    const response = await GET(new Request("http://localhost/api/surveys/abc/export"), {
      params: Promise.resolve({ id: "abc" }),
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("wordprocessingml");
    expect(response.headers.get("Content-Disposition")).toContain(
      "12-example-street-ref-001.docx",
    );
    expect(buildSurveyReportBuffer).toHaveBeenCalledWith("abc");
  });

  it("returns a JSON error when export fails", async () => {
    buildSurveyReportBuffer.mockRejectedValueOnce(new Error("Survey not found"));

    const response = await GET(new Request("http://localhost/api/surveys/missing/export"), {
      params: Promise.resolve({ id: "missing" }),
    });
    const payload = await response.json();

    expect(response.status).toBe(500);
    expect(payload.error).toBe("Survey not found");
  });
});

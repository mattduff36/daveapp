import { describe, expect, it } from "vitest";
import { buildSurveyDocx, getReportFilename } from "@/lib/report/build-docx";
import {
  baseCompany,
  baseSurvey,
  makeArea,
  makePhoto,
} from "../../../tests/fixtures/survey";

describe("buildSurveyDocx", () => {
  it("generates a valid docx buffer for a complete survey", async () => {
    const buffer = await buildSurveyDocx({
      survey: baseSurvey,
      areas: [
        makeArea({ name: "Kitchen", condition_rating: "defect" }),
        makeArea({
          name: "Front elevation",
          condition_rating: "monitor",
          area_type: "external",
        }),
      ],
      photos: [makePhoto()],
      company: baseCompany,
      photoBuffers: new Map(),
      logoBuffer: undefined,
    });

    expect(Buffer.isBuffer(buffer)).toBe(true);
    expect(buffer.length).toBeGreaterThan(1000);
    expect(buffer.subarray(0, 2).toString("utf8")).toBe("PK");
  });

  it("builds a stable report filename", () => {
    expect(getReportFilename(baseSurvey)).toBe(
      "12-example-street-REF-001.docx",
    );
  });
});

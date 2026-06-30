import JSZip from "jszip";
import { describe, expect, it } from "vitest";
import { buildSurveyDocx, getReportFilename } from "@/lib/report/build-docx";
import {
  baseCompany,
  baseSurvey,
  makeArea,
  makePhoto,
  TEST_AREA_ID,
  TEST_PHOTO_ID,
} from "../../../tests/fixtures/survey";

async function extractDocxText(buffer: Buffer) {
  const zip = await JSZip.loadAsync(buffer);
  const xml = await zip.file("word/document.xml")?.async("string");
  return xml ?? "";
}

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

  it("includes site observations, area notes, and photo captions in the docx", async () => {
    const notes = "Crack noted above window.";
    const buffer = await buildSurveyDocx({
      survey: baseSurvey,
      areas: [
        makeArea({
          name: "Kitchen",
          condition_rating: "defect",
          notes,
        }),
      ],
      photos: [
        makePhoto({
          area_id: TEST_AREA_ID,
          caption: "Crack above window",
        }),
      ],
      company: baseCompany,
      photoBuffers: new Map([
        [TEST_PHOTO_ID, Buffer.from([0xff, 0xd8, 0xff, 0x00])],
      ]),
      logoBuffer: undefined,
    });

    const xml = await extractDocxText(buffer);

    expect(xml).toContain("Site Observations");
    expect(xml).toContain("Internal Areas");
    expect(xml).toContain("Kitchen");
    expect(xml).toContain("Crack noted above window");
    expect(xml).toContain("Crack above window");
  });

  it("builds a stable report filename", () => {
    expect(getReportFilename(baseSurvey)).toBe(
      "12-example-street-REF-001.docx",
    );
  });
});

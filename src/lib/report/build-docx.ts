import {
  AlignmentType,
  Document,
  HeadingLevel,
  ImageRun,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";
import type { CompanySettings, Survey, SurveyArea, SurveyPhoto } from "@/lib/survey/types";
import {
  buildAreaObservation,
  buildPropertyDescription,
} from "@/lib/survey/report-text";

interface BuildDocxInput {
  survey: Survey;
  areas: SurveyArea[];
  photos: SurveyPhoto[];
  company: CompanySettings | null;
  photoBuffers: Map<string, Buffer>;
  logoBuffer?: Buffer;
}

function paragraph(
  text: string,
  options?: { heading?: (typeof HeadingLevel)[keyof typeof HeadingLevel]; bold?: boolean },
) {
  if (options?.heading) {
    return new Paragraph({
      text,
      heading: options.heading,
    });
  }

  return new Paragraph({
    children: [
      new TextRun({
        text,
        bold: options?.bold,
      }),
    ],
  });
}

function splitLines(text: string) {
  return text.split(/\n+/).filter(Boolean);
}

export async function buildSurveyDocx({
  survey,
  areas,
  photos,
  company,
  photoBuffers,
  logoBuffer,
}: BuildDocxInput) {
  const internalAreas = areas.filter((area) => area.area_type === "internal");
  const externalAreas = areas.filter((area) => area.area_type === "external");
  const address = survey.property_address || "Structural Survey Report";
  const ref = survey.reference_number || "Draft";

  const coverChildren: Paragraph[] = [];

  if (logoBuffer) {
    coverChildren.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new ImageRun({
            data: logoBuffer,
            transformation: { width: 180, height: 80 },
            type: "png",
          }),
        ],
      }),
    );
  }

  if (company?.company_name) {
    coverChildren.push(
      paragraph(company.company_name, { bold: true }),
      paragraph(company.company_address || ""),
      paragraph(
        [company.company_phone, company.company_website]
          .filter(Boolean)
          .join(" · "),
      ),
    );
  }

  coverChildren.push(
    paragraph("Structural Visual Survey Report", { heading: HeadingLevel.TITLE }),
    paragraph(address, { heading: HeadingLevel.HEADING_1 }),
    paragraph(`Reference: ${ref}`),
    paragraph(`Engineer: ${survey.engineer_name || "Not recorded"}`),
    paragraph(`Instructing party: ${survey.instructing_party || "Not recorded"}`),
  );

  const contents = [
    paragraph("Contents", { heading: HeadingLevel.HEADING_1 }),
    paragraph("1. Executive Summary"),
    paragraph("2. Introduction"),
    paragraph("3. Property Description"),
    paragraph("4. Site Observations"),
    paragraph("5. Conclusions"),
    paragraph("6. Recommendations"),
    paragraph("7. Photo Appendix"),
  ];

  const sections = [
    paragraph("Executive Summary", { heading: HeadingLevel.HEADING_1 }),
    ...splitLines(survey.executive_summary || "").map((line) => paragraph(line)),
    paragraph("Introduction", { heading: HeadingLevel.HEADING_1 }),
    ...splitLines(survey.introduction || "").map((line) => paragraph(line)),
    paragraph("Property Description", { heading: HeadingLevel.HEADING_1 }),
    paragraph(buildPropertyDescription(survey)),
    paragraph("Site Observations", { heading: HeadingLevel.HEADING_1 }),
  ];

  if (internalAreas.length > 0) {
    sections.push(paragraph("Internal Areas", { heading: HeadingLevel.HEADING_2 }));
    for (const area of internalAreas) {
      sections.push(
        paragraph(area.name, { heading: HeadingLevel.HEADING_3 }),
        ...splitLines(buildAreaObservation(area)).map((line) => paragraph(line)),
      );
    }
  }

  if (externalAreas.length > 0) {
    sections.push(paragraph("External Elevations", { heading: HeadingLevel.HEADING_2 }));
    for (const area of externalAreas) {
      sections.push(
        paragraph(area.name, { heading: HeadingLevel.HEADING_3 }),
        ...splitLines(buildAreaObservation(area)).map((line) => paragraph(line)),
      );
    }
  }

  sections.push(
    paragraph("Conclusions", { heading: HeadingLevel.HEADING_1 }),
    ...splitLines(survey.conclusions || "").map((line) => paragraph(line)),
    paragraph("Recommendations", { heading: HeadingLevel.HEADING_1 }),
    ...splitLines(survey.recommendations || "").map((line) => paragraph(line)),
    paragraph("Photo Appendix", { heading: HeadingLevel.HEADING_1 }),
  );

  for (const photo of photos) {
    const buffer = photoBuffers.get(photo.storage_path);
    const area = areas.find((item) => item.id === photo.area_id);
    sections.push(
      paragraph(area ? `${area.name}` : "General", { heading: HeadingLevel.HEADING_3 }),
    );

    if (photo.caption) {
      sections.push(paragraph(photo.caption));
    }

    if (buffer) {
      sections.push(
        new Paragraph({
          children: [
            new ImageRun({
              data: buffer,
              transformation: { width: 420, height: 315 },
              type: buffer[0] === 0xff && buffer[1] === 0xd8 ? "jpg" : "png",
            }),
          ],
        }),
      );
    }
  }

  const footerText = company?.company_name
    ? `${company.company_name}${company.company_address ? ` · ${company.company_address}` : ""}`
    : "Structural Survey Report";

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: coverChildren,
      },
      {
        properties: {},
        children: contents,
      },
      {
        properties: {},
        children: sections,
      },
      {
        properties: {},
        children: [
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [paragraph(footerText)],
                  }),
                ],
              }),
            ],
          }),
        ],
      },
    ],
  });

  return Packer.toBuffer(doc);
}

export function getReportFilename(survey: Survey) {
  const address = survey.property_address || "structural-survey";
  const ref = survey.reference_number || survey.id.slice(0, 8);
  return `${address.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-${ref}.docx`;
}

import type { CompanySettings, Survey, SurveyArea } from "@/lib/survey/types";

interface ReportDraftInput {
  survey: Survey;
  areas: SurveyArea[];
  company?: CompanySettings | null;
}

function countBySeverity(areas: SurveyArea[]) {
  return areas.reduce(
    (acc, area) => {
      if (area.condition_rating === "defect") acc.defects += 1;
      if (area.condition_rating === "significant") acc.significant += 1;
      if (area.condition_rating === "monitor") acc.monitor += 1;
      return acc;
    },
    { defects: 0, significant: 0, monitor: 0 },
  );
}

export function buildIntroduction({ survey, company }: ReportDraftInput) {
  const engineer =
    survey.engineer_name ||
    company?.default_engineer_name ||
    "the inspecting engineer";
  const address = survey.property_address || "the subject property";
  const instructing = survey.instructing_party || "the instructing party";

  return `This report presents the findings of a visual structural inspection undertaken at ${address}. The inspection was instructed by ${instructing} and carried out by ${engineer}. The survey comprised a non-invasive visual assessment of accessible areas and elevations, with observations recorded room by room and elevation by elevation. No opening-up, testing, or invasive investigation was undertaken unless otherwise stated.`;
}

export function buildExecutiveSummary({ survey, areas }: ReportDraftInput) {
  const { defects, significant, monitor } = countBySeverity(areas);
  const address = survey.property_address || "the property";

  if (significant > 0) {
    return `A visual structural survey was completed at ${address}. ${significant} significant defect${significant === 1 ? "" : "s"} and ${defects} defect${defects === 1 ? "" : "s"} were identified during the inspection. Immediate further investigation and remedial works are recommended in relation to the significant items.`;
  }

  if (defects > 0) {
    return `A visual structural survey was completed at ${address}. ${defects} defect${defects === 1 ? "" : "s"} were recorded together with ${monitor} item${monitor === 1 ? "" : "s"} requiring monitoring. No significant structural distress was identified, although remedial attention is advised for the recorded defects.`;
  }

  if (monitor > 0) {
    return `A visual structural survey was completed at ${address}. No significant defects were identified. ${monitor} observation${monitor === 1 ? "" : "s"} warrant periodic monitoring. Overall, the property appeared structurally stable at the time of inspection based on visual evidence only.`;
  }

  return `A visual structural survey was completed at ${address}. No significant structural defects were identified during the accessible visual inspection. Observations are recorded by area within this report for completeness.`;
}

export function buildConclusions({ areas }: ReportDraftInput) {
  const { defects, significant } = countBySeverity(areas);

  if (significant > 0) {
    return `Based on the visual inspection, significant structural defects were observed that require prompt further investigation and remedial design. The property should not be assumed to be free from hidden defects beyond the accessible areas inspected.`;
  }

  if (defects > 0) {
    return `Based on the visual inspection, localised defects were observed. These do not necessarily indicate widespread structural failure, but they should be addressed to prevent deterioration. Hidden defects may exist in inaccessible areas.`;
  }

  return `Based on the visual inspection, no significant structural defects were observed in the accessible areas inspected. This conclusion is limited to the scope of a non-invasive visual survey.`;
}

export function buildRecommendations({ areas }: ReportDraftInput) {
  const { defects, significant, monitor } = countBySeverity(areas);

  const items: string[] = [];

  if (significant > 0) {
    items.push(
      "Arrange urgent further investigation of all items classified as significant, including opening-up where appropriate and specialist input if required.",
    );
  }

  if (defects > 0) {
    items.push(
      "Implement remedial repairs to recorded defects by suitably qualified contractors following detailed specification.",
    );
  }

  if (monitor > 0) {
    items.push(
      "Monitor identified items at regular intervals and record any change in width, extent, or associated distress.",
    );
  }

  items.push(
    "Review this report with the instructing party before commencing works or making financial decisions.",
  );

  return items.map((item, index) => `${index + 1}. ${item}`).join("\n");
}

export function buildAreaObservation(area: SurveyArea) {
  const rating = area.condition_rating
    ? area.condition_rating.charAt(0).toUpperCase() +
      area.condition_rating.slice(1)
    : "Not rated";
  const notes = area.notes?.trim() || "No additional notes recorded.";

  return `${area.name} — Condition: ${rating}.\n${notes}`;
}

export function buildPropertyDescription(survey: Survey) {
  const parts = [
    survey.property_type && `Property type: ${survey.property_type}.`,
    survey.storeys != null && `Storeys: ${survey.storeys}.`,
    survey.attachment_type && `Attachment: ${survey.attachment_type}.`,
    survey.has_garage != null &&
      `Garage: ${survey.has_garage ? "Yes" : "No"}.`,
    survey.construction_type &&
      `Construction: ${survey.construction_type}.`,
  ].filter(Boolean);

  return parts.length > 0
    ? parts.join(" ")
    : "Property details were not fully recorded.";
}

export function buildReportDraft(input: ReportDraftInput) {
  return {
    executive_summary: buildExecutiveSummary(input),
    introduction: buildIntroduction(input),
    conclusions: buildConclusions(input),
    recommendations: buildRecommendations(input),
  };
}

import type { AreaType, ConditionRating } from "@/lib/survey/types";

export const SURVEY_STEPS = [
  "Property",
  "Areas",
  "Survey",
  "Review & Report",
] as const;

export const PROPERTY_TYPES = [
  "Detached house",
  "Semi-detached house",
  "Terraced house",
  "Flat / apartment",
  "Bungalow",
  "Other",
] as const;

export const ATTACHMENT_TYPES = [
  "Detached",
  "Semi-detached",
  "Terraced",
  "End terrace",
  "Mid terrace",
  "Adjoining",
] as const;

export const GARAGE_TYPES = [
  "Detached garage",
  "Adjoining garage",
  "Integral garage",
] as const;

export const CONSTRUCTION_TYPES = [
  "Cavity masonry",
  "Solid masonry",
  "Stone",
  "Timber frame",
  "Steel frame",
  "Concrete frame",
  "Mixed / unknown",
  "Other",
] as const;

export const INTERNAL_AREA_PRESETS = [
  "Hall",
  "Living room",
  "Kitchen",
  "Dining room",
  "Utility",
  "WC",
  "Bathroom",
  "Bedroom 1",
  "Bedroom 2",
  "Bedroom 3",
  "Loft",
  "Garage (internal)",
  "Other internal",
] as const;

export const EXTERNAL_AREA_PRESETS = [
  "Front elevation",
  "Rear elevation",
  "Left elevation",
  "Right elevation",
  "Roof",
  "Chimney",
  "Boundaries / garden",
  "Other external",
] as const;

export const CONDITION_RATINGS: {
  value: ConditionRating;
  label: string;
  description: string;
}[] = [
  {
    value: "observation",
    label: "Observation",
    description: "Noted for record; no immediate concern.",
  },
  {
    value: "monitor",
    label: "Monitor",
    description: "Requires periodic monitoring.",
  },
  {
    value: "defect",
    label: "Defect",
    description: "Defect requiring remedial attention.",
  },
  {
    value: "significant",
    label: "Significant",
    description: "Significant defect requiring prompt action.",
  },
];

export function getAreaTypeLabel(areaType: AreaType) {
  return areaType === "internal" ? "Internal" : "External";
}

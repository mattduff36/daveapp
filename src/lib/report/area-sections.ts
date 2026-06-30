import type { SurveyArea, SurveyPhoto } from "@/lib/survey/types";

export function groupAreasByType(areas: SurveyArea[]) {
  return {
    internalAreas: areas.filter((area) => area.area_type === "internal"),
    externalAreas: areas.filter((area) => area.area_type === "external"),
  };
}

export function getPhotosForArea(photos: SurveyPhoto[], areaId: string) {
  return photos.filter((photo) => photo.area_id === areaId);
}

import type { SurveyPhoto } from "@/lib/survey/types";

export function getPhotoLookupKey(photo: SurveyPhoto) {
  return photo.id;
}

export function resolvePhotoUrl(
  photo: SurveyPhoto,
  photoUrls: Record<string, string>,
) {
  return photoUrls[getPhotoLookupKey(photo)] ?? photo.photo_url ?? null;
}

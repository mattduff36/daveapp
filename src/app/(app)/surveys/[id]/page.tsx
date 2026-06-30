import { notFound } from "next/navigation";
import { AppHeader } from "@/components/layout/app-header";
import { SurveyEditor } from "@/components/survey/survey-editor";
import {
  getCompanySettings,
  getSignedAssetUrl,
  getSurveyWithRelations,
} from "@/lib/actions/survey-actions";
import { getPhotoLookupKey } from "@/lib/survey/photos";

interface SurveyPageProps {
  params: Promise<{ id: string }>;
}

export default async function SurveyPage({ params }: SurveyPageProps) {
  const { id } = await params;
  const survey = await getSurveyWithRelations(id);

  if (!survey) {
    notFound();
  }

  const company = await getCompanySettings();
  const photoUrls: Record<string, string> = {};

  await Promise.all(
    survey.survey_photos.map(async (photo) => {
      if (photo.photo_url) {
        photoUrls[getPhotoLookupKey(photo)] = photo.photo_url;
        return;
      }

      if (photo.storage_path) {
        const url = await getSignedAssetUrl(photo.storage_path);
        if (url) {
          photoUrls[getPhotoLookupKey(photo)] = url;
        }
      }
    }),
  );

  return (
    <div className="min-h-screen">
      <AppHeader
        subtitle={survey.property_address || "Structural visual survey"}
        title={survey.reference_number || "Survey workspace"}
      />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <SurveyEditor company={company} photoUrls={photoUrls} survey={survey} />
      </main>
    </div>
  );
}

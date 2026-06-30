import { Resend } from "resend";
import { buildSurveyDocx, getReportFilename } from "@/lib/report/build-docx";
import { getCompanySettings, getSurveyWithRelations } from "@/lib/actions/survey-actions";
import { requireUser, createClient } from "@/lib/supabase/server";

async function loadPhotoBuffers(
  userId: string,
  storagePaths: string[],
): Promise<Map<string, Buffer>> {
  const supabase = await createClient();
  const photoBuffers = new Map<string, Buffer>();

  await Promise.all(
    storagePaths.map(async (path) => {
      if (!path.startsWith(`${userId}/`)) return;
      const { data, error } = await supabase.storage
        .from("survey-assets")
        .download(path);

      if (error || !data) return;
      photoBuffers.set(path, Buffer.from(await data.arrayBuffer()));
    }),
  );

  return photoBuffers;
}

export async function buildSurveyReportBuffer(surveyId: string) {
  const user = await requireUser();
  const survey = await getSurveyWithRelations(surveyId);

  if (!survey) {
    throw new Error("Survey not found");
  }

  const company = await getCompanySettings();
  const photoBuffers = await loadPhotoBuffers(
    user.id,
    survey.survey_photos.map((photo) => photo.storage_path),
  );

  let logoBuffer: Buffer | undefined;
  if (company?.logo_path) {
    const supabase = await createClient();
    const { data } = await supabase.storage
      .from("survey-assets")
      .download(company.logo_path);

    if (data) {
      logoBuffer = Buffer.from(await data.arrayBuffer());
    }
  }

  const buffer = await buildSurveyDocx({
    survey,
    areas: survey.survey_areas,
    photos: survey.survey_photos,
    company,
    photoBuffers,
    logoBuffer,
  });

  return {
    buffer,
    filename: getReportFilename(survey),
    survey,
    company,
  };
}

export async function sendSurveyReportEmail(surveyId: string) {
  const company = await getCompanySettings();

  if (!company?.default_report_email) {
    throw new Error("Default report email is not configured in company settings.");
  }

  if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL) {
    throw new Error("Email service is not configured.");
  }

  const { buffer, filename, survey } = await buildSurveyReportBuffer(surveyId);
  const resend = new Resend(process.env.RESEND_API_KEY);
  const address = survey.property_address || "structural survey";

  const { error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL,
    to: [company.default_report_email],
    subject: `Structural Survey Report — ${address}`,
    html: `<p>Please find attached the structural visual survey report for <strong>${address}</strong>.</p>`,
    attachments: [
      {
        filename,
        content: buffer,
      },
    ],
  });

  if (error) {
    throw new Error(error.message);
  }

  return { success: true };
}

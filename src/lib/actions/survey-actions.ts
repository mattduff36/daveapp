"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient, requireUser } from "@/lib/supabase/server";
import { buildReportDraft } from "@/lib/survey/report-text";
import type {
  AreaType,
  CompanySettings,
  ConditionRating,
  Survey,
  SurveyArea,
  SurveyPhoto,
  SurveyWithRelations,
} from "@/lib/survey/types";

const propertySchema = z.object({
  surveyId: z.string().uuid(),
  referenceNumber: z.string().optional(),
  propertyAddress: z.string().min(1),
  propertyType: z.string().min(1),
  storeys: z.coerce.number().int().min(1).max(10),
  hasGarage: z.enum(["yes", "no"]),
  attachmentType: z.string().min(1),
  constructionType: z.string().min(1),
  instructingParty: z.string().optional(),
  engineerName: z.string().optional(),
  currentStep: z.coerce.number().int().min(0).max(3),
});

const areaSchema = z.object({
  surveyId: z.string().uuid(),
  name: z.string().min(1),
  areaType: z.enum(["internal", "external"]),
});

const areaUpdateSchema = z.object({
  areaId: z.string().uuid(),
  surveyId: z.string().uuid(),
  conditionRating: z
    .enum(["observation", "monitor", "defect", "significant"])
    .optional(),
  notes: z.string().optional(),
});

const reportSchema = z.object({
  surveyId: z.string().uuid(),
  executiveSummary: z.string().optional(),
  introduction: z.string().optional(),
  conclusions: z.string().optional(),
  recommendations: z.string().optional(),
  currentStep: z.coerce.number().int().min(0).max(3).optional(),
  status: z.enum(["draft", "in_progress", "complete"]).optional(),
});

const companySchema = z.object({
  companyName: z.string().optional(),
  companyAddress: z.string().optional(),
  companyPhone: z.string().optional(),
  companyWebsite: z.string().optional(),
  defaultEngineerName: z.string().optional(),
  defaultReportEmail: z.string().email().optional().or(z.literal("")),
});

function mapSurvey(row: Survey): Survey {
  return row;
}

function mapArea(row: SurveyArea): SurveyArea {
  return row;
}

function mapPhoto(row: SurveyPhoto): SurveyPhoto {
  return row;
}

export async function signUpAction(formData: FormData) {
  const supabase = await createClient();
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  const fullName = String(formData.get("fullName") || "");

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/dashboard");
}

export async function signInAction(formData: FormData) {
  const supabase = await createClient();
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/dashboard");
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function getCompanySettings(): Promise<CompanySettings | null> {
  const user = await requireUser();
  const supabase = await createClient();

  const { data } = await supabase
    .from("company_settings")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  return data as CompanySettings | null;
}

export async function saveCompanySettingsAction(formData: FormData) {
  const user = await requireUser();
  const supabase = await createClient();

  const parsed = companySchema.parse({
    companyName: formData.get("companyName") || undefined,
    companyAddress: formData.get("companyAddress") || undefined,
    companyPhone: formData.get("companyPhone") || undefined,
    companyWebsite: formData.get("companyWebsite") || undefined,
    defaultEngineerName: formData.get("defaultEngineerName") || undefined,
    defaultReportEmail: formData.get("defaultReportEmail") || "",
  });

  const logoFile = formData.get("logo") as File | null;
  let logoPath: string | undefined;

  if (logoFile && logoFile.size > 0) {
    const extension = logoFile.name.split(".").pop() || "png";
    logoPath = `${user.id}/logo.${extension}`;
    const buffer = Buffer.from(await logoFile.arrayBuffer());

    const { error: uploadError } = await supabase.storage
      .from("survey-assets")
      .upload(logoPath, buffer, {
        upsert: true,
        contentType: logoFile.type || "image/png",
      });

    if (uploadError) {
      return { error: uploadError.message };
    }
  }

  const existing = await getCompanySettings();
  const payload = {
    user_id: user.id,
    company_name: parsed.companyName || null,
    company_address: parsed.companyAddress || null,
    company_phone: parsed.companyPhone || null,
    company_website: parsed.companyWebsite || null,
    default_engineer_name: parsed.defaultEngineerName || null,
    default_report_email: parsed.defaultReportEmail || null,
    ...(logoPath ? { logo_path: logoPath } : {}),
  };

  const query = existing
    ? supabase.from("company_settings").update(payload).eq("user_id", user.id)
    : supabase.from("company_settings").insert(payload);

  const { error } = await query;
  if (error) {
    return { error: error.message };
  }

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function getSurveysList() {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: surveys, error } = await supabase
    .from("surveys")
    .select("id, property_address, reference_number, updated_at")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const surveyIds = surveys?.map((survey) => survey.id) ?? [];
  const areaCounts = new Map<string, number>();

  if (surveyIds.length > 0) {
    const { data: areas } = await supabase
      .from("survey_areas")
      .select("survey_id")
      .in("survey_id", surveyIds);

    for (const area of areas ?? []) {
      areaCounts.set(
        area.survey_id,
        (areaCounts.get(area.survey_id) ?? 0) + 1,
      );
    }
  }

  return (surveys ?? []).map((survey) => ({
    id: survey.id,
    property_address: survey.property_address,
    reference_number: survey.reference_number,
    updated_at: survey.updated_at,
    area_count: areaCounts.get(survey.id) ?? 0,
  }));
}

export async function createSurveyAction() {
  const user = await requireUser();
  const supabase = await createClient();
  const company = await getCompanySettings();

  const { data, error } = await supabase
    .from("surveys")
    .insert({
      user_id: user.id,
      engineer_name: company?.default_engineer_name,
      status: "draft",
      current_step: 0,
    })
    .select("id")
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Unable to create survey");
  }

  redirect(`/surveys/${data.id}`);
}

export async function createSurveyFormAction() {
  await createSurveyAction();
}

export async function deleteSurveyAction(surveyId: string) {
  const user = await requireUser();
  const supabase = await createClient();

  const { error } = await supabase
    .from("surveys")
    .delete()
    .eq("id", surveyId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteSurveyFormAction(formData: FormData) {
  const surveyId = String(formData.get("surveyId") || "");
  if (!surveyId) {
    return;
  }

  await deleteSurveyAction(surveyId);
}

export async function getSurveyWithRelations(
  surveyId: string,
): Promise<SurveyWithRelations | null> {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: survey, error } = await supabase
    .from("surveys")
    .select("*")
    .eq("id", surveyId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!survey) {
    return null;
  }

  const [{ data: areas }, { data: photos }] = await Promise.all([
    supabase
      .from("survey_areas")
      .select("*")
      .eq("survey_id", surveyId)
      .order("sort_order", { ascending: true }),
    supabase
      .from("survey_photos")
      .select("*")
      .eq("survey_id", surveyId)
      .order("sort_order", { ascending: true }),
  ]);

  return {
    ...mapSurvey(survey as Survey),
    survey_areas: (areas ?? []).map((area) => mapArea(area as SurveyArea)),
    survey_photos: (photos ?? []).map((photo) => mapPhoto(photo as SurveyPhoto)),
  };
}

export async function savePropertyStepAction(formData: FormData) {
  const user = await requireUser();
  const supabase = await createClient();

  const parsed = propertySchema.parse({
    surveyId: formData.get("surveyId"),
    referenceNumber: formData.get("referenceNumber") || undefined,
    propertyAddress: formData.get("propertyAddress"),
    propertyType: formData.get("propertyType"),
    storeys: formData.get("storeys"),
    hasGarage: formData.get("hasGarage"),
    attachmentType: formData.get("attachmentType"),
    constructionType: formData.get("constructionType"),
    instructingParty: formData.get("instructingParty") || undefined,
    engineerName: formData.get("engineerName") || undefined,
    currentStep: formData.get("currentStep") ?? 1,
  });

  const { error } = await supabase
    .from("surveys")
    .update({
      reference_number: parsed.referenceNumber || null,
      property_address: parsed.propertyAddress,
      property_type: parsed.propertyType,
      storeys: parsed.storeys,
      has_garage: parsed.hasGarage === "yes",
      attachment_type: parsed.attachmentType,
      construction_type: parsed.constructionType,
      instructing_party: parsed.instructingParty || null,
      engineer_name: parsed.engineerName || null,
      current_step: parsed.currentStep,
      status: "in_progress",
    })
    .eq("id", parsed.surveyId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/surveys/${parsed.surveyId}`);
  return { success: true };
}

export async function addSurveyAreaAction(formData: FormData) {
  const user = await requireUser();
  const supabase = await createClient();

  const parsed = areaSchema.parse({
    surveyId: formData.get("surveyId"),
    name: formData.get("name"),
    areaType: formData.get("areaType"),
  });

  const { data: existingAreas } = await supabase
    .from("survey_areas")
    .select("sort_order")
    .eq("survey_id", parsed.surveyId)
    .order("sort_order", { ascending: false })
    .limit(1);

  const nextSortOrder = (existingAreas?.[0]?.sort_order ?? -1) + 1;

  const { error } = await supabase.from("survey_areas").insert({
    survey_id: parsed.surveyId,
    user_id: user.id,
    name: parsed.name,
    area_type: parsed.areaType as AreaType,
    sort_order: nextSortOrder,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/surveys/${parsed.surveyId}`);
  return { success: true };
}

export async function removeSurveyAreaAction(areaId: string, surveyId: string) {
  const user = await requireUser();
  const supabase = await createClient();

  const { error } = await supabase
    .from("survey_areas")
    .delete()
    .eq("id", areaId)
    .eq("survey_id", surveyId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/surveys/${surveyId}`);
  return { success: true };
}

export async function saveAreaObservationAction(formData: FormData) {
  const user = await requireUser();
  const supabase = await createClient();

  const parsed = areaUpdateSchema.parse({
    areaId: formData.get("areaId"),
    surveyId: formData.get("surveyId"),
    conditionRating: formData.get("conditionRating") || undefined,
    notes: formData.get("notes") || undefined,
  });

  const { error } = await supabase
    .from("survey_areas")
    .update({
      condition_rating: (parsed.conditionRating as ConditionRating) || null,
      notes: parsed.notes || null,
    })
    .eq("id", parsed.areaId)
    .eq("survey_id", parsed.surveyId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/surveys/${parsed.surveyId}`);
  return { success: true };
}

export async function uploadSurveyPhotoAction(formData: FormData) {
  const user = await requireUser();
  const supabase = await createClient();

  const surveyId = String(formData.get("surveyId") || "");
  const areaId = String(formData.get("areaId") || "");
  const file = formData.get("file") as File | null;
  const caption = String(formData.get("caption") || "");

  if (!surveyId || !areaId || !file || file.size === 0) {
    return { error: "Photo upload requires a survey, area, and file." };
  }

  const extension = file.name.split(".").pop() || "jpg";
  const photoId = crypto.randomUUID();
  const storagePath = `${user.id}/${surveyId}/${photoId}.${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from("survey-assets")
    .upload(storagePath, buffer, {
      contentType: file.type || "image/jpeg",
      upsert: false,
    });

  if (uploadError) {
    return { error: uploadError.message };
  }

  const { data: existingPhotos } = await supabase
    .from("survey_photos")
    .select("sort_order")
    .eq("survey_id", surveyId)
    .eq("area_id", areaId)
    .order("sort_order", { ascending: false })
    .limit(1);

  const nextSortOrder = (existingPhotos?.[0]?.sort_order ?? -1) + 1;

  const { error } = await supabase.from("survey_photos").insert({
    survey_id: surveyId,
    area_id: areaId,
    user_id: user.id,
    storage_path: storagePath,
    caption: caption || null,
    sort_order: nextSortOrder,
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/surveys/${surveyId}`);
  return { success: true };
}

export async function deleteSurveyPhotoAction(
  photoId: string,
  surveyId: string,
  storagePath: string,
) {
  const user = await requireUser();
  const supabase = await createClient();

  await supabase.storage.from("survey-assets").remove([storagePath]);

  const { error } = await supabase
    .from("survey_photos")
    .delete()
    .eq("id", photoId)
    .eq("survey_id", surveyId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/surveys/${surveyId}`);
  return { success: true };
}

export async function generateReportDraftAction(surveyId: string) {
  const survey = await getSurveyWithRelations(surveyId);
  if (!survey) {
    return { error: "Survey not found" };
  }

  const company = await getCompanySettings();
  const draft = buildReportDraft({
    survey,
    areas: survey.survey_areas,
    company,
  });

  const supabase = await createClient();
  const user = await requireUser();

  const { error } = await supabase
    .from("surveys")
    .update({
      executive_summary: draft.executive_summary,
      introduction: draft.introduction,
      conclusions: draft.conclusions,
      recommendations: draft.recommendations,
      current_step: 3,
      status: "complete",
    })
    .eq("id", surveyId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/surveys/${surveyId}`);
  return { success: true, draft };
}

export async function saveReportEditsAction(formData: FormData) {
  const user = await requireUser();
  const supabase = await createClient();

  const parsed = reportSchema.parse({
    surveyId: formData.get("surveyId"),
    executiveSummary: formData.get("executiveSummary") || undefined,
    introduction: formData.get("introduction") || undefined,
    conclusions: formData.get("conclusions") || undefined,
    recommendations: formData.get("recommendations") || undefined,
    currentStep: formData.get("currentStep") || undefined,
    status: formData.get("status") || undefined,
  });

  const { error } = await supabase
    .from("surveys")
    .update({
      executive_summary: parsed.executiveSummary || null,
      introduction: parsed.introduction || null,
      conclusions: parsed.conclusions || null,
      recommendations: parsed.recommendations || null,
      current_step: parsed.currentStep,
      status: parsed.status,
    })
    .eq("id", parsed.surveyId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/surveys/${parsed.surveyId}`);
  return { success: true };
}

export async function updateSurveyStepAction(
  surveyId: string,
  currentStep: number,
) {
  const user = await requireUser();
  const supabase = await createClient();

  const { error } = await supabase
    .from("surveys")
    .update({ current_step: currentStep })
    .eq("id", surveyId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/surveys/${surveyId}`);
  return { success: true };
}

export async function getSignedAssetUrl(path: string) {
  const user = await requireUser();
  if (!path.startsWith(`${user.id}/`)) {
    return null;
  }

  const supabase = await createClient();
  const { data } = await supabase.storage
    .from("survey-assets")
    .createSignedUrl(path, 3600);

  return data?.signedUrl ?? null;
}

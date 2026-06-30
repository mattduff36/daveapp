import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  addSurveyAreaAction,
  savePropertyStepAction,
  updateSurveyPhotoCaptionAction,
} from "@/lib/actions/survey-actions";
import {
  TEST_AREA_ID,
  TEST_PHOTO_ID,
  TEST_SURVEY_ID,
  TEST_USER_ID,
} from "../fixtures/survey";
import {
  createSupabaseChain,
  createSupabaseSelectChain,
  createSupabaseUpdateChain,
} from "../helpers/supabase-mock";

const requireUser = vi.fn();
const revalidatePath = vi.fn();
const from = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  requireUser: (...args: unknown[]) => requireUser(...args),
  createClient: vi.fn(async () => ({
    from: (...args: unknown[]) => from(...args),
    storage: {
      from: vi.fn(),
    },
  })),
}));

vi.mock("next/cache", () => ({
  revalidatePath: (...args: unknown[]) => revalidatePath(...args),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

vi.mock("@/lib/cloudinary/upload", () => ({
  isCloudinaryConfigured: vi.fn(() => false),
  uploadSurveyPhotoToCloudinary: vi.fn(),
  deleteCloudinaryPhoto: vi.fn(),
}));

describe("survey server actions", () => {
  beforeEach(() => {
    requireUser.mockResolvedValue({ id: TEST_USER_ID });
    from.mockReset();
    revalidatePath.mockReset();
  });

  it("persists garage type when garage is selected", async () => {
    const updateChain = createSupabaseUpdateChain(null);
    from.mockReturnValue(updateChain);

    const formData = new FormData();
    formData.set("surveyId", TEST_SURVEY_ID);
    formData.set("propertyAddress", "12 Example Street");
    formData.set("propertyType", "Detached house");
    formData.set("storeys", "2");
    formData.set("hasGarage", "yes");
    formData.set("garageType", "Integral garage");
    formData.set("attachmentType", "Detached");
    formData.set("constructionType", "Cavity masonry");
    formData.set("currentStep", "1");

    const result = await savePropertyStepAction(formData);

    expect(result).toEqual({ success: true });
    expect(updateChain.update).toHaveBeenCalledWith(
      expect.objectContaining({
        has_garage: true,
        garage_type: "Integral garage",
      }),
    );
  });

  it("clears garage type when garage is not selected", async () => {
    const updateChain = createSupabaseUpdateChain(null);
    from.mockReturnValue(updateChain);

    const formData = new FormData();
    formData.set("surveyId", TEST_SURVEY_ID);
    formData.set("propertyAddress", "12 Example Street");
    formData.set("propertyType", "Detached house");
    formData.set("storeys", "2");
    formData.set("hasGarage", "no");
    formData.set("attachmentType", "Detached");
    formData.set("constructionType", "Cavity masonry");
    formData.set("currentStep", "1");

    const result = await savePropertyStepAction(formData);

    expect(result).toEqual({ success: true });
    expect(updateChain.update).toHaveBeenCalledWith(
      expect.objectContaining({
        has_garage: false,
        garage_type: null,
      }),
    );
  });

  it("prevents duplicate survey areas", async () => {
    const duplicateLookup = createSupabaseSelectChain({ id: TEST_AREA_ID });

    from.mockImplementation((table: string) => {
      if (table !== "survey_areas") {
        return createSupabaseSelectChain([]);
      }

      const chain = createSupabaseChain({ data: [{ sort_order: 2 }], error: null });
      chain.ilike = vi.fn(() => ({
        maybeSingle: duplicateLookup.maybeSingle,
      }));
      return chain;
    });

    const formData = new FormData();
    formData.set("surveyId", TEST_SURVEY_ID);
    formData.set("name", "Kitchen");
    formData.set("areaType", "internal");

    const result = await addSurveyAreaAction(formData);

    expect(result).toEqual({
      error: "An area with this name already exists.",
    });
  });

  it("updates photo captions for the authenticated user", async () => {
    const updateChain = createSupabaseUpdateChain(null);
    from.mockReturnValue(updateChain);

    const formData = new FormData();
    formData.set("photoId", TEST_PHOTO_ID);
    formData.set("surveyId", TEST_SURVEY_ID);
    formData.set("caption", "Crack above window");

    const result = await updateSurveyPhotoCaptionAction(formData);

    expect(result).toEqual({ success: true });
    expect(updateChain.update).toHaveBeenCalledWith({
      caption: "Crack above window",
    });
    expect(revalidatePath).toHaveBeenCalledWith(`/surveys/${TEST_SURVEY_ID}`);
  });
});

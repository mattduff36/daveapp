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

const requireUser = vi.fn();
const revalidatePath = vi.fn();
const from = vi.fn();

function createUpdateChain(error: { message: string } | null = null) {
  const result = Promise.resolve({ error });

  return {
    eq: vi.fn(function eq() {
      return {
        eq: vi.fn(function eqAgain() {
          return {
            eq: vi.fn(() => result),
            then: result.then.bind(result),
          };
        }),
        then: result.then.bind(result),
      };
    }),
  };
}

function createQueryChain(result: { data?: unknown; error?: { message: string } | null }) {
  return {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    ilike: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue(result),
    single: vi.fn().mockResolvedValue(result),
    update: vi.fn(() => createUpdateChain(result.error ?? null)),
    insert: vi.fn().mockResolvedValue({ error: null }),
    delete: vi.fn().mockReturnThis(),
  };
}

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
    const updateChain = createQueryChain({ error: null });
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
    const updateChain = createQueryChain({ error: null });
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
    const existingAreasChain = createQueryChain({ data: [{ sort_order: 2 }] });
    const duplicateChain = createQueryChain({
      data: { id: TEST_AREA_ID },
    });

    from.mockImplementation((table: string) => {
      if (table === "survey_areas") {
        return {
          ...existingAreasChain,
          ilike: vi.fn().mockReturnValue({
            maybeSingle: duplicateChain.maybeSingle,
          }),
        };
      }

      return existingAreasChain;
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
    const updateChain = createQueryChain({ error: null });
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

import { describe, expect, it } from "vitest";
import { getPhotoLookupKey, resolvePhotoUrl } from "@/lib/survey/photos";
import { makePhoto } from "../../../tests/fixtures/survey";

describe("survey photo helpers", () => {
  it("uses photo id as lookup key", () => {
    const photo = makePhoto();
    expect(getPhotoLookupKey(photo)).toBe(photo.id);
  });

  it("prefers resolved map URLs over stored photo_url", () => {
    const photo = makePhoto({
      photo_url: "https://res.cloudinary.com/demo/old.jpg",
    });

    expect(
      resolvePhotoUrl(photo, {
        [photo.id]: "https://res.cloudinary.com/demo/new.jpg",
      }),
    ).toBe("https://res.cloudinary.com/demo/new.jpg");
  });

  it("falls back to stored photo_url when map entry is missing", () => {
    const photo = makePhoto({
      photo_url: "https://res.cloudinary.com/demo/fallback.jpg",
    });

    expect(resolvePhotoUrl(photo, {})).toBe(
      "https://res.cloudinary.com/demo/fallback.jpg",
    );
  });

  it("returns null when no URL is available", () => {
    const photo = makePhoto({
      photo_url: null,
      storage_path: `${makePhoto().user_id}/survey/photo.jpg`,
    });

    expect(resolvePhotoUrl(photo, {})).toBeNull();
  });
});

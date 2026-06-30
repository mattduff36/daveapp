import { describe, expect, it } from "vitest";
import { getPhotosForArea, groupAreasByType } from "@/lib/report/area-sections";
import { makeArea, makePhoto, TEST_AREA_ID } from "../../../tests/fixtures/survey";

describe("area report sections", () => {
  it("groups areas by internal and external type", () => {
    const areas = [
      makeArea({ name: "Kitchen", condition_rating: "defect" }),
      makeArea({
        name: "Front elevation",
        condition_rating: "monitor",
        area_type: "external",
      }),
    ];

    expect(groupAreasByType(areas)).toEqual({
      internalAreas: [areas[0]],
      externalAreas: [areas[1]],
    });
  });

  it("returns photos linked to a survey area", () => {
    const photos = [
      makePhoto({ id: "photo-1", area_id: TEST_AREA_ID }),
      makePhoto({ id: "photo-2", area_id: "other-area" }),
    ];

    expect(getPhotosForArea(photos, TEST_AREA_ID)).toEqual([photos[0]]);
  });
});

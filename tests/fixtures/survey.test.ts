import { describe, expect, it } from "vitest";
import { z } from "zod";
import { TEST_IDS } from "../fixtures/survey";

const uuidSchema = z.string().uuid();

describe("survey test fixtures", () => {
  it("uses UUIDs compatible with zod validation", () => {
    for (const id of TEST_IDS) {
      expect(uuidSchema.safeParse(id).success).toBe(true);
    }
  });
});

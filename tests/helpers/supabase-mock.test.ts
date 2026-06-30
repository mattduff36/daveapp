import { describe, expect, it } from "vitest";
import {
  createSupabaseChain,
  createSupabaseSelectChain,
  createSupabaseUpdateChain,
} from "../helpers/supabase-mock";

describe("supabase mock helpers", () => {
  it("supports awaiting update chains with multiple eq calls", async () => {
    const chain = createSupabaseUpdateChain(null);

    const result = await chain.update({ caption: "Updated" }).eq("id", "1").eq("user_id", "2");

    expect(result).toEqual({ error: null });
  });

  it("supports awaiting update chains with three eq calls", async () => {
    const chain = createSupabaseUpdateChain(null);

    const result = await chain
      .update({ caption: "Updated" })
      .eq("id", "1")
      .eq("survey_id", "2")
      .eq("user_id", "3");

    expect(result).toEqual({ error: null });
  });

  it("resolves select chains through maybeSingle", async () => {
    const chain = createSupabaseSelectChain({ id: "abc" });

    await expect(chain.select("id").eq("survey_id", "1").maybeSingle()).resolves.toEqual({
      data: { id: "abc" },
      error: null,
    });
  });

  it("resolves insert calls directly", async () => {
    const chain = createSupabaseChain({ error: null });

    await expect(chain.insert({ name: "Kitchen" })).resolves.toEqual({ error: null });
  });
});

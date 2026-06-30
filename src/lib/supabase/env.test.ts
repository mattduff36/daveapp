import { afterEach, describe, expect, it } from "vitest";
import {
  getAppUrl,
  getSupabaseAnonKey,
  getSupabaseServiceRoleKey,
  getSupabaseUrl,
} from "@/lib/supabase/env";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
});

describe("supabase env helpers", () => {
  it("prefers public Supabase URL variables", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://public.supabase.co";
    process.env.SUPABASE_URL = "https://server.supabase.co";

    expect(getSupabaseUrl()).toBe("https://public.supabase.co");
  });

  it("falls back to server-side Supabase URL", () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    process.env.SUPABASE_URL = "https://server.supabase.co";

    expect(getSupabaseUrl()).toBe("https://server.supabase.co");
  });

  it("accepts publishable and anon key aliases", () => {
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "publishable-key";
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    delete process.env.SUPABASE_ANON_KEY;

    expect(getSupabaseAnonKey()).toBe("publishable-key");
  });

  it("accepts service role key aliases", () => {
    process.env.SUPABASE_SECRET_KEY = "secret-key";
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;

    expect(getSupabaseServiceRoleKey()).toBe("secret-key");
  });

  it("normalizes app URLs without a protocol", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "example.vercel.app";

    expect(getAppUrl()).toBe("https://example.vercel.app");
  });

  it("preserves explicit http URLs", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "http://localhost:3000";

    expect(getAppUrl()).toBe("http://localhost:3000");
  });
});

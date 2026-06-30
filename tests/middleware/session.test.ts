import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { updateSession } from "@/lib/supabase/middleware";

const getUser = vi.fn();

vi.mock("@supabase/ssr", () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      getUser,
    },
  })),
}));

vi.mock("@/lib/supabase/env", () => ({
  getSupabaseUrl: vi.fn(() => "https://example.supabase.co"),
  getSupabaseAnonKey: vi.fn(() => "anon-key"),
}));

describe("updateSession middleware", () => {
  beforeEach(() => {
    getUser.mockReset();
  });

  it("redirects unauthenticated users away from protected routes", async () => {
    getUser.mockResolvedValue({ data: { user: null } });

    const response = await updateSession(
      new NextRequest("http://localhost/surveys/123"),
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/login");
    expect(response.headers.get("location")).toContain("redirect=%2Fsurveys%2F123");
  });

  it("redirects authenticated users away from auth routes", async () => {
    getUser.mockResolvedValue({
      data: { user: { id: "user-1", email: "user@example.com" } },
    });

    const response = await updateSession(
      new NextRequest("http://localhost/login"),
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/dashboard");
  });

  it("allows authenticated users to access protected routes", async () => {
    getUser.mockResolvedValue({
      data: { user: { id: "user-1", email: "user@example.com" } },
    });

    const response = await updateSession(
      new NextRequest("http://localhost/dashboard"),
    );

    expect(response.status).toBe(200);
  });

  it("protects survey export API routes", async () => {
    getUser.mockResolvedValue({ data: { user: null } });

    const response = await updateSession(
      new NextRequest("http://localhost/api/surveys/123/export"),
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/login");
  });
});

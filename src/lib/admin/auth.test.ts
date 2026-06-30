import { describe, expect, it } from "vitest";
import { ADMIN_EMAILS, isAdminUser } from "@/lib/admin/auth";

describe("admin auth", () => {
  it("lists approved admin emails", () => {
    expect(ADMIN_EMAILS).toContain("mattduff36@gmail.com");
    expect(ADMIN_EMAILS).toContain("david.marshall@curtins.com");
  });

  it("accepts approved admin emails case-insensitively", () => {
    expect(isAdminUser({ email: "MattDuff36@gmail.com" })).toBe(true);
    expect(isAdminUser({ email: "david.marshall@curtins.com" })).toBe(true);
  });

  it("rejects non-admin users and missing emails", () => {
    expect(isAdminUser({ email: "someone@example.com" })).toBe(false);
    expect(isAdminUser({ email: null })).toBe(false);
    expect(isAdminUser(null)).toBe(false);
  });
});

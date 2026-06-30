import { afterEach, describe, expect, it } from "vitest";
import { isCloudinaryConfigured } from "@/lib/cloudinary/upload";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
});

describe("cloudinary upload helpers", () => {
  it("detects when all Cloudinary env vars are present", () => {
    process.env.CLOUDINARY_CLOUD_NAME = "demo";
    process.env.CLOUDINARY_API_KEY = "key";
    process.env.CLOUDINARY_API_SECRET = "secret";

    expect(isCloudinaryConfigured()).toBe(true);
  });

  it("detects missing Cloudinary configuration", () => {
    delete process.env.CLOUDINARY_CLOUD_NAME;
    delete process.env.CLOUDINARY_API_KEY;
    delete process.env.CLOUDINARY_API_SECRET;

    expect(isCloudinaryConfigured()).toBe(false);
  });
});

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { isAdminUser, requireAdminUser } from "@/lib/admin/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAppUrl } from "@/lib/supabase/env";

const userIdSchema = z.string().uuid();

const updateUserSchema = z.object({
  userId: z.string().uuid(),
  fullName: z.string().trim().optional(),
});

const resetPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
});

function redirectWithAdminMessage(key: "message" | "error", value: string) {
  const params = new URLSearchParams({ [key]: value });
  redirect(`/admin?${params.toString()}`);
}

export interface AdminUserListItem {
  id: string;
  email: string;
  fullName: string;
  createdAt: string;
  lastSignInAt: string | null;
  emailConfirmedAt: string | null;
  isAdmin: boolean;
}

export async function listAdminUsers(): Promise<AdminUserListItem[]> {
  await requireAdminUser();
  const supabase = createAdminClient();

  const { data, error } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data.users
    .map((user) => {
      const email = user.email ?? "";
      return {
        id: user.id,
        email,
        fullName:
          typeof user.user_metadata?.full_name === "string"
            ? user.user_metadata.full_name
            : "",
        createdAt: user.created_at,
        lastSignInAt: user.last_sign_in_at ?? null,
        emailConfirmedAt: user.email_confirmed_at ?? null,
        isAdmin: isAdminUser({ email }),
      };
    })
    .sort((first, second) => first.email.localeCompare(second.email));
}

export async function sendPasswordResetEmailAction(formData: FormData) {
  await requireAdminUser();
  const supabase = createAdminClient();
  const parsed = resetPasswordSchema.parse({
    email: formData.get("email"),
  });

  const { error } = await supabase.auth.resetPasswordForEmail(parsed.email, {
    redirectTo: `${getAppUrl()}/reset-password`,
  });

  if (error) {
    redirectWithAdminMessage("error", error.message);
  }

  redirectWithAdminMessage("message", "Password reset email sent.");
}

export async function confirmUserEmailAction(formData: FormData) {
  await requireAdminUser();
  const supabase = createAdminClient();
  const userId = userIdSchema.parse(formData.get("userId"));

  const { error } = await supabase.auth.admin.updateUserById(userId, {
    email_confirm: true,
  });

  if (error) {
    redirectWithAdminMessage("error", error.message);
  }

  revalidatePath("/admin");
  redirectWithAdminMessage("message", "User email confirmed.");
}

export async function updateUserNameAction(formData: FormData) {
  await requireAdminUser();
  const supabase = createAdminClient();
  const parsed = updateUserSchema.parse({
    userId: formData.get("userId"),
    fullName: formData.get("fullName") || "",
  });

  const { error } = await supabase.auth.admin.updateUserById(parsed.userId, {
    user_metadata: {
      full_name: parsed.fullName ?? "",
    },
  });

  if (error) {
    redirectWithAdminMessage("error", error.message);
  }

  revalidatePath("/admin");
  redirectWithAdminMessage("message", "User name updated.");
}

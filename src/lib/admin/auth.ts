import "server-only";

import type { User } from "@supabase/supabase-js";
import { getUser } from "@/lib/supabase/server";

export const ADMIN_EMAILS = ["mattduff36@gmail.com"] as const;

export function isAdminUser(user: Pick<User, "email"> | null | undefined) {
  if (!user?.email) return false;
  return ADMIN_EMAILS.includes(
    user.email.toLowerCase() as (typeof ADMIN_EMAILS)[number],
  );
}

export async function requireAdminUser() {
  const user = await getUser();

  if (!isAdminUser(user)) {
    throw new Error("Admin access required");
  }

  return user;
}

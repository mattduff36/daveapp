import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";

export default function ResetPasswordPage() {
  return (
    <main className="survey-grid flex min-h-screen items-center justify-center px-4 py-10">
      <ResetPasswordForm
        supabaseAnonKey={getSupabaseAnonKey()}
        supabaseUrl={getSupabaseUrl()}
      />
    </main>
  );
}

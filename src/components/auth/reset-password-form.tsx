"use client";

import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Database } from "@/lib/supabase/database.types";

interface ResetPasswordFormProps {
  supabaseUrl: string;
  supabaseAnonKey: string;
}

export function ResetPasswordForm({
  supabaseUrl,
  supabaseAnonKey,
}: ResetPasswordFormProps) {
  const supabase = useMemo(
    () =>
      createBrowserClient<Database>(supabaseUrl, supabaseAnonKey, {
        auth: {
          detectSessionInUrl: true,
        },
      }),
    [supabaseAnonKey, supabaseUrl],
  );
  const [hasSession, setHasSession] = useState<boolean | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (isMounted) setHasSession(Boolean(session));
    }

    void loadSession();

    return () => {
      isMounted = false;
    };
  }, [supabase]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setIsPending(true);

    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") || "");
    const confirmPassword = String(formData.get("confirmPassword") || "");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      setIsPending(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setIsPending(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    setIsPending(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setMessage("Password updated. You can now sign in.");
  }

  return (
    <Card className="w-full max-w-md border-primary/10 shadow-xl">
      <CardHeader>
        <CardTitle>Reset password</CardTitle>
        <CardDescription>
          Enter a new password for your survey account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {hasSession === false ? (
          <div className="space-y-4">
            <p className="rounded-lg border border-accent/30 bg-secondary p-4 text-sm text-muted-foreground">
              Open this page from the password reset email link so we can verify
              your reset session.
            </p>
            <Button asChild className="w-full">
              <Link href="/login">Back to sign in</Link>
            </Button>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="password">New password</Label>
              <Input
                id="password"
                minLength={8}
                name="password"
                required
                type="password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm new password</Label>
              <Input
                id="confirmPassword"
                minLength={8}
                name="confirmPassword"
                required
                type="password"
              />
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            {message ? <p className="text-sm text-primary">{message}</p> : null}
            <Button className="w-full" disabled={isPending} type="submit">
              {isPending ? "Updating..." : "Update password"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

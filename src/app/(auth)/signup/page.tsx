"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signUpAction } from "@/lib/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SignUpState {
  error?: string;
  success?: boolean;
  email?: string;
}

export default function SignUpPage() {
  const [state, formAction, isPending] = useActionState(
    async (_prev: SignUpState | null, formData: FormData) =>
      signUpAction(formData),
    null,
  );

  if (state?.success) {
    return (
      <main className="survey-grid flex min-h-screen items-center justify-center px-4 py-10">
        <Card className="w-full max-w-md border-primary/10 shadow-xl">
          <CardHeader>
            <CardTitle>Check your email</CardTitle>
            <CardDescription>
              We have created your account. Please confirm your email address
              before signing in.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-primary/20 bg-secondary p-4 text-sm">
              <p className="font-medium text-foreground">
                Confirmation sent to:
              </p>
              <p className="mt-1 break-all font-data text-muted-foreground">
                {state.email}
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              Open the confirmation link in that email, then return here to sign
              in. If you do not see it within a few minutes, check your spam or
              junk folder.
            </p>
            <Button asChild className="w-full">
              <Link href="/login">Back to sign in</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="survey-grid flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md border-primary/10 shadow-xl">
        <CardHeader>
          <CardTitle>Create account</CardTitle>
          <CardDescription>
            Set up your engineer account to start recording surveys.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input id="fullName" name="fullName" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" minLength={8} required />
            </div>
            {state?.error ? (
              <p className="text-sm text-destructive">{state.error}</p>
            ) : null}
            <Button className="w-full" disabled={isPending} type="submit">
              {isPending ? "Creating account..." : "Create account"}
            </Button>
          </form>
          <p className="mt-4 text-sm text-muted-foreground">
            Already registered?{" "}
            <Link className="font-medium text-primary underline-offset-4 hover:underline" href="/login">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}

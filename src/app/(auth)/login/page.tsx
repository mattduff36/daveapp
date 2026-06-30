"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signInAction } from "@/lib/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) =>
      signInAction(formData),
    null,
  );

  return (
    <main className="survey-grid flex min-h-screen items-center justify-center px-4 py-10">
      <Card className="w-full max-w-md border-primary/10 shadow-xl">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>
            Access your structural survey workspace and saved reports.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" required />
            </div>
            {state?.error ? (
              <p className="text-sm text-destructive">{state.error}</p>
            ) : null}
            <Button className="w-full" disabled={isPending} type="submit">
              {isPending ? "Signing in..." : "Sign in"}
            </Button>
          </form>
          <p className="mt-4 text-sm text-muted-foreground">
            Need an account?{" "}
            <Link className="font-medium text-primary underline-offset-4 hover:underline" href="/signup">
              Create one
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}

"use client";

import { useActionState } from "react";
import { changePasswordAction } from "@/lib/actions/auth-actions";
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

export function ChangePasswordForm() {
  const [state, formAction, isPending] = useActionState(
    changePasswordAction,
    null,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Change password</CardTitle>
        <CardDescription>
          Update your account password. You will stay signed in after changing
          it.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current password</Label>
            <Input
              autoComplete="current-password"
              id="currentPassword"
              name="currentPassword"
              required
              type="password"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">New password</Label>
            <Input
              autoComplete="new-password"
              id="newPassword"
              minLength={8}
              name="newPassword"
              required
              type="password"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm new password</Label>
            <Input
              autoComplete="new-password"
              id="confirmPassword"
              minLength={8}
              name="confirmPassword"
              required
              type="password"
            />
          </div>

          {state?.error ? (
            <p className="text-sm text-destructive">{state.error}</p>
          ) : null}
          {state?.success ? (
            <p className="text-sm text-primary">Password updated.</p>
          ) : null}

          <Button disabled={isPending} type="submit">
            {isPending ? "Updating..." : "Update password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

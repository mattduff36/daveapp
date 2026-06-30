import { notFound } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { AppHeader } from "@/components/layout/app-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  confirmUserEmailAction,
  listAdminUsers,
  sendPasswordResetEmailAction,
  updateUserNameAction,
} from "@/lib/actions/admin-actions";
import { isAdminUser } from "@/lib/admin/auth";
import { getUser } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

interface AdminPageProps {
  searchParams: Promise<{
    message?: string;
    error?: string;
  }>;
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const currentUser = await getUser();

  if (!isAdminUser(currentUser)) {
    notFound();
  }

  const users = await listAdminUsers();
  const params = await searchParams;

  return (
    <div className="min-h-screen">
      <AppHeader
        subtitle="Manage user access and account support actions"
        title="Admin settings"
      />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  Users
                </CardTitle>
                <CardDescription>
                  View registered users, confirm accounts, update names, and
                  send password reset emails.
                </CardDescription>
              </div>
              <Badge>{users.length} users</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {params.message ? (
              <p className="rounded-lg border border-primary/20 bg-secondary p-3 text-sm text-primary">
                {params.message}
              </p>
            ) : null}
            {params.error ? (
              <p className="rounded-lg border border-destructive/20 bg-secondary p-3 text-sm text-destructive">
                {params.error}
              </p>
            ) : null}

            {users.map((user) => (
              <section
                className="rounded-xl border border-border bg-background p-4"
                key={user.id}
              >
                <div className="grid gap-4 lg:grid-cols-[1fr_360px] lg:items-start">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-medium">
                        {user.fullName || "Unnamed user"}
                      </h2>
                      {user.isAdmin ? (
                        <Badge>
                          {user.email.toLowerCase() === "admin@mpdee.co.uk"
                            ? "Developer"
                            : "Admin"}
                        </Badge>
                      ) : null}
                      {user.emailConfirmedAt ? (
                        <Badge className="border-primary/30 text-primary">
                          Confirmed
                        </Badge>
                      ) : (
                        <Badge className="border-accent/40 text-accent">
                          Unconfirmed
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 break-all font-data text-sm text-muted-foreground">
                      {user.email}
                    </p>
                    <dl className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                      <div>
                        <dt className="font-medium text-foreground">
                          Created
                        </dt>
                        <dd>{formatDate(user.createdAt)}</dd>
                      </div>
                      <div>
                        <dt className="font-medium text-foreground">
                          Last sign in
                        </dt>
                        <dd>
                          {user.lastSignInAt
                            ? formatDate(user.lastSignInAt)
                            : "Never"}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div className="space-y-3">
                    <form action={updateUserNameAction} className="flex gap-2">
                      <input name="userId" type="hidden" value={user.id} />
                      <Input
                        aria-label={`Full name for ${user.email}`}
                        defaultValue={user.fullName}
                        name="fullName"
                        placeholder="Full name"
                      />
                      <Button type="submit" variant="outline">
                        Save
                      </Button>
                    </form>

                    <div className="flex flex-wrap gap-2">
                      {!user.emailConfirmedAt ? (
                        <form action={confirmUserEmailAction}>
                          <input name="userId" type="hidden" value={user.id} />
                          <Button size="sm" type="submit" variant="outline">
                            Confirm email
                          </Button>
                        </form>
                      ) : null}

                      <form action={sendPasswordResetEmailAction}>
                        <input name="email" type="hidden" value={user.email} />
                        <Button size="sm" type="submit" variant="secondary">
                          Send password reset
                        </Button>
                      </form>
                    </div>
                  </div>
                </div>
              </section>
            ))}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

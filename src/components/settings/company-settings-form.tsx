"use client";

import { useActionState } from "react";
import { saveCompanySettingsAction } from "@/lib/actions/survey-actions";
import type { CompanySettings } from "@/lib/survey/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface CompanySettingsFormProps {
  settings: CompanySettings | null;
  logoUrl: string | null;
}

export function CompanySettingsForm({
  settings,
  logoUrl,
}: CompanySettingsFormProps) {
  const [state, formAction, isPending] = useActionState(
    async (_prev: { error?: string; success?: boolean } | null, formData: FormData) =>
      saveCompanySettingsAction(formData),
    null,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Company defaults</CardTitle>
        <CardDescription>
          Logo and company details appear on report covers. The default report email is used only for sending and never printed in reports.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-6" encType="multipart/form-data">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company name</Label>
              <Input
                defaultValue={settings?.company_name || ""}
                id="companyName"
                name="companyName"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="defaultEngineerName">Default engineer name</Label>
              <Input
                defaultValue={settings?.default_engineer_name || ""}
                id="defaultEngineerName"
                name="defaultEngineerName"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyAddress">Company address</Label>
            <Textarea
              defaultValue={settings?.company_address || ""}
              id="companyAddress"
              name="companyAddress"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="companyPhone">Phone</Label>
              <Input
                defaultValue={settings?.company_phone || ""}
                id="companyPhone"
                name="companyPhone"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyWebsite">Website</Label>
              <Input
                defaultValue={settings?.company_website || ""}
                id="companyWebsite"
                name="companyWebsite"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="defaultReportEmail">Default report recipient email</Label>
            <Input
              defaultValue={settings?.default_report_email || ""}
              id="defaultReportEmail"
              name="defaultReportEmail"
              placeholder="reports@example.com"
              type="email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo">Company logo</Label>
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                alt="Current company logo"
                className="mb-2 h-16 w-auto rounded border border-border object-contain p-2"
                src={logoUrl}
              />
            ) : null}
            <Input accept="image/*" id="logo" name="logo" type="file" />
          </div>

          {state?.error ? (
            <p className="text-sm text-destructive">{state.error}</p>
          ) : null}
          {state?.success ? (
            <p className="text-sm text-primary">Settings saved.</p>
          ) : null}

          <Button disabled={isPending} type="submit">
            {isPending ? "Saving..." : "Save defaults"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

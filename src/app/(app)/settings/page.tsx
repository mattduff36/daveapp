import { AppHeader } from "@/components/layout/app-header";
import { ChangePasswordForm } from "@/components/settings/change-password-form";
import { CompanySettingsForm } from "@/components/settings/company-settings-form";
import { getCompanySettings, getSignedAssetUrl } from "@/lib/actions/survey-actions";

export default async function SettingsPage() {
  const settings = await getCompanySettings();
  const logoUrl = settings?.logo_path
    ? await getSignedAssetUrl(settings.logo_path)
    : null;

  return (
    <div className="min-h-screen">
      <AppHeader subtitle="Company branding and report defaults" title="Settings" />
      <main className="mx-auto max-w-3xl space-y-8 px-4 py-8">
        <CompanySettingsForm logoUrl={logoUrl} settings={settings} />
        <ChangePasswordForm />
      </main>
    </div>
  );
}

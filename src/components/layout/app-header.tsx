import Link from "next/link";
import { LogOut, Settings } from "lucide-react";
import { signOutAction } from "@/lib/actions/survey-actions";
import { getCompanySettings } from "@/lib/actions/survey-actions";
import { getSignedAssetUrl } from "@/lib/actions/survey-actions";
import { Button } from "@/components/ui/button";

interface AppHeaderProps {
  title: string;
  subtitle?: string;
}

export async function AppHeader({ title, subtitle }: AppHeaderProps) {
  const company = await getCompanySettings();
  const logoUrl = company?.logo_path
    ? await getSignedAssetUrl(company.logo_path)
    : null;

  return (
    <header className="border-b border-border/80 bg-card/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <div className="flex items-center gap-4">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              alt={company?.company_name || "Company logo"}
              className="h-10 w-auto max-w-[120px] object-contain"
              src={logoUrl}
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground">
              DS
            </div>
          )}
          <div>
            <p className="font-serif text-xl font-semibold text-foreground">{title}</p>
            {subtitle ? (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            ) : null}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link href="/settings">
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </Button>
          <form action={signOutAction}>
            <Button type="submit" variant="ghost">
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}

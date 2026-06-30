import Link from "next/link";
import { AppHeaderNav } from "@/components/layout/app-header-nav";
import { getCompanySettings } from "@/lib/actions/survey-actions";
import { getSignedAssetUrl } from "@/lib/actions/survey-actions";
import { isAdminUser } from "@/lib/admin/auth";
import { getUser } from "@/lib/supabase/server";

interface AppHeaderProps {
  title: string;
  subtitle?: string;
}

export async function AppHeader({ title, subtitle }: AppHeaderProps) {
  const [company, user] = await Promise.all([getCompanySettings(), getUser()]);
  const logoUrl = company?.logo_path
    ? await getSignedAssetUrl(company.logo_path)
    : null;
  const isAdmin = isAdminUser(user);

  return (
    <header className="border-b border-border/80 bg-card/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4">
        <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
          {logoUrl ? (
            <Link
              aria-label="Go to dashboard"
              className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              href="/dashboard"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt={company?.company_name || "Company logo"}
                className="h-10 w-auto max-w-[120px] object-contain"
                src={logoUrl}
              />
            </Link>
          ) : (
            <Link
              aria-label="Go to dashboard"
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              href="/dashboard"
            >
              DS
            </Link>
          )}
          <div className="min-w-0">
            <p className="truncate font-serif text-lg font-semibold text-foreground sm:text-xl">
              {title}
            </p>
            {subtitle ? (
              <p className="line-clamp-2 text-xs text-muted-foreground sm:text-sm">
                {subtitle}
              </p>
            ) : null}
          </div>
        </div>
        <div className="shrink-0">
          <AppHeaderNav isAdmin={isAdmin} />
        </div>
      </div>
    </header>
  );
}

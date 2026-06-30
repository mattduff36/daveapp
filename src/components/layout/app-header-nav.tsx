"use client";

import Link from "next/link";
import { useState } from "react";
import { LogOut, Menu, Settings, ShieldCheck } from "lucide-react";
import { signOutAction } from "@/lib/actions/auth-actions";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface AppHeaderNavProps {
  isAdmin: boolean;
}

interface HeaderNavActionsProps {
  isAdmin: boolean;
  layout: "desktop" | "mobile";
  onNavigate?: () => void;
}

function HeaderNavActions({
  isAdmin,
  layout,
  onNavigate,
}: HeaderNavActionsProps) {
  const isMobile = layout === "mobile";
  const buttonClassName = isMobile ? "w-full justify-start" : undefined;

  return (
    <>
      {isAdmin ? (
        <Button asChild className={buttonClassName} variant="outline">
          <Link href="/admin" onClick={onNavigate}>
            <ShieldCheck className="h-4 w-4" />
            Admin
          </Link>
        </Button>
      ) : null}
      <Button asChild className={buttonClassName} variant="outline">
        <Link href="/settings" onClick={onNavigate}>
          <Settings className="h-4 w-4" />
          Settings
        </Link>
      </Button>
      <form action={signOutAction} className={isMobile ? "w-full" : undefined}>
        <Button className={buttonClassName} type="submit" variant="ghost">
          <LogOut className="h-4 w-4" />
          Sign out
        </Button>
      </form>
    </>
  );
}

export function AppHeaderNav({ isAdmin }: AppHeaderNavProps) {
  const [open, setOpen] = useState(false);

  function closeMenu() {
    setOpen(false);
  }

  return (
    <>
      <div className="hidden items-center gap-2 md:flex">
        <HeaderNavActions isAdmin={isAdmin} layout="desktop" />
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            aria-label="Open navigation menu"
            className="md:hidden"
            size="icon"
            type="button"
            variant="outline"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Menu</SheetTitle>
          </SheetHeader>
          <nav aria-label="Main navigation" className="flex flex-col gap-2">
            <HeaderNavActions
              isAdmin={isAdmin}
              layout="mobile"
              onNavigate={closeMenu}
            />
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
}

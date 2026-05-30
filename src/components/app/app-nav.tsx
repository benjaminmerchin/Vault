"use client";

import Link from "next/link";
import { useTransition } from "react";
import { LogOut, Sparkles, ShieldCheck } from "lucide-react";
import { signOutAction } from "@/lib/actions/auth";
import { VaultLogo } from "@/components/brand/logo";
import { AdvisorPanel } from "@/components/advisor/advisor-panel";
import { PrivacyPill } from "@/components/privacy-pill";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function AppNav({
  email,
  name,
}: {
  email: string;
  name: string | null;
}) {
  const [pending, start] = useTransition();
  const initials = (name || email).slice(0, 2).toUpperCase();

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5">
        <Link href="/dashboard">
          <VaultLogo />
        </Link>

        <div className="flex items-center gap-2">
          <Link href="/privacy" className="hidden sm:block">
            <Button variant="ghost" size="sm">
              <ShieldCheck className="size-4" />
              Privacy
            </Button>
          </Link>

          <Sheet>
            <SheetTrigger render={<Button size="sm" className="gap-1.5" />}>
              <Sparkles className="size-4" />
              Ask Vault
            </SheetTrigger>
            <SheetContent
              side="right"
              className="flex w-full flex-col gap-0 p-0 sm:max-w-md"
            >
              <SheetHeader className="border-b border-border px-5 py-4">
                <SheetTitle className="flex items-center gap-2">
                  <Sparkles className="size-4 text-primary" />
                  Vault Advisor
                </SheetTitle>
                <PrivacyPill icon="lock" className="mt-1 w-fit">
                  End-to-end encrypted · zero-retention
                </PrivacyPill>
              </SheetHeader>
              <div className="min-h-0 flex-1 px-4">
                <AdvisorPanel />
              </div>
            </SheetContent>
          </Sheet>

          <DropdownMenu>
            <DropdownMenuTrigger className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <Avatar className="size-9 border border-border">
                <AvatarFallback className="bg-secondary text-xs font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="flex flex-col">
                <span className="text-sm font-medium">{name || "Your vault"}</span>
                <span className="text-xs font-normal text-muted-foreground">
                  {email}
                </span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                disabled={pending}
                closeOnClick={false}
                onClick={() =>
                  start(() => {
                    void signOutAction();
                  })
                }
              >
                <LogOut className="size-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

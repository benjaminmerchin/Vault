"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { VaultLogo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/#how", label: "How it works" },
  { href: "/#why", label: "Why Vault" },
  { href: "/privacy", label: "Privacy" },
];

export function SiteNav({ authed = false }: { authed?: boolean }) {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-30 w-full border-b border-white/5 bg-black/60 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6">
        <Link href="/">
          <VaultLogo />
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
          {LINKS.map((l) => {
            const active = l.href === "/privacy" && pathname === "/privacy";
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "transition hover:text-white",
                  active ? "text-white" : "text-white/70",
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          {authed ? (
            <Link href="/dashboard">
              <Button size="sm" className="h-9 rounded-full px-4">
                Go to dashboard
                <ArrowRight className="ml-0.5 size-3.5" />
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden h-9 rounded-full px-4 text-white/80 hover:bg-white/10 hover:text-white sm:inline-flex"
                >
                  Sign in
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="h-9 rounded-full px-4">
                  Open Vault
                  <ArrowRight className="ml-0.5 size-3.5" />
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

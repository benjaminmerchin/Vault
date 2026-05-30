"use client";

import Link from "next/link";
import { useTransition } from "react";
import { LogOut, ShieldCheck } from "lucide-react";
import { signOutAction } from "@/lib/actions/auth";
import { VaultLogo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
    <header className="z-30 shrink-0 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="flex h-16 w-full items-center justify-between px-5">
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

          <DropdownMenu>
            <DropdownMenuTrigger className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <Avatar className="size-9 border border-border">
                <AvatarFallback className="bg-secondary text-xs font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex flex-col px-2 py-1.5">
                <span className="text-sm font-medium">{name || "Your vault"}</span>
                <span className="text-xs font-normal text-muted-foreground">
                  {email}
                </span>
              </div>
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

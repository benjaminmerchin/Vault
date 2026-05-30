"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  usePlaidLink,
  type PlaidLinkOnSuccessMetadata,
} from "react-plaid-link";
import { Landmark, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function ConnectBankButton({
  label = "Connect a bank",
  variant = "default",
  size = "default",
  className,
}: {
  label?: string;
  variant?: "default" | "outline" | "secondary";
  size?: "default" | "sm" | "lg";
  className?: string;
}) {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/plaid/link-token", { method: "POST" })
      .then((r) => r.json())
      .then((d) => {
        if (active && d.link_token) setToken(d.link_token);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const onSuccess = useCallback(
    async (publicToken: string, metadata: PlaidLinkOnSuccessMetadata) => {
      setBusy(true);
      try {
        const res = await fetch("/api/plaid/exchange", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            public_token: publicToken,
            institution_name: metadata?.institution?.name,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Connection failed");
        toast.success(
          `Connected ${data.institution} — ${data.accounts} accounts, ${data.transactions} transactions`,
        );
        router.refresh();
      } catch (e) {
        toast.error((e as Error).message);
      } finally {
        setBusy(false);
      }
    },
    [router],
  );

  const { open, ready } = usePlaidLink({ token, onSuccess });

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      disabled={!ready || !token || busy}
      onClick={() => open()}
    >
      {busy ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Landmark className="size-4" />
      )}
      {busy ? "Syncing…" : label}
    </Button>
  );
}

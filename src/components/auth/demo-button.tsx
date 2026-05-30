"use client";

import { useTransition } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { signInDemoAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function DemoButton({
  className,
  size,
  label = "Try the live demo",
}: {
  className?: string;
  size?: "default" | "sm" | "lg";
  label?: string;
}) {
  const [pending, start] = useTransition();
  return (
    <Button
      type="button"
      size={size}
      variant="secondary"
      className={cn(
        "border border-primary/30 bg-primary/10 text-primary hover:bg-primary/15",
        className,
      )}
      disabled={pending}
      onClick={() =>
        start(async () => {
          const res = await signInDemoAction();
          if (res?.error) toast.error(res.error);
        })
      }
    >
      {pending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Sparkles className="size-4" />
      )}
      {label}
    </Button>
  );
}

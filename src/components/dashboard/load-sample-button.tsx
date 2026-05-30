"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { loadSampleData } from "@/lib/actions/data";
import { Button } from "@/components/ui/button";

export function LoadSampleButton({
  label = "Load a sample portfolio",
  size = "lg",
}: {
  label?: string;
  size?: "default" | "sm" | "lg";
}) {
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <Button
      size={size}
      disabled={pending}
      onClick={() =>
        start(async () => {
          const res = await loadSampleData();
          if (res?.error) toast.error(res.error);
          else {
            toast.success("Sample portfolio loaded");
            router.refresh();
          }
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

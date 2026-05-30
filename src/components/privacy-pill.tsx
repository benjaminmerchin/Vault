import { Lock, ShieldCheck, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

const ICONS = { lock: Lock, shield: ShieldCheck, eye: EyeOff } as const;

export function PrivacyPill({
  children,
  icon = "lock",
  className,
}: {
  children: React.ReactNode;
  icon?: keyof typeof ICONS;
  className?: string;
}) {
  const Icon = ICONS[icon];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary",
        className,
      )}
    >
      <Icon className="size-3.5" />
      {children}
    </span>
  );
}

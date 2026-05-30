import { cn } from "@/lib/utils";

export function VaultMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative inline-flex size-8 items-center justify-center rounded-[10px] bg-primary text-primary-foreground shadow-[0_0_24px_-6px_var(--primary)]",
        className,
      )}
    >
      <svg viewBox="0 0 24 24" className="size-[18px]" aria-hidden>
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 3l7 3v5c0 4.2-2.8 7.6-7 9-4.2-1.4-7-4.8-7-9V6l7-3z"
        />
        <circle cx="12" cy="11" r="2.1" fill="currentColor" stroke="none" />
        <path
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          d="M12 13.1v2.4"
        />
      </svg>
    </span>
  );
}

export function VaultLogo({
  className,
  textClassName,
}: {
  className?: string;
  textClassName?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <VaultMark />
      <span
        className={cn(
          "text-lg font-semibold tracking-tight text-foreground",
          textClassName,
        )}
      >
        Vault
      </span>
    </span>
  );
}

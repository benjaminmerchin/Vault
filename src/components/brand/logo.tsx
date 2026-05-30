import { cn } from "@/lib/utils";

export function VaultMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative inline-flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-300 via-emerald-400 to-teal-500 text-emerald-950 shadow-lg shadow-emerald-500/30 ring-1 ring-inset ring-white/25",
        className,
      )}
    >
      {/* top sheen for a glassy finish */}
      <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-xl bg-gradient-to-b from-white/40 to-transparent" />
      <svg viewBox="0 0 24 24" className="relative size-[19px]" aria-hidden>
        {/* shield */}
        <path
          d="M12 2.5 L19.5 5.3 L19.5 11.2 C19.5 16.3 16.3 20.3 12 21.6 C7.7 20.3 4.5 16.3 4.5 11.2 L4.5 5.3 Z"
          fill="currentColor"
        />
        {/* keyhole */}
        <circle cx="12" cy="10.2" r="1.85" fill="#d1fae5" />
        <path
          d="M12 11.7 V14.8"
          stroke="#d1fae5"
          strokeWidth="2.1"
          strokeLinecap="round"
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
          "bg-gradient-to-b from-foreground to-foreground/75 bg-clip-text text-lg font-semibold tracking-tight text-transparent",
          textClassName,
        )}
      >
        Vault
      </span>
    </span>
  );
}

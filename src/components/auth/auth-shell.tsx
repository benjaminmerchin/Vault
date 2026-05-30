import Link from "next/link";
import { VaultLogo } from "@/components/brand/logo";
import { PrivacyPill } from "@/components/privacy-pill";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <main className="vault-grid flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <Link href="/" className="mb-8">
        <VaultLogo />
      </Link>
      <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-7 shadow-2xl shadow-black/30">
        <div className="mb-6 space-y-1.5 text-center">
          <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        {children}
      </div>
      <div className="mt-6">
        <PrivacyPill icon="shield">
          Secured by Supabase Auth · private AI by Krava
        </PrivacyPill>
      </div>
    </main>
  );
}

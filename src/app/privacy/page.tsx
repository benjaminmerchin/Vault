import Link from "next/link";
import {
  ArrowLeft,
  KeyRound,
  ServerOff,
  Fingerprint,
  Lock,
  Database,
  Bot,
  Check,
  X,
} from "lucide-react";
import { VaultLogo } from "@/components/brand/logo";
import { DemoButton } from "@/components/auth/demo-button";
import { Button } from "@/components/ui/button";
import { BlurFade } from "@/components/ui/blur-fade";

export const metadata = {
  title: "How privacy works — Vault",
};

export default function PrivacyPage() {
  return (
    <div className="relative flex min-h-screen flex-col bg-black text-white">
      <header className="sticky top-0 z-30 w-full border-b border-white/5 bg-black/60 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-4xl items-center justify-between px-6">
          <Link href="/">
            <VaultLogo />
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full text-white/80 hover:bg-white/10 hover:text-white"
              >
                <ArrowLeft className="size-4" />
                Home
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="rounded-full px-4">
                Open Vault
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-20">
        <BlurFade inView>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-white/40">
            Privacy architecture
          </p>
          <h1 className="mt-4 text-balance text-4xl font-semibold tracking-[-0.03em] md:text-5xl">
            How Vault keeps your money{" "}
            <span className="font-serif font-normal italic text-primary">
              private
            </span>
            .
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-white/60">
            A finance app only earns trust if privacy is structural, not a
            policy paragraph. Here is exactly where your data lives and what
            every party in the chain can — and cannot — see.
          </p>
        </BlurFade>

        {/* Flow */}
        <div className="mt-14 grid gap-4 sm:grid-cols-4">
          {[
            {
              icon: Database,
              title: "Your vault",
              body: "Accounts, holdings, debts and goals stored in Postgres with row-level security, scoped to your user id.",
            },
            {
              icon: Lock,
              title: "Encrypted prompt",
              body: "Your question + context is sent over TLS to Krava and encrypted with AES-256-GCM, keyed to your token.",
            },
            {
              icon: Fingerprint,
              title: "Anonymized",
              body: "Krava strips your identity before the request reaches any model provider. The model never learns who you are.",
            },
            {
              icon: ServerOff,
              title: "Forgotten",
              body: "Inference runs zero-retention. No logs, no training, nothing kept. The answer streams back, then it's gone.",
            },
          ].map((s, i) => (
            <BlurFade key={s.title} delay={0.06 * i} inView>
              <div className="h-full rounded-2xl border border-white/10 bg-white/[0.02] p-5 backdrop-blur transition duration-300 hover:border-primary/30 hover:bg-white/[0.04]">
                <s.icon className="size-5 text-primary" />
                <h3 className="mt-3 text-sm font-semibold">{s.title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-white/55">
                  {s.body}
                </p>
              </div>
            </BlurFade>
          ))}
        </div>

        {/* Pillars */}
        <BlurFade inView>
          <p className="mt-20 font-mono text-xs uppercase tracking-[0.18em] text-white/40">
            The three guarantees
          </p>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-[-0.03em] md:text-4xl">
            Trust you don&apos;t have to{" "}
            <span className="font-serif font-normal italic text-primary">take</span> —
            you can check.
          </h2>
        </BlurFade>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            {
              icon: KeyRound,
              title: "Your token is the key",
              body: "The userToken Krava issues doubles as your encryption key. Vault's servers only ever hold ciphertext — we cannot decrypt your conversations.",
            },
            {
              icon: ServerOff,
              title: "Zero-retention models",
              body: "Prompts route through Krava to zero-retention inference (Tinfoil + model-agnostic routing). Your finances are never logged or trained on.",
            },
            {
              icon: Fingerprint,
              title: "Anonymized identity",
              body: "Krava decouples your real identity from every API call, so the provider sees an anonymous request — not your net worth with your name on it.",
            },
          ].map((p, i) => (
            <BlurFade key={p.title} delay={0.07 * i} inView>
              <div className="h-full rounded-2xl border border-white/10 bg-white/[0.02] p-6 backdrop-blur transition duration-300 hover:border-primary/30 hover:bg-white/[0.04]">
                <span className="flex size-10 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-primary">
                  <p.icon className="size-5" />
                </span>
                <h3 className="mt-4 font-semibold">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/55">
                  {p.body}
                </p>
              </div>
            </BlurFade>
          ))}
        </div>

        {/* Who can see what */}
        <BlurFade inView>
          <div className="mt-20 rounded-2xl border border-white/10 bg-white/[0.02] p-7">
            <h2 className="flex items-center gap-2 text-xl font-semibold">
              <Bot className="size-5 text-primary" />
              What each party can see
            </h2>
            <div className="mt-6 grid gap-px overflow-hidden rounded-xl bg-white/10 sm:grid-cols-2">
              <Visibility
                who="You"
                can={["Everything — it's your vault", "Plaintext chats & balances"]}
                cannot={[]}
              />
              <Visibility
                who="Vault (this app)"
                can={["Your data, to route it", "Which accounts exist"]}
                cannot={["The contents of your AI chats"]}
              />
              <Visibility
                who="Krava"
                can={["Encrypted ciphertext only"]}
                cannot={["Your plaintext messages", "Your decryption key"]}
              />
              <Visibility
                who="The model provider"
                can={["An anonymized prompt"]}
                cannot={["Who you are", "Anything after the reply (zero-retention)"]}
              />
            </div>
          </div>
        </BlurFade>

        {/* Built on */}
        <BlurFade inView>
          <div className="vault-grid mt-12 flex flex-col items-start gap-5 overflow-hidden rounded-3xl border border-primary/20 bg-white/[0.02] p-8 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold">Built on Krava</h3>
              <p className="mt-1.5 max-w-xl text-sm text-white/60">
                Encrypted memory, passkey identity, and model-agnostic
                zero-retention routing — the privacy infrastructure, so we
                don&apos;t have to promise it, we can prove it.
              </p>
            </div>
            <DemoButton
              label="See it live"
              className="shrink-0 rounded-full border-transparent bg-primary text-primary-foreground hover:bg-primary/90"
            />
          </div>
        </BlurFade>
      </main>

      <footer className="border-t border-white/5">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-6 py-8 text-xs text-white/40">
          <VaultLogo textClassName="text-base" />
          <p>Krava privacy hackathon · 2026</p>
        </div>
      </footer>
    </div>
  );
}

function Visibility({
  who,
  can,
  cannot,
}: {
  who: string;
  can: string[];
  cannot: string[];
}) {
  return (
    <div className="bg-black p-5">
      <p className="font-medium">{who}</p>
      <ul className="mt-3 space-y-1.5 text-sm">
        {can.map((c) => (
          <li key={c} className="flex items-start gap-2 text-white/60">
            <Check className="mt-0.5 size-4 shrink-0 text-primary" />
            {c}
          </li>
        ))}
        {cannot.map((c) => (
          <li key={c} className="flex items-start gap-2 text-white/60">
            <X className="mt-0.5 size-4 shrink-0 text-destructive" />
            {c}
          </li>
        ))}
      </ul>
    </div>
  );
}

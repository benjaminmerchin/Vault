import Link from "next/link";
import {
  ArrowRight,
  Lock,
  ShieldCheck,
  EyeOff,
  Sparkles,
  LineChart,
  Wallet,
  Target,
  ServerOff,
  KeyRound,
  Fingerprint,
} from "lucide-react";
import { VaultLogo } from "@/components/brand/logo";
import { PrivacyPill } from "@/components/privacy-pill";
import { DemoButton } from "@/components/auth/demo-button";
import { Button } from "@/components/ui/button";
import { AuroraText } from "@/components/ui/aurora-text";
import { Particles } from "@/components/ui/particles";

export default function Landing() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Nav */}
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5">
          <VaultLogo />
          <nav className="flex items-center gap-2">
            <Link href="/privacy">
              <Button variant="ghost" size="sm">
                How privacy works
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Sign in
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Open Vault</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="vault-grid relative overflow-hidden">
        <Particles
          className="absolute inset-0"
          quantity={130}
          ease={70}
          color="#34d399"
          size={0.5}
        />
        <div className="relative z-10 mx-auto w-full max-w-6xl px-5 py-24 text-center sm:py-32">
          <div className="mb-6 flex justify-center">
            <PrivacyPill icon="shield">
              Privacy as infrastructure — not a pinky promise
            </PrivacyPill>
          </div>
          <h1 className="mx-auto max-w-3xl text-balance text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
            Your money. Your AI.{" "}
            <AuroraText colors={["#34d399", "#10b981", "#5eead4", "#2dd4bf"]}>
              Nobody else&apos;s.
            </AuroraText>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground">
            Vault is a financial hub that holds your whole money picture and a
            personal AI advisor — without becoming a surveillance product on the
            side. Every conversation is end-to-end encrypted and runs on
            zero-retention models. Even we can&apos;t read it.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <DemoButton size="lg" label="Try the live demo" />
            <Link href="/signup">
              <Button size="lg" variant="outline" className="group">
                Create your vault
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </Link>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            No credit card. The demo opens a fully loaded account instantly.
          </p>
        </div>
      </section>

      {/* Trust strip */}
      <section className="border-y border-border/60 bg-card/30">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-px px-5 py-1 sm:grid-cols-4">
          {[
            { icon: Lock, label: "AES-256-GCM encrypted at rest" },
            { icon: ServerOff, label: "Zero-retention inference" },
            { icon: Fingerprint, label: "Identity anonymized from the model" },
            { icon: EyeOff, label: "Even Krava can't read it" },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-2.5 px-3 py-5 text-sm text-muted-foreground"
            >
              <Icon className="size-4 shrink-0 text-primary" />
              {label}
            </div>
          ))}
        </div>
      </section>

      {/* Problem / difference */}
      <section className="mx-auto w-full max-w-6xl px-5 py-24">
        <div className="grid gap-10 md:grid-cols-2 md:gap-16">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight">
              Most finance AI reads everything you own.
            </h2>
            <p className="mt-4 text-muted-foreground">
              To get useful advice, today&apos;s tools ship your balances,
              transactions, and goals straight to OpenAI or Anthropic — logged,
              retained, and tied to you. Your most sensitive data becomes
              training fuel and a breach waiting to happen.
            </p>
          </div>
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-7">
            <h3 className="flex items-center gap-2 text-xl font-semibold">
              <ShieldCheck className="size-5 text-primary" />
              The Vault difference
            </h3>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-3">
                <KeyRound className="mt-0.5 size-4 shrink-0 text-primary" />
                Your token is your encryption key. Vault stores ciphertext it
                can&apos;t open.
              </li>
              <li className="flex gap-3">
                <ServerOff className="mt-0.5 size-4 shrink-0 text-primary" />
                Prompts route through Krava to zero-retention models — nothing
                is kept or trained on.
              </li>
              <li className="flex gap-3">
                <Fingerprint className="mt-0.5 size-4 shrink-0 text-primary" />
                The model never learns who you are. Your identity is stripped
                before the request leaves.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border/60 bg-card/30">
        <div className="mx-auto w-full max-w-6xl px-5 py-24">
          <div className="text-center">
            <h2 className="text-3xl font-semibold tracking-tight">
              Private by architecture, in three steps
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Privacy isn&apos;t a setting you toggle. It&apos;s how the data
              flows.
            </p>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {[
              {
                n: "01",
                title: "Bring your money in",
                body: "Accounts, holdings, debts and goals live in your own row-level-secured vault. Only you can read them.",
                icon: Wallet,
              },
              {
                n: "02",
                title: "Ask your advisor anything",
                body: "“How fast can I kill this credit card?” Vault answers using your real numbers — never a generic guess.",
                icon: Sparkles,
              },
              {
                n: "03",
                title: "Krava keeps it private",
                body: "The chat is AES-256 encrypted, the model is zero-retention, and your identity is anonymized end-to-end.",
                icon: ShieldCheck,
              },
            ].map((s) => (
              <div
                key={s.n}
                className="rounded-2xl border border-border bg-card p-7"
              >
                <div className="flex items-center justify-between">
                  <s.icon className="size-6 text-primary" />
                  <span className="font-mono text-sm text-muted-foreground">
                    {s.n}
                  </span>
                </div>
                <h3 className="mt-5 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto w-full max-w-6xl px-5 py-24">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: LineChart, title: "Net worth, live", body: "Assets minus liabilities, tracked over time." },
            { icon: Wallet, title: "Every account", body: "Cash, brokerage, retirement, and debts in one view." },
            { icon: Sparkles, title: "Private advisor", body: "An AI that knows your finances — and forgets them." },
            { icon: Target, title: "Goals that pace", body: "See exactly what it takes to hit each target." },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border border-border bg-card p-6">
              <f.icon className="size-5 text-primary" />
              <h3 className="mt-4 font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto mb-24 w-full max-w-6xl px-5">
        <div className="vault-grid relative overflow-hidden rounded-3xl border border-primary/25 bg-card p-12 text-center">
          <h2 className="text-3xl font-semibold tracking-tight">
            See your finances without giving them away
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
            Open the demo and ask the advisor anything. Watch a private answer
            stream back — encrypted, anonymized, forgotten.
          </p>
          <div className="mt-8 flex justify-center">
            <DemoButton size="lg" label="Open the live demo" />
          </div>
        </div>
      </section>

      <footer className="mt-auto border-t border-border/60">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 text-sm text-muted-foreground sm:flex-row">
          <VaultLogo textClassName="text-base" />
          <p>Built for the Krava privacy hackathon · Powered by Krava + Supabase</p>
        </div>
      </footer>
    </div>
  );
}

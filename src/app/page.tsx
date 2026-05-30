import Link from "next/link";
import { redirect } from "next/navigation";
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
import { SiteNav } from "@/components/site-nav";
import { DemoButton } from "@/components/auth/demo-button";
import { Button } from "@/components/ui/button";
import { BlurFade } from "@/components/ui/blur-fade";
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";
import { Marquee } from "@/components/ui/marquee";
import { NumberTicker } from "@/components/ui/number-ticker";
import { cn } from "@/lib/utils";

const GUARANTEES = [
  { icon: Lock, label: "AES-256-GCM encrypted" },
  { icon: ServerOff, label: "Zero-retention inference" },
  { icon: Fingerprint, label: "Identity anonymized" },
  { icon: KeyRound, label: "Your token, your key" },
  { icon: ShieldCheck, label: "Row-level security" },
  { icon: EyeOff, label: "Even Krava can't read it" },
];

const STATS: { value: number; suffix: string; label: string }[] = [
  { value: 256, suffix: "-bit", label: "AES-GCM encryption" },
  { value: 0, suffix: "", label: "Bytes the model retains" },
  { value: 100, suffix: "%", label: "Your data, your keys" },
  { value: 1, suffix: "-tap", label: "To a private demo" },
];

const STEPS = [
  {
    icon: Wallet,
    title: "Bring your money in",
    body: "Accounts, holdings, debts and goals live in your own row-level-secured vault. Only you can read them — not even we can.",
  },
  {
    icon: Sparkles,
    title: "Ask your advisor anything",
    body: "“How fast can I kill this credit card?” Vault answers with your real numbers, not a generic guess — streamed live.",
  },
  {
    icon: ShieldCheck,
    title: "Krava keeps it private",
    body: "The chat is AES-256 encrypted, the model is zero-retention, and your identity is stripped before the request ever leaves.",
  },
];

const FEATURES = [
  {
    icon: KeyRound,
    title: "Your token is the key",
    body: "The userToken Krava issues doubles as your encryption key. Vault only ever holds ciphertext — we literally cannot open your conversations.",
    accent: "md:col-span-2",
  },
  {
    icon: ServerOff,
    title: "Zero-retention models",
    body: "Prompts route through Krava to zero-retention inference. Nothing logged, nothing trained on.",
    accent: "",
  },
  {
    icon: Fingerprint,
    title: "Anonymized identity",
    body: "The model sees an anonymous request — not your net worth tied to your name.",
    accent: "",
  },
  {
    icon: LineChart,
    title: "Actually useful, still private",
    body: "Net worth, spending, holdings, goals and an advisor that reasons over all of it. Privacy that doesn't cost you the product.",
    accent: "md:col-span-2",
  },
];

export default async function Landing({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  // Supabase email-confirmation links land on the Site URL (/) with a PKCE code.
  // Hand it off to the callback route to exchange it for a session.
  const { code } = await searchParams;
  if (code) redirect(`/auth/callback?code=${code}&next=/dashboard`);

  return (
    <div className="relative flex min-h-screen flex-col bg-black text-white">
      {/* Nav */}
      <SiteNav />

      {/* Hero */}
      <section className="relative isolate flex flex-1 items-center overflow-hidden">
        <AnimatedGridPattern
          numSquares={56}
          maxOpacity={0.1}
          duration={3}
          repeatDelay={0.6}
          width={46}
          height={46}
          className={cn(
            "[mask-image:radial-gradient(760px_circle_at_50%_0%,white,transparent)]",
            "absolute inset-0 h-full w-full fill-primary/12 stroke-primary/15",
          )}
        />
        <div className="pointer-events-none absolute left-1/2 top-0 -z-10 size-[640px] -translate-x-1/2 rounded-full bg-primary/15 blur-[120px]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black to-transparent" />

        <div className="relative z-10 mx-auto w-full max-w-5xl px-6 py-24 md:py-32">
          <BlurFade delay={0.05} inView>
            <div className="mx-auto mb-8 flex w-fit items-center gap-2 rounded-full border border-primary/25 bg-primary/[0.07] px-4 py-1.5 text-xs font-medium text-primary backdrop-blur">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
                <span className="relative inline-flex size-1.5 rounded-full bg-primary" />
              </span>
              PRIVATE BY DESIGN — built for the Krava privacy hackathon
            </div>
          </BlurFade>

          <BlurFade delay={0.15} inView>
            <h1 className="text-balance text-center text-5xl font-semibold leading-[1.02] tracking-[-0.04em] text-white drop-shadow-[0_4px_30px_rgba(0,0,0,0.6)] md:text-7xl">
              Your money. Your AI.
              <br />
              <span className="font-serif font-normal italic text-primary">
                Nobody else&apos;s.
              </span>
            </h1>
          </BlurFade>

          <BlurFade delay={0.3} inView>
            <p className="mx-auto mt-7 max-w-2xl text-balance text-center text-lg text-white/60 md:text-xl">
              Vault holds your whole money picture and a personal AI advisor —
              without becoming a surveillance product on the side. Every chat is
              end-to-end encrypted and runs on zero-retention models. Even we
              can&apos;t read it.
            </p>
          </BlurFade>

          <BlurFade delay={0.45} inView>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <DemoButton
                size="lg"
                label="Try the live demo"
                className="h-12 rounded-full border-transparent bg-primary px-7 text-primary-foreground hover:bg-primary/90"
              />
              <Link href="/signup">
                <Button
                  variant="ghost"
                  size="lg"
                  className="group h-12 gap-2 rounded-full border border-white/15 bg-white/[0.03] px-7 text-white/85 backdrop-blur hover:bg-white/[0.08] hover:text-white"
                >
                  Create your vault
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </Link>
            </div>
          </BlurFade>

          <BlurFade delay={0.6} inView>
            <p className="mt-12 text-center font-mono text-xs uppercase tracking-[0.18em] text-white/35">
              Encrypted · Zero-retention · Anonymized — powered by Krava + Supabase
            </p>
          </BlurFade>
        </div>
      </section>

      {/* Guarantees marquee */}
      <section className="relative border-y border-white/5 py-10">
        <p className="mb-6 text-center font-mono text-xs uppercase tracking-[0.18em] text-white/40">
          Privacy guarantees, enforced in the architecture
        </p>
        <Marquee className="[--duration:32s]" pauseOnHover>
          {GUARANTEES.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="mx-3 flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.02] px-4 py-1.5 text-sm text-white/70"
            >
              <Icon className="size-4 text-primary" />
              {label}
            </div>
          ))}
        </Marquee>
      </section>

      {/* Stats */}
      <section className="relative border-b border-white/5 py-14">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-2 gap-y-10 px-6 md:grid-cols-4 md:gap-y-0">
          {STATS.map((s, i) => (
            <BlurFade key={s.label} delay={0.05 * i} inView>
              <div className="flex flex-col items-center text-center">
                <div className="flex items-baseline text-4xl font-semibold tracking-[-0.03em] text-white tabular-nums md:text-5xl">
                  <NumberTicker value={s.value} className="text-white" />
                  <span className="ml-0.5 text-primary">{s.suffix}</span>
                </div>
                <span className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
                  {s.label}
                </span>
              </div>
            </BlurFade>
          ))}
        </div>
      </section>

      {/* Problem / contrast */}
      <section id="why" className="relative mx-auto w-full max-w-6xl px-6 py-28">
        <BlurFade inView>
          <div className="grid gap-10 md:grid-cols-2 md:gap-16">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-white/40">
                The problem
              </p>
              <h2 className="mt-3 max-w-md text-balance text-3xl font-semibold tracking-[-0.03em] text-white md:text-5xl">
                Most finance AI reads{" "}
                <span className="font-serif font-normal italic text-white/90">
                  everything
                </span>{" "}
                you own.
              </h2>
              <p className="mt-5 max-w-md text-white/60">
                To give advice, today&apos;s tools ship your balances,
                transactions and goals straight to OpenAI or Anthropic — logged,
                retained, and tied to you. Your most sensitive data becomes
                training fuel and a breach waiting to happen.
              </p>
            </div>
            <div className="rounded-2xl border border-primary/20 bg-primary/[0.04] p-8">
              <h3 className="flex items-center gap-2 text-xl font-semibold text-white">
                <ShieldCheck className="size-5 text-primary" />
                The Vault difference
              </h3>
              <ul className="mt-5 space-y-4 text-sm text-white/65">
                <li className="flex gap-3">
                  <KeyRound className="mt-0.5 size-4 shrink-0 text-primary" />
                  Your token is your encryption key. Vault stores ciphertext it can&apos;t open.
                </li>
                <li className="flex gap-3">
                  <ServerOff className="mt-0.5 size-4 shrink-0 text-primary" />
                  Prompts route through Krava to zero-retention models — nothing kept or trained on.
                </li>
                <li className="flex gap-3">
                  <Fingerprint className="mt-0.5 size-4 shrink-0 text-primary" />
                  Your identity is stripped before the request reaches any provider.
                </li>
              </ul>
            </div>
          </div>
        </BlurFade>
      </section>

      {/* How it works */}
      <section id="how" className="relative border-y border-white/5 bg-white/[0.012] py-28">
        <div className="mx-auto w-full max-w-6xl px-6">
          <BlurFade inView>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-white/40">
              How it works
            </p>
            <h2 className="mt-3 max-w-3xl text-balance text-3xl font-semibold tracking-[-0.03em] text-white md:text-5xl">
              Private by{" "}
              <span className="font-serif font-normal italic text-primary">architecture</span>,
              in three steps.
            </h2>
          </BlurFade>

          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {STEPS.map(({ icon: Icon, title, body }, i) => (
              <BlurFade key={title} delay={0.1 * (i + 1)} inView>
                <div className="group relative h-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-7 backdrop-blur transition duration-300 hover:border-primary/30 hover:bg-white/[0.04]">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="grid size-10 place-items-center rounded-xl border border-white/15 bg-white/5">
                      <Icon className="size-5 text-primary" />
                    </div>
                    <span className="font-mono text-xs uppercase tracking-widest text-white/40">
                      Step 0{i + 1}
                    </span>
                  </div>
                  <h3 className="text-2xl font-semibold tracking-tight text-white">{title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/60">{body}</p>
                </div>
              </BlurFade>
            ))}
          </div>
        </div>
      </section>

      {/* Bento features */}
      <section className="relative mx-auto w-full max-w-6xl px-6 py-28">
        <BlurFade inView>
          <div className="flex items-end justify-between gap-8">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-white/40">
                Why Vault
              </p>
              <h2 className="mt-3 max-w-2xl text-balance text-3xl font-semibold tracking-[-0.03em] text-white md:text-5xl">
                A finance app you don&apos;t have to{" "}
                <span className="font-serif font-normal italic text-primary">trust</span> —
                you can verify.
              </h2>
            </div>
          </div>
        </BlurFade>

        <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, body, accent }, i) => (
            <BlurFade key={title} delay={0.07 * i} inView className={accent}>
              <div className="group relative h-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] p-7 backdrop-blur transition duration-300 hover:border-primary/30 hover:bg-white/[0.04]">
                <div className="mb-5 grid size-11 place-items-center rounded-xl border border-white/15 bg-white/[0.04]">
                  <Icon className="size-5 text-primary" />
                </div>
                <h3 className="text-xl font-semibold tracking-tight text-white md:text-2xl">{title}</h3>
                <p className="mt-2.5 max-w-md text-sm leading-relaxed text-white/60">{body}</p>
                <div className="pointer-events-none absolute -bottom-10 -right-10 size-40 rounded-full border border-primary/[0.06] bg-primary/[0.02]" />
              </div>
            </BlurFade>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative isolate mx-auto w-full max-w-6xl overflow-hidden px-6 pb-28">
        <div className="relative overflow-hidden rounded-3xl border border-primary/15 bg-white/[0.02] p-12 text-center md:p-20">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -left-20 top-1/2 size-80 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute -right-20 top-1/2 size-80 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl" />
          </div>
          <h2 className="relative text-balance text-3xl font-semibold tracking-[-0.03em] text-white md:text-5xl">
            See your finances without{" "}
            <span className="font-serif font-normal italic text-primary">giving them away</span>.
          </h2>
          <p className="relative mx-auto mt-5 max-w-xl text-balance text-white/60 md:text-lg">
            Open the demo and ask the advisor anything. Watch a private answer
            stream back — encrypted, anonymized, forgotten.
          </p>
          <div className="relative mt-10 flex justify-center">
            <DemoButton
              size="lg"
              label="Open the live demo"
              className="h-12 rounded-full border-transparent bg-primary px-7 text-primary-foreground hover:bg-primary/90"
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-white/5">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-4 px-6 py-8 text-xs text-white/40 md:flex-row md:items-center">
          <div className="flex items-center gap-3">
            <VaultLogo textClassName="text-base" />
            <span className="hidden md:inline">·</span>
            <span>Built for the Krava privacy hackathon · 2026</span>
          </div>
          <div className="flex items-center gap-5">
            <Link href="/privacy" className="transition hover:text-white">How privacy works</Link>
            <Link href="/login" className="transition hover:text-white">Sign in</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

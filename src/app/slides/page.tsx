"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  EyeOff,
  Fingerprint,
  KeyRound,
  LineChart,
  Landmark,
  Brain,
  ServerOff,
  Lock,
} from "lucide-react";
import { VaultLogo, VaultMark } from "@/components/brand/logo";
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";
import { cn } from "@/lib/utils";

const TOTAL = 4;

export default function SlidesPage() {
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);

  const go = useCallback((next: number) => {
    setI((cur) => {
      const target = Math.max(0, Math.min(TOTAL - 1, next));
      setDir(target >= cur ? 1 : -1);
      return target;
    });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " " || e.key === "PageDown") {
        e.preventDefault();
        go(i + 1);
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        go(i - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [i, go]);

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-black text-white">
      <AnimatedGridPattern
        numSquares={50}
        maxOpacity={0.08}
        duration={3}
        repeatDelay={0.7}
        width={48}
        height={48}
        className={cn(
          "[mask-image:radial-gradient(900px_circle_at_50%_40%,white,transparent)]",
          "absolute inset-0 h-full w-full fill-primary/10 stroke-primary/12",
        )}
      />
      <div className="pointer-events-none absolute left-1/2 top-1/3 -z-10 size-[640px] -translate-x-1/2 rounded-full bg-primary/15 blur-[130px]" />

      {/* top bar */}
      <header className="relative z-10 flex items-center justify-between px-8 py-6">
        <VaultLogo />
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-white/40">
          {String(i + 1).padStart(2, "0")} / {String(TOTAL).padStart(2, "0")}
        </span>
      </header>

      {/* slide */}
      <main className="relative z-10 flex flex-1 items-center justify-center px-8">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={i}
            custom={dir}
            initial={{ opacity: 0, x: dir * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir * -40 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="mx-auto w-full max-w-4xl"
          >
            {SLIDES[i]}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* bottom controls */}
      <footer className="relative z-10 flex items-center justify-between px-8 py-6">
        <button
          onClick={() => go(i - 1)}
          disabled={i === 0}
          className="inline-flex size-10 items-center justify-center rounded-full border border-white/15 text-white/70 transition hover:bg-white/10 hover:text-white disabled:pointer-events-none disabled:opacity-30"
          aria-label="Previous slide"
        >
          <ChevronLeft className="size-5" />
        </button>

        <div className="flex items-center gap-2.5">
          {Array.from({ length: TOTAL }).map((_, n) => (
            <button
              key={n}
              onClick={() => go(n)}
              aria-label={`Slide ${n + 1}`}
              className={cn(
                "h-1.5 rounded-full transition-all",
                n === i ? "w-7 bg-primary" : "w-1.5 bg-white/25 hover:bg-white/50",
              )}
            />
          ))}
        </div>

        <button
          onClick={() => go(i + 1)}
          disabled={i === TOTAL - 1}
          className="inline-flex size-10 items-center justify-center rounded-full border border-white/15 text-white/70 transition hover:bg-white/10 hover:text-white disabled:pointer-events-none disabled:opacity-30"
          aria-label="Next slide"
        >
          <ChevronRight className="size-5" />
        </button>
      </footer>

      <p className="relative z-10 pb-4 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-white/25">
        Use ← → to navigate
      </p>
    </div>
  );
}

const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <p className="font-mono text-xs uppercase tracking-[0.22em] text-primary/80">
    {children}
  </p>
);

const SLIDES = [
  // 1 — The problem (lead with it)
  <div key="s1">
    <Eyebrow>The problem</Eyebrow>
    <h2 className="mt-5 max-w-3xl text-balance text-4xl font-semibold leading-tight tracking-[-0.03em] md:text-6xl">
      To get AI help with your money, you hand it to{" "}
      <span className="font-serif font-normal italic text-white/90">
        big companies
      </span>
      .
    </h2>
    <p className="mt-6 max-w-2xl text-lg text-white/60">
      Today&apos;s finance tools ship your balances, transactions and goals
      straight to OpenAI or Anthropic — where they&apos;re:
    </p>
    <div className="mt-8 flex flex-wrap gap-3">
      {["Logged", "Retained", "Trained on", "Tied to your name"].map((t) => (
        <span
          key={t}
          className="inline-flex items-center gap-2 rounded-full border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-red-300"
        >
          <EyeOff className="size-4" />
          {t}
        </span>
      ))}
    </div>
    <p className="mt-8 max-w-2xl text-pretty text-white/50">
      Useful — and a surveillance product on the side. We don&apos;t want to
      send our financial life to companies we just have to trust.
    </p>
  </div>,

  // 2 — The thesis + brand reveal
  <div key="s2" className="text-center">
    <div className="mb-8 flex justify-center">
      <VaultMark className="size-16 rounded-2xl" />
    </div>
    <Eyebrow>You shouldn&apos;t have to trust them</Eyebrow>
    <h1 className="mx-auto mt-5 max-w-3xl text-balance text-5xl font-semibold leading-[1.05] tracking-[-0.04em] md:text-7xl">
      Your money. Your AI.
      <br />
      <span className="font-serif font-normal italic text-primary">
        Nobody else&apos;s.
      </span>
    </h1>
    <p className="mx-auto mt-7 max-w-2xl text-balance text-lg text-white/60 md:text-xl">
      Vault runs every AI interaction through{" "}
      <span className="text-white">Krava</span> — encrypted, anonymized, and
      zero-retention. You don&apos;t have to <span className="italic">trust</span>{" "}
      that no one sees your data. By design,{" "}
      <span className="text-white">no one can</span>.
    </p>
  </div>,

  // 3 — Private by architecture
  <div key="s3">
    <Eyebrow>Private by architecture</Eyebrow>
    <h2 className="mt-5 max-w-3xl text-balance text-4xl font-semibold leading-tight tracking-[-0.03em] md:text-6xl">
      Not a promise — a{" "}
      <span className="font-serif font-normal italic text-primary">
        guarantee
      </span>
      .
    </h2>
    <div className="mt-9 grid gap-4 sm:grid-cols-2">
      {[
        { icon: Lock, t: "End-to-end encrypted", d: "AES-256-GCM at rest, keyed to your Krava identity." },
        { icon: ServerOff, t: "Zero-retention models", d: "Nothing logged, nothing trained on." },
        { icon: Fingerprint, t: "Identity anonymized", d: "The model never learns who you are." },
        { icon: Brain, t: "Encrypted cross-chat memory", d: "It remembers you — under your own key." },
      ].map((p) => (
        <div
          key={p.t}
          className="flex gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-5"
        >
          <p.icon className="mt-0.5 size-5 shrink-0 text-primary" />
          <div>
            <p className="font-semibold">{p.t}</p>
            <p className="mt-1 text-sm text-white/55">{p.d}</p>
          </div>
        </div>
      ))}
    </div>
    <p className="mt-7 flex items-center gap-2 text-sm text-white/40">
      <KeyRound className="size-4 text-primary" />
      Your token is the key — Vault stores only ciphertext it can&apos;t open.
    </p>
  </div>,

  // 4 — Demo CTA
  <div key="s4" className="text-center">
    <Eyebrow>Let&apos;s see it</Eyebrow>
    <h2 className="mx-auto mt-5 max-w-3xl text-balance text-4xl font-semibold leading-tight tracking-[-0.03em] md:text-6xl">
      A real financial hub that{" "}
      <span className="font-serif font-normal italic text-primary">forgets</span>{" "}
      you.
    </h2>
    <div className="mx-auto mt-9 flex max-w-2xl flex-wrap justify-center gap-3">
      {[
        { icon: LineChart, t: "Net worth & insights" },
        { icon: Landmark, t: "Plaid bank connect" },
        { icon: Brain, t: "Private AI advisor" },
        { icon: Lock, t: "Encrypted memory" },
      ].map((f) => (
        <span
          key={f.t}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-white/75"
        >
          <f.icon className="size-4 text-primary" />
          {f.t}
        </span>
      ))}
    </div>
    <div className="mt-10 flex justify-center">
      <a
        href="/"
        className="inline-flex h-12 items-center gap-2 rounded-full bg-primary px-7 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
      >
        Launch Vault
        <ArrowRight className="size-4" />
      </a>
    </div>
    <p className="mt-8 font-mono text-xs uppercase tracking-[0.18em] text-white/30">
      Powered by Krava · Supabase · Plaid
    </p>
  </div>,
];

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
import { PrivacyPill } from "@/components/privacy-pill";
import { DemoButton } from "@/components/auth/demo-button";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "How privacy works — Vault",
};

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-4xl items-center justify-between px-5">
          <Link href="/">
            <VaultLogo />
          </Link>
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="size-4" />
              Back
            </Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 px-5 py-16">
        <PrivacyPill icon="shield">Privacy architecture</PrivacyPill>
        <h1 className="mt-5 text-4xl font-semibold tracking-tight">
          How Vault keeps your money private
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
          A finance app only earns trust if privacy is structural, not a policy
          paragraph. Here is exactly where your data lives and what every party
          in the chain can — and cannot — see.
        </p>

        {/* Flow */}
        <div className="mt-12 grid gap-4 sm:grid-cols-4">
          <FlowStep
            icon={Database}
            title="Your vault"
            body="Accounts, holdings, debts and goals stored in Postgres with row-level security. Scoped to your user id."
          />
          <FlowStep
            icon={Lock}
            title="Encrypted prompt"
            body="Your question + context is sent over TLS to Krava and encrypted with AES-256-GCM, keyed to your token."
          />
          <FlowStep
            icon={Fingerprint}
            title="Anonymized"
            body="Krava strips your identity before the request reaches any model provider. The model never learns who you are."
          />
          <FlowStep
            icon={ServerOff}
            title="Forgotten"
            body="Inference runs zero-retention. No logs, no training, nothing kept. The answer streams back, then it's gone."
          />
        </div>

        {/* Pillars */}
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          <Pillar
            icon={KeyRound}
            title="Your token is the key"
            body="The userToken Krava issues doubles as your encryption key. Vault's servers only ever hold ciphertext — we literally cannot decrypt your conversations."
          />
          <Pillar
            icon={ServerOff}
            title="Zero-retention models"
            body="Prompts route through Krava to zero-retention inference (Tinfoil + model-agnostic routing). Your finances are never logged or used for training."
          />
          <Pillar
            icon={Fingerprint}
            title="Anonymized identity"
            body="Krava decouples your real identity from every API call, so the model provider sees an anonymous request — not Alex Rivera's net worth."
          />
        </div>

        {/* Can / cannot see */}
        <div className="mt-16 rounded-2xl border border-border bg-card p-7">
          <h2 className="flex items-center gap-2 text-xl font-semibold">
            <Bot className="size-5 text-primary" />
            What each party can see
          </h2>
          <div className="mt-6 grid gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2">
            <Visibility
              who="You"
              can={["Everything — it's your vault", "Plaintext chats & balances"]}
              cannot={[]}
            />
            <Visibility
              who="Vault (this app)"
              can={["Your encrypted data to route it", "Which accounts exist"]}
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
              cannot={["Who you are", "Anything after the response (zero-retention)"]}
            />
          </div>
        </div>

        {/* Built on */}
        <div className="mt-12 flex flex-col items-start gap-4 rounded-2xl border border-primary/20 bg-primary/5 p-7 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-semibold">Built on Krava</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Encrypted memory, passkey identity, and model-agnostic
              zero-retention routing — the privacy infrastructure, so we don&apos;t
              have to promise, we can prove it.
            </p>
          </div>
          <DemoButton label="See it live" />
        </div>
      </main>

      <footer className="mt-auto border-t border-border/60">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-5 py-8 text-sm text-muted-foreground">
          <VaultLogo textClassName="text-base" />
          <p>Krava privacy hackathon</p>
        </div>
      </footer>
    </div>
  );
}

function FlowStep({
  icon: Icon,
  title,
  body,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <Icon className="size-5 text-primary" />
      <h3 className="mt-3 text-sm font-semibold">{title}</h3>
      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}

function Pillar({
  icon: Icon,
  title,
  body,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="size-5" />
      </span>
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
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
    <div className="bg-card p-5">
      <p className="font-medium">{who}</p>
      <ul className="mt-3 space-y-1.5 text-sm">
        {can.map((c) => (
          <li key={c} className="flex items-start gap-2 text-muted-foreground">
            <Check className="mt-0.5 size-4 shrink-0 text-primary" />
            {c}
          </li>
        ))}
        {cannot.map((c) => (
          <li key={c} className="flex items-start gap-2 text-muted-foreground">
            <X className="mt-0.5 size-4 shrink-0 text-destructive" />
            {c}
          </li>
        ))}
      </ul>
    </div>
  );
}

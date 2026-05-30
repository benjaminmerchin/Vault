# Vault — private money, private AI

**Build AI apps where privacy is infrastructure, not a pinky promise.**

Vault is a personal financial hub: your accounts, holdings, debts, goals, and an
AI advisor that actually knows your numbers — without becoming a surveillance
product on the side. Every advisor conversation is end-to-end encrypted and runs
on **zero-retention** models, with your identity anonymized from the provider.
Powered by [Krava](https://krava.io).

> Built for the Krava privacy hackathon.

---

## Why it's private by architecture

| Party | Can see | Cannot see |
| --- | --- | --- |
| You | Everything — it's your vault | — |
| Vault (this app) | Your data (to route it), which accounts exist | The contents of your AI chats |
| Krava | Encrypted ciphertext | Your plaintext messages, your key |
| Model provider | An anonymized prompt | Who you are; anything after the reply (zero-retention) |

- **Your finances** live in Supabase Postgres behind **row-level security** — every
  row is scoped to `auth.uid()`, so users can only ever read their own data.
- **The advisor** (`/api/advisor`) runs server-side: it loads your finance snapshot
  (RLS), builds a private system prompt, provisions a Krava `userToken` for your
  user id, and streams `POST https://krava.io/api/platform/chat` straight back to
  the browser. The Krava **appKey never leaves the server**; messages are
  **AES-256-GCM** encrypted at rest.

## Stack

- **Next.js 16** (App Router) · **React 19** · **Tailwind v4** · **shadcn/ui** + **MagicUI**
- **Supabase** — Auth (email/password) + Postgres (RLS)
- **Krava** — `@kravalabs/api-client` for user provisioning + encrypted chat
- Charts via **Recharts**

## How Krava is used

- `src/lib/krava.ts` — `createKravaPlatformClient({ appKey })` →
  `users.getOrCreate(supabaseUserId)` maps each Supabase user to an encrypted
  Krava `userToken`, then streams the platform chat endpoint.
- `src/app/api/advisor/route.ts` — auth → finance context → Krava stream (SSE),
  piped to the client. Verified with `npx @kravalabs/api-client doctor` ✓.

## Run locally

```bash
pnpm install
cp .env.example .env.local   # fill in Supabase + Krava values

pnpm migrate                 # create tables + RLS policies
pnpm seed                    # create & seed the demo account
pnpm dev                     # http://localhost:3000
```

Then open the app and click **Try the live demo** (or sign up). New accounts can
load the same sample portfolio from the empty-state button.

- `pnpm migrate` — apply `scripts/schema.sql`
- `pnpm seed` — create/confirm `DEMO_EMAIL` and insert the sample portfolio
- `node scripts/e2e.mjs` — Playwright smoke test (login → dashboard → advisor)

## Deploy (Vercel)

Set these env vars in the Vercel project (runtime needs no DB connection — data
goes over Supabase HTTPS):

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
KRAVA_APP_KEY
KRAVA_BASE_URL=https://krava.io
DEMO_EMAIL
DEMO_PASSWORD
```

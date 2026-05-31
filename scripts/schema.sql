-- Vault — privacy-first financial hub. Schema + RLS.
-- All rows are scoped to a Supabase auth user via user_id = auth.uid().

create extension if not exists pgcrypto;

-- Lightweight profile (display name + income context for the advisor)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  monthly_income numeric default 0,
  created_at timestamptz not null default now()
);

-- Asset & liability accounts. net worth = sum(asset.balance) - sum(liability.balance)
create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  institution text,
  kind text not null default 'asset' check (kind in ('asset','liability')),
  type text not null,                 -- checking | savings | brokerage | retirement | credit_card | loan | mortgage | cash
  balance numeric not null default 0, -- always stored positive; kind decides sign for net worth
  apr numeric,                        -- for liabilities
  created_at timestamptz not null default now()
);

-- Transactions. amount: positive = inflow/income, negative = outflow/expense
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  account_id uuid references public.accounts(id) on delete set null,
  posted_at date not null,
  description text not null,
  category text not null default 'other',
  amount numeric not null,
  created_at timestamptz not null default now()
);

-- Investment holdings (positions inside brokerage/retirement accounts)
create table if not exists public.holdings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  account_id uuid references public.accounts(id) on delete set null,
  symbol text not null,
  name text,
  shares numeric not null default 0,
  price numeric not null default 0,
  cost_basis numeric not null default 0,
  created_at timestamptz not null default now()
);

-- Savings / payoff goals
create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  target_amount numeric not null default 0,
  current_amount numeric not null default 0,
  target_date date,
  created_at timestamptz not null default now()
);

create index if not exists idx_accounts_user on public.accounts(user_id);
create index if not exists idx_tx_user_date on public.transactions(user_id, posted_at desc);
create index if not exists idx_holdings_user on public.holdings(user_id);
create index if not exists idx_goals_user on public.goals(user_id);

-- Row Level Security: every table is private to its owner.
alter table public.profiles     enable row level security;
alter table public.accounts     enable row level security;
alter table public.transactions enable row level security;
alter table public.holdings     enable row level security;
alter table public.goals        enable row level security;

-- Plaid item link. access_token is per-user and kept private via RLS.
create table if not exists public.plaid_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  item_id text not null,
  access_token text not null,
  institution_name text,
  cursor text,
  created_at timestamptz not null default now()
);
create index if not exists idx_plaid_items_user on public.plaid_items(user_id);
alter table public.plaid_items enable row level security;
drop policy if exists owner_all on public.plaid_items;
create policy owner_all on public.plaid_items
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Advisor chat history. Stored as AES-256-GCM ciphertext only (encrypted by
-- the app before insert) — the database never holds plaintext messages.
create table if not exists public.advisor_chats (
  user_id uuid primary key references auth.users(id) on delete cascade,
  chat_id text,
  payload text not null,   -- base64(ciphertext || authTag)
  iv text not null,        -- base64(iv)
  updated_at timestamptz not null default now()
);
alter table public.advisor_chats enable row level security;
drop policy if exists owner_all on public.advisor_chats;
create policy owner_all on public.advisor_chats
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Long-term advisor memory across ALL chats: an encrypted list of durable
-- facts the advisor has learned about the user. Ciphertext only.
create table if not exists public.advisor_memories (
  user_id uuid primary key references auth.users(id) on delete cascade,
  payload text not null,
  iv text not null,
  updated_at timestamptz not null default now()
);
alter table public.advisor_memories enable row level security;
drop policy if exists owner_all on public.advisor_memories;
create policy owner_all on public.advisor_memories
  using (user_id = auth.uid()) with check (user_id = auth.uid());

do $$
declare t text;
begin
  foreach t in array array['profiles','accounts','transactions','holdings','goals'] loop
    execute format('drop policy if exists owner_all on public.%I', t);
    if t = 'profiles' then
      execute format($f$create policy owner_all on public.%I
        using (id = auth.uid()) with check (id = auth.uid())$f$, t);
    else
      execute format($f$create policy owner_all on public.%I
        using (user_id = auth.uid()) with check (user_id = auth.uid())$f$, t);
    end if;
  end loop;
end $$;

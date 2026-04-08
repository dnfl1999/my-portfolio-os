create table if not exists portfolio_snapshots (
  id uuid primary key default gen_random_uuid(),
  portfolio_key text not null unique,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists portfolio_snapshots_portfolio_key_idx
  on portfolio_snapshots (portfolio_key);

do $$
begin
  alter publication supabase_realtime add table portfolio_snapshots;
exception
  when duplicate_object then null;
end
$$;

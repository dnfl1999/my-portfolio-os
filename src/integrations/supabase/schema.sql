create table if not exists portfolio_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists portfolio_snapshots_user_id_idx
  on portfolio_snapshots (user_id);

alter table generation_runs
  add column backend text not null default 'codex',
  add column adapter_mode text,
  add column current_stage text,
  add column failed_stage text,
  add column failure_mode text,
  add column failure_message text,
  add column run_evidence_prefix text,
  add column trigger_run_handle_id text,
  add column executor_kind text,
  add column executor_run_id text,
  add column executor_run_url text,
  add column updated_at timestamptz not null default now(),
  add constraint generation_runs_adapter_mode_check
    check (adapter_mode is null or adapter_mode in ('mock', 'real')),
  add constraint generation_runs_executor_kind_check
    check (executor_kind is null or executor_kind in ('github-actions'));

create table generation_run_events (
  event_id text primary key,
  run_id uuid not null references generation_runs(id) on delete cascade,
  event_type text not null,
  stage text,
  from_state text,
  to_state text,
  data jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index generation_run_events_run_time_idx
  on generation_run_events (run_id, occurred_at, event_id);

create table run_evidence_objects (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  run_id uuid not null references generation_runs(id) on delete cascade,
  relative_path text not null,
  storage_key text not null,
  sha256 text not null,
  size_bytes bigint not null,
  content_type text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (run_id, relative_path),
  unique (storage_key)
);

insert into storage.buckets (id, name, public, file_size_limit)
values ('fusera-run-evidence', 'fusera-run-evidence', false, 52428800)
on conflict (id) do update set public = excluded.public;

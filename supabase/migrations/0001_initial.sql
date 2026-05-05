create table projects (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  product_name text not null,
  intake jsonb not null,
  status text not null default 'draft'
);

create table generation_runs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  created_at timestamptz not null default now(),
  status text not null default 'queued',
  latest_product_brief_ref text,
  latest_brand_profile_ref text,
  latest_page_plan_ref text,
  latest_section_graph_ref text,
  latest_theme_tokens_ref text,
  quality_score numeric
);

create table artifacts (
  artifact_id text primary key,
  project_id uuid not null references projects(id) on delete cascade,
  run_id uuid not null references generation_runs(id) on delete cascade,
  artifact_type text not null,
  schema_version text not null,
  status text not null,
  producer_stage text not null,
  input_refs jsonb not null default '[]'::jsonb,
  validation jsonb not null,
  payload jsonb not null
);

alter table generation_runs
  drop constraint if exists generation_runs_review_state_check;

alter table generation_runs
  add constraint generation_runs_review_state_check
    check (
      review_state in (
        'none',
        'validating',
        'qa_failed',
        'review_ready',
        'approved',
        'rejected',
        'needs_changes'
      )
    );

create table project_intent_events (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  run_id uuid references generation_runs(id) on delete set null,
  created_at timestamptz not null default now(),
  event_type text not null,
  metadata jsonb not null default '{}'::jsonb,
  constraint project_intent_events_event_type_check
    check (
      event_type in (
        'publish_ready_viewed',
        'export_clicked',
        'publish_confirmed',
        'qa_failed_reason',
        'review_approved',
        'review_rejected',
        'revision_requested',
        'returned_to_modify'
      )
    )
);

create index project_intent_events_project_created_idx
  on project_intent_events (project_id, created_at desc);

create index project_intent_events_run_type_idx
  on project_intent_events (run_id, event_type);

comment on table project_intent_events is
  'P0.5 commercial intent measurement events for landing-page review/export/publish behavior.';

comment on column project_intent_events.event_type is
  'Commercial validation event type, including publish_ready_viewed, export_clicked, publish_confirmed, qa_failed_reason, and review decisions.';

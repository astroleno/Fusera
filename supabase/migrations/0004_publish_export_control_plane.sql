create table publish_export_operations (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references projects(id) on delete cascade,
  run_id uuid not null references generation_runs(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  operation_type text not null,
  status text not null default 'requested',
  page_spec_ref text not null,
  qa_report_ref text not null,
  publish_version_ref text,
  preview_build_ref text not null,
  failure_code text,
  failure_reason text,
  external_target jsonb,
  external_result jsonb,
  constraint publish_export_operations_type_check
    check (operation_type in ('export', 'publish')),
  constraint publish_export_operations_status_check
    check (
      status in (
        'requested',
        'blocked',
        'ready',
        'external_pending',
        'external_succeeded',
        'external_failed',
        'cancelled'
      )
    ),
  constraint publish_export_operations_ready_refs_check
    check (
      status <> 'ready'
      or (
        length(page_spec_ref) > 0
        and length(qa_report_ref) > 0
        and length(preview_build_ref) > 0
      )
    )
);

create index publish_export_operations_project_created_idx
  on publish_export_operations (project_id, created_at desc);

create index publish_export_operations_run_type_idx
  on publish_export_operations (run_id, operation_type, created_at desc);

comment on table publish_export_operations is
  'Control-plane records for export/publish requests. Preview readiness alone does not mean an external export or publish happened.';

comment on column publish_export_operations.status is
  'Control-plane lifecycle: requested, blocked, ready, external_pending, external_succeeded, external_failed, cancelled.';

comment on column publish_export_operations.publish_version_ref is
  'Optional preview-scoped PublishVersion reference. Real export/publish readiness is owned by this control-plane table.';

comment on column generation_runs.export_state is
  'Legacy rollup only. New export/publish lifecycle transitions are recorded in publish_export_operations.';

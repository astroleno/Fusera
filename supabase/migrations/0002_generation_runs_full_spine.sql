alter table generation_runs
  add column latest_design_spec_ref text,
  add column latest_page_spec_ref text,
  add column latest_qa_report_ref text,
  add column latest_publish_version_ref text,
  add column review_state text not null default 'none',
  add column export_state text not null default 'none',
  add constraint generation_runs_review_state_check
    check (review_state in ('none', 'validating', 'qa_failed', 'review_ready', 'approved')),
  add constraint generation_runs_export_state_check
    check (export_state in ('none', 'export_ready', 'exported', 'published'));

comment on column generation_runs.status is
  'Generation lifecycle only: queued, running, completed, failed.';

comment on column generation_runs.review_state is
  'Review lifecycle: none, validating, qa_failed, review_ready, approved.';

comment on column generation_runs.export_state is
  'Export lifecycle: none, export_ready, exported, published.';

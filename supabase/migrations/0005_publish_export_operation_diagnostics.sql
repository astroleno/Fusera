alter table publish_export_operations
  add column diagnostics jsonb not null default '[]'::jsonb,
  add constraint publish_export_operations_diagnostics_array_check
    check (jsonb_typeof(diagnostics) = 'array');

comment on column publish_export_operations.diagnostics is
  'Machine-readable blocking diagnostics for control-plane readiness checks, including proof hard-gate failures.';

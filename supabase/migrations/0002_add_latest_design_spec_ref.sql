alter table generation_runs
add column if not exists latest_design_spec_ref text;

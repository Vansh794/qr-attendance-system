create table if not exists public.qr_scan_logs (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.sessions(id) on delete set null,
  raw_payload text not null,
  parsed_enrollment_number text,
  result_status text not null check (
    result_status in (
      'success',
      'duplicate',
      'expired',
      'closed',
      'invalid_session',
      'student_not_found',
      'error',
      'no_active_session',
      'unreadable'
    )
  ),
  attendance_record_id uuid references public.attendance_records(id) on delete set null,
  scan_source text not null check (scan_source in ('camera', 'image_upload', 'manual_entry')),
  camera_label text,
  device_info text,
  error_message text,
  created_at timestamptz default now()
);

create index if not exists idx_qr_scan_logs_session on public.qr_scan_logs(session_id);
create index if not exists idx_qr_scan_logs_created_at on public.qr_scan_logs(created_at);
create index if not exists idx_qr_scan_logs_enrollment on public.qr_scan_logs(parsed_enrollment_number);

alter table public.qr_scan_logs enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'qr_scan_logs'
      and policyname = 'Allow clients to insert qr scan logs'
  ) then
    create policy "Allow clients to insert qr scan logs"
      on public.qr_scan_logs
      for insert
      to anon, authenticated
      with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'qr_scan_logs'
      and policyname = 'Allow authenticated users to read qr scan logs'
  ) then
    create policy "Allow authenticated users to read qr scan logs"
      on public.qr_scan_logs
      for select
      to authenticated
      using (true);
  end if;
end
$$;

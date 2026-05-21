alter table if exists public.students
  alter column full_name drop not null;

create unique index if not exists idx_students_enrollment_unique
  on public.students(enrollment_number);

create unique index if not exists idx_attendance_student_session_unique
  on public.attendance_records(student_id, session_id);

alter table if exists public.qr_scan_logs
  drop constraint if exists qr_scan_logs_result_status_check;

alter table if exists public.qr_scan_logs
  add constraint qr_scan_logs_result_status_check
  check (
    result_status in (
      'received',
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
  );

create index if not exists idx_qr_scan_logs_status
  on public.qr_scan_logs(result_status);

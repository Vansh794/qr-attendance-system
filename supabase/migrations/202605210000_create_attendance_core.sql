create extension if not exists pgcrypto;

create table if not exists public.departments (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  code text not null unique,
  created_at timestamptz default now()
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique,
  department_id uuid references public.departments(id) on delete set null,
  credits integer default 3,
  created_at timestamptz default now()
);

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  enrollment_number text not null unique,
  full_name text,
  email text unique,
  phone text,
  department_id uuid references public.departments(id) on delete set null,
  semester integer check (semester between 1 and 10),
  batch_year integer,
  is_active boolean default true,
  qr_token text unique default gen_random_uuid()::text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses(id) on delete set null,
  faculty_name text,
  session_date date not null default current_date,
  start_time time not null,
  end_time time,
  room text,
  qr_secret text not null default gen_random_uuid()::text,
  qr_expires_at timestamptz,
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.attendance_records (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  session_id uuid not null references public.sessions(id) on delete cascade,
  marked_at timestamptz default now(),
  method text not null default 'qr_scan' check (
    method in ('qr_scan', 'manual_enrollment', 'manual_name')
  ),
  marked_by text not null default 'system',
  ip_address inet,
  device_info text,
  status text not null default 'present' check (
    status in ('present', 'late', 'absent')
  ),
  notes text,
  unique(student_id, session_id)
);

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  full_name text not null,
  role text not null default 'faculty' check (
    role in ('super_admin', 'admin', 'faculty')
  ),
  is_active boolean default true,
  created_at timestamptz default now()
);

create index if not exists idx_students_enrollment on public.students(enrollment_number);
create index if not exists idx_students_qr_token on public.students(qr_token);
create index if not exists idx_attendance_session on public.attendance_records(session_id);
create index if not exists idx_attendance_student on public.attendance_records(student_id);
create index if not exists idx_attendance_marked_at on public.attendance_records(marked_at);
create index if not exists idx_sessions_date on public.sessions(session_date);
create index if not exists idx_sessions_course on public.sessions(course_id);

alter table public.departments enable row level security;
alter table public.courses enable row level security;
alter table public.students enable row level security;
alter table public.sessions enable row level security;
alter table public.attendance_records enable row level security;
alter table public.admin_users enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and policyname = 'Allow clients to read departments'
      and tablename = 'departments'
  ) then
    create policy "Allow clients to read departments"
      on public.departments
      for select
      to anon, authenticated
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and policyname = 'Allow clients to read courses'
      and tablename = 'courses'
  ) then
    create policy "Allow clients to read courses"
      on public.courses
      for select
      to anon, authenticated
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and policyname = 'Allow clients to manage scanned students'
      and tablename = 'students'
  ) then
    create policy "Allow clients to manage scanned students"
      on public.students
      for all
      to anon, authenticated
      using (true)
      with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and policyname = 'Allow clients to manage sessions'
      and tablename = 'sessions'
  ) then
    create policy "Allow clients to manage sessions"
      on public.sessions
      for all
      to anon, authenticated
      using (true)
      with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and policyname = 'Allow clients to manage attendance records'
      and tablename = 'attendance_records'
  ) then
    create policy "Allow clients to manage attendance records"
      on public.attendance_records
      for all
      to anon, authenticated
      using (true)
      with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and policyname = 'Allow clients to read admin users'
      and tablename = 'admin_users'
  ) then
    create policy "Allow clients to read admin users"
      on public.admin_users
      for select
      to authenticated
      using (true);
  end if;
end
$$;

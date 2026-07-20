-- Бионит В Деле
-- Полная схема Supabase: данные, триггеры, RLS и RPC для Next.js-приложения.
-- Запуск: Supabase SQL Editor, `supabase db reset` или `supabase db push`.

begin;

create extension if not exists pgcrypto with schema extensions;

create type public.user_role as enum ('employee', 'mentor', 'manager', 'hr', 'admin');
create type public.entity_status as enum ('active', 'inactive', 'archived');
create type public.progress_status as enum ('not_started', 'in_progress', 'completed', 'overdue');
create type public.learning_status as enum ('not_started', 'in_progress', 'passed', 'failed');
create type public.order_status as enum ('new', 'approved', 'assembling', 'ready', 'issued', 'cancelled');
create type public.question_status as enum ('new', 'answered', 'closed');
create type public.badge_kind as enum ('first-step', 'gmp', 'team', 'mentor', 'anniversary', 'safety', 'streak', 'leader');
create type public.course_cover_kind as enum ('quality', 'safety', 'product', 'leadership');
create type public.product_kind as enum ('polo', 'sweatshirt', 'thermos', 'tote', 'notebook', 'pins');

-- -----------------------------------------------------------------------------
-- Организация и сотрудники
-- -----------------------------------------------------------------------------

create table public.companies (
  id uuid primary key default extensions.gen_random_uuid(),
  name text not null,
  legal_name text,
  description text,
  founded_year integer check (founded_year between 1800 and 2200),
  employee_count_hint integer not null default 0 check (employee_count_hint >= 0),
  status public.entity_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.departments (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  code text not null,
  status public.entity_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, code),
  unique (company_id, name)
);

create table public.profiles (
  id uuid primary key default extensions.gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete set null,
  company_id uuid not null references public.companies(id) on delete restrict,
  department_id uuid references public.departments(id) on delete set null,
  employee_number text not null unique,
  phone text,
  first_name text not null,
  last_name text not null,
  position text not null default 'Сотрудник',
  role public.user_role not null default 'employee',
  status public.entity_status not null default 'active',
  hired_at date not null default current_date,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (btrim(employee_number) <> ''),
  check (btrim(first_name) <> ''),
  check (btrim(last_name) <> '')
);

create unique index profiles_phone_unique on public.profiles(phone) where phone is not null;
create index profiles_company_idx on public.profiles(company_id, status);
create index profiles_department_idx on public.profiles(department_id, status);
create index profiles_auth_user_idx on public.profiles(auth_user_id);

create table public.wallets (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  balance integer not null default 0 check (balance >= 0),
  updated_at timestamptz not null default now()
);

create table public.bionic_transactions (
  id uuid primary key default extensions.gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  amount integer not null check (amount <> 0),
  reason_code text not null,
  description text not null,
  source_type text,
  source_id uuid,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index bionic_transactions_profile_created_idx
  on public.bionic_transactions(profile_id, created_at desc);
create unique index bionic_transactions_unique_source
  on public.bionic_transactions(profile_id, source_type, source_id, reason_code)
  where source_id is not null;

-- -----------------------------------------------------------------------------
-- Онбординг и база знаний
-- -----------------------------------------------------------------------------

create table public.onboarding_templates (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  title text not null,
  description text not null,
  duration_days integer not null default 30 check (duration_days between 1 and 365),
  is_default boolean not null default false,
  status public.entity_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index onboarding_one_default_template_idx
  on public.onboarding_templates(company_id)
  where is_default and status = 'active';

create table public.onboarding_stages (
  id uuid primary key default extensions.gen_random_uuid(),
  template_id uuid not null references public.onboarding_templates(id) on delete cascade,
  title text not null,
  description text not null,
  sort_order integer not null,
  day_from integer not null default 0 check (day_from >= 0),
  day_to integer not null default 0 check (day_to >= day_from),
  unique (template_id, sort_order)
);

create table public.onboarding_tasks (
  id uuid primary key default extensions.gen_random_uuid(),
  stage_id uuid not null references public.onboarding_stages(id) on delete cascade,
  title text not null,
  description text not null,
  points integer not null default 0 check (points >= 0),
  due_offset_days integer not null default 0 check (due_offset_days >= 0),
  required boolean not null default true,
  sort_order integer not null,
  unique (stage_id, sort_order)
);

create table public.onboarding_assignments (
  id uuid primary key default extensions.gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  template_id uuid not null references public.onboarding_templates(id) on delete restrict,
  mentor_id uuid references public.profiles(id) on delete set null,
  start_date date not null default current_date,
  due_date date not null,
  status public.progress_status not null default 'in_progress',
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (profile_id, template_id, start_date)
);

create index onboarding_assignments_profile_idx
  on public.onboarding_assignments(profile_id, created_at desc);
create index onboarding_assignments_mentor_idx
  on public.onboarding_assignments(mentor_id, status);

create table public.onboarding_task_progress (
  id uuid primary key default extensions.gen_random_uuid(),
  assignment_id uuid not null references public.onboarding_assignments(id) on delete cascade,
  task_id uuid not null references public.onboarding_tasks(id) on delete cascade,
  status public.progress_status not null default 'not_started',
  due_date date,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (assignment_id, task_id)
);

create index onboarding_progress_assignment_idx
  on public.onboarding_task_progress(assignment_id, status);

create table public.knowledge_articles (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  title text not null,
  summary text not null,
  body text not null,
  category text not null,
  read_minutes integer not null default 5 check (read_minutes between 1 and 240),
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.onboarding_questions (
  id uuid primary key default extensions.gen_random_uuid(),
  assignment_id uuid not null references public.onboarding_assignments(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  question text not null check (char_length(btrim(question)) >= 8),
  answer text,
  status public.question_status not null default 'new',
  answered_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  answered_at timestamptz
);

create index onboarding_questions_assignment_idx
  on public.onboarding_questions(assignment_id, created_at desc);

-- -----------------------------------------------------------------------------
-- Обучение и тестирование
-- -----------------------------------------------------------------------------

create table public.learning_classes (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  title text not null,
  slug text not null,
  description text not null,
  long_description text not null,
  category text not null,
  duration_minutes integer not null default 30 check (duration_minutes > 0),
  reward integer not null default 0 check (reward >= 0),
  pass_threshold integer not null default 90 check (pass_threshold between 1 and 100),
  max_attempts integer not null default 3 check (max_attempts between 1 and 3),
  cover_kind public.course_cover_kind not null,
  sort_order integer not null default 0,
  status public.entity_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, slug)
);

create table public.learning_modules (
  id uuid primary key default extensions.gen_random_uuid(),
  class_id uuid not null references public.learning_classes(id) on delete cascade,
  title text not null,
  content text not null,
  duration_minutes integer not null default 5 check (duration_minutes > 0),
  sort_order integer not null,
  unique (class_id, sort_order)
);

create table public.learning_questions (
  id uuid primary key default extensions.gen_random_uuid(),
  class_id uuid not null references public.learning_classes(id) on delete cascade,
  prompt text not null,
  sort_order integer not null,
  unique (class_id, sort_order)
);

create table public.learning_options (
  id uuid primary key default extensions.gen_random_uuid(),
  question_id uuid not null references public.learning_questions(id) on delete cascade,
  label text not null,
  is_correct boolean not null default false,
  sort_order integer not null,
  unique (question_id, sort_order)
);

create unique index learning_one_correct_option_idx
  on public.learning_options(question_id)
  where is_correct;

create table public.learning_enrollments (
  id uuid primary key default extensions.gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  class_id uuid not null references public.learning_classes(id) on delete cascade,
  status public.learning_status not null default 'not_started',
  progress_percent integer not null default 0 check (progress_percent between 0 and 100),
  best_score integer check (best_score between 0 and 100),
  attempts_used integer not null default 0 check (attempts_used between 0 and 3),
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (profile_id, class_id)
);

create table public.learning_module_progress (
  id uuid primary key default extensions.gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  module_id uuid not null references public.learning_modules(id) on delete cascade,
  completed_at timestamptz not null default now(),
  unique (profile_id, module_id)
);

create table public.learning_attempts (
  id uuid primary key default extensions.gen_random_uuid(),
  enrollment_id uuid not null references public.learning_enrollments(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  class_id uuid not null references public.learning_classes(id) on delete cascade,
  score integer not null check (score between 0 and 100),
  passed boolean not null,
  attempt_number integer not null check (attempt_number between 1 and 3),
  created_at timestamptz not null default now(),
  unique (enrollment_id, attempt_number)
);

create table public.learning_attempt_answers (
  id uuid primary key default extensions.gen_random_uuid(),
  attempt_id uuid not null references public.learning_attempts(id) on delete cascade,
  question_id uuid not null references public.learning_questions(id) on delete cascade,
  selected_option_id uuid not null references public.learning_options(id) on delete restrict,
  is_correct boolean not null,
  unique (attempt_id, question_id)
);

-- -----------------------------------------------------------------------------
-- Бейджи, достижения и рейтинг
-- -----------------------------------------------------------------------------

create table public.badges (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  code text not null,
  title text not null,
  description text not null,
  kind public.badge_kind not null,
  reward integer not null default 0 check (reward >= 0),
  target_value integer not null default 1 check (target_value > 0),
  sort_order integer not null default 0,
  status public.entity_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, code)
);

create table public.profile_badges (
  id uuid primary key default extensions.gen_random_uuid(),
  badge_id uuid not null references public.badges(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  earned_at timestamptz not null default now(),
  reward_granted boolean not null default false,
  unique (badge_id, profile_id)
);

create table public.profile_badge_progress (
  id uuid primary key default extensions.gen_random_uuid(),
  badge_id uuid not null references public.badges(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  current_value integer not null default 0 check (current_value >= 0),
  updated_at timestamptz not null default now(),
  unique (badge_id, profile_id)
);

create table public.achievement_stories (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  year integer not null check (year between 1800 and 2200),
  title text not null,
  description text not null,
  accent text not null default 'light' check (accent in ('red', 'dark', 'light')),
  metric text,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Магазин
-- -----------------------------------------------------------------------------

create table public.shop_products (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  title text not null,
  description text not null,
  price integer not null check (price > 0),
  stock integer not null default 0 check (stock >= 0),
  kind public.product_kind not null,
  featured boolean not null default false,
  sort_order integer not null default 0,
  status public.entity_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.shop_product_variants (
  id uuid primary key default extensions.gen_random_uuid(),
  product_id uuid not null references public.shop_products(id) on delete cascade,
  title text not null,
  stock integer not null default 0 check (stock >= 0),
  sort_order integer not null default 0,
  unique (product_id, title)
);

create sequence public.shop_order_number_seq start 1000;

create table public.shop_orders (
  id uuid primary key default extensions.gen_random_uuid(),
  order_number text not null unique,
  profile_id uuid not null references public.profiles(id) on delete restrict,
  total integer not null default 0 check (total >= 0),
  status public.order_status not null default 'new',
  processed_by uuid references public.profiles(id) on delete set null,
  issued_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index shop_orders_profile_created_idx on public.shop_orders(profile_id, created_at desc);
create index shop_orders_status_idx on public.shop_orders(status, created_at desc);

create table public.shop_order_items (
  id uuid primary key default extensions.gen_random_uuid(),
  order_id uuid not null references public.shop_orders(id) on delete cascade,
  product_id uuid not null references public.shop_products(id) on delete restrict,
  variant_id uuid references public.shop_product_variants(id) on delete restrict,
  product_title text not null,
  variant_title text,
  quantity integer not null check (quantity > 0),
  unit_price integer not null check (unit_price > 0),
  total integer generated always as (quantity * unit_price) stored
);

-- -----------------------------------------------------------------------------
-- Технические триггеры
-- -----------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger companies_updated_at before update on public.companies
for each row execute function public.set_updated_at();
create trigger departments_updated_at before update on public.departments
for each row execute function public.set_updated_at();
create trigger profiles_updated_at before update on public.profiles
for each row execute function public.set_updated_at();
create trigger wallets_updated_at before update on public.wallets
for each row execute function public.set_updated_at();
create trigger onboarding_templates_updated_at before update on public.onboarding_templates
for each row execute function public.set_updated_at();
create trigger onboarding_assignments_updated_at before update on public.onboarding_assignments
for each row execute function public.set_updated_at();
create trigger onboarding_progress_updated_at before update on public.onboarding_task_progress
for each row execute function public.set_updated_at();
create trigger knowledge_articles_updated_at before update on public.knowledge_articles
for each row execute function public.set_updated_at();
create trigger learning_classes_updated_at before update on public.learning_classes
for each row execute function public.set_updated_at();
create trigger learning_enrollments_updated_at before update on public.learning_enrollments
for each row execute function public.set_updated_at();
create trigger badges_updated_at before update on public.badges
for each row execute function public.set_updated_at();
create trigger badge_progress_updated_at before update on public.profile_badge_progress
for each row execute function public.set_updated_at();
create trigger shop_products_updated_at before update on public.shop_products
for each row execute function public.set_updated_at();
create trigger shop_orders_updated_at before update on public.shop_orders
for each row execute function public.set_updated_at();

create or replace function public.set_shop_order_number()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.order_number is null or btrim(new.order_number) = '' then
    new.order_number := 'BD-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.shop_order_number_seq')::text, 5, '0');
  end if;
  return new;
end;
$$;

create trigger shop_order_number_before_insert
before insert on public.shop_orders
for each row execute function public.set_shop_order_number();

-- -----------------------------------------------------------------------------
-- Связка Supabase Auth с бизнес-профилем
-- -----------------------------------------------------------------------------

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
declare
  v_profile_id uuid;
  v_requested_profile_id uuid;
  v_company_id uuid;
  v_metadata_company_id uuid;
  v_department_id uuid;
  v_employee_number text;
  v_role public.user_role;
begin
  begin
    v_requested_profile_id := nullif(new.raw_user_meta_data ->> 'profile_id', '')::uuid;
  exception when invalid_text_representation then
    v_requested_profile_id := null;
  end;

  begin
    v_metadata_company_id := nullif(new.raw_user_meta_data ->> 'company_id', '')::uuid;
  exception when invalid_text_representation then
    v_metadata_company_id := null;
  end;

  begin
    v_department_id := nullif(new.raw_user_meta_data ->> 'department_id', '')::uuid;
  exception when invalid_text_representation then
    v_department_id := null;
  end;

  v_employee_number := lower(btrim(coalesce(
    nullif(new.raw_user_meta_data ->> 'employee_number', ''),
    split_part(coalesce(new.email, new.phone, new.id::text), '@', 1)
  )));

  begin
    v_role := coalesce(nullif(new.raw_user_meta_data ->> 'role', ''), 'employee')::public.user_role;
  exception when invalid_text_representation then
    v_role := 'employee';
  end;

  if v_department_id is not null then
    select d.company_id into v_company_id
    from public.departments d
    where d.id = v_department_id and d.status = 'active';
  end if;

  if v_company_id is null then
    begin
      v_company_id := nullif(new.raw_user_meta_data ->> 'company_id', '')::uuid;
    exception when invalid_text_representation then
      v_company_id := null;
    end;
  end if;

  if v_company_id is null then
    select c.id into v_company_id
    from public.companies c
    where c.status = 'active'
    order by c.created_at
    limit 1;
  end if;

  if v_company_id is null then
    raise exception 'Сначала создайте компанию в public.companies.';
  end if;

  select p.id into v_profile_id
  from public.profiles p
  where (v_requested_profile_id is not null and p.id = v_requested_profile_id)
     or p.employee_number = v_employee_number
     or (new.phone is not null and p.phone = new.phone)
  order by case when p.id = v_requested_profile_id then 0 else 1 end
  limit 1;

  if v_profile_id is null then
    v_profile_id := coalesce(v_requested_profile_id, extensions.gen_random_uuid());

    insert into public.profiles (
      id, auth_user_id, company_id, department_id, employee_number, phone,
      first_name, last_name, position, role, hired_at
    ) values (
      v_profile_id,
      new.id,
      v_company_id,
      v_department_id,
      v_employee_number,
      new.phone,
      coalesce(nullif(btrim(new.raw_user_meta_data ->> 'first_name'), ''), 'Новый'),
      coalesce(nullif(btrim(new.raw_user_meta_data ->> 'last_name'), ''), 'сотрудник'),
      coalesce(nullif(btrim(new.raw_user_meta_data ->> 'position'), ''), 'Сотрудник'),
      v_role,
      coalesce(nullif(new.raw_user_meta_data ->> 'hired_at', '')::date, current_date)
    );
  else
    update public.profiles
    set auth_user_id = new.id,
        company_id = coalesce(v_company_id, company_id),
        department_id = coalesce(v_department_id, department_id),
        employee_number = v_employee_number,
        phone = coalesce(new.phone, phone),
        first_name = coalesce(nullif(btrim(new.raw_user_meta_data ->> 'first_name'), ''), first_name),
        last_name = coalesce(nullif(btrim(new.raw_user_meta_data ->> 'last_name'), ''), last_name),
        position = coalesce(nullif(btrim(new.raw_user_meta_data ->> 'position'), ''), position),
        role = v_role,
        status = 'active',
        updated_at = now()
    where id = v_profile_id;
  end if;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert or update of raw_user_meta_data, phone, email on auth.users
  for each row execute function public.handle_new_auth_user();

-- -----------------------------------------------------------------------------
-- Автоматическая подготовка программ сотрудника
-- -----------------------------------------------------------------------------

create or replace function public.bootstrap_profile_programs()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_template_id uuid;
  v_duration integer;
  v_assignment_id uuid;
  v_mentor_id uuid;
begin
  insert into public.wallets(profile_id, balance)
  values (new.id, 0)
  on conflict (profile_id) do nothing;

  insert into public.learning_enrollments(profile_id, class_id)
  select new.id, lc.id
  from public.learning_classes lc
  where lc.company_id = new.company_id and lc.status = 'active'
  on conflict (profile_id, class_id) do nothing;

  insert into public.profile_badge_progress(profile_id, badge_id, current_value)
  select new.id, b.id, 0
  from public.badges b
  where b.company_id = new.company_id and b.status = 'active'
  on conflict (profile_id, badge_id) do nothing;

  select ot.id, ot.duration_days
    into v_template_id, v_duration
  from public.onboarding_templates ot
  where ot.company_id = new.company_id
    and ot.status = 'active'
  order by ot.is_default desc, ot.created_at
  limit 1;

  if v_template_id is not null then
    select p.id into v_mentor_id
    from public.profiles p
    where p.company_id = new.company_id
      and p.id <> new.id
      and p.status = 'active'
      and p.role in ('mentor', 'manager', 'hr', 'admin')
    order by
      case when p.department_id = new.department_id then 0 else 1 end,
      case p.role when 'mentor' then 0 when 'manager' then 1 when 'hr' then 2 else 3 end,
      p.created_at
    limit 1;

    insert into public.onboarding_assignments(
      profile_id, template_id, mentor_id, start_date, due_date, status
    ) values (
      new.id, v_template_id, v_mentor_id, new.hired_at,
      new.hired_at + v_duration, 'in_progress'
    )
    on conflict (profile_id, template_id, start_date) do update
      set mentor_id = coalesce(public.onboarding_assignments.mentor_id, excluded.mentor_id)
    returning id into v_assignment_id;

    insert into public.onboarding_task_progress(assignment_id, task_id, status, due_date)
    select v_assignment_id, t.id, 'not_started', new.hired_at + t.due_offset_days
    from public.onboarding_tasks t
    join public.onboarding_stages s on s.id = t.stage_id
    where s.template_id = v_template_id
    on conflict (assignment_id, task_id) do nothing;
  end if;

  return new;
end;
$$;

create trigger profiles_bootstrap_after_insert
  after insert on public.profiles
  for each row execute function public.bootstrap_profile_programs();

create or replace function public.enroll_profiles_in_new_class()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'active' then
    insert into public.learning_enrollments(profile_id, class_id)
    select p.id, new.id
    from public.profiles p
    where p.company_id = new.company_id and p.status = 'active'
    on conflict (profile_id, class_id) do nothing;
  end if;
  return new;
end;
$$;

create trigger learning_class_enroll_after_insert
  after insert on public.learning_classes
  for each row execute function public.enroll_profiles_in_new_class();

create or replace function public.initialize_new_badge_progress()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'active' then
    insert into public.profile_badge_progress(profile_id, badge_id, current_value)
    select p.id, new.id, 0
    from public.profiles p
    where p.company_id = new.company_id and p.status = 'active'
    on conflict (profile_id, badge_id) do nothing;
  end if;
  return new;
end;
$$;

create trigger badge_progress_after_insert
  after insert on public.badges
  for each row execute function public.initialize_new_badge_progress();

-- -----------------------------------------------------------------------------
-- Контекст текущего пользователя
-- -----------------------------------------------------------------------------

create or replace function public.current_profile_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select p.id
  from public.profiles p
  where p.auth_user_id = auth.uid() or p.id = auth.uid()
  order by case when p.auth_user_id = auth.uid() then 0 else 1 end
  limit 1;
$$;

create or replace function public.current_company_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select p.company_id
  from public.profiles p
  where p.id = public.current_profile_id();
$$;

create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select p.role
  from public.profiles p
  where p.id = public.current_profile_id();
$$;

create or replace function public.is_hr_or_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_user_role() in ('hr', 'admin'), false);
$$;

create or replace function public.assert_hr_or_admin()
returns void
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_hr_or_admin() then
    raise exception 'Недостаточно прав для выполнения операции.' using errcode = '42501';
  end if;
end;
$$;

-- -----------------------------------------------------------------------------
-- Баланс и бейджи
-- -----------------------------------------------------------------------------

create or replace function public.change_bionic_balance(
  p_profile_id uuid,
  p_delta integer,
  p_reason_code text,
  p_description text,
  p_source_type text default null,
  p_source_id uuid default null,
  p_created_by uuid default null
)
returns integer
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_balance integer;
begin
  if p_delta = 0 then
    return 0;
  end if;

  insert into public.wallets(profile_id, balance)
  values (p_profile_id, 0)
  on conflict (profile_id) do nothing;

  select w.balance into v_balance
  from public.wallets w
  where w.profile_id = p_profile_id
  for update;

  if p_source_id is not null and exists (
    select 1
    from public.bionic_transactions bt
    where bt.profile_id = p_profile_id
      and bt.source_type is not distinct from p_source_type
      and bt.source_id = p_source_id
      and bt.reason_code = p_reason_code
  ) then
    return 0;
  end if;

  if v_balance + p_delta < 0 then
    raise exception 'Недостаточно Биоников.';
  end if;

  update public.wallets
  set balance = balance + p_delta,
      updated_at = now()
  where profile_id = p_profile_id;

  insert into public.bionic_transactions(
    profile_id, amount, reason_code, description, source_type, source_id, created_by
  ) values (
    p_profile_id, p_delta, p_reason_code, p_description,
    p_source_type, p_source_id, p_created_by
  );

  return abs(p_delta);
end;
$$;

create or replace function public.grant_badge(p_profile_id uuid, p_badge_code text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_badge public.badges%rowtype;
  v_inserted boolean := false;
  v_row_count integer := 0;
begin
  select b.* into v_badge
  from public.badges b
  join public.profiles p on p.company_id = b.company_id
  where p.id = p_profile_id
    and b.code = p_badge_code
    and b.status = 'active'
  limit 1;

  if v_badge.id is null then
    return false;
  end if;

  insert into public.profile_badges(badge_id, profile_id, reward_granted)
  values (v_badge.id, p_profile_id, false)
  on conflict (badge_id, profile_id) do nothing;

  get diagnostics v_row_count = row_count;
  v_inserted := v_row_count > 0;

  insert into public.profile_badge_progress(badge_id, profile_id, current_value)
  values (v_badge.id, p_profile_id, v_badge.target_value)
  on conflict (badge_id, profile_id) do update
    set current_value = greatest(public.profile_badge_progress.current_value, v_badge.target_value),
        updated_at = now();

  if v_inserted and v_badge.reward > 0 then
    perform public.change_bionic_balance(
      p_profile_id,
      v_badge.reward,
      'badge_reward',
      'Бейдж «' || v_badge.title || '»',
      'badge',
      v_badge.id,
      null
    );

    update public.profile_badges
    set reward_granted = true
    where badge_id = v_badge.id and profile_id = p_profile_id;
  end if;

  return v_inserted;
end;
$$;

-- -----------------------------------------------------------------------------
-- RPC: профиль и главная
-- -----------------------------------------------------------------------------

create or replace function public.get_profile_summary()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'id', p.id,
    'firstName', p.first_name,
    'lastName', p.last_name,
    'fullName', p.first_name || ' ' || p.last_name,
    'position', p.position,
    'departmentName', coalesce(d.name, 'Без отдела'),
    'role', p.role,
    'avatarUrl', p.avatar_url,
    'hiredAt', p.hired_at,
    'balance', coalesce(w.balance, 0)
  )
  from public.profiles p
  left join public.departments d on d.id = p.department_id
  left join public.wallets w on w.profile_id = p.id
  where p.id = public.current_profile_id()
    and p.status = 'active';
$$;

create or replace function public.get_learning_catalog()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(jsonb_agg(
    jsonb_build_object(
      'id', lc.id,
      'title', lc.title,
      'description', lc.description,
      'category', lc.category,
      'durationMinutes', lc.duration_minutes,
      'reward', lc.reward,
      'passThreshold', lc.pass_threshold,
      'maxAttempts', lc.max_attempts,
      'attemptsUsed', coalesce(le.attempts_used, 0),
      'progressPercent', coalesce(le.progress_percent, 0),
      'status', coalesce(le.status, 'not_started'::public.learning_status),
      'modulesCount', (select count(*) from public.learning_modules lm where lm.class_id = lc.id),
      'coverKind', lc.cover_kind
    ) order by lc.sort_order, lc.created_at
  ), '[]'::jsonb)
  from public.learning_classes lc
  left join public.learning_enrollments le
    on le.class_id = lc.id and le.profile_id = public.current_profile_id()
  where lc.company_id = public.current_company_id()
    and lc.status = 'active';
$$;

create or replace function public.get_dashboard()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_profile_id uuid := public.current_profile_id();
  v_profile jsonb;
  v_onboarding_percent integer := 0;
  v_learning_percent integer := 0;
  v_rank integer := 1;
  v_badge_count integer := 0;
  v_weekly_earned integer := 0;
  v_active_onboarding jsonb;
  v_recommended jsonb;
  v_latest_badge jsonb;
begin
  v_profile := public.get_profile_summary();
  if v_profile is null then
    raise exception 'Профиль сотрудника не найден.' using errcode = 'P0002';
  end if;

  select coalesce(round(100.0 * count(*) filter (where tp.status = 'completed') / nullif(count(*), 0)), 0)::integer
    into v_onboarding_percent
  from public.onboarding_assignments oa
  join public.onboarding_task_progress tp on tp.assignment_id = oa.id
  where oa.id = (
    select x.id from public.onboarding_assignments x
    where x.profile_id = v_profile_id
    order by (x.status = 'completed'), x.created_at desc
    limit 1
  );

  select coalesce(round(avg(le.progress_percent)), 0)::integer
    into v_learning_percent
  from public.learning_enrollments le
  join public.learning_classes lc on lc.id = le.class_id and lc.status = 'active'
  where le.profile_id = v_profile_id;

  with scores as (
    select p.id,
           coalesce(sum(bt.amount) filter (
             where bt.amount > 0
               and bt.created_at >= date_trunc('month', now())
           ), 0) as score
    from public.profiles p
    left join public.bionic_transactions bt on bt.profile_id = p.id
    where p.company_id = public.current_company_id() and p.status = 'active'
    group by p.id
  ), ranked as (
    select id, dense_rank() over (order by score desc, id) as rank
    from scores
  )
  select rank::integer into v_rank from ranked where id = v_profile_id;

  select count(*)::integer into v_badge_count
  from public.profile_badges pb
  where pb.profile_id = v_profile_id;

  select coalesce(sum(bt.amount) filter (where bt.amount > 0), 0)::integer
    into v_weekly_earned
  from public.bionic_transactions bt
  where bt.profile_id = v_profile_id
    and bt.created_at >= now() - interval '7 days';

  select jsonb_build_object(
    'assignmentId', oa.id,
    'title', ot.title,
    'currentStage', coalesce((
      select s.title
      from public.onboarding_stages s
      join public.onboarding_tasks t on t.stage_id = s.id
      join public.onboarding_task_progress tp on tp.task_id = t.id and tp.assignment_id = oa.id
      group by s.id, s.title, s.sort_order
      having count(*) filter (where tp.status <> 'completed') > 0
      order by s.sort_order
      limit 1
    ), 'Завершено'),
    'completedTasks', (select count(*) from public.onboarding_task_progress tp where tp.assignment_id = oa.id and tp.status = 'completed'),
    'totalTasks', (select count(*) from public.onboarding_task_progress tp where tp.assignment_id = oa.id),
    'dueDate', oa.due_date
  ) into v_active_onboarding
  from public.onboarding_assignments oa
  join public.onboarding_templates ot on ot.id = oa.template_id
  where oa.profile_id = v_profile_id and oa.status <> 'completed'
  order by oa.created_at desc
  limit 1;

  select jsonb_build_object(
    'id', lc.id,
    'title', lc.title,
    'description', lc.description,
    'category', lc.category,
    'durationMinutes', lc.duration_minutes,
    'reward', lc.reward,
    'passThreshold', lc.pass_threshold,
    'maxAttempts', lc.max_attempts,
    'attemptsUsed', coalesce(le.attempts_used, 0),
    'progressPercent', coalesce(le.progress_percent, 0),
    'status', coalesce(le.status, 'not_started'::public.learning_status),
    'modulesCount', (select count(*) from public.learning_modules lm where lm.class_id = lc.id),
    'coverKind', lc.cover_kind
  ) into v_recommended
  from public.learning_classes lc
  left join public.learning_enrollments le
    on le.class_id = lc.id and le.profile_id = v_profile_id
  where lc.company_id = public.current_company_id()
    and lc.status = 'active'
    and coalesce(le.status, 'not_started'::public.learning_status) <> 'passed'
  order by
    case coalesce(le.status, 'not_started'::public.learning_status)
      when 'in_progress' then 0 when 'not_started' then 1 else 2 end,
    lc.sort_order
  limit 1;

  select jsonb_build_object(
    'id', b.id,
    'code', b.code,
    'title', b.title,
    'description', b.description,
    'kind', b.kind,
    'reward', b.reward,
    'earnedAt', pb.earned_at,
    'progressPercent', 100,
    'locked', false
  ) into v_latest_badge
  from public.profile_badges pb
  join public.badges b on b.id = pb.badge_id
  where pb.profile_id = v_profile_id
  order by pb.earned_at desc
  limit 1;

  return jsonb_build_object(
    'profile', v_profile,
    'stats', jsonb_build_object(
      'onboardingPercent', v_onboarding_percent,
      'learningPercent', v_learning_percent,
      'companyRank', coalesce(v_rank, 1),
      'badgeCount', v_badge_count
    ),
    'activeOnboarding', v_active_onboarding,
    'recommendedClass', v_recommended,
    'latestBadge', v_latest_badge,
    'weeklyEarned', v_weekly_earned
  );
end;
$$;

-- -----------------------------------------------------------------------------
-- RPC: онбординг
-- -----------------------------------------------------------------------------

create or replace function public.get_onboarding()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_profile_id uuid := public.current_profile_id();
  v_assignment public.onboarding_assignments%rowtype;
  v_result jsonb;
begin
  select oa.* into v_assignment
  from public.onboarding_assignments oa
  where oa.profile_id = v_profile_id
  order by (oa.status = 'completed'), oa.created_at desc
  limit 1;

  if v_assignment.id is null then
    raise exception 'Онбординг ещё не назначен.' using errcode = 'P0002';
  end if;

  select jsonb_build_object(
    'assignmentId', oa.id,
    'title', ot.title,
    'mentorName', coalesce(mp.first_name || ' ' || mp.last_name, 'HR-команда Бионит'),
    'mentorPosition', coalesce(mp.position, 'Служба персонала'),
    'startDate', oa.start_date,
    'dueDate', oa.due_date,
    'progressPercent', coalesce(round(100.0 * count(tp.id) filter (where tp.status = 'completed') / nullif(count(tp.id), 0)), 0)::integer,
    'stages', (
      select coalesce(jsonb_agg(
        jsonb_build_object(
          'id', s.id,
          'title', s.title,
          'description', s.description,
          'sortOrder', s.sort_order,
          'status', case
            when count(stp.id) filter (where stp.status = 'completed') = count(stp.id) then 'completed'
            when count(stp.id) filter (where stp.status = 'overdue' or (stp.status <> 'completed' and stp.due_date < current_date)) > 0 then 'overdue'
            when count(stp.id) filter (where stp.status in ('in_progress', 'completed')) > 0 then 'in_progress'
            else 'not_started'
          end,
          'tasks', (
            select coalesce(jsonb_agg(
              jsonb_build_object(
                'id', ttp.id,
                'title', t.title,
                'description', t.description,
                'points', t.points,
                'dueDate', ttp.due_date,
                'status', case
                  when ttp.status <> 'completed' and ttp.due_date < current_date then 'overdue'
                  else ttp.status::text
                end,
                'required', t.required,
                'completedAt', ttp.completed_at
              ) order by t.sort_order
            ), '[]'::jsonb)
            from public.onboarding_tasks t
            join public.onboarding_task_progress ttp
              on ttp.task_id = t.id and ttp.assignment_id = oa.id
            where t.stage_id = s.id
          )
        ) order by s.sort_order
      ), '[]'::jsonb)
      from public.onboarding_stages s
      left join public.onboarding_tasks st on st.stage_id = s.id
      left join public.onboarding_task_progress stp
        on stp.task_id = st.id and stp.assignment_id = oa.id
      where s.template_id = oa.template_id
      group by s.template_id
    ),
    'knowledge', (
      select coalesce(jsonb_agg(
        jsonb_build_object(
          'id', ka.id,
          'title', ka.title,
          'summary', ka.summary,
          'category', ka.category,
          'readMinutes', ka.read_minutes,
          'body', ka.body
        ) order by ka.sort_order, ka.created_at
      ), '[]'::jsonb)
      from public.knowledge_articles ka
      where ka.company_id = (select p.company_id from public.profiles p where p.id = v_profile_id)
        and ka.is_published
    ),
    'questions', (
      select coalesce(jsonb_agg(
        jsonb_build_object(
          'id', oq.id,
          'question', oq.question,
          'answer', oq.answer,
          'status', oq.status,
          'createdAt', oq.created_at,
          'answeredAt', oq.answered_at
        ) order by oq.created_at desc
      ), '[]'::jsonb)
      from public.onboarding_questions oq
      where oq.assignment_id = oa.id and oq.author_id = v_profile_id
    )
  ) into v_result
  from public.onboarding_assignments oa
  join public.onboarding_templates ot on ot.id = oa.template_id
  left join public.profiles mp on mp.id = oa.mentor_id
  left join public.onboarding_task_progress tp on tp.assignment_id = oa.id
  where oa.id = v_assignment.id
  group by oa.id, ot.id, mp.id;

  return v_result;
end;
$$;

create or replace function public.complete_onboarding_task(p_task_progress_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile_id uuid := public.current_profile_id();
  v_progress public.onboarding_task_progress%rowtype;
  v_task public.onboarding_tasks%rowtype;
  v_assignment_id uuid;
  v_completed integer;
  v_total integer;
  v_percent integer;
  v_points integer := 0;
begin
  select tp.*
    into v_progress
  from public.onboarding_task_progress tp
  join public.onboarding_assignments oa on oa.id = tp.assignment_id
  where tp.id = p_task_progress_id
    and oa.profile_id = v_profile_id
  for update of tp;

  if v_progress.id is null then
    raise exception 'Задание онбординга не найдено.' using errcode = 'P0002';
  end if;

  v_assignment_id := v_progress.assignment_id;

  select t.* into v_task
  from public.onboarding_tasks t
  where t.id = v_progress.task_id;

  if v_progress.status <> 'completed' then
    update public.onboarding_task_progress
    set status = 'completed', completed_at = now(), updated_at = now()
    where id = v_progress.id;

    if v_task.points > 0 then
      v_points := public.change_bionic_balance(
        v_profile_id,
        v_task.points,
        'onboarding_task',
        'Онбординг: ' || v_task.title,
        'onboarding_task',
        v_progress.id,
        v_profile_id
      );
    end if;
  end if;

  select count(*) filter (where tp.status = 'completed')::integer,
         count(*)::integer
    into v_completed, v_total
  from public.onboarding_task_progress tp
  where tp.assignment_id = v_assignment_id;

  v_percent := coalesce(round(100.0 * v_completed / nullif(v_total, 0)), 0)::integer;

  update public.onboarding_assignments
  set status = case when v_completed = v_total and v_total > 0 then 'completed' else 'in_progress' end,
      completed_at = case when v_completed = v_total and v_total > 0 then coalesce(completed_at, now()) else null end,
      updated_at = now()
  where id = v_assignment_id;

  if v_completed >= 3 then
    perform public.grant_badge(v_profile_id, 'FIRST_STEP');
  end if;

  return jsonb_build_object(
    'taskId', p_task_progress_id,
    'completed', true,
    'pointsGranted', v_points,
    'progressPercent', v_percent
  );
end;
$$;

create or replace function public.ask_onboarding_question(
  p_assignment_id uuid,
  p_question text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile_id uuid := public.current_profile_id();
  v_question public.onboarding_questions%rowtype;
begin
  if char_length(btrim(p_question)) < 8 then
    raise exception 'Вопрос должен содержать не менее 8 символов.';
  end if;

  if not exists (
    select 1 from public.onboarding_assignments oa
    where oa.id = p_assignment_id and oa.profile_id = v_profile_id
  ) then
    raise exception 'Назначение онбординга не найдено.' using errcode = 'P0002';
  end if;

  insert into public.onboarding_questions(assignment_id, author_id, question)
  values (p_assignment_id, v_profile_id, btrim(p_question))
  returning * into v_question;

  return jsonb_build_object(
    'id', v_question.id,
    'question', v_question.question,
    'answer', v_question.answer,
    'status', v_question.status,
    'createdAt', v_question.created_at,
    'answeredAt', v_question.answered_at
  );
end;
$$;

-- -----------------------------------------------------------------------------
-- RPC: обучение
-- -----------------------------------------------------------------------------

create or replace function public.get_learning_class(p_class_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_profile_id uuid := public.current_profile_id();
  v_result jsonb;
begin
  select jsonb_build_object(
    'id', lc.id,
    'title', lc.title,
    'description', lc.description,
    'longDescription', lc.long_description,
    'category', lc.category,
    'durationMinutes', lc.duration_minutes,
    'reward', lc.reward,
    'passThreshold', lc.pass_threshold,
    'maxAttempts', lc.max_attempts,
    'attemptsUsed', coalesce(le.attempts_used, 0),
    'progressPercent', coalesce(le.progress_percent, 0),
    'status', coalesce(le.status, 'not_started'::public.learning_status),
    'modulesCount', (select count(*) from public.learning_modules lm where lm.class_id = lc.id),
    'coverKind', lc.cover_kind,
    'bestScore', le.best_score,
    'modules', (
      select coalesce(jsonb_agg(
        jsonb_build_object(
          'id', lm.id,
          'title', lm.title,
          'sortOrder', lm.sort_order,
          'durationMinutes', lm.duration_minutes,
          'content', lm.content,
          'completed', (lmp.id is not null)
        ) order by lm.sort_order
      ), '[]'::jsonb)
      from public.learning_modules lm
      left join public.learning_module_progress lmp
        on lmp.module_id = lm.id and lmp.profile_id = v_profile_id
      where lm.class_id = lc.id
    ),
    'questions', (
      select coalesce(jsonb_agg(
        jsonb_build_object(
          'id', lq.id,
          'prompt', lq.prompt,
          'sortOrder', lq.sort_order,
          'options', (
            select coalesce(jsonb_agg(
              jsonb_build_object('id', lo.id, 'label', lo.label)
              order by lo.sort_order
            ), '[]'::jsonb)
            from public.learning_options lo
            where lo.question_id = lq.id
          )
        ) order by lq.sort_order
      ), '[]'::jsonb)
      from public.learning_questions lq
      where lq.class_id = lc.id
    )
  ) into v_result
  from public.learning_classes lc
  left join public.learning_enrollments le
    on le.class_id = lc.id and le.profile_id = v_profile_id
  where lc.id = p_class_id
    and lc.company_id = public.current_company_id()
    and lc.status = 'active';

  return v_result;
end;
$$;

create or replace function public.submit_learning_attempt(
  p_class_id uuid,
  p_answers jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_profile_id uuid := public.current_profile_id();
  v_class public.learning_classes%rowtype;
  v_enrollment public.learning_enrollments%rowtype;
  v_question_count integer;
  v_answer_count integer;
  v_correct_count integer;
  v_score integer;
  v_passed boolean;
  v_attempt_number integer;
  v_attempt_id uuid;
  v_reward integer := 0;
  v_was_passed boolean := false;
begin
  select * into v_class
  from public.learning_classes lc
  where lc.id = p_class_id
    and lc.company_id = public.current_company_id()
    and lc.status = 'active';

  if v_class.id is null then
    raise exception 'Учебный класс не найден.' using errcode = 'P0002';
  end if;

  insert into public.learning_enrollments(profile_id, class_id, status, started_at)
  values (v_profile_id, p_class_id, 'in_progress', now())
  on conflict (profile_id, class_id) do update
    set started_at = coalesce(public.learning_enrollments.started_at, now())
  returning * into v_enrollment;

  select * into v_enrollment
  from public.learning_enrollments le
  where le.profile_id = v_profile_id and le.class_id = p_class_id
  for update;

  v_was_passed := v_enrollment.status = 'passed';

  if v_enrollment.attempts_used >= v_class.max_attempts and not v_was_passed then
    raise exception 'Все три попытки уже использованы.';
  end if;

  if v_was_passed then
    raise exception 'Курс уже успешно пройден.';
  end if;

  select count(*)::integer into v_question_count
  from public.learning_questions lq
  where lq.class_id = p_class_id;

  select count(*)::integer into v_answer_count
  from jsonb_each_text(coalesce(p_answers, '{}'::jsonb)) a
  join public.learning_questions q
    on q.id::text = a.key and q.class_id = p_class_id
  join public.learning_options o
    on o.id::text = a.value and o.question_id = q.id;

  if v_question_count = 0 then
    raise exception 'Для класса не настроен тест.';
  end if;

  if v_answer_count <> v_question_count then
    raise exception 'Ответьте на все вопросы теста.';
  end if;

  select count(*)::integer into v_correct_count
  from jsonb_each_text(p_answers) a
  join public.learning_questions q
    on q.id::text = a.key and q.class_id = p_class_id
  join public.learning_options o
    on o.id::text = a.value and o.question_id = q.id and o.is_correct;

  v_score := round(100.0 * v_correct_count / v_question_count)::integer;
  v_passed := v_score >= v_class.pass_threshold;
  v_attempt_number := v_enrollment.attempts_used + 1;
  v_attempt_id := extensions.gen_random_uuid();

  insert into public.learning_attempts(
    id, enrollment_id, profile_id, class_id, score, passed, attempt_number
  ) values (
    v_attempt_id, v_enrollment.id, v_profile_id, p_class_id,
    v_score, v_passed, v_attempt_number
  );

  insert into public.learning_attempt_answers(
    attempt_id, question_id, selected_option_id, is_correct
  )
  select v_attempt_id, q.id, o.id, o.is_correct
  from jsonb_each_text(p_answers) a
  join public.learning_questions q
    on q.id::text = a.key and q.class_id = p_class_id
  join public.learning_options o
    on o.id::text = a.value and o.question_id = q.id;

  update public.learning_enrollments
  set attempts_used = v_attempt_number,
      best_score = greatest(coalesce(best_score, 0), v_score),
      progress_percent = 100,
      status = case
        when v_passed then 'passed'
        when v_attempt_number >= v_class.max_attempts then 'failed'
        else 'in_progress'
      end,
      completed_at = case when v_passed then now() else completed_at end,
      started_at = coalesce(started_at, now()),
      updated_at = now()
  where id = v_enrollment.id;

  if v_passed and v_class.reward > 0 then
    v_reward := public.change_bionic_balance(
      v_profile_id,
      v_class.reward,
      'learning_pass',
      'Обучение: ' || v_class.title,
      'learning_class',
      v_class.id,
      v_profile_id
    );
  end if;

  if v_passed and v_class.slug like '%gmp%' then
    perform public.grant_badge(v_profile_id, 'GMP_EXPERT');
  end if;

  if v_passed and v_class.slug like '%safety%' then
    perform public.grant_badge(v_profile_id, 'SAFETY_FIRST');
  end if;

  return jsonb_build_object(
    'attemptId', v_attempt_id,
    'score', v_score,
    'passed', v_passed,
    'attemptsUsed', v_attempt_number,
    'attemptsLeft', greatest(v_class.max_attempts - v_attempt_number, 0),
    'rewardGranted', v_reward
  );
end;
$$;

-- -----------------------------------------------------------------------------
-- RPC: достижения, рейтинг, бейджи
-- -----------------------------------------------------------------------------

create or replace function public.get_achievement_stories()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(jsonb_agg(
    jsonb_build_object(
      'id', a.id,
      'year', a.year,
      'title', a.title,
      'description', a.description,
      'accent', a.accent,
      'metric', a.metric
    ) order by a.sort_order, a.year
  ), '[]'::jsonb)
  from public.achievement_stories a
  where a.company_id = public.current_company_id()
    and a.is_published;
$$;

create or replace function public.russian_period_label(p_date date default current_date)
returns text
language sql
immutable
as $$
  select case extract(month from p_date)::integer
    when 1 then 'Январь' when 2 then 'Февраль' when 3 then 'Март'
    when 4 then 'Апрель' when 5 then 'Май' when 6 then 'Июнь'
    when 7 then 'Июль' when 8 then 'Август' when 9 then 'Сентябрь'
    when 10 then 'Октябрь' when 11 then 'Ноябрь' else 'Декабрь'
  end || ' ' || extract(year from p_date)::integer;
$$;

create or replace function public.get_leaderboards()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_profile_id uuid := public.current_profile_id();
  v_employees jsonb;
  v_departments jsonb;
begin
  with score_data as (
    select p.id,
           p.first_name || ' ' || p.last_name as full_name,
           p.position,
           p.department_id,
           coalesce(d.name, 'Без отдела') as department_name,
           p.avatar_url,
           coalesce(sum(bt.amount) filter (
             where bt.amount > 0 and bt.created_at >= date_trunc('month', now())
           ), 0)::integer as score
    from public.profiles p
    left join public.departments d on d.id = p.department_id
    left join public.bionic_transactions bt on bt.profile_id = p.id
    where p.company_id = public.current_company_id() and p.status = 'active'
    group by p.id, d.name
  ), ranked as (
    select *, dense_rank() over (order by score desc, full_name) as rank
    from score_data
  )
  select coalesce(jsonb_agg(
    jsonb_build_object(
      'rank', r.rank,
      'profileId', r.id,
      'fullName', r.full_name,
      'position', r.position,
      'departmentName', r.department_name,
      'score', r.score,
      'avatarUrl', r.avatar_url,
      'isCurrentUser', r.id = v_profile_id
    ) order by r.rank, r.full_name
  ), '[]'::jsonb)
  into v_employees
  from ranked r
  where r.rank <= 20 or r.id = v_profile_id;

  with score_data as (
    select d.id,
           d.name,
           count(distinct p.id)::integer as members_count,
           coalesce(sum(bt.amount) filter (
             where bt.amount > 0 and bt.created_at >= date_trunc('month', now())
           ), 0)::integer as score
    from public.departments d
    left join public.profiles p on p.department_id = d.id and p.status = 'active'
    left join public.bionic_transactions bt on bt.profile_id = p.id
    where d.company_id = public.current_company_id() and d.status = 'active'
    group by d.id
  ), ranked as (
    select *, dense_rank() over (order by score desc, name) as rank
    from score_data
  )
  select coalesce(jsonb_agg(
    jsonb_build_object(
      'rank', r.rank,
      'departmentId', r.id,
      'departmentName', r.name,
      'score', r.score,
      'membersCount', r.members_count
    ) order by r.rank, r.name
  ), '[]'::jsonb)
  into v_departments
  from ranked r;

  return jsonb_build_object(
    'employees', v_employees,
    'departments', v_departments,
    'periodLabel', public.russian_period_label(current_date)
  );
end;
$$;

create or replace function public.get_badges()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(jsonb_agg(
    jsonb_build_object(
      'id', b.id,
      'code', b.code,
      'title', b.title,
      'description', b.description,
      'kind', b.kind,
      'reward', b.reward,
      'earnedAt', pb.earned_at,
      'progressPercent', case
        when pb.id is not null then 100
        else least(100, round(100.0 * coalesce(pp.current_value, 0) / b.target_value)::integer)
      end,
      'locked', pb.id is null
    ) order by b.sort_order, b.created_at
  ), '[]'::jsonb)
  from public.badges b
  left join public.profile_badges pb
    on pb.badge_id = b.id and pb.profile_id = public.current_profile_id()
  left join public.profile_badge_progress pp
    on pp.badge_id = b.id and pp.profile_id = public.current_profile_id()
  where b.company_id = public.current_company_id()
    and b.status = 'active';
$$;

-- -----------------------------------------------------------------------------
-- RPC: магазин
-- -----------------------------------------------------------------------------

create or replace function public.get_shop()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_profile_id uuid := public.current_profile_id();
  v_balance integer;
  v_products jsonb;
  v_orders jsonb;
begin
  select coalesce(w.balance, 0) into v_balance
  from public.wallets w
  where w.profile_id = v_profile_id;

  select coalesce(jsonb_agg(
    jsonb_build_object(
      'id', p.id,
      'title', p.title,
      'description', p.description,
      'price', p.price,
      'stock', case
        when exists (select 1 from public.shop_product_variants pv where pv.product_id = p.id)
          then (select coalesce(sum(pv.stock), 0) from public.shop_product_variants pv where pv.product_id = p.id)
        else p.stock
      end,
      'kind', p.kind,
      'variants', (
        select coalesce(jsonb_agg(
          jsonb_build_object('id', pv.id, 'title', pv.title, 'stock', pv.stock)
          order by pv.sort_order, pv.title
        ), '[]'::jsonb)
        from public.shop_product_variants pv
        where pv.product_id = p.id
      ),
      'featured', p.featured
    ) order by p.featured desc, p.sort_order, p.created_at
  ), '[]'::jsonb)
  into v_products
  from public.shop_products p
  where p.company_id = public.current_company_id() and p.status = 'active';

  select coalesce(jsonb_agg(order_json order by created_at desc), '[]'::jsonb)
  into v_orders
  from (
    select o.created_at,
           jsonb_build_object(
             'id', o.id,
             'number', o.order_number,
             'productTitle', oi.product_title,
             'variantTitle', oi.variant_title,
             'quantity', oi.quantity,
             'total', o.total,
             'status', o.status,
             'createdAt', o.created_at
           ) as order_json
    from public.shop_orders o
    join lateral (
      select x.* from public.shop_order_items x
      where x.order_id = o.id
      order by x.id
      limit 1
    ) oi on true
    where o.profile_id = v_profile_id
    order by o.created_at desc
    limit 10
  ) recent;

  return jsonb_build_object(
    'balance', coalesce(v_balance, 0),
    'products', v_products,
    'recentOrders', v_orders
  );
end;
$$;

create or replace function public.create_shop_order(
  p_product_id uuid,
  p_variant_id uuid default null,
  p_quantity integer default 1
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_profile_id uuid := public.current_profile_id();
  v_product public.shop_products%rowtype;
  v_variant public.shop_product_variants%rowtype;
  v_has_variants boolean;
  v_total integer;
  v_order public.shop_orders%rowtype;
begin
  if p_quantity < 1 or p_quantity > 20 then
    raise exception 'Количество должно быть от 1 до 20.';
  end if;

  select * into v_product
  from public.shop_products p
  where p.id = p_product_id
    and p.company_id = public.current_company_id()
    and p.status = 'active'
  for update;

  if v_product.id is null then
    raise exception 'Товар не найден.' using errcode = 'P0002';
  end if;

  select exists (
    select 1 from public.shop_product_variants pv where pv.product_id = v_product.id
  ) into v_has_variants;

  if v_has_variants then
    if p_variant_id is null then
      raise exception 'Выберите вариант товара.';
    end if;

    select * into v_variant
    from public.shop_product_variants pv
    where pv.id = p_variant_id and pv.product_id = v_product.id
    for update;

    if v_variant.id is null then
      raise exception 'Вариант товара не найден.' using errcode = 'P0002';
    end if;

    if v_variant.stock < p_quantity then
      raise exception 'Недостаточно товара выбранного размера.';
    end if;

    update public.shop_product_variants
    set stock = stock - p_quantity
    where id = v_variant.id;
  else
    if v_product.stock < p_quantity then
      raise exception 'Товар закончился.';
    end if;

    update public.shop_products
    set stock = stock - p_quantity, updated_at = now()
    where id = v_product.id;
  end if;

  v_total := v_product.price * p_quantity;

  perform public.change_bionic_balance(
    v_profile_id,
    -v_total,
    'shop_order',
    'Заказ: ' || v_product.title,
    'shop_order',
    null,
    v_profile_id
  );

  insert into public.shop_orders(profile_id, total, order_number)
  values (v_profile_id, v_total, '')
  returning * into v_order;

  insert into public.shop_order_items(
    order_id, product_id, variant_id, product_title, variant_title,
    quantity, unit_price
  ) values (
    v_order.id, v_product.id, v_variant.id, v_product.title, v_variant.title,
    p_quantity, v_product.price
  );

  update public.bionic_transactions
  set source_id = v_order.id
  where id = (
    select bt.id from public.bionic_transactions bt
    where bt.profile_id = v_profile_id
      and bt.reason_code = 'shop_order'
      and bt.source_type = 'shop_order'
      and bt.source_id is null
    order by bt.created_at desc
    limit 1
  );

  return jsonb_build_object(
    'id', v_order.id,
    'number', v_order.order_number,
    'productTitle', v_product.title,
    'variantTitle', v_variant.title,
    'quantity', p_quantity,
    'total', v_total,
    'status', v_order.status,
    'createdAt', v_order.created_at
  );
end;
$$;

-- -----------------------------------------------------------------------------
-- RPC: администрирование
-- -----------------------------------------------------------------------------

create or replace function public.get_admin_dashboard()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_company_id uuid := public.current_company_id();
  v_orders jsonb;
  v_employees jsonb;
  v_departments jsonb;
  v_new_orders integer;
  v_active_employees integer;
  v_onboarding integer;
  v_pass_rate integer;
begin
  perform public.assert_hr_or_admin();

  select count(*)::integer into v_new_orders
  from public.shop_orders o
  join public.profiles p on p.id = o.profile_id
  where p.company_id = v_company_id and o.status = 'new';

  select count(*)::integer into v_active_employees
  from public.profiles p
  where p.company_id = v_company_id and p.status = 'active';

  select count(*)::integer into v_onboarding
  from public.onboarding_assignments oa
  join public.profiles p on p.id = oa.profile_id
  where p.company_id = v_company_id and oa.status in ('not_started', 'in_progress', 'overdue');

  select coalesce(round(100.0 * count(*) filter (where le.status = 'passed') / nullif(count(*) filter (where le.attempts_used > 0), 0)), 0)::integer
    into v_pass_rate
  from public.learning_enrollments le
  join public.profiles p on p.id = le.profile_id
  where p.company_id = v_company_id;

  select coalesce(jsonb_agg(order_json order by created_at desc), '[]'::jsonb)
  into v_orders
  from (
    select o.created_at,
           jsonb_build_object(
             'id', o.id,
             'number', o.order_number,
             'productTitle', oi.product_title,
             'variantTitle', oi.variant_title,
             'quantity', oi.quantity,
             'total', o.total,
             'status', o.status,
             'createdAt', o.created_at,
             'employeeName', p.first_name || ' ' || p.last_name
           ) as order_json
    from public.shop_orders o
    join public.profiles p on p.id = o.profile_id
    join lateral (
      select x.* from public.shop_order_items x
      where x.order_id = o.id order by x.id limit 1
    ) oi on true
    where p.company_id = v_company_id
    order by o.created_at desc
    limit 50
  ) data;

  select coalesce(jsonb_agg(
    jsonb_build_object(
      'id', p.id,
      'employeeNumber', p.employee_number,
      'fullName', p.first_name || ' ' || p.last_name,
      'departmentName', coalesce(d.name, 'Без отдела'),
      'position', p.position,
      'role', p.role,
      'status', p.status,
      'authLinked', p.auth_user_id is not null
    ) order by p.last_name, p.first_name
  ), '[]'::jsonb)
  into v_employees
  from public.profiles p
  left join public.departments d on d.id = p.department_id
  where p.company_id = v_company_id;

  select coalesce(jsonb_agg(
    jsonb_build_object('id', d.id, 'name', d.name)
    order by d.name
  ), '[]'::jsonb)
  into v_departments
  from public.departments d
  where d.company_id = v_company_id and d.status = 'active';

  return jsonb_build_object(
    'metrics', jsonb_build_object(
      'newOrders', v_new_orders,
      'activeEmployees', v_active_employees,
      'onboardingInProgress', v_onboarding,
      'learningPassRate', v_pass_rate
    ),
    'orders', v_orders,
    'employees', v_employees,
    'departments', v_departments
  );
end;
$$;

create or replace function public.admin_update_order(
  p_order_id uuid,
  p_status public.order_status
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_admin_id uuid := public.current_profile_id();
  v_order public.shop_orders%rowtype;
  v_item public.shop_order_items%rowtype;
begin
  perform public.assert_hr_or_admin();

  select o.* into v_order
  from public.shop_orders o
  join public.profiles p on p.id = o.profile_id
  where o.id = p_order_id and p.company_id = public.current_company_id()
  for update of o;

  if v_order.id is null then
    raise exception 'Заказ не найден.' using errcode = 'P0002';
  end if;

  if v_order.status = 'cancelled' and p_status <> 'cancelled' then
    raise exception 'Отменённый заказ нельзя вернуть в работу.';
  end if;

  if p_status = 'cancelled' and v_order.status <> 'cancelled' then
    select * into v_item
    from public.shop_order_items oi
    where oi.order_id = v_order.id
    order by oi.id
    limit 1;

    if v_item.variant_id is not null then
      update public.shop_product_variants
      set stock = stock + v_item.quantity
      where id = v_item.variant_id;
    else
      update public.shop_products
      set stock = stock + v_item.quantity, updated_at = now()
      where id = v_item.product_id;
    end if;

    perform public.change_bionic_balance(
      v_order.profile_id,
      v_order.total,
      'shop_refund',
      'Возврат по заказу ' || v_order.order_number,
      'shop_refund',
      v_order.id,
      v_admin_id
    );
  end if;

  update public.shop_orders
  set status = p_status,
      processed_by = v_admin_id,
      issued_at = case when p_status = 'issued' then coalesce(issued_at, now()) else issued_at end,
      updated_at = now()
  where id = v_order.id
  returning * into v_order;

  return jsonb_build_object('id', v_order.id, 'status', v_order.status);
end;
$$;

create or replace function public.admin_set_user_role(
  p_profile_id uuid,
  p_role public.user_role
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile public.profiles%rowtype;
begin
  perform public.assert_hr_or_admin();

  update public.profiles
  set role = p_role, updated_at = now()
  where id = p_profile_id and company_id = public.current_company_id()
  returning * into v_profile;

  if v_profile.id is null then
    raise exception 'Сотрудник не найден.' using errcode = 'P0002';
  end if;

  return jsonb_build_object('id', v_profile.id, 'role', v_profile.role);
end;
$$;

-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------

alter table public.companies enable row level security;
alter table public.departments enable row level security;
alter table public.profiles enable row level security;
alter table public.wallets enable row level security;
alter table public.bionic_transactions enable row level security;
alter table public.onboarding_templates enable row level security;
alter table public.onboarding_stages enable row level security;
alter table public.onboarding_tasks enable row level security;
alter table public.onboarding_assignments enable row level security;
alter table public.onboarding_task_progress enable row level security;
alter table public.knowledge_articles enable row level security;
alter table public.onboarding_questions enable row level security;
alter table public.learning_classes enable row level security;
alter table public.learning_modules enable row level security;
alter table public.learning_questions enable row level security;
alter table public.learning_options enable row level security;
alter table public.learning_enrollments enable row level security;
alter table public.learning_module_progress enable row level security;
alter table public.learning_attempts enable row level security;
alter table public.learning_attempt_answers enable row level security;
alter table public.badges enable row level security;
alter table public.profile_badges enable row level security;
alter table public.profile_badge_progress enable row level security;
alter table public.achievement_stories enable row level security;
alter table public.shop_products enable row level security;
alter table public.shop_product_variants enable row level security;
alter table public.shop_orders enable row level security;
alter table public.shop_order_items enable row level security;

create policy companies_read_current on public.companies
for select to authenticated
using (id = public.current_company_id());

create policy departments_read_current on public.departments
for select to authenticated
using (company_id = public.current_company_id());

create policy profiles_read_company on public.profiles
for select to authenticated
using (company_id = public.current_company_id());

create policy profiles_admin_update on public.profiles
for update to authenticated
using (company_id = public.current_company_id() and public.is_hr_or_admin())
with check (company_id = public.current_company_id() and public.is_hr_or_admin());

create policy wallets_read_own_or_admin on public.wallets
for select to authenticated
using (
  profile_id = public.current_profile_id()
  or (public.is_hr_or_admin() and profile_id in (
    select p.id from public.profiles p where p.company_id = public.current_company_id()
  ))
);

create policy transactions_read_own_or_admin on public.bionic_transactions
for select to authenticated
using (
  profile_id = public.current_profile_id()
  or (public.is_hr_or_admin() and profile_id in (
    select p.id from public.profiles p where p.company_id = public.current_company_id()
  ))
);

create policy onboarding_templates_read on public.onboarding_templates
for select to authenticated
using (company_id = public.current_company_id());

create policy onboarding_stages_read on public.onboarding_stages
for select to authenticated
using (template_id in (
  select ot.id from public.onboarding_templates ot where ot.company_id = public.current_company_id()
));

create policy onboarding_tasks_read on public.onboarding_tasks
for select to authenticated
using (stage_id in (
  select os.id from public.onboarding_stages os
  join public.onboarding_templates ot on ot.id = os.template_id
  where ot.company_id = public.current_company_id()
));

create policy onboarding_assignments_read on public.onboarding_assignments
for select to authenticated
using (
  profile_id = public.current_profile_id()
  or mentor_id = public.current_profile_id()
  or (public.is_hr_or_admin() and profile_id in (
    select p.id from public.profiles p where p.company_id = public.current_company_id()
  ))
);

create policy onboarding_progress_read on public.onboarding_task_progress
for select to authenticated
using (assignment_id in (
  select oa.id from public.onboarding_assignments oa
  where oa.profile_id = public.current_profile_id()
     or oa.mentor_id = public.current_profile_id()
     or (public.is_hr_or_admin() and oa.profile_id in (
       select p.id from public.profiles p where p.company_id = public.current_company_id()
     ))
));

create policy knowledge_articles_read on public.knowledge_articles
for select to authenticated
using (company_id = public.current_company_id() and (is_published or public.is_hr_or_admin()));

create policy onboarding_questions_read on public.onboarding_questions
for select to authenticated
using (
  author_id = public.current_profile_id()
  or assignment_id in (
    select oa.id from public.onboarding_assignments oa
    where oa.mentor_id = public.current_profile_id()
       or (public.is_hr_or_admin() and oa.profile_id in (
         select p.id from public.profiles p where p.company_id = public.current_company_id()
       ))
  )
);

create policy learning_classes_read on public.learning_classes
for select to authenticated
using (company_id = public.current_company_id() and status = 'active');

create policy learning_modules_read on public.learning_modules
for select to authenticated
using (class_id in (
  select lc.id from public.learning_classes lc
  where lc.company_id = public.current_company_id() and lc.status = 'active'
));

create policy learning_questions_read on public.learning_questions
for select to authenticated
using (class_id in (
  select lc.id from public.learning_classes lc
  where lc.company_id = public.current_company_id() and lc.status = 'active'
));

-- В learning_options есть is_correct: прямой доступ authenticated не выдаётся.
create policy learning_options_admin_read on public.learning_options
for select to authenticated
using (public.is_hr_or_admin());

create policy learning_enrollments_read on public.learning_enrollments
for select to authenticated
using (
  profile_id = public.current_profile_id()
  or (public.is_hr_or_admin() and profile_id in (
    select p.id from public.profiles p where p.company_id = public.current_company_id()
  ))
);

create policy learning_module_progress_read on public.learning_module_progress
for select to authenticated
using (profile_id = public.current_profile_id());

create policy learning_attempts_read on public.learning_attempts
for select to authenticated
using (
  profile_id = public.current_profile_id()
  or (public.is_hr_or_admin() and profile_id in (
    select p.id from public.profiles p where p.company_id = public.current_company_id()
  ))
);

create policy learning_attempt_answers_read on public.learning_attempt_answers
for select to authenticated
using (attempt_id in (
  select la.id from public.learning_attempts la
  where la.profile_id = public.current_profile_id()
     or (public.is_hr_or_admin() and la.profile_id in (
       select p.id from public.profiles p where p.company_id = public.current_company_id()
     ))
));

create policy badges_read on public.badges
for select to authenticated
using (company_id = public.current_company_id() and status = 'active');

create policy profile_badges_read on public.profile_badges
for select to authenticated
using (
  profile_id = public.current_profile_id()
  or (public.is_hr_or_admin() and profile_id in (
    select p.id from public.profiles p where p.company_id = public.current_company_id()
  ))
);

create policy profile_badge_progress_read on public.profile_badge_progress
for select to authenticated
using (profile_id = public.current_profile_id());

create policy achievement_stories_read on public.achievement_stories
for select to authenticated
using (company_id = public.current_company_id() and is_published);

create policy shop_products_read on public.shop_products
for select to authenticated
using (company_id = public.current_company_id() and status = 'active');

create policy shop_variants_read on public.shop_product_variants
for select to authenticated
using (product_id in (
  select sp.id from public.shop_products sp
  where sp.company_id = public.current_company_id() and sp.status = 'active'
));

create policy shop_orders_read on public.shop_orders
for select to authenticated
using (
  profile_id = public.current_profile_id()
  or (public.is_hr_or_admin() and profile_id in (
    select p.id from public.profiles p where p.company_id = public.current_company_id()
  ))
);

create policy shop_order_items_read on public.shop_order_items
for select to authenticated
using (order_id in (
  select so.id from public.shop_orders so
  where so.profile_id = public.current_profile_id()
     or (public.is_hr_or_admin() and so.profile_id in (
       select p.id from public.profiles p where p.company_id = public.current_company_id()
     ))
));

-- Приложение работает через security-definer RPC. Прямые права ограничены чтением
-- безопасных справочников; таблица learning_options намеренно исключена.
revoke all on all tables in schema public from anon;
revoke all on all tables in schema public from authenticated;

grant usage on schema public to authenticated;
grant select on public.companies, public.departments, public.profiles,
  public.onboarding_templates, public.onboarding_stages, public.onboarding_tasks,
  public.knowledge_articles, public.learning_classes, public.learning_modules,
  public.learning_questions, public.badges, public.achievement_stories,
  public.shop_products, public.shop_product_variants
  to authenticated;

grant select on public.wallets, public.bionic_transactions,
  public.onboarding_assignments, public.onboarding_task_progress, public.onboarding_questions,
  public.learning_enrollments, public.learning_module_progress, public.learning_attempts,
  public.learning_attempt_answers, public.profile_badges, public.profile_badge_progress,
  public.shop_orders, public.shop_order_items
  to authenticated;

revoke execute on function public.change_bionic_balance(uuid, integer, text, text, text, uuid, uuid)
  from public, anon, authenticated;
revoke execute on function public.grant_badge(uuid, text)
  from public, anon, authenticated;
revoke execute on function public.bootstrap_profile_programs()
  from public, anon, authenticated;
revoke execute on function public.enroll_profiles_in_new_class()
  from public, anon, authenticated;
revoke execute on function public.initialize_new_badge_progress()
  from public, anon, authenticated;
revoke execute on function public.handle_new_auth_user()
  from public, anon, authenticated;
revoke execute on function public.assert_hr_or_admin()
  from public, anon;

grant execute on function public.current_profile_id() to authenticated;
grant execute on function public.current_company_id() to authenticated;
grant execute on function public.current_user_role() to authenticated;
grant execute on function public.is_hr_or_admin() to authenticated;

grant execute on function public.get_profile_summary() to authenticated;
grant execute on function public.get_dashboard() to authenticated;
grant execute on function public.get_onboarding() to authenticated;
grant execute on function public.complete_onboarding_task(uuid) to authenticated;
grant execute on function public.ask_onboarding_question(uuid, text) to authenticated;
grant execute on function public.get_learning_catalog() to authenticated;
grant execute on function public.get_learning_class(uuid) to authenticated;
grant execute on function public.submit_learning_attempt(uuid, jsonb) to authenticated;
grant execute on function public.get_achievement_stories() to authenticated;
grant execute on function public.get_leaderboards() to authenticated;
grant execute on function public.get_badges() to authenticated;
grant execute on function public.get_shop() to authenticated;
grant execute on function public.create_shop_order(uuid, uuid, integer) to authenticated;
grant execute on function public.get_admin_dashboard() to authenticated;
grant execute on function public.admin_update_order(uuid, public.order_status) to authenticated;
grant execute on function public.admin_set_user_role(uuid, public.user_role) to authenticated;

commit;

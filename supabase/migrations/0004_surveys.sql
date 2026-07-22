-- Бионит В Деле — опросы вовлечённости
-- Добавляет только новые сущности опросов; существующие таблицы проекта не изменяются.
-- Запускать после основной миграции 0001_schema.sql.

begin;

-- -----------------------------------------------------------------------------
-- Типы
-- -----------------------------------------------------------------------------

do $$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public' and t.typname = 'survey_status'
  ) then
    create type public.survey_status as enum ('draft', 'active', 'closed');
  end if;

  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where n.nspname = 'public' and t.typname = 'survey_question_type'
  ) then
    create type public.survey_question_type as enum (
      'single_choice',
      'number',
      'scale_1_5',
      'yes_no',
      'long_text'
    );
  end if;
end;
$$;

-- -----------------------------------------------------------------------------
-- Таблицы
-- -----------------------------------------------------------------------------

create table if not exists public.surveys (
  id uuid primary key default extensions.gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  title text not null,
  description text not null default '',
  status public.survey_status not null default 'draft',
  starts_at timestamptz,
  ends_at timestamptz,
  estimated_minutes integer not null default 10 check (estimated_minutes between 1 and 180),
  employee_total integer not null default 134 check (employee_total > 0),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint surveys_title_not_blank check (btrim(title) <> ''),
  constraint surveys_dates_valid check (
    ends_at is null or starts_at is null or ends_at >= starts_at
  ),
  unique (company_id, title)
);

create index if not exists surveys_company_status_idx
  on public.surveys(company_id, status, created_at desc);

create table if not exists public.survey_questions (
  id uuid primary key default extensions.gen_random_uuid(),
  survey_id uuid not null references public.surveys(id) on delete cascade,
  code text not null,
  block text not null,
  block_title text not null,
  question_number integer check (question_number is null or question_number > 0),
  title text not null,
  question_type public.survey_question_type not null,
  required boolean not null default true,
  options jsonb not null default '[]'::jsonb,
  sort_order integer not null,
  created_at timestamptz not null default now(),
  constraint survey_questions_code_not_blank check (btrim(code) <> ''),
  constraint survey_questions_block_not_blank check (btrim(block) <> ''),
  constraint survey_questions_title_not_blank check (btrim(title) <> ''),
  constraint survey_questions_options_array check (jsonb_typeof(options) = 'array'),
  unique (survey_id, code),
  unique (survey_id, sort_order)
);

create index if not exists survey_questions_survey_order_idx
  on public.survey_questions(survey_id, sort_order);

create table if not exists public.survey_answers (
  id uuid primary key default extensions.gen_random_uuid(),
  survey_id uuid not null references public.surveys(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete set null,
  department_name text not null,
  gender text not null check (gender in ('М', 'Ж')),
  age integer not null check (age between 16 and 100),
  employee_category text not null,
  production_tenure text not null,
  answers jsonb not null,
  submitted_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint survey_answers_department_not_blank check (btrim(department_name) <> ''),
  constraint survey_answers_category_not_blank check (btrim(employee_category) <> ''),
  constraint survey_answers_tenure_not_blank check (btrim(production_tenure) <> ''),
  constraint survey_answers_object check (jsonb_typeof(answers) = 'object')
);

create unique index if not exists survey_answers_one_per_profile_idx
  on public.survey_answers(survey_id, profile_id)
  where profile_id is not null;

create index if not exists survey_answers_survey_submitted_idx
  on public.survey_answers(survey_id, submitted_at desc);

create index if not exists survey_answers_filters_idx
  on public.survey_answers(
    survey_id,
    department_name,
    employee_category,
    production_tenure
  );

-- Триггер updated_at уже существует в основной схеме.
drop trigger if exists surveys_updated_at on public.surveys;
create trigger surveys_updated_at
  before update on public.surveys
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Проверка прав: аналитика опросов доступна только роли admin
-- -----------------------------------------------------------------------------

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_user_role() = 'admin', false);
$$;

create or replace function public.assert_admin()
returns void
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Аналитика опросов доступна только администратору.'
      using errcode = '42501';
  end if;
end;
$$;

-- -----------------------------------------------------------------------------
-- RPC: список и карточка опроса
-- -----------------------------------------------------------------------------

create or replace function public.get_surveys()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', s.id,
        'title', s.title,
        'description', s.description,
        'status', s.status,
        'startsAt', s.starts_at,
        'endsAt', s.ends_at,
        'estimatedMinutes', s.estimated_minutes,
        'questionsCount', (
          select count(*)
          from public.survey_questions q
          where q.survey_id = s.id and q.question_number is not null
        ),
        'responseSubmitted', exists (
          select 1
          from public.survey_answers a
          where a.survey_id = s.id
            and a.profile_id = public.current_profile_id()
        ),
        'responseCount', (
          select count(*)
          from public.survey_answers a
          where a.survey_id = s.id
        ),
        'canViewResults', public.is_admin()
      )
      order by
        case s.status when 'active' then 0 when 'draft' then 1 else 2 end,
        s.created_at desc
    ),
    '[]'::jsonb
  )
  from public.surveys s
  where s.company_id = public.current_company_id()
    and (s.status <> 'draft' or public.is_admin());
$$;

create or replace function public.get_survey(p_survey_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_survey public.surveys%rowtype;
  v_questions jsonb;
  v_departments jsonb;
  v_categories jsonb;
  v_tenure jsonb;
begin
  select s.*
    into v_survey
  from public.surveys s
  where s.id = p_survey_id
    and s.company_id = public.current_company_id()
    and (s.status <> 'draft' or public.is_admin());

  if not found then
    return null;
  end if;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', q.id,
        'code', q.code,
        'block', q.block,
        'blockTitle', q.block_title,
        'number', q.question_number,
        'title', q.title,
        'type', q.question_type,
        'required', q.required,
        'options', q.options,
        'sortOrder', q.sort_order
      )
      order by q.sort_order
    ),
    '[]'::jsonb
  )
    into v_questions
  from public.survey_questions q
  where q.survey_id = p_survey_id;

  select coalesce(q.options, '[]'::jsonb)
    into v_departments
  from public.survey_questions q
  where q.survey_id = p_survey_id and q.code = 'DEPARTMENT';

  select coalesce(q.options, '[]'::jsonb)
    into v_categories
  from public.survey_questions q
  where q.survey_id = p_survey_id and q.code = 'EMPLOYEE_CATEGORY';

  select coalesce(q.options, '[]'::jsonb)
    into v_tenure
  from public.survey_questions q
  where q.survey_id = p_survey_id and q.code = 'PRODUCTION_TENURE';

  return jsonb_build_object(
    'id', v_survey.id,
    'title', v_survey.title,
    'description', v_survey.description,
    'status', v_survey.status,
    'startsAt', v_survey.starts_at,
    'endsAt', v_survey.ends_at,
    'estimatedMinutes', v_survey.estimated_minutes,
    'questionsCount', (
      select count(*)
      from public.survey_questions q
      where q.survey_id = p_survey_id and q.question_number is not null
    ),
    'responseSubmitted', exists (
      select 1
      from public.survey_answers a
      where a.survey_id = p_survey_id
        and a.profile_id = public.current_profile_id()
    ),
    'responseCount', (
      select count(*)
      from public.survey_answers a
      where a.survey_id = p_survey_id
    ),
    'canViewResults', public.is_admin(),
    'questions', v_questions,
    'departments', coalesce(v_departments, '[]'::jsonb),
    'employeeCategories', coalesce(v_categories, '[]'::jsonb),
    'tenureOptions', coalesce(v_tenure, '[]'::jsonb)
  );
end;
$$;

-- -----------------------------------------------------------------------------
-- RPC: отправка ответа
-- -----------------------------------------------------------------------------

create or replace function public.submit_survey_response(
  p_survey_id uuid,
  p_department_name text,
  p_gender text,
  p_age integer,
  p_employee_category text,
  p_production_tenure text,
  p_answers jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile_id uuid := public.current_profile_id();
  v_company_id uuid := public.current_company_id();
  v_answer_id uuid;
  v_submitted_at timestamptz;
  v_missing_count integer;
  v_invalid_count integer;
begin
  if v_profile_id is null or v_company_id is null then
    raise exception 'Требуется авторизация.' using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.surveys s
    where s.id = p_survey_id
      and s.company_id = v_company_id
      and s.status = 'active'
  ) then
    raise exception 'Опрос сейчас закрыт.' using errcode = '22023';
  end if;

  if p_gender not in ('М', 'Ж') or p_age not between 16 and 100 then
    raise exception 'Проверьте пол и возраст.' using errcode = '22023';
  end if;

  if btrim(coalesce(p_department_name, '')) = ''
    or btrim(coalesce(p_employee_category, '')) = ''
    or btrim(coalesce(p_production_tenure, '')) = '' then
    raise exception 'Заполните демографические данные.' using errcode = '22023';
  end if;

  if jsonb_typeof(p_answers) <> 'object' then
    raise exception 'Ответы должны быть объектом JSON.' using errcode = '22023';
  end if;

  if not exists (
    select 1
    from public.survey_questions q,
      lateral jsonb_array_elements_text(q.options) as option_value(value)
    where q.survey_id = p_survey_id
      and q.code = 'DEPARTMENT'
      and option_value.value = p_department_name
  ) then
    raise exception 'Выбрано неизвестное подразделение.' using errcode = '22023';
  end if;

  if not exists (
    select 1
    from public.survey_questions q,
      lateral jsonb_array_elements_text(q.options) as option_value(value)
    where q.survey_id = p_survey_id
      and q.code = 'EMPLOYEE_CATEGORY'
      and option_value.value = p_employee_category
  ) then
    raise exception 'Выбрана неизвестная категория сотрудника.' using errcode = '22023';
  end if;

  if not exists (
    select 1
    from public.survey_questions q,
      lateral jsonb_array_elements_text(q.options) as option_value(value)
    where q.survey_id = p_survey_id
      and q.code = 'PRODUCTION_TENURE'
      and option_value.value = p_production_tenure
  ) then
    raise exception 'Выбран неизвестный стаж.' using errcode = '22023';
  end if;

  select count(*)
    into v_missing_count
  from public.survey_questions q
  where q.survey_id = p_survey_id
    and q.required
    and q.question_number is not null
    and (
      not (p_answers ? q.code)
      or p_answers -> q.code is null
      or p_answers -> q.code = 'null'::jsonb
      or (
        jsonb_typeof(p_answers -> q.code) = 'string'
        and btrim(p_answers ->> q.code) = ''
      )
    );

  if v_missing_count > 0 then
    raise exception 'Ответьте на все обязательные вопросы.' using errcode = '22023';
  end if;

  select count(*)
    into v_invalid_count
  from public.survey_questions q
  where q.survey_id = p_survey_id
    and q.question_number is not null
    and p_answers ? q.code
    and case q.question_type
      when 'scale_1_5' then
        jsonb_typeof(p_answers -> q.code) <> 'number'
        or (p_answers ->> q.code)::numeric < 1
        or (p_answers ->> q.code)::numeric > 5
        or trunc((p_answers ->> q.code)::numeric) <> (p_answers ->> q.code)::numeric
      when 'yes_no' then
        jsonb_typeof(p_answers -> q.code) <> 'boolean'
      when 'long_text' then
        jsonb_typeof(p_answers -> q.code) not in ('string', 'null')
        or length(coalesce(p_answers ->> q.code, '')) > 2000
      else false
    end;

  if v_invalid_count > 0 then
    raise exception 'Один или несколько ответов имеют неверный формат.'
      using errcode = '22023';
  end if;

  begin
    insert into public.survey_answers (
      survey_id,
      company_id,
      profile_id,
      department_name,
      gender,
      age,
      employee_category,
      production_tenure,
      answers
    )
    values (
      p_survey_id,
      v_company_id,
      v_profile_id,
      p_department_name,
      p_gender,
      p_age,
      p_employee_category,
      p_production_tenure,
      p_answers
    )
    returning id, submitted_at into v_answer_id, v_submitted_at;
  exception
    when unique_violation then
      raise exception 'Вы уже прошли этот опрос.' using errcode = '23505';
  end;

  return jsonb_build_object(
    'id', v_answer_id,
    'surveyId', p_survey_id,
    'submittedAt', v_submitted_at
  );
end;
$$;

-- -----------------------------------------------------------------------------
-- RPC: управление опросом
-- -----------------------------------------------------------------------------

create or replace function public.get_admin_survey_control()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_result jsonb;
begin
  perform public.assert_admin();

  select jsonb_build_object(
    'id', s.id,
    'title', s.title,
    'status', s.status,
    'responseCount', (
      select count(*) from public.survey_answers a where a.survey_id = s.id
    ),
    'startsAt', s.starts_at,
    'endsAt', s.ends_at
  )
    into v_result
  from public.surveys s
  where s.company_id = public.current_company_id()
  order by s.created_at desc
  limit 1;

  if v_result is null then
    raise exception 'Опрос не найден.' using errcode = 'P0002';
  end if;

  return v_result;
end;
$$;

create or replace function public.admin_set_survey_status(
  p_survey_id uuid,
  p_status public.survey_status
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_result jsonb;
begin
  perform public.assert_admin();

  if p_status not in ('active', 'closed') then
    raise exception 'Опрос можно только открыть или закрыть.' using errcode = '22023';
  end if;

  update public.surveys s
  set
    status = p_status,
    starts_at = case
      when p_status = 'active' then coalesce(s.starts_at, now())
      else s.starts_at
    end
  where s.id = p_survey_id
    and s.company_id = public.current_company_id();

  if not found then
    raise exception 'Опрос не найден.' using errcode = 'P0002';
  end if;

  select jsonb_build_object(
    'id', s.id,
    'title', s.title,
    'status', s.status,
    'responseCount', (
      select count(*) from public.survey_answers a where a.survey_id = s.id
    ),
    'startsAt', s.starts_at,
    'endsAt', s.ends_at
  )
    into v_result
  from public.surveys s
  where s.id = p_survey_id;

  return v_result;
end;
$$;

-- -----------------------------------------------------------------------------
-- RPC: агрегированная аналитика
-- -----------------------------------------------------------------------------

create or replace function public.get_survey_results(
  p_survey_id uuid,
  p_department text default null,
  p_employee_category text default null,
  p_production_tenure text default null
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_survey public.surveys%rowtype;
  v_departments_filter jsonb;
  v_categories_filter jsonb;
  v_tenure_filter jsonb;
  v_respondent_count integer := 0;
  v_score_total numeric := 0;
  v_q20_yes integer := 0;
  v_enps numeric := 0;
  v_q20_share numeric := 0;
  v_response_rate numeric := 0;
  v_department_results jsonb := '[]'::jsonb;
  v_yes_questions jsonb := '[]'::jsonb;
begin
  perform public.assert_admin();

  select s.*
    into v_survey
  from public.surveys s
  where s.id = p_survey_id
    and s.company_id = public.current_company_id();

  if not found then
    return null;
  end if;

  select coalesce(q.options, '[]'::jsonb)
    into v_departments_filter
  from public.survey_questions q
  where q.survey_id = p_survey_id and q.code = 'DEPARTMENT';

  select coalesce(q.options, '[]'::jsonb)
    into v_categories_filter
  from public.survey_questions q
  where q.survey_id = p_survey_id and q.code = 'EMPLOYEE_CATEGORY';

  select coalesce(q.options, '[]'::jsonb)
    into v_tenure_filter
  from public.survey_questions q
  where q.survey_id = p_survey_id and q.code = 'PRODUCTION_TENURE';

  select
    count(*),
    coalesce(sum(
      (a.answers ->> 'Q1')::numeric
      + (a.answers ->> 'Q2')::numeric
      + (a.answers ->> 'Q3')::numeric
    ), 0),
    count(*) filter (where a.answers -> 'Q20' = 'true'::jsonb)
  into v_respondent_count, v_score_total, v_q20_yes
  from public.survey_answers a
  where a.survey_id = p_survey_id
    and (p_department is null or a.department_name = p_department)
    and (p_employee_category is null or a.employee_category = p_employee_category)
    and (p_production_tenure is null or a.production_tenure = p_production_tenure);

  if v_respondent_count > 0 then
    v_enps := round(v_score_total / (v_respondent_count * 3), 2);
    v_q20_share := round(v_q20_yes::numeric / v_respondent_count, 2);
  end if;

  v_response_rate := round(
    (v_respondent_count::numeric / nullif(v_survey.employee_total, 0)) * 100,
    1
  );

  with filtered as (
    select a.*
    from public.survey_answers a
    where a.survey_id = p_survey_id
      and (p_employee_category is null or a.employee_category = p_employee_category)
      and (p_production_tenure is null or a.production_tenure = p_production_tenure)
      and (p_department is null or a.department_name = p_department)
  ), department_options as (
    select value as department_name, ordinality as sort_order
    from public.survey_questions q
    cross join lateral jsonb_array_elements_text(q.options) with ordinality values_list(value, ordinality)
    where q.survey_id = p_survey_id
      and q.code = 'DEPARTMENT'
      and (p_department is null or value = p_department)
  ), department_metrics as (
    select
      d.department_name,
      d.sort_order,
      count(f.id)::integer as respondent_count,
      case when count(f.id) = 0 then 0::numeric else round(
        coalesce(sum(
          (f.answers ->> 'Q1')::numeric
          + (f.answers ->> 'Q2')::numeric
          + (f.answers ->> 'Q3')::numeric
        ), 0) / (count(f.id) * 3),
        2
      ) end as enps,
      case when count(f.id) = 0 then 0::numeric else round(
        count(f.id) filter (where f.answers -> 'Q20' = 'true'::jsonb)::numeric
          / count(f.id),
        2
      ) end as q20_share
    from department_options d
    left join filtered f on f.department_name = d.department_name
    group by d.department_name, d.sort_order
  )
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'departmentName', dm.department_name,
        'respondentCount', dm.respondent_count,
        'enps', dm.enps,
        'q20Share', dm.q20_share,
        'yesPercentages', (
          select coalesce(jsonb_object_agg(percentages.code, percentages.percentage), '{}'::jsonb)
          from (
            select
              q.code,
              case when dm.respondent_count = 0 then 0::numeric else round(
                count(f.id) filter (
                  where f.answers -> q.code = 'true'::jsonb
                )::numeric / dm.respondent_count * 100,
                1
              ) end as percentage
            from public.survey_questions q
            left join filtered f on f.department_name = dm.department_name
            where q.survey_id = p_survey_id
              and q.question_type = 'yes_no'
            group by q.code, q.sort_order
            order by q.sort_order
          ) percentages
        )
      )
      order by dm.sort_order
    ),
    '[]'::jsonb
  )
  into v_department_results
  from department_metrics dm;

  with filtered as (
    select a.*
    from public.survey_answers a
    where a.survey_id = p_survey_id
      and (p_department is null or a.department_name = p_department)
      and (p_employee_category is null or a.employee_category = p_employee_category)
      and (p_production_tenure is null or a.production_tenure = p_production_tenure)
  )
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'code', result.code,
        'number', result.question_number,
        'title', result.title,
        'overallPercent', result.overall_percentage
      )
      order by result.sort_order
    ),
    '[]'::jsonb
  )
  into v_yes_questions
  from (
    select
      q.code,
      q.question_number,
      q.title,
      q.sort_order,
      case when v_respondent_count = 0 then 0::numeric else round(
        count(f.id) filter (
          where f.answers -> q.code = 'true'::jsonb
        )::numeric / v_respondent_count * 100,
        1
      ) end as overall_percentage
    from public.survey_questions q
    left join filtered f on true
    where q.survey_id = p_survey_id
      and q.question_type = 'yes_no'
    group by q.code, q.question_number, q.title, q.sort_order
  ) result;

  return jsonb_build_object(
    'survey', jsonb_build_object(
      'id', v_survey.id,
      'title', v_survey.title,
      'status', v_survey.status
    ),
    'filters', jsonb_build_object(
      'departments', coalesce(v_departments_filter, '[]'::jsonb),
      'employeeCategories', coalesce(v_categories_filter, '[]'::jsonb),
      'tenureOptions', coalesce(v_tenure_filter, '[]'::jsonb),
      'applied', jsonb_build_object(
        'department', p_department,
        'employeeCategory', p_employee_category,
        'productionTenure', p_production_tenure
      )
    ),
    'totals', jsonb_build_object(
      'enps', v_enps,
      'q20Share', v_q20_share,
      'respondentCount', v_respondent_count,
      'employeeTotal', v_survey.employee_total,
      'responseRatePercent', coalesce(v_response_rate, 0)
    ),
    'departments', v_department_results,
    'yesNoQuestions', v_yes_questions
  );
end;
$$;

-- -----------------------------------------------------------------------------
-- RLS
-- -----------------------------------------------------------------------------

alter table public.surveys enable row level security;
alter table public.survey_questions enable row level security;
alter table public.survey_answers enable row level security;

drop policy if exists surveys_read_company on public.surveys;
create policy surveys_read_company on public.surveys
for select to authenticated
using (
  company_id = public.current_company_id()
  and (status <> 'draft' or public.is_admin())
);

drop policy if exists survey_questions_read_company on public.survey_questions;
create policy survey_questions_read_company on public.survey_questions
for select to authenticated
using (
  exists (
    select 1
    from public.surveys s
    where s.id = survey_questions.survey_id
      and s.company_id = public.current_company_id()
      and (s.status <> 'draft' or public.is_admin())
  )
);

drop policy if exists survey_answers_read_own_or_admin on public.survey_answers;
create policy survey_answers_read_own_or_admin on public.survey_answers
for select to authenticated
using (
  company_id = public.current_company_id()
  and (profile_id = public.current_profile_id() or public.is_admin())
);

drop policy if exists survey_answers_insert_own on public.survey_answers;
create policy survey_answers_insert_own on public.survey_answers
for insert to authenticated
with check (
  company_id = public.current_company_id()
  and profile_id = public.current_profile_id()
);

-- -----------------------------------------------------------------------------
-- Демо-опрос и вопросы
-- -----------------------------------------------------------------------------

do $$
declare
  v_company_id uuid;
  v_admin_id uuid;
begin
  select c.id
    into v_company_id
  from public.companies c
  where c.status = 'active'
  order by c.created_at
  limit 1;

  if v_company_id is null then
    raise exception 'Сначала создайте компанию из основной миграции/seed.';
  end if;

  select p.id
    into v_admin_id
  from public.profiles p
  where p.company_id = v_company_id and p.role = 'admin'
  order by p.created_at
  limit 1;

  insert into public.surveys (
    id,
    company_id,
    title,
    description,
    status,
    starts_at,
    ends_at,
    estimated_minutes,
    employee_total,
    created_by
  )
  values (
    '81000000-0000-4000-8000-000000000001',
    v_company_id,
    'Вовлечённость Q3 2026',
    'Опрос поможет оценить вовлечённость, качество взаимодействия и рабочие условия в подразделениях Бионит.',
    'active',
    '2026-07-01 00:00:00+00',
    '2026-09-30 20:59:59+00',
    12,
    134,
    v_admin_id
  )
  on conflict (id) do update set
    company_id = excluded.company_id,
    title = excluded.title,
    description = excluded.description,
    starts_at = excluded.starts_at,
    ends_at = excluded.ends_at,
    estimated_minutes = excluded.estimated_minutes,
    employee_total = excluded.employee_total,
    created_by = excluded.created_by;
end;
$$;

insert into public.survey_questions (
  id,
  survey_id,
  code,
  block,
  block_title,
  question_number,
  title,
  question_type,
  required,
  options,
  sort_order
)
values
  (
    '82000000-0000-4000-8000-000000000001',
    '81000000-0000-4000-8000-000000000001',
    'DEPARTMENT', 'demographics', 'Демография', null, 'Подразделение',
    'single_choice', true,
    '["Отдел главного инженера","ОБП","ОФП","ОФП 1 смена (верхний участок)","ОФП 1 смена (цоколь)","ОФП 1 смена (мансарда)","ОФП (упаковка)","Технологи/специалисты","ОФП 2 смена","Административный отдел","Отдел снабжения, маркетинга и сбыта","Финансовый отдел/Юридический отдел","ОКК"]'::jsonb,
    1
  ),
  (
    '82000000-0000-4000-8000-000000000002',
    '81000000-0000-4000-8000-000000000001',
    'GENDER', 'demographics', 'Демография', null, 'Пол',
    'single_choice', true, '["М","Ж"]'::jsonb, 2
  ),
  (
    '82000000-0000-4000-8000-000000000003',
    '81000000-0000-4000-8000-000000000001',
    'AGE', 'demographics', 'Демография', null, 'Возраст',
    'number', true, '[]'::jsonb, 3
  ),
  (
    '82000000-0000-4000-8000-000000000004',
    '81000000-0000-4000-8000-000000000001',
    'EMPLOYEE_CATEGORY', 'demographics', 'Демография', null, 'Категория сотрудника',
    'single_choice', true,
    '["Руководство и специалисты административного блока","Руководство и специалисты производственного блока","Специалисты и рабочие на производстве"]'::jsonb,
    4
  ),
  (
    '82000000-0000-4000-8000-000000000005',
    '81000000-0000-4000-8000-000000000001',
    'PRODUCTION_TENURE', 'demographics', 'Демография', null, 'Стаж на производстве',
    'single_choice', true,
    '["0-3 месяца","3-6 месяцев","6-12 месяцев","более 1 года"]'::jsonb,
    5
  ),
  ('82000000-0000-4000-8000-000000000010','81000000-0000-4000-8000-000000000001','Q1','scale','Оценка по шкале 1–5',1,'Оцените, насколько Вы довольны результатами своей работы','scale_1_5',true,'[]',10),
  ('82000000-0000-4000-8000-000000000011','81000000-0000-4000-8000-000000000001','Q2','scale','Оценка по шкале 1–5',2,'Я готов рекомендовать компанию Бионит как надёжного работодателя','scale_1_5',true,'[]',11),
  ('82000000-0000-4000-8000-000000000012','81000000-0000-4000-8000-000000000001','Q3','scale','Оценка по шкале 1–5',3,'Я готов рекомендовать продукцию, которую производит наша компания','scale_1_5',true,'[]',12),
  ('82000000-0000-4000-8000-000000000020','81000000-0000-4000-8000-000000000001','Q4','yes_no','Да / Нет',4,'Знаете ли Вы, чего ожидает от Вас работодатель?','yes_no',true,'[]',20),
  ('82000000-0000-4000-8000-000000000021','81000000-0000-4000-8000-000000000001','Q5','yes_no','Да / Нет',5,'У Вас есть материалы и инструменты, необходимые для качественной работы?','yes_no',true,'[]',21),
  ('82000000-0000-4000-8000-000000000022','81000000-0000-4000-8000-000000000001','Q6','yes_no','Да / Нет',6,'У Вас есть возможность каждый день делать то, что Вы умеете лучше всего?','yes_no',true,'[]',22),
  ('82000000-0000-4000-8000-000000000023','81000000-0000-4000-8000-000000000001','Q7','yes_no','Да / Нет',7,'За последние семь дней Вы получали признание или похвалу за хорошую работу?','yes_no',true,'[]',23),
  ('82000000-0000-4000-8000-000000000024','81000000-0000-4000-8000-000000000001','Q8','yes_no','Да / Нет',8,'Мой руководитель проводит со мной личные встречи и даёт обратную связь','yes_no',true,'[]',24),
  ('82000000-0000-4000-8000-000000000025','81000000-0000-4000-8000-000000000001','Q9','yes_no','Да / Нет',9,'За последние полгода кто-нибудь говорил с Вами о Ваших успехах?','yes_no',true,'[]',25),
  ('82000000-0000-4000-8000-000000000026','81000000-0000-4000-8000-000000000001','Q10','yes_no','Да / Нет',10,'Считаете ли Вы, что Ваш руководитель заботится о Вас как о личности?','yes_no',true,'[]',26),
  ('82000000-0000-4000-8000-000000000027','81000000-0000-4000-8000-000000000001','Q11','yes_no','Да / Нет',11,'В прошлом году у Вас были возможности учиться и расти на работе?','yes_no',true,'[]',27),
  ('82000000-0000-4000-8000-000000000028','81000000-0000-4000-8000-000000000001','Q12','yes_no','Да / Нет',12,'Считают ли Ваши коллеги своей обязанностью качественно выполнять работу?','yes_no',true,'[]',28),
  ('82000000-0000-4000-8000-000000000029','81000000-0000-4000-8000-000000000001','Q13','yes_no','Да / Нет',13,'Мои коллеги конструктивно и доброжелательно взаимодействуют со мной','yes_no',true,'[]',29),
  ('82000000-0000-4000-8000-000000000030','81000000-0000-4000-8000-000000000001','Q14','yes_no','Да / Нет',14,'Кто-нибудь на работе способствует Вашему развитию?','yes_no',true,'[]',30),
  ('82000000-0000-4000-8000-000000000031','81000000-0000-4000-8000-000000000001','Q15','yes_no','Да / Нет',15,'Учитывается ли Ваша точка зрения?','yes_no',true,'[]',31),
  ('82000000-0000-4000-8000-000000000032','81000000-0000-4000-8000-000000000001','Q16','yes_no','Да / Нет',16,'Я чувствую, что меня ценят на работе','yes_no',true,'[]',32),
  ('82000000-0000-4000-8000-000000000033','81000000-0000-4000-8000-000000000001','Q17','yes_no','Да / Нет',17,'Я могу свободно выражать своё мнение, не опасаясь негативных последствий','yes_no',true,'[]',33),
  ('82000000-0000-4000-8000-000000000034','81000000-0000-4000-8000-000000000001','Q18','yes_no','Да / Нет',18,'Уровень оплаты моего труда соответствует моему вкладу','yes_no',true,'[]',34),
  ('82000000-0000-4000-8000-000000000035','81000000-0000-4000-8000-000000000001','Q19','yes_no','Да / Нет',19,'Миссия и цель компании заставляют Вас чувствовать, что Ваша работа важна?','yes_no',true,'[]',35),
  ('82000000-0000-4000-8000-000000000036','81000000-0000-4000-8000-000000000001','Q20','yes_no','Да / Нет',20,'У Вас есть лучший друг на работе?','yes_no',true,'[]',36),
  ('82000000-0000-4000-8000-000000000040','81000000-0000-4000-8000-000000000001','Q21','open','Открытые вопросы',21,'Какие положительные изменения Вы заметили в работе компании за последние три месяца/полгода?','long_text',false,'[]',40),
  ('82000000-0000-4000-8000-000000000041','81000000-0000-4000-8000-000000000001','Q22','open','Открытые вопросы',22,'Что помогло бы Вам быть ещё более эффективным в работе?','long_text',false,'[]',41),
  ('82000000-0000-4000-8000-000000000042','81000000-0000-4000-8000-000000000001','Q23','open','Открытые вопросы',23,'Что должна сделать компания как работодатель, чтобы улучшить Вашу оценку?','long_text',false,'[]',42),
  ('82000000-0000-4000-8000-000000000043','81000000-0000-4000-8000-000000000001','Q24','open','Открытые вопросы',24,'Что больше всего Вам нравится в компании?','long_text',false,'[]',43)
on conflict (id) do update set
  survey_id = excluded.survey_id,
  code = excluded.code,
  block = excluded.block,
  block_title = excluded.block_title,
  question_number = excluded.question_number,
  title = excluded.title,
  question_type = excluded.question_type,
  required = excluded.required,
  options = excluded.options,
  sort_order = excluded.sort_order;

-- -----------------------------------------------------------------------------
-- 30 демонстрационных ответов
-- -----------------------------------------------------------------------------

do $$
declare
  v_company_id uuid;
  v_departments text[] := array[
    'Отдел главного инженера',
    'ОБП',
    'ОФП',
    'ОФП 1 смена (верхний участок)',
    'ОФП 1 смена (цоколь)',
    'ОФП 1 смена (мансарда)',
    'ОФП (упаковка)',
    'Технологи/специалисты',
    'ОФП 2 смена',
    'Административный отдел',
    'Отдел снабжения, маркетинга и сбыта',
    'Финансовый отдел/Юридический отдел',
    'ОКК'
  ];
  v_categories text[] := array[
    'Руководство и специалисты административного блока',
    'Руководство и специалисты производственного блока',
    'Специалисты и рабочие на производстве'
  ];
  v_tenure text[] := array[
    '0-3 месяца',
    '3-6 месяцев',
    '6-12 месяцев',
    'более 1 года'
  ];
  v_positive text[] := array[
    'Стало больше открытых встреч с руководителями и понятнее приоритеты.',
    'Улучшилась организация смен и информирование о производственных планах.',
    'Появилось больше обучения и полезных материалов по качеству.',
    'Быстрее решаются вопросы по инструментам и снабжению.',
    'Коллеги стали активнее делиться опытом между участками.'
  ];
  v_efficiency text[] := array[
    'Более стабильное обеспечение материалами и понятный график задач.',
    'Короткие еженедельные встречи с обратной связью.',
    'Дополнительное обучение по оборудованию и рабочим системам.',
    'Упрощение согласований и единое место для инструкций.',
    'Больше времени на профилактическое обслуживание оборудования.'
  ];
  v_employer text[] := array[
    'Чаще рассказывать о решениях компании и результатах подразделений.',
    'Развивать систему признания и понятные критерии премирования.',
    'Улучшить бытовые условия и зоны отдыха.',
    'Регулярно обсуждать карьерные и учебные возможности.',
    'Сократить время реакции на обращения сотрудников.'
  ];
  v_likes text[] := array[
    'Стабильность, полезная продукция и сильная команда.',
    'Отношение коллег и возможность видеть результат своего труда.',
    'История компании и внимание к качеству продукции.',
    'Профессиональные специалисты и взаимопомощь.',
    'Возможность учиться и участвовать в развитии производства.'
  ];
  i integer;
  v_answers jsonb;
begin
  select s.company_id
    into v_company_id
  from public.surveys s
  where s.id = '81000000-0000-4000-8000-000000000001';

  for i in 0..29 loop
    v_answers := jsonb_build_object(
      'Q1', 2 + ((i + 1) % 4),
      'Q2', 1 + ((i * 2 + 2) % 5),
      'Q3', 2 + ((i * 3 + 1) % 4),
      'Q4', ((i * 7 + 4 * 3) % 10) < 5,
      'Q5', ((i * 7 + 5 * 3) % 10) < 6,
      'Q6', ((i * 7 + 6 * 3) % 10) < 7,
      'Q7', ((i * 7 + 7 * 3) % 10) < 8,
      'Q8', ((i * 7 + 8 * 3) % 10) < 5,
      'Q9', ((i * 7 + 9 * 3) % 10) < 6,
      'Q10', ((i * 7 + 10 * 3) % 10) < 7,
      'Q11', ((i * 7 + 11 * 3) % 10) < 8,
      'Q12', ((i * 7 + 12 * 3) % 10) < 5,
      'Q13', ((i * 7 + 13 * 3) % 10) < 6,
      'Q14', ((i * 7 + 14 * 3) % 10) < 7,
      'Q15', ((i * 7 + 15 * 3) % 10) < 8,
      'Q16', ((i * 7 + 16 * 3) % 10) < 5,
      'Q17', ((i * 7 + 17 * 3) % 10) < 6,
      'Q18', ((i * 7 + 18 * 3) % 10) < 7,
      'Q19', ((i * 7 + 19 * 3) % 10) < 8,
      'Q20', (i % 3) <> 0,
      'Q21', case when i % 3 = 0 then v_positive[(i % 5) + 1] else '' end,
      'Q22', case when i % 4 = 0 then v_efficiency[(i % 5) + 1] else '' end,
      'Q23', case when i % 5 = 0 then v_employer[(i % 5) + 1] else '' end,
      'Q24', case when i % 2 = 0 then v_likes[(i % 5) + 1] else '' end
    );

    insert into public.survey_answers (
      id,
      survey_id,
      company_id,
      profile_id,
      department_name,
      gender,
      age,
      employee_category,
      production_tenure,
      answers,
      submitted_at
    )
    values (
      ('83000000-0000-4000-8000-' || lpad((i + 1)::text, 12, '0'))::uuid,
      '81000000-0000-4000-8000-000000000001',
      v_company_id,
      null,
      v_departments[(i % array_length(v_departments, 1)) + 1],
      case when i % 2 = 0 then 'Ж' else 'М' end,
      22 + ((i * 5) % 37),
      v_categories[(i % array_length(v_categories, 1)) + 1],
      v_tenure[(i % array_length(v_tenure, 1)) + 1],
      v_answers,
      '2026-07-01 08:15:00+00'::timestamptz
        + (i * interval '1 day')
        + ((i % 8) * interval '1 hour')
    )
    on conflict (id) do update set
      company_id = excluded.company_id,
      department_name = excluded.department_name,
      gender = excluded.gender,
      age = excluded.age,
      employee_category = excluded.employee_category,
      production_tenure = excluded.production_tenure,
      answers = excluded.answers,
      submitted_at = excluded.submitted_at;
  end loop;
end;
$$;

-- -----------------------------------------------------------------------------
-- Права на таблицы и RPC
-- -----------------------------------------------------------------------------

revoke all on public.surveys, public.survey_questions, public.survey_answers
  from anon, authenticated;

grant select on public.surveys, public.survey_questions, public.survey_answers
  to authenticated;

revoke execute on function public.assert_admin() from public, anon;
revoke execute on function public.is_admin() from public, anon;
revoke execute on function public.get_surveys() from public, anon;
revoke execute on function public.get_survey(uuid) from public, anon;
revoke execute on function public.submit_survey_response(uuid, text, text, integer, text, text, jsonb)
  from public, anon;
revoke execute on function public.get_admin_survey_control() from public, anon;
revoke execute on function public.admin_set_survey_status(uuid, public.survey_status)
  from public, anon;
revoke execute on function public.get_survey_results(uuid, text, text, text)
  from public, anon;

grant execute on function public.is_admin() to authenticated;
grant execute on function public.get_surveys() to authenticated;
grant execute on function public.get_survey(uuid) to authenticated;
grant execute on function public.submit_survey_response(uuid, text, text, integer, text, text, jsonb)
  to authenticated;
grant execute on function public.get_admin_survey_control() to authenticated;
grant execute on function public.admin_set_survey_status(uuid, public.survey_status)
  to authenticated;
grant execute on function public.get_survey_results(uuid, text, text, text)
  to authenticated;

commit;

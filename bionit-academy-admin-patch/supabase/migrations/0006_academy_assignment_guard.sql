-- Бионит В Деле: защита от повторного активного назначения одного курса.
-- Запустить в Supabase SQL Editor до рабочего тестирования интерфейса.
-- Существующие зачисления и попытки не удаляются.

CREATE OR REPLACE FUNCTION public.academy_create_assignment(
    p_profile_id uuid,
    p_class_ids uuid[],
    p_due_date date DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
    v_company_id uuid := public.current_company_id();
    v_actor_id uuid := public.current_profile_id();
    v_assignment_id uuid;
    v_class_id uuid;
    v_enrollment_id uuid;
    v_enrollment_status text;
    v_count integer := 0;
BEGIN
    IF NOT public.is_academy_admin() THEN
        RAISE EXCEPTION 'Недостаточно прав для назначения обучения.'
            USING ERRCODE = '42501';
    END IF;

    IF p_class_ids IS NULL OR cardinality(p_class_ids) = 0 THEN
        RAISE EXCEPTION 'Не выбраны курсы.';
    END IF;

    IF (SELECT company_id FROM public.profiles
        WHERE id = p_profile_id AND status = 'active')
        IS DISTINCT FROM v_company_id THEN
        RAISE EXCEPTION 'Активный сотрудник этой компании не найден.';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM unnest(p_class_ids) AS requested(class_id)
        LEFT JOIN public.learning_classes lc
          ON lc.id = requested.class_id
         AND lc.company_id = v_company_id
         AND lc.status = 'active'
        WHERE lc.id IS NULL
    ) THEN
        RAISE EXCEPTION 'Есть неактивный курс или курс другой компании.';
    END IF;

    IF cardinality(p_class_ids) <>
       (SELECT count(DISTINCT x) FROM unnest(p_class_ids) AS t(x)) THEN
        RAISE EXCEPTION 'В списке есть повторяющиеся курсы.';
    END IF;

    -- Не допускаем повторного активного назначения того же курса тому же сотруднику.
    IF EXISTS (
        SELECT 1
        FROM public.learning_assignments la
        JOIN public.learning_assignment_courses lac
          ON lac.assignment_id = la.id
        WHERE la.profile_id = p_profile_id
          AND la.company_id = v_company_id
          AND la.status IN ('assigned', 'in_progress')
          AND lac.status IN ('assigned', 'in_progress')
          AND lac.class_id = ANY(p_class_ids)
    ) THEN
        RAISE EXCEPTION 'Один или несколько курсов уже назначены этому сотруднику.';
    END IF;

    INSERT INTO public.learning_assignments(
        company_id, profile_id, assigned_by, due_date, status
    )
    VALUES (v_company_id, p_profile_id, v_actor_id, p_due_date, 'assigned')
    RETURNING id INTO v_assignment_id;

    FOREACH v_class_id IN ARRAY p_class_ids LOOP
        SELECT id, status::text
        INTO v_enrollment_id, v_enrollment_status
        FROM public.learning_enrollments
        WHERE profile_id = p_profile_id
          AND class_id = v_class_id
        FOR UPDATE;

        IF v_enrollment_id IS NULL THEN
            INSERT INTO public.learning_enrollments(
                profile_id, class_id, assignment_source
            )
            VALUES (p_profile_id, v_class_id, 'hr_manual')
            ON CONFLICT (profile_id, class_id) DO NOTHING;

            SELECT id, status::text
            INTO v_enrollment_id, v_enrollment_status
            FROM public.learning_enrollments
            WHERE profile_id = p_profile_id
              AND class_id = v_class_id
            FOR UPDATE;
        END IF;

        INSERT INTO public.learning_assignment_courses(
            assignment_id, class_id, enrollment_id, status
        )
        VALUES (
            v_assignment_id,
            v_class_id,
            v_enrollment_id,
            CASE WHEN v_enrollment_status = 'passed'
                 THEN 'completed' ELSE 'assigned' END
        );

        v_count := v_count + 1;
    END LOOP;

    -- Если все выбранные курсы уже были пройдены ранее,
    -- новое назначение сразу получает завершённый статус.
    UPDATE public.learning_assignments la
    SET status = 'completed',
        completed_at = now(),
        updated_at = now()
    WHERE la.id = v_assignment_id
      AND NOT EXISTS (
          SELECT 1
          FROM public.learning_assignment_courses lac
          WHERE lac.assignment_id = la.id
            AND lac.status <> 'completed'
      );

    INSERT INTO public.academy_audit_log(
        company_id, actor_profile_id, action, entity_type, entity_id, details
    )
    VALUES (
        v_company_id, v_actor_id, 'learning_assigned',
        'learning_assignment', v_assignment_id,
        jsonb_build_object(
            'profile_id', p_profile_id,
            'class_ids', to_jsonb(p_class_ids),
            'due_date', p_due_date
        )
    );

    RETURN jsonb_build_object(
        'assignmentId', v_assignment_id,
        'coursesAssigned', v_count
    );
END;
$function$;

REVOKE ALL ON FUNCTION public.academy_create_assignment(uuid, uuid[], date)
FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.academy_create_assignment(uuid, uuid[], date)
TO authenticated;

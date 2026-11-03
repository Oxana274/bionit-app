-- Академия Бионит: статус курса в каталоге.
CREATE OR REPLACE FUNCTION public.get_learning_catalog()
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
SELECT COALESCE(
    jsonb_agg(
        jsonb_build_object(
            'id', lc.id,
            'title', lc.title,
            'description', lc.description,
            'category', lc.category,
            'durationMinutes', lc.duration_minutes,
            'reward', lc.reward,
            'passThreshold', lc.pass_threshold,
            'maxAttempts', lc.max_attempts,
            'attemptsUsed', COALESCE(le.attempts_used, 0),
            'progressPercent', COALESCE(le.progress_percent, 0),
            'status', COALESCE(le.status, 'not_started'::public.learning_status),
            'courseStatus', lc.status,
            'modulesCount', (
                SELECT COUNT(*) FROM public.learning_modules lm WHERE lm.class_id = lc.id
            ),
            'coverKind', lc.cover_kind
        )
        ORDER BY lc.sort_order, lc.created_at
    ),
    '[]'::jsonb
)
FROM public.learning_classes lc
LEFT JOIN public.learning_enrollments le
    ON le.class_id = lc.id
   AND le.profile_id = public.current_profile_id()
WHERE lc.company_id = public.current_company_id()
  AND (
      public.is_academy_admin()
      OR (
          lc.status = 'active'
          AND EXISTS (
              SELECT 1
              FROM public.learning_assignment_courses lac
              JOIN public.learning_assignments la ON la.id = lac.assignment_id
              WHERE lac.class_id = lc.id
                AND la.profile_id = public.current_profile_id()
                AND la.company_id = public.current_company_id()
                AND la.status IN ('assigned', 'in_progress')
                AND lac.status IN ('assigned', 'in_progress')
          )
      )
      OR le.status = 'passed'
  );
$function$;

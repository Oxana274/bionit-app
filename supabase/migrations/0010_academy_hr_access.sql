-- Разрешение HR управлять Академией Бионит.
-- Существующие проверки интерфейса, страницы и API уже используют эту функцию.
-- Источник полномочий — роль профиля, определяемая current_profile_id() по auth.uid().
CREATE OR REPLACE FUNCTION public.is_academy_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT COALESCE(public.current_user_role() IN ('hr', 'admin'), false);
$function$;

REVOKE ALL ON FUNCTION public.is_academy_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_academy_admin() TO authenticated;

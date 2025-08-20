-- Fix the views to use security_definer instead of security_invoker
-- This allows the views to access the base tables with the definer's permissions

ALTER VIEW questions_public SET (security_definer = true);
ALTER VIEW fill_blank_exercises_public SET (security_definer = true);

-- Ensure views have proper permissions for authenticated and anon users
GRANT SELECT ON questions_public TO anon, authenticated;
GRANT SELECT ON fill_blank_exercises_public TO anon, authenticated;
-- Fix the security definer view issue by recreating views properly
-- Drop and recreate views as SECURITY INVOKER (default behavior)

DROP VIEW IF EXISTS public.questions_public;
DROP VIEW IF EXISTS public.fill_blank_exercises_public;

-- Create views without security definer (they inherit permissions properly)
CREATE VIEW public.questions_public AS
SELECT 
  id,
  category_id,
  question_text,
  question_type,
  difficulty_level,
  points_value,
  options,
  explanation,
  created_at
FROM public.questions;

CREATE VIEW public.fill_blank_exercises_public AS
SELECT 
  id,
  category_id,
  exercise_text,
  difficulty_level,
  created_at
FROM public.fill_blank_exercises;

-- Explicitly set views to use invoker security (safer)
ALTER VIEW public.questions_public SET (security_invoker = true);
ALTER VIEW public.fill_blank_exercises_public SET (security_invoker = true);

-- Grant access to the views
GRANT SELECT ON public.questions_public TO anon, authenticated;
GRANT SELECT ON public.fill_blank_exercises_public TO anon, authenticated;
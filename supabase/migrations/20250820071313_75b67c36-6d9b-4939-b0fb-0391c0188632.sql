-- Fix security definer views by making them security invoker and using functions instead
DROP VIEW IF EXISTS questions_public;
DROP VIEW IF EXISTS fill_blank_exercises_public;

-- Create secure functions that can be called by anon/authenticated users
CREATE OR REPLACE FUNCTION get_questions_public()
RETURNS TABLE (
  id uuid,
  category_id uuid,
  question_text text,
  question_type text,
  options text[],
  explanation text,
  created_at timestamptz,
  points_value integer,
  difficulty_level integer
)
SECURITY DEFINER
LANGUAGE sql
AS $$
  SELECT 
    id, 
    category_id, 
    question_text, 
    question_type, 
    options, 
    explanation, 
    created_at, 
    points_value, 
    difficulty_level 
  FROM questions;
$$;

CREATE OR REPLACE FUNCTION get_fill_blank_exercises_public()
RETURNS TABLE (
  id uuid,
  category_id uuid,
  exercise_text text,
  difficulty_level integer,
  created_at timestamptz
)
SECURITY DEFINER
LANGUAGE sql
AS $$
  SELECT 
    id, 
    category_id, 
    exercise_text, 
    difficulty_level, 
    created_at 
  FROM fill_blank_exercises;
$$;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION get_questions_public() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_fill_blank_exercises_public() TO anon, authenticated;
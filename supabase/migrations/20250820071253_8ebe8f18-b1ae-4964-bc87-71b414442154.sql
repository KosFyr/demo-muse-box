-- Drop and recreate the views with security definer
DROP VIEW IF EXISTS questions_public;
DROP VIEW IF EXISTS fill_blank_exercises_public;

-- Create questions_public view with security definer
CREATE VIEW questions_public
WITH (security_invoker = false)
AS SELECT 
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

-- Create fill_blank_exercises_public view with security definer  
CREATE VIEW fill_blank_exercises_public
WITH (security_invoker = false)
AS SELECT 
  id, 
  category_id, 
  exercise_text, 
  difficulty_level, 
  created_at 
FROM fill_blank_exercises;

-- Grant permissions to views
GRANT SELECT ON questions_public TO anon, authenticated;
GRANT SELECT ON fill_blank_exercises_public TO anon, authenticated;
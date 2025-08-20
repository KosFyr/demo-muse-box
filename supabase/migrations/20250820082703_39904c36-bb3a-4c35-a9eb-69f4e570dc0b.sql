-- Fix function search path security warnings by setting proper search_path
-- This secures the functions against potential search_path manipulation attacks

-- Update the get_questions_public function to have a secure search_path
CREATE OR REPLACE FUNCTION public.get_questions_public()
 RETURNS TABLE(id uuid, category_id uuid, question_text text, question_type text, options text[], explanation text, created_at timestamp with time zone, points_value integer, difficulty_level integer)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;

-- Update the get_fill_blank_exercises_public function to have a secure search_path
CREATE OR REPLACE FUNCTION public.get_fill_blank_exercises_public()
 RETURNS TABLE(id uuid, category_id uuid, exercise_text text, difficulty_level integer, created_at timestamp with time zone)
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT 
    id, 
    category_id, 
    exercise_text, 
    difficulty_level, 
    created_at 
  FROM fill_blank_exercises;
$function$;
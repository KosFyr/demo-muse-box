-- Create secure views for questions without exposing answers
-- This prevents cheating by hiding correct answers from the client

-- First drop existing policies that conflict with storage security
DROP POLICY IF EXISTS "Users can view all avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can upload their own avatar only" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar only" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar only" ON storage.objects;

-- Create a public view for questions without answers (no RLS on views)
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

-- Create a public view for fill blank exercises without answers
CREATE VIEW public.fill_blank_exercises_public AS
SELECT 
  id,
  category_id,
  exercise_text,
  difficulty_level,
  created_at
FROM public.fill_blank_exercises;

-- Revoke direct access to the original tables for regular users
REVOKE SELECT ON public.questions FROM anon, authenticated;
REVOKE SELECT ON public.fill_blank_exercises FROM anon, authenticated;

-- Grant access to the public views
GRANT SELECT ON public.questions_public TO anon, authenticated;
GRANT SELECT ON public.fill_blank_exercises_public TO anon, authenticated;

-- Improve avatar storage security with more restrictive policies
CREATE POLICY "Users can view all avatars" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar only" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
  AND (storage.extension(name)) IN ('jpg', 'jpeg', 'png', 'webp', 'gif')
);

CREATE POLICY "Users can update their own avatar only" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own avatar only" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
-- Create table for tracking question review status and mistakes
CREATE TABLE public.question_review_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id UUID NOT NULL,
  category_id UUID NOT NULL,
  needs_review BOOLEAN NOT NULL DEFAULT true,
  correct_streak INTEGER NOT NULL DEFAULT 0,
  total_attempts INTEGER NOT NULL DEFAULT 0,
  correct_attempts INTEGER NOT NULL DEFAULT 0,
  last_attempted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, question_id)
);

-- Enable RLS
ALTER TABLE public.question_review_status ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own review status" 
ON public.question_review_status 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own review status" 
ON public.question_review_status 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own review status" 
ON public.question_review_status 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for updating timestamps
CREATE TRIGGER update_question_review_status_updated_at
BEFORE UPDATE ON public.question_review_status
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_question_review_status_user_id ON public.question_review_status(user_id);
CREATE INDEX idx_question_review_status_needs_review ON public.question_review_status(user_id, needs_review);
CREATE INDEX idx_question_review_status_category ON public.question_review_status(user_id, category_id);
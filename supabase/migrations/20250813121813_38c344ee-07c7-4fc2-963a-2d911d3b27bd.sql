-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  difficulty_level INTEGER NOT NULL DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 5),
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create questions table
CREATE TABLE public.questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('true-false', 'matching', 'multiple-choice')),
  difficulty_level INTEGER NOT NULL DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 5),
  points_value INTEGER NOT NULL DEFAULT 10,
  correct_answer TEXT NOT NULL,
  options TEXT[],
  explanation TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create fill blank exercises table
CREATE TABLE public.fill_blank_exercises (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  exercise_text TEXT NOT NULL,
  answers TEXT[] NOT NULL,
  difficulty_level INTEGER NOT NULL DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create player progress table
CREATE TABLE public.player_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  current_position INTEGER NOT NULL DEFAULT 1,
  correct_answers INTEGER NOT NULL DEFAULT 0,
  total_questions_answered INTEGER NOT NULL DEFAULT 0,
  completion_percentage DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, category_id)
);

-- Enable Row Level Security
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fill_blank_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.player_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies for categories (public read)
CREATE POLICY "Categories are viewable by everyone" 
ON public.categories 
FOR SELECT 
USING (true);

-- RLS Policies for questions (public read)
CREATE POLICY "Questions are viewable by everyone" 
ON public.questions 
FOR SELECT 
USING (true);

-- RLS Policies for fill blank exercises (public read)
CREATE POLICY "Fill blank exercises are viewable by everyone" 
ON public.fill_blank_exercises 
FOR SELECT 
USING (true);

-- RLS Policies for profiles
CREATE POLICY "Profiles are viewable by everyone" 
ON public.profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- RLS Policies for player progress
CREATE POLICY "Users can view their own progress" 
ON public.player_progress 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own progress" 
ON public.player_progress 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" 
ON public.player_progress 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'display_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_player_progress_updated_at
BEFORE UPDATE ON public.player_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default category and sample questions
INSERT INTO public.categories (name, description, difficulty_level, order_index) VALUES
('Γενικές Γνώσεις', 'Ερωτήσεις γενικών γνώσεων', 1, 1);

-- Get the category ID for inserting questions (using proper array syntax)
INSERT INTO public.questions (category_id, question_text, question_type, difficulty_level, points_value, correct_answer, options, explanation)
SELECT c.id, 'Η Αθήνα είναι η πρωτεύουσα της Ελλάδας.', 'true-false', 1, 10, 'true', ARRAY['Σωστό', 'Λάθος'], 'Η Αθήνα είναι πράγματι η πρωτεύουσα της Ελλάδας.'
FROM public.categories c WHERE c.name = 'Γενικές Γνώσεις';

INSERT INTO public.questions (category_id, question_text, question_type, difficulty_level, points_value, correct_answer, options, explanation)
SELECT c.id, 'Ποια είναι η μεγαλύτερη χώρα στον κόσμο;', 'multiple-choice', 2, 15, 'Ρωσία', ARRAY['ΗΠΑ', 'Κίνα', 'Ρωσία', 'Καναδάς'], 'Η Ρωσία είναι η μεγαλύτερη χώρα στον κόσμο με έκταση 17.1 εκατομμύρια τετραγωνικά χιλιόμετρα.'
FROM public.categories c WHERE c.name = 'Γενικές Γνώσεις';

INSERT INTO public.questions (category_id, question_text, question_type, difficulty_level, points_value, correct_answer, options, explanation)
SELECT c.id, 'Ο Ήλιος είναι ένας πλανήτης.', 'true-false', 1, 10, 'false', ARRAY['Σωστό', 'Λάθος'], 'Ο Ήλιος είναι αστέρι, όχι πλανήτης.'
FROM public.categories c WHERE c.name = 'Γενικές Γνώσεις';

INSERT INTO public.questions (category_id, question_text, question_type, difficulty_level, points_value, correct_answer, options, explanation)
SELECT c.id, 'Πόσα χρόνια έχει μια δεκαετία;', 'multiple-choice', 1, 10, '10', ARRAY['5', '10', '15', '20'], 'Μια δεκαετία αποτελείται από 10 χρόνια.'
FROM public.categories c WHERE c.name = 'Γενικές Γνώσεις';
import { createClient } from '@supabase/supabase-js'

// These will be set via Supabase integration
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || ''
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseKey)

// Database types
export interface Category {
  id: string
  name: string
  description?: string
  difficulty_level: number
  order_index: number
  created_at: string
}

export interface Question {
  id: string
  category_id: string
  question_text: string
  question_type: 'true-false' | 'matching' | 'multiple-choice'
  difficulty_level: number
  points_value: number
  correct_answer: string
  options?: string[]
  explanation?: string
  created_at: string
}

export interface FillBlankExercise {
  id: string
  category_id: string
  exercise_text: string
  answers: string[]
  difficulty_level: number
  created_at: string
}

export interface PlayerProgress {
  id: string
  player_name: string
  avatar_image_url?: string
  category_id: string
  current_position: number
  correct_answers: number
  total_questions_answered: number
  completion_percentage: number
  created_at: string
  updated_at: string
}
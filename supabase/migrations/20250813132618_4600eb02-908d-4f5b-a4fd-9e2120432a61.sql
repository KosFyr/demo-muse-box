-- First, let's clear existing test questions
DELETE FROM public.questions;

-- Add fill-in-the-blank question type to the existing enum
ALTER TYPE question_type ADD VALUE IF NOT EXISTS 'fill-in-the-blank';

-- Create AEPP categories
INSERT INTO public.categories (name, description) VALUES
('Προβλήματα και Δεδομένα', 'Βασικές έννοιες προβλημάτων, δεδομένων και πληροφοριών'),
('Αλγόριθμοι', 'Ορισμός, χαρακτηριστικά και αναπαράσταση αλγορίθμων'),
('Δομές Δεδομένων', 'Βασικές λειτουργίες και μέθοδοι δομών δεδομένων'),
('Ταξινόμηση και Αναζήτηση', 'Μέθοδοι ταξινόμησης και αναζήτησης'),
('Γλώσσες Προγραμματισμού', 'Στοιχεία και χαρακτηριστικά γλωσσών προγραμματισμού');
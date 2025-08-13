-- Remove the check constraint that prevents fill-in-the-blank
ALTER TABLE public.questions DROP CONSTRAINT IF EXISTS questions_question_type_check;

-- Clear existing test questions
DELETE FROM public.questions;

-- Create AEPP categories
INSERT INTO public.categories (name, description) VALUES
('Προβλήματα και Δεδομένα', 'Βασικές έννοιες προβλημάτων, δεδομένων και πληροφοριών'),
('Αλγόριθμοι', 'Ορισμός, χαρακτηριστικά και αναπαράσταση αλγορίθμων'),
('Δομές Δεδομένων', 'Βασικές λειτουργίες και μέθοδοι δομών δεδομένων'),
('Ταξινόμηση και Αναζήτηση', 'Μέθοδοι ταξινόμησης και αναζήτησης'),
('Γλώσσες Προγραμματισμού', 'Στοιχεία και χαρακτηριστικά γλωσσών προγραμματισμού');
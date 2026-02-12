
-- Create technology_trainings table
CREATE TABLE public.technology_trainings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  province text NOT NULL,
  title text NOT NULL,
  training_date_start date,
  training_date_end date,
  venue text,
  participants_total integer DEFAULT 0,
  participants_female integer DEFAULT 0,
  participants_male integer DEFAULT 0,
  participants_senior integer DEFAULT 0,
  participants_differently_abled integer DEFAULT 0,
  firms_assisted integer DEFAULT 0,
  firm_names text,
  resource_persons text,
  counterpart text,
  approved_amount numeric DEFAULT 0,
  actual_expenses numeric DEFAULT 0,
  remarks text,
  status text DEFAULT 'draft',
  created_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.technology_trainings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Authenticated users can view technology trainings"
ON public.technology_trainings FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert technology trainings"
ON public.technology_trainings FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Authenticated users can update technology trainings"
ON public.technology_trainings FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete technology trainings"
ON public.technology_trainings FOR DELETE
TO authenticated
USING (created_by = auth.uid());

-- Trigger for updated_at
CREATE TRIGGER update_technology_trainings_updated_at
BEFORE UPDATE ON public.technology_trainings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

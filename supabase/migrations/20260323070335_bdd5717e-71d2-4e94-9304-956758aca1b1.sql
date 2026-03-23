CREATE TABLE public.gross_sales (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  province text NOT NULL,
  funding_type text NOT NULL DEFAULT 'SETUP',
  firm_name text NOT NULL,
  year integer NOT NULL DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)::integer,
  jan numeric DEFAULT 0,
  feb numeric DEFAULT 0,
  mar numeric DEFAULT 0,
  apr numeric DEFAULT 0,
  may numeric DEFAULT 0,
  jun numeric DEFAULT 0,
  jul numeric DEFAULT 0,
  aug numeric DEFAULT 0,
  sep numeric DEFAULT 0,
  oct numeric DEFAULT 0,
  nov numeric DEFAULT 0,
  dec numeric DEFAULT 0,
  remarks text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.gross_sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view gross sales"
  ON public.gross_sales FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert gross sales"
  ON public.gross_sales FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Authenticated users can update gross sales"
  ON public.gross_sales FOR UPDATE TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete gross sales"
  ON public.gross_sales FOR DELETE TO authenticated
  USING (created_by = auth.uid());
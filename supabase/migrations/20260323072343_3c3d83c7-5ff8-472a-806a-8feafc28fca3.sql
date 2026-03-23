
-- Add contact fields to gross_sales
ALTER TABLE public.gross_sales 
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS mobile_number text;

-- Create monthly details table
CREATE TABLE public.gross_sales_monthly_details (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gross_sales_id uuid NOT NULL REFERENCES public.gross_sales(id) ON DELETE CASCADE,
  month text NOT NULL,
  products text,
  production_volume text,
  existing_workers_male integer DEFAULT 0,
  existing_workers_female integer DEFAULT 0,
  new_workers_male integer DEFAULT 0,
  new_workers_female integer DEFAULT 0,
  market_outlets_male integer DEFAULT 0,
  market_outlets_female integer DEFAULT 0,
  raw_material_suppliers_male integer DEFAULT 0,
  raw_material_suppliers_female integer DEFAULT 0,
  business_status text,
  UNIQUE(gross_sales_id, month)
);

ALTER TABLE public.gross_sales_monthly_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view gross sales details"
  ON public.gross_sales_monthly_details FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert gross sales details"
  ON public.gross_sales_monthly_details FOR INSERT TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update gross sales details"
  ON public.gross_sales_monthly_details FOR UPDATE TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete gross sales details"
  ON public.gross_sales_monthly_details FOR DELETE TO authenticated
  USING (true);

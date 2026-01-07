-- Create travel_orders table
CREATE TABLE public.travel_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  travel_order_no TEXT NOT NULL,
  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  inclusive_dates_start DATE,
  inclusive_dates_end DATE,
  destinations TEXT,
  purpose TEXT,
  expense_type TEXT DEFAULT 'general_fund',
  expense_type_other TEXT,
  transportation_type TEXT DEFAULT 'official_vehicle',
  has_actual_expenses BOOLEAN DEFAULT false,
  has_per_diem BOOLEAN DEFAULT false,
  remarks TEXT,
  approved_by TEXT,
  approved_by_position TEXT,
  status TEXT DEFAULT 'draft',
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create travel_order_personnel table
CREATE TABLE public.travel_order_personnel (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  travel_order_id UUID NOT NULL REFERENCES public.travel_orders(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  position TEXT,
  division_agency TEXT,
  sort_order INTEGER DEFAULT 0
);

-- Create travel_order_expenses table
CREATE TABLE public.travel_order_expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  travel_order_id UUID NOT NULL REFERENCES public.travel_orders(id) ON DELETE CASCADE,
  expense_category TEXT NOT NULL,
  is_actual BOOLEAN DEFAULT false,
  is_per_diem BOOLEAN DEFAULT false,
  amount NUMERIC DEFAULT 0
);

-- Enable RLS on all tables
ALTER TABLE public.travel_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_order_personnel ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_order_expenses ENABLE ROW LEVEL SECURITY;

-- RLS policies for travel_orders
CREATE POLICY "Authenticated users can view travel orders"
ON public.travel_orders FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert travel orders"
ON public.travel_orders FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Authenticated users can update travel orders"
ON public.travel_orders FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete travel orders"
ON public.travel_orders FOR DELETE
TO authenticated
USING (created_by = auth.uid());

-- RLS policies for travel_order_personnel
CREATE POLICY "Authenticated users can view personnel"
ON public.travel_order_personnel FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert personnel"
ON public.travel_order_personnel FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update personnel"
ON public.travel_order_personnel FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete personnel"
ON public.travel_order_personnel FOR DELETE
TO authenticated
USING (true);

-- RLS policies for travel_order_expenses
CREATE POLICY "Authenticated users can view expenses"
ON public.travel_order_expenses FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can insert expenses"
ON public.travel_order_expenses FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update expenses"
ON public.travel_order_expenses FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete expenses"
ON public.travel_order_expenses FOR DELETE
TO authenticated
USING (true);

-- Create function to generate travel order number
CREATE OR REPLACE FUNCTION public.generate_travel_order_no()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_year TEXT;
  next_num INTEGER;
  new_to_no TEXT;
BEGIN
  current_year := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(travel_order_no FROM 2 FOR 6) AS INTEGER)), 0) + 1
  INTO next_num
  FROM public.travel_orders
  WHERE travel_order_no LIKE 'B' || SUBSTRING(current_year FROM 3) || '%';
  
  new_to_no := 'B' || SUBSTRING(current_year FROM 3) || LPAD(next_num::TEXT, 4, '0');
  
  RETURN new_to_no;
END;
$$;

-- Create trigger for updated_at
CREATE TRIGGER update_travel_orders_updated_at
BEFORE UPDATE ON public.travel_orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
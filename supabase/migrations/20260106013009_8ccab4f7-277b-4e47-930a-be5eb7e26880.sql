-- Fix update_updated_at_column function with proper search_path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Fix generate_tr_no function with proper search_path
CREATE OR REPLACE FUNCTION public.generate_tr_no()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_year TEXT;
  next_num INTEGER;
  new_tr_no TEXT;
BEGIN
  current_year := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(tr_no FROM 6) AS INTEGER)), 0) + 1
  INTO next_num
  FROM public.trip_tickets
  WHERE tr_no LIKE current_year || '-%';
  
  new_tr_no := current_year || '-' || LPAD(next_num::TEXT, 4, '0');
  
  RETURN new_tr_no;
END;
$$;
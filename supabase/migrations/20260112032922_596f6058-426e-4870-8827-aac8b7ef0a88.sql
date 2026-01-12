-- Add location columns to inventory_items table
ALTER TABLE public.inventory_items ADD COLUMN location_lat NUMERIC;
ALTER TABLE public.inventory_items ADD COLUMN location_lng NUMERIC;
ALTER TABLE public.inventory_items ADD COLUMN location_updated_at TIMESTAMP WITH TIME ZONE;
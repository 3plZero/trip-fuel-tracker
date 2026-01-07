-- Add location columns to vehicles table
ALTER TABLE public.vehicles
ADD COLUMN last_location_lat numeric,
ADD COLUMN last_location_lng numeric,
ADD COLUMN last_location_updated_at timestamp with time zone,
ADD COLUMN last_location_name text;
-- Add new columns to drivers table
ALTER TABLE public.drivers
ADD COLUMN nationality TEXT,
ADD COLUMN sex TEXT,
ADD COLUMN birthdate DATE,
ADD COLUMN weight NUMERIC,
ADD COLUMN height NUMERIC,
ADD COLUMN address TEXT,
ADD COLUMN license_image_url TEXT;

-- Create storage bucket for driver license images
INSERT INTO storage.buckets (id, name, public)
VALUES ('driver-licenses', 'driver-licenses', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to driver-licenses bucket
CREATE POLICY "Authenticated users can upload driver licenses"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'driver-licenses' AND auth.role() = 'authenticated');

-- Allow public read access to driver licenses
CREATE POLICY "Public can view driver licenses"
ON storage.objects
FOR SELECT
USING (bucket_id = 'driver-licenses');

-- Allow authenticated users to update driver licenses
CREATE POLICY "Authenticated users can update driver licenses"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'driver-licenses' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete driver licenses
CREATE POLICY "Authenticated users can delete driver licenses"
ON storage.objects
FOR DELETE
USING (bucket_id = 'driver-licenses' AND auth.role() = 'authenticated');
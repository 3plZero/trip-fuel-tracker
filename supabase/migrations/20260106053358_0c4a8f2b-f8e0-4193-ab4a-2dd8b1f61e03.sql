-- Add new columns for vehicle registration details
ALTER TABLE public.vehicles
ADD COLUMN IF NOT EXISTS engine_no TEXT,
ADD COLUMN IF NOT EXISTS chassis_no TEXT,
ADD COLUMN IF NOT EXISTS file_no TEXT,
ADD COLUMN IF NOT EXISTS mv_file_no TEXT,
ADD COLUMN IF NOT EXISTS vehicle_category TEXT,
ADD COLUMN IF NOT EXISTS make_brand TEXT,
ADD COLUMN IF NOT EXISTS body_type TEXT,
ADD COLUMN IF NOT EXISTS series TEXT,
ADD COLUMN IF NOT EXISTS gross_weight NUMERIC,
ADD COLUMN IF NOT EXISTS net_weight NUMERIC,
ADD COLUMN IF NOT EXISTS year_model TEXT,
ADD COLUMN IF NOT EXISTS year_rebuilt TEXT,
ADD COLUMN IF NOT EXISTS piston_displacement TEXT,
ADD COLUMN IF NOT EXISTS max_power TEXT,
ADD COLUMN IF NOT EXISTS passenger_capacity INTEGER,
ADD COLUMN IF NOT EXISTS color TEXT,
ADD COLUMN IF NOT EXISTS fuel_type TEXT,
ADD COLUMN IF NOT EXISTS registration_classification TEXT,
ADD COLUMN IF NOT EXISTS owner_name TEXT,
ADD COLUMN IF NOT EXISTS owner_address TEXT,
ADD COLUMN IF NOT EXISTS encumbered_to TEXT,
ADD COLUMN IF NOT EXISTS or_no TEXT,
ADD COLUMN IF NOT EXISTS or_date DATE,
ADD COLUMN IF NOT EXISTS cr_no TEXT,
ADD COLUMN IF NOT EXISTS remarks TEXT,
ADD COLUMN IF NOT EXISTS registration_image_url TEXT;

-- Create storage bucket for vehicle registrations
INSERT INTO storage.buckets (id, name, public)
VALUES ('vehicle-registrations', 'vehicle-registrations', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for vehicle-registrations bucket
CREATE POLICY "Authenticated users can upload vehicle registrations"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'vehicle-registrations');

CREATE POLICY "Authenticated users can update vehicle registrations"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'vehicle-registrations');

CREATE POLICY "Authenticated users can delete vehicle registrations"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'vehicle-registrations');

CREATE POLICY "Vehicle registrations are publicly readable"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'vehicle-registrations');
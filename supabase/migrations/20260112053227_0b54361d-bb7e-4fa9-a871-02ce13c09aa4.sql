-- Create table for inventory item scan logs
CREATE TABLE public.inventory_scan_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
  location_lat DOUBLE PRECISION,
  location_lng DOUBLE PRECISION,
  location_accuracy DOUBLE PRECISION,
  location_name TEXT,
  scanned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  user_agent TEXT,
  ip_address TEXT
);

-- Enable RLS
ALTER TABLE public.inventory_scan_logs ENABLE ROW LEVEL SECURITY;

-- Allow public inserts (for QR scans without login)
CREATE POLICY "Anyone can insert scan logs"
ON public.inventory_scan_logs
FOR INSERT
WITH CHECK (true);

-- Only authenticated users can view scan logs
CREATE POLICY "Authenticated users can view scan logs"
ON public.inventory_scan_logs
FOR SELECT
USING (auth.uid() IS NOT NULL);

-- Create index for faster lookups by item
CREATE INDEX idx_inventory_scan_logs_item_id ON public.inventory_scan_logs(item_id);
CREATE INDEX idx_inventory_scan_logs_scanned_at ON public.inventory_scan_logs(scanned_at DESC);
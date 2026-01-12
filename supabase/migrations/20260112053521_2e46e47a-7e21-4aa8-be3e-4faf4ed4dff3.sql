-- Add public SELECT policies for inventory items and images so QR scan page works without login

-- Allow anyone to view basic inventory item info (for QR scan)
CREATE POLICY "Anyone can view inventory items"
ON public.inventory_items
FOR SELECT
USING (true);

-- Allow anyone to view inventory item images (for QR scan)
CREATE POLICY "Anyone can view inventory item images"
ON public.inventory_item_images
FOR SELECT
USING (true);
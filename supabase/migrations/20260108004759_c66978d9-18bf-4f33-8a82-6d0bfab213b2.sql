-- Create function to generate product IDs
CREATE OR REPLACE FUNCTION public.generate_product_id()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_year TEXT;
  next_num INTEGER;
  new_product_id TEXT;
BEGIN
  current_year := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(product_id FROM 10) AS INTEGER)), 0) + 1
  INTO next_num
  FROM public.inventory_items
  WHERE product_id LIKE 'INV-' || current_year || '-%';
  
  new_product_id := 'INV-' || current_year || '-' || LPAD(next_num::TEXT, 4, '0');
  
  RETURN new_product_id;
END;
$$;

-- Create inventory_categories table
CREATE TABLE public.inventory_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on inventory_categories
ALTER TABLE public.inventory_categories ENABLE ROW LEVEL SECURITY;

-- RLS policies for inventory_categories
CREATE POLICY "Authenticated users can view inventory categories"
ON public.inventory_categories FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can insert inventory categories"
ON public.inventory_categories FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Authenticated users can update inventory categories"
ON public.inventory_categories FOR UPDATE
USING (true);

CREATE POLICY "Authenticated users can delete inventory categories"
ON public.inventory_categories FOR DELETE
USING (created_by = auth.uid());

-- Create inventory_items table
CREATE TABLE public.inventory_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES public.inventory_categories(id) ON DELETE SET NULL,
  product_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  date_received DATE,
  current_location TEXT,
  status TEXT DEFAULT 'active',
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on inventory_items
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;

-- RLS policies for inventory_items
CREATE POLICY "Authenticated users can view inventory items"
ON public.inventory_items FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can insert inventory items"
ON public.inventory_items FOR INSERT
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Authenticated users can update inventory items"
ON public.inventory_items FOR UPDATE
USING (true);

CREATE POLICY "Authenticated users can delete inventory items"
ON public.inventory_items FOR DELETE
USING (created_by = auth.uid());

-- Create inventory_item_images table
CREATE TABLE public.inventory_item_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID NOT NULL REFERENCES public.inventory_items(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on inventory_item_images
ALTER TABLE public.inventory_item_images ENABLE ROW LEVEL SECURITY;

-- RLS policies for inventory_item_images
CREATE POLICY "Authenticated users can view inventory item images"
ON public.inventory_item_images FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can insert inventory item images"
ON public.inventory_item_images FOR INSERT
WITH CHECK (true);

CREATE POLICY "Authenticated users can update inventory item images"
ON public.inventory_item_images FOR UPDATE
USING (true);

CREATE POLICY "Authenticated users can delete inventory item images"
ON public.inventory_item_images FOR DELETE
USING (true);

-- Create triggers for updated_at
CREATE TRIGGER update_inventory_categories_updated_at
BEFORE UPDATE ON public.inventory_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_inventory_items_updated_at
BEFORE UPDATE ON public.inventory_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for inventory images
INSERT INTO storage.buckets (id, name, public) VALUES ('inventory-images', 'inventory-images', true);

-- Storage policies for inventory-images bucket
CREATE POLICY "Inventory images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'inventory-images');

CREATE POLICY "Authenticated users can upload inventory images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'inventory-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update inventory images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'inventory-images' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete inventory images"
ON storage.objects FOR DELETE
USING (bucket_id = 'inventory-images' AND auth.role() = 'authenticated');
-- Add new columns to inventory_items table
ALTER TABLE public.inventory_items 
ADD COLUMN IF NOT EXISTS brand_model text,
ADD COLUMN IF NOT EXISTS property_number text,
ADD COLUMN IF NOT EXISTS property_tag text DEFAULT 'No Tag',
ADD COLUMN IF NOT EXISTS serial_number text,
ADD COLUMN IF NOT EXISTS quantity integer DEFAULT 1,
ADD COLUMN IF NOT EXISTS unit_cost numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_cost numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS condition text DEFAULT 'Good Condition',
ADD COLUMN IF NOT EXISTS accountable_person text,
ADD COLUMN IF NOT EXISTS utilization_status text DEFAULT 'In Use',
ADD COLUMN IF NOT EXISTS remarks text,
ADD COLUMN IF NOT EXISTS accountability_document text,
ADD COLUMN IF NOT EXISTS property_from text;

-- Insert default categories based on the Excel file
INSERT INTO public.inventory_categories (name, description) VALUES
('Information and Communication Technology (ICT) Equipment', 'Computers, laptops, tablets, and related ICT devices'),
('Printing, Scanning, and Imaging Equipment', 'Printers, scanners, photocopiers, and imaging devices'),
('Networking and Communication Equipment', 'Routers, switches, modems, and communication devices'),
('Office Furniture and Fixtures', 'Desks, chairs, cabinets, and office fixtures'),
('Audio-Visual and Documentation Equipment', 'Projectors, cameras, audio equipment, and documentation tools'),
('Power, Electrical, and Support Equipment', 'UPS, AVR, power supplies, and electrical support devices'),
('Office Machines and Specialized Equipment', 'Specialized office machines and equipment'),
('Storage, Safety, and Security Equipment', 'Safes, lockers, fire extinguishers, and security devices'),
('Tools and Maintenance Equipment', 'Hand tools, power tools, and maintenance equipment'),
('Miscellaneous Office Equipment & Supplies', 'General office equipment and supplies'),
('Vehicle & Vehicle Accessories/Supplies', 'Vehicles and vehicle-related accessories'),
('Office Appliances', 'Air conditioners, refrigerators, water dispensers, and appliances')
ON CONFLICT DO NOTHING;
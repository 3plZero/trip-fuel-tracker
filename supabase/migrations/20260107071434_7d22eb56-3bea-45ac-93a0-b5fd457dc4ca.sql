-- Create generators table
CREATE TABLE public.generators (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  equipment_name TEXT NOT NULL,
  serial_no TEXT,
  type_model_no TEXT,
  location TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create buildings table
CREATE TABLE public.buildings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  building_name TEXT NOT NULL,
  location TEXT,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create vehicle_maintenance_checklists table
CREATE TABLE public.vehicle_maintenance_checklists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE,
  checklist_month DATE NOT NULL,
  performed_by TEXT,
  location TEXT,
  status TEXT DEFAULT 'draft',
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create vehicle_maintenance_checks table
CREATE TABLE public.vehicle_maintenance_checks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  checklist_id UUID NOT NULL REFERENCES public.vehicle_maintenance_checklists(id) ON DELETE CASCADE,
  check_item TEXT NOT NULL,
  check_category TEXT NOT NULL,
  day_1 BOOLEAN DEFAULT false,
  day_2 BOOLEAN DEFAULT false,
  day_3 BOOLEAN DEFAULT false,
  day_4 BOOLEAN DEFAULT false,
  day_5 BOOLEAN DEFAULT false,
  remarks TEXT
);

-- Create generator_maintenance_checklists table
CREATE TABLE public.generator_maintenance_checklists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  generator_id UUID REFERENCES public.generators(id) ON DELETE CASCADE,
  checklist_month DATE NOT NULL,
  performed_by TEXT,
  status TEXT DEFAULT 'draft',
  monitoring_notes TEXT,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create generator_maintenance_checks table
CREATE TABLE public.generator_maintenance_checks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  checklist_id UUID NOT NULL REFERENCES public.generator_maintenance_checklists(id) ON DELETE CASCADE,
  check_item TEXT NOT NULL,
  week_2 BOOLEAN DEFAULT false,
  week_4 BOOLEAN DEFAULT false,
  remarks TEXT
);

-- Create building_maintenance_checklists table
CREATE TABLE public.building_maintenance_checklists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  building_id UUID REFERENCES public.buildings(id) ON DELETE CASCADE,
  checklist_month DATE NOT NULL,
  checklist_year INTEGER NOT NULL,
  performed_by TEXT,
  location TEXT,
  status TEXT DEFAULT 'draft',
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create building_maintenance_checks table
CREATE TABLE public.building_maintenance_checks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  checklist_id UUID NOT NULL REFERENCES public.building_maintenance_checklists(id) ON DELETE CASCADE,
  check_item TEXT NOT NULL,
  check_category TEXT NOT NULL,
  week_1 BOOLEAN DEFAULT false,
  week_2 BOOLEAN DEFAULT false,
  week_3 BOOLEAN DEFAULT false,
  week_4 BOOLEAN DEFAULT false,
  remarks TEXT
);

-- Enable RLS on all tables
ALTER TABLE public.generators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_maintenance_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicle_maintenance_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generator_maintenance_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generator_maintenance_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.building_maintenance_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.building_maintenance_checks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for generators
CREATE POLICY "Authenticated users can view generators" ON public.generators FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert generators" ON public.generators FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can update generators" ON public.generators FOR UPDATE USING (true);
CREATE POLICY "Authenticated users can delete generators" ON public.generators FOR DELETE USING (true);

-- RLS Policies for buildings
CREATE POLICY "Authenticated users can view buildings" ON public.buildings FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert buildings" ON public.buildings FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can update buildings" ON public.buildings FOR UPDATE USING (true);
CREATE POLICY "Authenticated users can delete buildings" ON public.buildings FOR DELETE USING (true);

-- RLS Policies for vehicle_maintenance_checklists
CREATE POLICY "Authenticated users can view vehicle maintenance checklists" ON public.vehicle_maintenance_checklists FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert vehicle maintenance checklists" ON public.vehicle_maintenance_checklists FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Authenticated users can update vehicle maintenance checklists" ON public.vehicle_maintenance_checklists FOR UPDATE USING (true);
CREATE POLICY "Authenticated users can delete vehicle maintenance checklists" ON public.vehicle_maintenance_checklists FOR DELETE USING (created_by = auth.uid());

-- RLS Policies for vehicle_maintenance_checks
CREATE POLICY "Authenticated users can view vehicle maintenance checks" ON public.vehicle_maintenance_checks FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert vehicle maintenance checks" ON public.vehicle_maintenance_checks FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can update vehicle maintenance checks" ON public.vehicle_maintenance_checks FOR UPDATE USING (true);
CREATE POLICY "Authenticated users can delete vehicle maintenance checks" ON public.vehicle_maintenance_checks FOR DELETE USING (true);

-- RLS Policies for generator_maintenance_checklists
CREATE POLICY "Authenticated users can view generator maintenance checklists" ON public.generator_maintenance_checklists FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert generator maintenance checklists" ON public.generator_maintenance_checklists FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Authenticated users can update generator maintenance checklists" ON public.generator_maintenance_checklists FOR UPDATE USING (true);
CREATE POLICY "Authenticated users can delete generator maintenance checklists" ON public.generator_maintenance_checklists FOR DELETE USING (created_by = auth.uid());

-- RLS Policies for generator_maintenance_checks
CREATE POLICY "Authenticated users can view generator maintenance checks" ON public.generator_maintenance_checks FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert generator maintenance checks" ON public.generator_maintenance_checks FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can update generator maintenance checks" ON public.generator_maintenance_checks FOR UPDATE USING (true);
CREATE POLICY "Authenticated users can delete generator maintenance checks" ON public.generator_maintenance_checks FOR DELETE USING (true);

-- RLS Policies for building_maintenance_checklists
CREATE POLICY "Authenticated users can view building maintenance checklists" ON public.building_maintenance_checklists FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert building maintenance checklists" ON public.building_maintenance_checklists FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Authenticated users can update building maintenance checklists" ON public.building_maintenance_checklists FOR UPDATE USING (true);
CREATE POLICY "Authenticated users can delete building maintenance checklists" ON public.building_maintenance_checklists FOR DELETE USING (created_by = auth.uid());

-- RLS Policies for building_maintenance_checks
CREATE POLICY "Authenticated users can view building maintenance checks" ON public.building_maintenance_checks FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert building maintenance checks" ON public.building_maintenance_checks FOR INSERT WITH CHECK (true);
CREATE POLICY "Authenticated users can update building maintenance checks" ON public.building_maintenance_checks FOR UPDATE USING (true);
CREATE POLICY "Authenticated users can delete building maintenance checks" ON public.building_maintenance_checks FOR DELETE USING (true);

-- Add triggers for updated_at
CREATE TRIGGER update_generators_updated_at BEFORE UPDATE ON public.generators FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_buildings_updated_at BEFORE UPDATE ON public.buildings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_vehicle_maintenance_checklists_updated_at BEFORE UPDATE ON public.vehicle_maintenance_checklists FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_generator_maintenance_checklists_updated_at BEFORE UPDATE ON public.generator_maintenance_checklists FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_building_maintenance_checklists_updated_at BEFORE UPDATE ON public.building_maintenance_checklists FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
-- Create a generic audit trigger function
CREATE OR REPLACE FUNCTION public.audit_trigger_function()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (user_id, action, table_name, record_id, new_data)
    VALUES (auth.uid(), 'insert', TG_TABLE_NAME, NEW.id, to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_logs (user_id, action, table_name, record_id, old_data, new_data)
    VALUES (auth.uid(), 'update', TG_TABLE_NAME, NEW.id, to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_logs (user_id, action, table_name, record_id, old_data)
    VALUES (auth.uid(), 'delete', TG_TABLE_NAME, OLD.id, to_jsonb(OLD));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Add triggers to all main tables

-- Vehicles
CREATE TRIGGER audit_vehicles
  AFTER INSERT OR UPDATE OR DELETE ON public.vehicles
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

-- Drivers
CREATE TRIGGER audit_drivers
  AFTER INSERT OR UPDATE OR DELETE ON public.drivers
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

-- Trip Tickets
CREATE TRIGGER audit_trip_tickets
  AFTER INSERT OR UPDATE OR DELETE ON public.trip_tickets
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

-- Travel Orders
CREATE TRIGGER audit_travel_orders
  AFTER INSERT OR UPDATE OR DELETE ON public.travel_orders
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

-- Inventory Items
CREATE TRIGGER audit_inventory_items
  AFTER INSERT OR UPDATE OR DELETE ON public.inventory_items
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

-- Inventory Categories
CREATE TRIGGER audit_inventory_categories
  AFTER INSERT OR UPDATE OR DELETE ON public.inventory_categories
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

-- Buildings
CREATE TRIGGER audit_buildings
  AFTER INSERT OR UPDATE OR DELETE ON public.buildings
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

-- Generators
CREATE TRIGGER audit_generators
  AFTER INSERT OR UPDATE OR DELETE ON public.generators
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

-- Vehicle Maintenance Checklists
CREATE TRIGGER audit_vehicle_maintenance_checklists
  AFTER INSERT OR UPDATE OR DELETE ON public.vehicle_maintenance_checklists
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

-- Building Maintenance Checklists
CREATE TRIGGER audit_building_maintenance_checklists
  AFTER INSERT OR UPDATE OR DELETE ON public.building_maintenance_checklists
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

-- Generator Maintenance Checklists
CREATE TRIGGER audit_generator_maintenance_checklists
  AFTER INSERT OR UPDATE OR DELETE ON public.generator_maintenance_checklists
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

-- Profiles
CREATE TRIGGER audit_profiles
  AFTER INSERT OR UPDATE OR DELETE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();

-- User Roles
CREATE TRIGGER audit_user_roles
  AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_function();
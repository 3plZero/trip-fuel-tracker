-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  position TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  UNIQUE (user_id, role)
);

-- Create vehicles table
CREATE TABLE public.vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plate_no TEXT NOT NULL UNIQUE,
  description TEXT,
  vehicle_type TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create drivers table
CREATE TABLE public.drivers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  license_no TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trip_tickets table
CREATE TABLE public.trip_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tr_no TEXT NOT NULL UNIQUE,
  ticket_date DATE NOT NULL DEFAULT CURRENT_DATE,
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
  driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL,
  purpose TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'completed', 'cancelled')),
  -- Fuel data
  balance_tank_start DECIMAL(10,2) DEFAULT 0,
  issued_from_stock DECIMAL(10,2) DEFAULT 0,
  purchased_outside DECIMAL(10,2) DEFAULT 0,
  gasoline_used DECIMAL(10,2) DEFAULT 0,
  balance_tank_end DECIMAL(10,2) DEFAULT 0,
  -- Oils and grease
  gear_oil_used DECIMAL(10,2) DEFAULT 0,
  motor_oil_used DECIMAL(10,2) DEFAULT 0,
  brake_fluid_used DECIMAL(10,2) DEFAULT 0,
  grease_used DECIMAL(10,2) DEFAULT 0,
  -- Distance
  total_distance DECIMAL(10,2) DEFAULT 0,
  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create trip_ticket_passengers table
CREATE TABLE public.trip_ticket_passengers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_ticket_id UUID REFERENCES public.trip_tickets(id) ON DELETE CASCADE NOT NULL,
  passenger_name TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0
);

-- Create trip_ticket_destinations table
CREATE TABLE public.trip_ticket_destinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_ticket_id UUID REFERENCES public.trip_tickets(id) ON DELETE CASCADE NOT NULL,
  destination TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0
);

-- Create trip_details table (individual trips within a ticket)
CREATE TABLE public.trip_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_ticket_id UUID REFERENCES public.trip_tickets(id) ON DELETE CASCADE NOT NULL,
  trip_no INTEGER NOT NULL,
  trip_date DATE,
  departure_time TIME,
  departure_place TEXT,
  arrival_time TIME,
  arrival_place TEXT,
  odometer_initial DECIMAL(10,2),
  odometer_end DECIMAL(10,2),
  sort_order INTEGER DEFAULT 0
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_ticket_passengers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_ticket_destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_details ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name');
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON public.vehicles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_drivers_updated_at BEFORE UPDATE ON public.drivers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_trip_tickets_updated_at BEFORE UPDATE ON public.trip_tickets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for user_roles (read-only for users)
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

-- RLS Policies for vehicles (all authenticated users can view)
CREATE POLICY "Authenticated users can view vehicles" ON public.vehicles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert vehicles" ON public.vehicles FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update vehicles" ON public.vehicles FOR UPDATE TO authenticated USING (true);

-- RLS Policies for drivers (all authenticated users can view)
CREATE POLICY "Authenticated users can view drivers" ON public.drivers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert drivers" ON public.drivers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update drivers" ON public.drivers FOR UPDATE TO authenticated USING (true);

-- RLS Policies for trip_tickets
CREATE POLICY "Authenticated users can view trip tickets" ON public.trip_tickets FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert trip tickets" ON public.trip_tickets FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Authenticated users can update trip tickets" ON public.trip_tickets FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete trip tickets" ON public.trip_tickets FOR DELETE TO authenticated USING (created_by = auth.uid());

-- RLS Policies for trip_ticket_passengers
CREATE POLICY "Authenticated users can view passengers" ON public.trip_ticket_passengers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert passengers" ON public.trip_ticket_passengers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update passengers" ON public.trip_ticket_passengers FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete passengers" ON public.trip_ticket_passengers FOR DELETE TO authenticated USING (true);

-- RLS Policies for trip_ticket_destinations
CREATE POLICY "Authenticated users can view destinations" ON public.trip_ticket_destinations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert destinations" ON public.trip_ticket_destinations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update destinations" ON public.trip_ticket_destinations FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete destinations" ON public.trip_ticket_destinations FOR DELETE TO authenticated USING (true);

-- RLS Policies for trip_details
CREATE POLICY "Authenticated users can view trip details" ON public.trip_details FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert trip details" ON public.trip_details FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update trip details" ON public.trip_details FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete trip details" ON public.trip_details FOR DELETE TO authenticated USING (true);

-- Function to generate TR number
CREATE OR REPLACE FUNCTION public.generate_tr_no()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  current_year TEXT;
  next_num INTEGER;
  new_tr_no TEXT;
BEGIN
  current_year := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(tr_no FROM 6) AS INTEGER)), 0) + 1
  INTO next_num
  FROM public.trip_tickets
  WHERE tr_no LIKE current_year || '-%';
  
  new_tr_no := current_year || '-' || LPAD(next_num::TEXT, 4, '0');
  
  RETURN new_tr_no;
END;
$$;
import { useParams, useNavigate, Link } from 'react-router-dom';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowLeft, Pencil, Printer, Check, X } from 'lucide-react';
import { format } from 'date-fns';

const CHECKLIST_LABELS: Record<string, string> = {
  tires_pressure: '1. Tires (Proper pressure and condition)',
  wheel_nuts: '2. Wheel Nuts (Must be tight and lug bolts must be complete)',
  wheel_rim: '3. Wheel Rim (Must not be bent or cracked)',
  oil_gasoline_leaks: '4. Oil and Gasoline Leaks/hoses (Check leaks on floor/ground)',
  lights_reflector: '5. Lights and Reflector (Must be functional)',
  battery: 'B - Battery (Must be functional)',
  lights: 'L - Lights (Must be functional)',
  oil_check: 'O - Oil Check (Check oil level)',
  water: 'W - Water (Check radiator water level)',
  brakes: 'B - Brakes (Check brake fluid level)',
  air_filter: 'A - Air Filter (Check if clean)',
  gas: 'G - Gas (Check fuel level)',
  engine: 'E - Engine (Check engine condition)',
  tire_spare: 'T - Tire/Spare Tire (Check spare tire condition)',
  self_tools: 'S - Self/Tools (Check tools availability)',
  engine_oil_level: '1. Engine Oil Level',
  coolant_level: '2. Coolant Level',
  brake_fluid_level: '3. Brake Fluid Level',
  belts_hoses: '4. Belts and Hoses',
  warning_lights: '1. Warning Lights (All must turn off after starting)',
};

const CATEGORY_TITLES: Record<string, string> = {
  outside_vehicle: 'A.I. Outside the Vehicle',
  inside_vehicle: 'A.II. Inside the Vehicle (BLOWBAGETS)',
  engine_compartment: 'A.III. Engine Compartment',
  after_starting: 'B. After Starting Engine',
};

export default function VehicleMaintenanceView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: checklist, isLoading } = useQuery({
    queryKey: ['vehicle-maintenance-checklist', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vehicle_maintenance_checklists')
        .select('*, vehicles(plate_no, make_brand), vehicle_maintenance_checks(*)')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!checklist) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Checklist not found</p>
        <Link to="/vehicle-maintenance">
          <Button className="mt-4">Back to List</Button>
        </Link>
      </div>
    );
  }

  const checksByCategory = checklist.vehicle_maintenance_checks?.reduce(
    (acc: Record<string, any[]>, check: any) => {
      if (!acc[check.check_category]) {
        acc[check.check_category] = [];
      }
      acc[check.check_category].push(check);
      return acc;
    },
    {}
  );

  const renderCheckIcon = (value: boolean) => {
    return value ? (
      <Check className="h-4 w-4 text-green-600 mx-auto" />
    ) : (
      <X className="h-4 w-4 text-muted-foreground mx-auto" />
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/vehicle-maintenance')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">Vehicle Maintenance Checklist</h1>
          <Badge variant={checklist.status === 'completed' ? 'default' : 'secondary'}>
            {checklist.status}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-2" /> Print
          </Button>
          <Link to={`/vehicle-maintenance/${id}/edit`}>
            <Button>
              <Pencil className="h-4 w-4 mr-2" /> Edit
            </Button>
          </Link>
        </div>
      </div>

      {/* Header Info */}
      <Card>
        <CardHeader>
          <CardTitle>Checklist Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Vehicle</p>
              <p className="font-medium">
                {checklist.vehicles?.plate_no} - {checklist.vehicles?.make_brand}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Month</p>
              <p className="font-medium">
                {format(new Date(checklist.checklist_month), 'MMMM yyyy')}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Performed By</p>
              <p className="font-medium">{checklist.performed_by || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Location</p>
              <p className="font-medium">{checklist.location || 'N/A'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Checklist Sections */}
      {Object.entries(CATEGORY_TITLES).map(([category, title]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="text-lg">{title}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Check Item</TableHead>
                  <TableHead className="text-center">Day 1</TableHead>
                  <TableHead className="text-center">Day 2</TableHead>
                  <TableHead className="text-center">Day 3</TableHead>
                  <TableHead className="text-center">Day 4</TableHead>
                  <TableHead className="text-center">Day 5</TableHead>
                  <TableHead>Remarks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {checksByCategory?.[category]?.map((check: any) => (
                  <TableRow key={check.id}>
                    <TableCell className="text-sm">
                      {CHECKLIST_LABELS[check.check_item] || check.check_item}
                    </TableCell>
                    <TableCell className="text-center">{renderCheckIcon(check.day_1)}</TableCell>
                    <TableCell className="text-center">{renderCheckIcon(check.day_2)}</TableCell>
                    <TableCell className="text-center">{renderCheckIcon(check.day_3)}</TableCell>
                    <TableCell className="text-center">{renderCheckIcon(check.day_4)}</TableCell>
                    <TableCell className="text-center">{renderCheckIcon(check.day_5)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {check.remarks || '-'}
                    </TableCell>
                  </TableRow>
                )) || (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No checks recorded
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

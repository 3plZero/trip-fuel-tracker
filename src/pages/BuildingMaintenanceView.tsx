import { useParams, useNavigate, Link } from 'react-router-dom';
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
  doors_windows: 'Doors and Windows (Locks, hinges, glass)',
  walls_ceilings: 'Walls and Ceilings (Cracks, paint, stains)',
  floors: 'Floors (Tiles, cracks, cleanliness)',
  roof: 'Roof (Leaks, gutters, drainage)',
  signage: 'Signage (Condition, visibility)',
  parking: 'Parking Area (Lines, lighting, cleanliness)',
  landscaping: 'Landscaping (Plants, grass, cleanliness)',
  security: 'Security Features (CCTV, alarms, locks)',
  lighting_fixtures: 'Lighting Fixtures (Bulbs, switches, wiring)',
  outlets_switches: 'Electrical Outlets and Switches',
  breaker_panel: 'Breaker Panel (Labels, functionality)',
  faucets_sinks: 'Faucets and Sinks (Leaks, drainage)',
  toilets: 'Toilets (Flush, leaks, cleanliness)',
  water_heater: 'Water Heater (Temperature, leaks)',
  pipes_drains: 'Pipes and Drains (Leaks, clogs)',
  water_supply: 'Water Supply (Pressure, quality)',
};

const CATEGORY_TITLES: Record<string, string> = {
  exterior_interior: 'Exterior and Interior',
  electrical: 'Electrical Systems',
  plumbing: 'Plumbing Systems',
};

export default function BuildingMaintenanceView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: checklist, isLoading } = useQuery({
    queryKey: ['building-maintenance-checklist', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('building_maintenance_checklists')
        .select('*, buildings(building_name), building_maintenance_checks(*)')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return <div className="flex items-center justify-center py-8">Loading...</div>;
  }

  if (!checklist) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Checklist not found</p>
        <Link to="/building-maintenance">
          <Button className="mt-4">Back to List</Button>
        </Link>
      </div>
    );
  }

  const checksByCategory = checklist.building_maintenance_checks?.reduce(
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
          <Button variant="ghost" size="icon" onClick={() => navigate('/building-maintenance')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">Building Maintenance Checklist</h1>
          <Badge variant={checklist.status === 'completed' ? 'default' : 'secondary'}>
            {checklist.status}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-2" /> Print
          </Button>
          <Link to={`/building-maintenance/${id}/edit`}>
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
              <p className="text-sm text-muted-foreground">Building</p>
              <p className="font-medium">{checklist.buildings?.building_name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Month/Year</p>
              <p className="font-medium">
                {format(new Date(checklist.checklist_month), 'MMMM')} {checklist.checklist_year}
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
                  <TableHead className="text-center">Week 1</TableHead>
                  <TableHead className="text-center">Week 2</TableHead>
                  <TableHead className="text-center">Week 3</TableHead>
                  <TableHead className="text-center">Week 4</TableHead>
                  <TableHead>Remarks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {checksByCategory?.[category]?.map((check: any) => (
                  <TableRow key={check.id}>
                    <TableCell className="text-sm">
                      {CHECKLIST_LABELS[check.check_item] || check.check_item}
                    </TableCell>
                    <TableCell className="text-center">{renderCheckIcon(check.week_1)}</TableCell>
                    <TableCell className="text-center">{renderCheckIcon(check.week_2)}</TableCell>
                    <TableCell className="text-center">{renderCheckIcon(check.week_3)}</TableCell>
                    <TableCell className="text-center">{renderCheckIcon(check.week_4)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {check.remarks || '-'}
                    </TableCell>
                  </TableRow>
                )) || (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
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

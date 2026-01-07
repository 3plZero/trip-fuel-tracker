import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Car, Building2, Zap, Plus, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function MaintenanceDashboard() {
  const { data: vehicleChecklists } = useQuery({
    queryKey: ['vehicle-maintenance-checklists'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vehicle_maintenance_checklists')
        .select('*, vehicles(plate_no, make_brand)')
        .order('created_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
  });

  const { data: buildingChecklists } = useQuery({
    queryKey: ['building-maintenance-checklists'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('building_maintenance_checklists')
        .select('*, buildings(building_name)')
        .order('created_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
  });

  const { data: generatorChecklists } = useQuery({
    queryKey: ['generator-maintenance-checklists'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('generator_maintenance_checklists')
        .select('*, generators(equipment_name)')
        .order('created_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
  });

  const { data: vehicleCount } = useQuery({
    queryKey: ['vehicle-maintenance-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('vehicle_maintenance_checklists')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'draft');
      if (error) throw error;
      return count || 0;
    },
  });

  const { data: buildingCount } = useQuery({
    queryKey: ['building-maintenance-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('building_maintenance_checklists')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'draft');
      if (error) throw error;
      return count || 0;
    },
  });

  const { data: generatorCount } = useQuery({
    queryKey: ['generator-maintenance-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('generator_maintenance_checklists')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'draft');
      if (error) throw error;
      return count || 0;
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Preventive Maintenance Dashboard</h1>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vehicle Maintenance</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vehicleCount || 0}</div>
            <p className="text-xs text-muted-foreground">Pending checklists</p>
            <Link to="/vehicle-maintenance/new">
              <Button size="sm" className="mt-3 w-full">
                <Plus className="h-4 w-4 mr-1" /> New Checklist
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Building Maintenance</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{buildingCount || 0}</div>
            <p className="text-xs text-muted-foreground">Pending checklists</p>
            <Link to="/building-maintenance/new">
              <Button size="sm" className="mt-3 w-full">
                <Plus className="h-4 w-4 mr-1" /> New Checklist
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Generator Maintenance</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{generatorCount || 0}</div>
            <p className="text-xs text-muted-foreground">Pending checklists</p>
            <Link to="/generator-maintenance/new">
              <Button size="sm" className="mt-3 w-full">
                <Plus className="h-4 w-4 mr-1" /> New Checklist
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Vehicle Maintenance</CardTitle>
          </CardHeader>
          <CardContent>
            {vehicleChecklists && vehicleChecklists.length > 0 ? (
              <ul className="space-y-2">
                {vehicleChecklists.map((checklist: any) => (
                  <li key={checklist.id} className="flex items-center justify-between text-sm">
                    <Link 
                      to={`/vehicle-maintenance/${checklist.id}`}
                      className="hover:underline"
                    >
                      {checklist.vehicles?.plate_no || 'Unknown Vehicle'}
                    </Link>
                    <span className="text-muted-foreground">
                      {format(new Date(checklist.checklist_month), 'MMM yyyy')}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No recent checklists</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Building Maintenance</CardTitle>
          </CardHeader>
          <CardContent>
            {buildingChecklists && buildingChecklists.length > 0 ? (
              <ul className="space-y-2">
                {buildingChecklists.map((checklist: any) => (
                  <li key={checklist.id} className="flex items-center justify-between text-sm">
                    <Link 
                      to={`/building-maintenance/${checklist.id}`}
                      className="hover:underline"
                    >
                      {checklist.buildings?.building_name || 'Unknown Building'}
                    </Link>
                    <span className="text-muted-foreground">
                      {format(new Date(checklist.checklist_month), 'MMM yyyy')}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No recent checklists</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Generator Maintenance</CardTitle>
          </CardHeader>
          <CardContent>
            {generatorChecklists && generatorChecklists.length > 0 ? (
              <ul className="space-y-2">
                {generatorChecklists.map((checklist: any) => (
                  <li key={checklist.id} className="flex items-center justify-between text-sm">
                    <Link 
                      to={`/generator-maintenance/${checklist.id}`}
                      className="hover:underline"
                    >
                      {checklist.generators?.equipment_name || 'Unknown Generator'}
                    </Link>
                    <span className="text-muted-foreground">
                      {format(new Date(checklist.checklist_month), 'MMM yyyy')}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No recent checklists</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Links for Managing Assets */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Manage Assets</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Link to="/vehicles">
            <Button variant="outline">
              <Car className="h-4 w-4 mr-2" /> Manage Vehicles
            </Button>
          </Link>
          <Link to="/buildings">
            <Button variant="outline">
              <Building2 className="h-4 w-4 mr-2" /> Manage Buildings
            </Button>
          </Link>
          <Link to="/generators">
            <Button variant="outline">
              <Zap className="h-4 w-4 mr-2" /> Manage Generators
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import { ArrowLeft, Save } from 'lucide-react';
import { format } from 'date-fns';

const CHECKLIST_ITEMS = {
  outside_vehicle: [
    { id: 'tires_pressure', label: '1. Tires (Proper pressure and condition)' },
    { id: 'wheel_nuts', label: '2. Wheel Nuts (Must be tight and lug bolts must be complete)' },
    { id: 'wheel_rim', label: '3. Wheel Rim (Must not be bent or cracked)' },
    { id: 'oil_gasoline_leaks', label: '4. Oil and Gasoline Leaks/hoses (Check leaks on floor/ground)' },
    { id: 'lights_reflector', label: '5. Lights and Reflector (Must be functional)' },
  ],
  inside_vehicle: [
    { id: 'battery', label: 'B - Battery (Must be functional)' },
    { id: 'lights', label: 'L - Lights (Must be functional)' },
    { id: 'oil_check', label: 'O - Oil Check (Check oil level)' },
    { id: 'water', label: 'W - Water (Check radiator water level)' },
    { id: 'brakes', label: 'B - Brakes (Check brake fluid level)' },
    { id: 'air_filter', label: 'A - Air Filter (Check if clean)' },
    { id: 'gas', label: 'G - Gas (Check fuel level)' },
    { id: 'engine', label: 'E - Engine (Check engine condition)' },
    { id: 'tire_spare', label: 'T - Tire/Spare Tire (Check spare tire condition)' },
    { id: 'self_tools', label: 'S - Self/Tools (Check tools availability)' },
  ],
  engine_compartment: [
    { id: 'engine_oil_level', label: '1. Engine Oil Level' },
    { id: 'coolant_level', label: '2. Coolant Level' },
    { id: 'brake_fluid_level', label: '3. Brake Fluid Level' },
    { id: 'belts_hoses', label: '4. Belts and Hoses' },
  ],
  after_starting: [
    { id: 'warning_lights', label: '1. Warning Lights (All must turn off after starting)' },
  ],
};

interface CheckItem {
  check_item: string;
  check_category: string;
  day_1: boolean;
  day_2: boolean;
  day_3: boolean;
  day_4: boolean;
  day_5: boolean;
  remarks: string;
}

export default function VehicleMaintenanceForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    vehicle_id: '',
    checklist_month: format(new Date(), 'yyyy-MM'),
    performed_by: '',
    location: '',
    status: 'draft',
  });

  const [checks, setChecks] = useState<Record<string, CheckItem>>({});

  // Initialize checks
  useEffect(() => {
    if (!isEditing) {
      const initialChecks: Record<string, CheckItem> = {};
      Object.entries(CHECKLIST_ITEMS).forEach(([category, items]) => {
        items.forEach((item) => {
          initialChecks[item.id] = {
            check_item: item.id,
            check_category: category,
            day_1: false,
            day_2: false,
            day_3: false,
            day_4: false,
            day_5: false,
            remarks: '',
          };
        });
      });
      setChecks(initialChecks);
    }
  }, [isEditing]);

  const { data: vehicles } = useQuery({
    queryKey: ['vehicles-active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vehicles')
        .select('id, plate_no, make_brand')
        .eq('is_active', true)
        .order('plate_no');
      if (error) throw error;
      return data;
    },
  });

  const { data: existingChecklist, isLoading: isLoadingChecklist } = useQuery({
    queryKey: ['vehicle-maintenance-checklist', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('vehicle_maintenance_checklists')
        .select('*, vehicle_maintenance_checks(*)')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: isEditing,
  });

  // Load existing data
  useEffect(() => {
    if (existingChecklist) {
      setFormData({
        vehicle_id: existingChecklist.vehicle_id || '',
        checklist_month: existingChecklist.checklist_month,
        performed_by: existingChecklist.performed_by || '',
        location: existingChecklist.location || '',
        status: existingChecklist.status || 'draft',
      });

      const loadedChecks: Record<string, CheckItem> = {};
      Object.entries(CHECKLIST_ITEMS).forEach(([category, items]) => {
        items.forEach((item) => {
          const existingCheck = existingChecklist.vehicle_maintenance_checks?.find(
            (c: any) => c.check_item === item.id
          );
          loadedChecks[item.id] = existingCheck
            ? {
                check_item: existingCheck.check_item,
                check_category: existingCheck.check_category,
                day_1: existingCheck.day_1,
                day_2: existingCheck.day_2,
                day_3: existingCheck.day_3,
                day_4: existingCheck.day_4,
                day_5: existingCheck.day_5,
                remarks: existingCheck.remarks || '',
              }
            : {
                check_item: item.id,
                check_category: category,
                day_1: false,
                day_2: false,
                day_3: false,
                day_4: false,
                day_5: false,
                remarks: '',
              };
        });
      });
      setChecks(loadedChecks);
    }
  }, [existingChecklist]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!formData.vehicle_id) {
        throw new Error('Please select a vehicle');
      }

      const checklistData = {
        vehicle_id: formData.vehicle_id,
        checklist_month: `${formData.checklist_month}-01`,
        performed_by: formData.performed_by,
        location: formData.location,
        status: formData.status,
        created_by: user?.id,
      };

      let checklistId = id;

      if (isEditing) {
        const { error } = await supabase
          .from('vehicle_maintenance_checklists')
          .update(checklistData)
          .eq('id', id);
        if (error) throw error;

        // Delete existing checks
        await supabase
          .from('vehicle_maintenance_checks')
          .delete()
          .eq('checklist_id', id);
      } else {
        const { data, error } = await supabase
          .from('vehicle_maintenance_checklists')
          .insert([checklistData])
          .select()
          .single();
        if (error) throw error;
        checklistId = data.id;
      }

      // Insert checks
      const checksToInsert = Object.values(checks).map((check) => ({
        ...check,
        checklist_id: checklistId,
      }));

      const { error: checksError } = await supabase
        .from('vehicle_maintenance_checks')
        .insert(checksToInsert);
      if (checksError) throw checksError;

      return checklistId;
    },
    onSuccess: (checklistId) => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-maintenance-checklists'] });
      toast.success(isEditing ? 'Checklist updated successfully' : 'Checklist created successfully');
      navigate(`/vehicle-maintenance/${checklistId}`);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to save checklist');
    },
  });

  const handleCheckChange = (itemId: string, day: keyof CheckItem, value: boolean) => {
    setChecks((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [day]: value,
      },
    }));
  };

  const handleRemarksChange = (itemId: string, value: string) => {
    setChecks((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        remarks: value,
      },
    }));
  };

  const renderChecklistSection = (title: string, category: string) => {
    const items = CHECKLIST_ITEMS[category as keyof typeof CHECKLIST_ITEMS];
    return (
      <Card className="mb-6">
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
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="text-sm">{item.label}</TableCell>
                  {(['day_1', 'day_2', 'day_3', 'day_4', 'day_5'] as const).map((day) => (
                    <TableCell key={day} className="text-center">
                      <Checkbox
                        checked={checks[item.id]?.[day] || false}
                        onCheckedChange={(checked) =>
                          handleCheckChange(item.id, day, checked as boolean)
                        }
                      />
                    </TableCell>
                  ))}
                  <TableCell>
                    <Input
                      value={checks[item.id]?.remarks || ''}
                      onChange={(e) => handleRemarksChange(item.id, e.target.value)}
                      placeholder="Remarks"
                      className="w-full"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    );
  };

  if (isEditing && isLoadingChecklist) {
    return <div className="flex items-center justify-center py-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/vehicle-maintenance')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold">
          {isEditing ? 'Edit Vehicle Maintenance Checklist' : 'New Vehicle Maintenance Checklist'}
        </h1>
      </div>

      {/* Header Fields */}
      <Card>
        <CardHeader>
          <CardTitle>Checklist Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Vehicle *</Label>
              <Select
                value={formData.vehicle_id}
                onValueChange={(value) => setFormData({ ...formData, vehicle_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select vehicle" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles?.map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.plate_no} - {vehicle.make_brand}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Month</Label>
              <Input
                type="month"
                value={formData.checklist_month}
                onChange={(e) => setFormData({ ...formData, checklist_month: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Performed By</Label>
              <Input
                value={formData.performed_by}
                onChange={(e) => setFormData({ ...formData, performed_by: e.target.value })}
                placeholder="Enter name"
              />
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Enter location"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Checklist Sections */}
      {renderChecklistSection('A.I. Outside the Vehicle', 'outside_vehicle')}
      {renderChecklistSection('A.II. Inside the Vehicle (BLOWBAGETS)', 'inside_vehicle')}
      {renderChecklistSection('A.III. Engine Compartment', 'engine_compartment')}
      {renderChecklistSection('B. After Starting Engine', 'after_starting')}

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => navigate('/vehicle-maintenance')}>
          Cancel
        </Button>
        <Button
          onClick={() => {
            setFormData({ ...formData, status: 'completed' });
            saveMutation.mutate();
          }}
          variant="secondary"
        >
          Save as Completed
        </Button>
        <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
          <Save className="h-4 w-4 mr-2" />
          {saveMutation.isPending ? 'Saving...' : 'Save Draft'}
        </Button>
      </div>
    </div>
  );
}

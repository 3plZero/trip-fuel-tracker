import { useState, useEffect } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
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
  exterior_interior: [
    { id: 'doors_windows', label: 'Doors and Windows (Locks, hinges, glass)' },
    { id: 'walls_ceilings', label: 'Walls and Ceilings (Cracks, paint, stains)' },
    { id: 'floors', label: 'Floors (Tiles, cracks, cleanliness)' },
    { id: 'roof', label: 'Roof (Leaks, gutters, drainage)' },
    { id: 'signage', label: 'Signage (Condition, visibility)' },
    { id: 'parking', label: 'Parking Area (Lines, lighting, cleanliness)' },
    { id: 'landscaping', label: 'Landscaping (Plants, grass, cleanliness)' },
    { id: 'security', label: 'Security Features (CCTV, alarms, locks)' },
  ],
  electrical: [
    { id: 'lighting_fixtures', label: 'Lighting Fixtures (Bulbs, switches, wiring)' },
    { id: 'outlets_switches', label: 'Electrical Outlets and Switches' },
    { id: 'breaker_panel', label: 'Breaker Panel (Labels, functionality)' },
  ],
  plumbing: [
    { id: 'faucets_sinks', label: 'Faucets and Sinks (Leaks, drainage)' },
    { id: 'toilets', label: 'Toilets (Flush, leaks, cleanliness)' },
    { id: 'water_heater', label: 'Water Heater (Temperature, leaks)' },
    { id: 'pipes_drains', label: 'Pipes and Drains (Leaks, clogs)' },
    { id: 'water_supply', label: 'Water Supply (Pressure, quality)' },
  ],
};

interface CheckItem {
  check_item: string;
  check_category: string;
  week_1: boolean;
  week_2: boolean;
  week_3: boolean;
  week_4: boolean;
  remarks: string;
}

export default function BuildingMaintenanceForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isEditing = !!id;

  const currentYear = new Date().getFullYear();
  const [formData, setFormData] = useState({
    building_id: '',
    checklist_month: format(new Date(), 'yyyy-MM'),
    checklist_year: currentYear,
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
            week_1: false,
            week_2: false,
            week_3: false,
            week_4: false,
            remarks: '',
          };
        });
      });
      setChecks(initialChecks);
    }
  }, [isEditing]);

  const { data: buildings } = useQuery({
    queryKey: ['buildings-active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('buildings')
        .select('id, building_name, location')
        .eq('is_active', true)
        .order('building_name');
      if (error) throw error;
      return data;
    },
  });

  const { data: existingChecklist, isLoading: isLoadingChecklist } = useQuery({
    queryKey: ['building-maintenance-checklist', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('building_maintenance_checklists')
        .select('*, building_maintenance_checks(*)')
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
        building_id: existingChecklist.building_id || '',
        checklist_month: existingChecklist.checklist_month,
        checklist_year: existingChecklist.checklist_year,
        performed_by: existingChecklist.performed_by || '',
        location: existingChecklist.location || '',
        status: existingChecklist.status || 'draft',
      });

      const loadedChecks: Record<string, CheckItem> = {};
      Object.entries(CHECKLIST_ITEMS).forEach(([category, items]) => {
        items.forEach((item) => {
          const existingCheck = existingChecklist.building_maintenance_checks?.find(
            (c: any) => c.check_item === item.id
          );
          loadedChecks[item.id] = existingCheck
            ? {
                check_item: existingCheck.check_item,
                check_category: existingCheck.check_category,
                week_1: existingCheck.week_1,
                week_2: existingCheck.week_2,
                week_3: existingCheck.week_3,
                week_4: existingCheck.week_4,
                remarks: existingCheck.remarks || '',
              }
            : {
                check_item: item.id,
                check_category: category,
                week_1: false,
                week_2: false,
                week_3: false,
                week_4: false,
                remarks: '',
              };
        });
      });
      setChecks(loadedChecks);
    }
  }, [existingChecklist]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!formData.building_id) {
        throw new Error('Please select a building');
      }

      const checklistData = {
        building_id: formData.building_id,
        checklist_month: `${formData.checklist_month}-01`,
        checklist_year: formData.checklist_year,
        performed_by: formData.performed_by,
        location: formData.location,
        status: formData.status,
        created_by: user?.id,
      };

      let checklistId = id;

      if (isEditing) {
        const { error } = await supabase
          .from('building_maintenance_checklists')
          .update(checklistData)
          .eq('id', id);
        if (error) throw error;

        // Delete existing checks
        await supabase
          .from('building_maintenance_checks')
          .delete()
          .eq('checklist_id', id);
      } else {
        const { data, error } = await supabase
          .from('building_maintenance_checklists')
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
        .from('building_maintenance_checks')
        .insert(checksToInsert);
      if (checksError) throw checksError;

      return checklistId;
    },
    onSuccess: (checklistId) => {
      queryClient.invalidateQueries({ queryKey: ['building-maintenance-checklists'] });
      toast.success(isEditing ? 'Checklist updated successfully' : 'Checklist created successfully');
      navigate(`/building-maintenance/${checklistId}`);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to save checklist');
    },
  });

  const handleCheckChange = (itemId: string, week: keyof CheckItem, value: boolean) => {
    setChecks((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [week]: value,
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
                <TableHead className="text-center">Week 1</TableHead>
                <TableHead className="text-center">Week 2</TableHead>
                <TableHead className="text-center">Week 3</TableHead>
                <TableHead className="text-center">Week 4</TableHead>
                <TableHead>Remarks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="text-sm">{item.label}</TableCell>
                  {(['week_1', 'week_2', 'week_3', 'week_4'] as const).map((week) => (
                    <TableCell key={week} className="text-center">
                      <Checkbox
                        checked={checks[item.id]?.[week] || false}
                        onCheckedChange={(checked) =>
                          handleCheckChange(item.id, week, checked as boolean)
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
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/building-maintenance')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold">
          {isEditing ? 'Edit Building Maintenance Checklist' : 'New Building Maintenance Checklist'}
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
              <Label>Building *</Label>
              <Select
                value={formData.building_id}
                onValueChange={(value) => setFormData({ ...formData, building_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select building" />
                </SelectTrigger>
                <SelectContent>
                  {buildings?.map((building) => (
                    <SelectItem key={building.id} value={building.id}>
                      {building.building_name}
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
      {renderChecklistSection('Exterior and Interior', 'exterior_interior')}
      {renderChecklistSection('Electrical Systems', 'electrical')}
      {renderChecklistSection('Plumbing Systems', 'plumbing')}

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => navigate('/building-maintenance')}>
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

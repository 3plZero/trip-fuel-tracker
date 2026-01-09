import { useState, useEffect } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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

const CHECKLIST_ITEMS = [
  { id: 'fuel_level', label: 'Check fuel level and refill if necessary' },
  { id: 'oil_level', label: 'Check engine oil level' },
  { id: 'coolant_level', label: 'Check coolant level' },
  { id: 'battery', label: 'Check battery condition and terminals' },
  { id: 'belts_hoses', label: 'Inspect belts and hoses for wear' },
  { id: 'air_filter', label: 'Check and clean air filter' },
  { id: 'test_run', label: 'Perform test run (10-15 minutes)' },
];

interface CheckItem {
  check_item: string;
  week_2: boolean;
  week_4: boolean;
  remarks: string;
}

export default function GeneratorMaintenanceForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    generator_id: '',
    checklist_month: format(new Date(), 'yyyy-MM'),
    performed_by: '',
    status: 'draft',
    monitoring_notes: '',
  });

  const [checks, setChecks] = useState<Record<string, CheckItem>>({});

  // Initialize checks
  useEffect(() => {
    if (!isEditing) {
      const initialChecks: Record<string, CheckItem> = {};
      CHECKLIST_ITEMS.forEach((item) => {
        initialChecks[item.id] = {
          check_item: item.id,
          week_2: false,
          week_4: false,
          remarks: '',
        };
      });
      setChecks(initialChecks);
    }
  }, [isEditing]);

  const { data: generators } = useQuery({
    queryKey: ['generators-active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('generators')
        .select('id, equipment_name, serial_no')
        .eq('is_active', true)
        .order('equipment_name');
      if (error) throw error;
      return data;
    },
  });

  const { data: existingChecklist, isLoading: isLoadingChecklist } = useQuery({
    queryKey: ['generator-maintenance-checklist', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('generator_maintenance_checklists')
        .select('*, generator_maintenance_checks(*)')
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
        generator_id: existingChecklist.generator_id || '',
        checklist_month: existingChecklist.checklist_month,
        performed_by: existingChecklist.performed_by || '',
        status: existingChecklist.status || 'draft',
        monitoring_notes: existingChecklist.monitoring_notes || '',
      });

      const loadedChecks: Record<string, CheckItem> = {};
      CHECKLIST_ITEMS.forEach((item) => {
        const existingCheck = existingChecklist.generator_maintenance_checks?.find(
          (c: any) => c.check_item === item.id
        );
        loadedChecks[item.id] = existingCheck
          ? {
              check_item: existingCheck.check_item,
              week_2: existingCheck.week_2,
              week_4: existingCheck.week_4,
              remarks: existingCheck.remarks || '',
            }
          : {
              check_item: item.id,
              week_2: false,
              week_4: false,
              remarks: '',
            };
      });
      setChecks(loadedChecks);
    }
  }, [existingChecklist]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!formData.generator_id) {
        throw new Error('Please select a generator');
      }

      const checklistData = {
        generator_id: formData.generator_id,
        checklist_month: `${formData.checklist_month}-01`,
        performed_by: formData.performed_by,
        status: formData.status,
        monitoring_notes: formData.monitoring_notes,
        created_by: user?.id,
      };

      let checklistId = id;

      if (isEditing) {
        const { error } = await supabase
          .from('generator_maintenance_checklists')
          .update(checklistData)
          .eq('id', id);
        if (error) throw error;

        // Delete existing checks
        await supabase
          .from('generator_maintenance_checks')
          .delete()
          .eq('checklist_id', id);
      } else {
        const { data, error } = await supabase
          .from('generator_maintenance_checklists')
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
        .from('generator_maintenance_checks')
        .insert(checksToInsert);
      if (checksError) throw checksError;

      return checklistId;
    },
    onSuccess: (checklistId) => {
      queryClient.invalidateQueries({ queryKey: ['generator-maintenance-checklists'] });
      toast.success(isEditing ? 'Checklist updated successfully' : 'Checklist created successfully');
      navigate(`/generator-maintenance/${checklistId}`);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to save checklist');
    },
  });

  const handleCheckChange = (itemId: string, week: 'week_2' | 'week_4', value: boolean) => {
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
        <Button variant="ghost" size="icon" onClick={() => navigate('/generator-maintenance')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold">
          {isEditing ? 'Edit Generator Maintenance Checklist' : 'New Generator Maintenance Checklist'}
        </h1>
      </div>

      {/* Header Fields */}
      <Card>
        <CardHeader>
          <CardTitle>Checklist Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Generator *</Label>
              <Select
                value={formData.generator_id}
                onValueChange={(value) => setFormData({ ...formData, generator_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select generator" />
                </SelectTrigger>
                <SelectContent>
                  {generators?.map((generator) => (
                    <SelectItem key={generator.id} value={generator.id}>
                      {generator.equipment_name} {generator.serial_no ? `(${generator.serial_no})` : ''}
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
          </div>
        </CardContent>
      </Card>

      {/* Bi-Weekly Checklist */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Bi-Weekly Maintenance Checklist</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[400px]">Check Item</TableHead>
                <TableHead className="text-center">Week 2</TableHead>
                <TableHead className="text-center">Week 4</TableHead>
                <TableHead>Remarks</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {CHECKLIST_ITEMS.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="text-sm">{item.label}</TableCell>
                  <TableCell className="text-center">
                    <Checkbox
                      checked={checks[item.id]?.week_2 || false}
                      onCheckedChange={(checked) =>
                        handleCheckChange(item.id, 'week_2', checked as boolean)
                      }
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <Checkbox
                      checked={checks[item.id]?.week_4 || false}
                      onCheckedChange={(checked) =>
                        handleCheckChange(item.id, 'week_4', checked as boolean)
                      }
                    />
                  </TableCell>
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

      {/* Monitoring Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Monitoring Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={formData.monitoring_notes}
            onChange={(e) => setFormData({ ...formData, monitoring_notes: e.target.value })}
            placeholder="Enter monitoring notes (temperature, pressure, voltage, frequency, observations, etc.)"
            rows={5}
          />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => navigate('/generator-maintenance')}>
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

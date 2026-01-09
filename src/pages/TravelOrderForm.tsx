import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Loader2, Plus, Trash2 } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Personnel {
  id?: string;
  name: string;
  position: string;
  division_agency: string;
}

interface FormData {
  order_date: string;
  inclusive_dates_start: string;
  inclusive_dates_end: string;
  destinations: string;
  purpose: string;
  expense_type: string;
  expense_type_other: string;
  transportation_type: string;
  has_actual_expenses: boolean;
  has_per_diem: boolean;
  remarks: string;
  approved_by: string;
  approved_by_position: string;
  status: string;
  personnel: Personnel[];
}

export default function TravelOrderForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const isEditing = !!id;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toNo, setToNo] = useState('');
  const [formData, setFormData] = useState<FormData>({
    order_date: format(new Date(), 'yyyy-MM-dd'),
    inclusive_dates_start: '',
    inclusive_dates_end: '',
    destinations: '',
    purpose: '',
    expense_type: 'general_fund',
    expense_type_other: '',
    transportation_type: 'official_vehicle',
    has_actual_expenses: false,
    has_per_diem: false,
    remarks: '',
    approved_by: '',
    approved_by_position: '',
    status: 'draft',
    personnel: [{ name: '', position: '', division_agency: '' }],
  });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    if (isEditing) {
      const { data: order, error } = await supabase
        .from('travel_orders')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error || !order) {
        toast({
          title: 'Error',
          description: 'Travel order not found',
          variant: 'destructive',
        });
        navigate('/travel-orders');
        return;
      }

      setToNo(order.travel_order_no);

      const { data: personnelData } = await supabase
        .from('travel_order_personnel')
        .select('*')
        .eq('travel_order_id', id)
        .order('sort_order');

      setFormData({
        order_date: order.order_date,
        inclusive_dates_start: order.inclusive_dates_start || '',
        inclusive_dates_end: order.inclusive_dates_end || '',
        destinations: order.destinations || '',
        purpose: order.purpose || '',
        expense_type: order.expense_type || 'general_fund',
        expense_type_other: order.expense_type_other || '',
        transportation_type: order.transportation_type || 'official_vehicle',
        has_actual_expenses: order.has_actual_expenses || false,
        has_per_diem: order.has_per_diem || false,
        remarks: order.remarks || '',
        approved_by: order.approved_by || '',
        approved_by_position: order.approved_by_position || '',
        status: order.status || 'draft',
        personnel: personnelData?.length
          ? personnelData.map((p) => ({
              id: p.id,
              name: p.name,
              position: p.position || '',
              division_agency: p.division_agency || '',
            }))
          : [{ name: '', position: '', division_agency: '' }],
      });
    } else {
      const { data } = await supabase.rpc('generate_travel_order_no');
      setToNo(data || '');
    }

    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);

    try {
      const orderData = {
        travel_order_no: toNo,
        order_date: formData.order_date,
        inclusive_dates_start: formData.inclusive_dates_start || null,
        inclusive_dates_end: formData.inclusive_dates_end || null,
        destinations: formData.destinations || null,
        purpose: formData.purpose || null,
        expense_type: formData.expense_type,
        expense_type_other: formData.expense_type_other || null,
        transportation_type: formData.transportation_type,
        has_actual_expenses: formData.has_actual_expenses,
        has_per_diem: formData.has_per_diem,
        remarks: formData.remarks || null,
        approved_by: formData.approved_by || null,
        approved_by_position: formData.approved_by_position || null,
        status: formData.status,
        created_by: user.id,
      };

      let orderId: string;

      if (isEditing) {
        const { error } = await supabase
          .from('travel_orders')
          .update(orderData)
          .eq('id', id);

        if (error) throw error;
        orderId = id!;

        await supabase.from('travel_order_personnel').delete().eq('travel_order_id', id);
      } else {
        const { data, error } = await supabase
          .from('travel_orders')
          .insert(orderData)
          .select('id')
          .single();

        if (error) throw error;
        orderId = data.id;
      }

      const validPersonnel = formData.personnel.filter((p) => p.name.trim());
      if (validPersonnel.length > 0) {
        await supabase.from('travel_order_personnel').insert(
          validPersonnel.map((p, i) => ({
            travel_order_id: orderId,
            name: p.name,
            position: p.position || null,
            division_agency: p.division_agency || null,
            sort_order: i,
          }))
        );
      }

      toast({
        title: isEditing ? 'Updated' : 'Created',
        description: `Travel order ${isEditing ? 'updated' : 'created'} successfully`,
      });
      navigate('/travel-orders');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const addPersonnel = () => {
    setFormData({
      ...formData,
      personnel: [...formData.personnel, { name: '', position: '', division_agency: '' }],
    });
  };

  const removePersonnel = (index: number) => {
    const newPersonnel = formData.personnel.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      personnel: newPersonnel.length ? newPersonnel : [{ name: '', position: '', division_agency: '' }],
    });
  };

  const updatePersonnel = (index: number, field: keyof Personnel, value: string) => {
    const newPersonnel = [...formData.personnel];
    newPersonnel[index] = { ...newPersonnel[index], [field]: value };
    setFormData({ ...formData, personnel: newPersonnel });
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/travel-orders')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {isEditing ? 'Edit Travel Order' : 'Create Travel Order'}
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? `Editing ${toNo}` : `New order: ${toNo}`}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header Section */}
        <Card>
          <CardHeader>
            <CardTitle>Travel Order Information</CardTitle>
            <CardDescription>Basic travel order details</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label>TO No.</Label>
              <Input value={toNo} disabled className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="order_date">Date</Label>
              <Input
                id="order_date"
                type="date"
                value={formData.order_date}
                onChange={(e) => setFormData({ ...formData, order_date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inclusive_dates_start">Inclusive Date (Start)</Label>
              <Input
                id="inclusive_dates_start"
                type="date"
                value={formData.inclusive_dates_start}
                onChange={(e) => setFormData({ ...formData, inclusive_dates_start: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inclusive_dates_end">Inclusive Date (End)</Label>
              <Input
                id="inclusive_dates_end"
                type="date"
                value={formData.inclusive_dates_end}
                onChange={(e) => setFormData({ ...formData, inclusive_dates_end: e.target.value })}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="destinations">Destination(s)</Label>
              <Input
                id="destinations"
                value={formData.destinations}
                onChange={(e) => setFormData({ ...formData, destinations: e.target.value })}
                placeholder="Enter destination(s)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Personnel Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Personnel</CardTitle>
                <CardDescription>Add personnel for this travel order</CardDescription>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addPersonnel}>
                <Plus className="mr-2 h-4 w-4" />
                Add Personnel
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.personnel.map((person, index) => (
              <div key={index} className="grid gap-4 md:grid-cols-4 items-end">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={person.name}
                    onChange={(e) => updatePersonnel(index, 'name', e.target.value)}
                    placeholder="Full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Position</Label>
                  <Input
                    value={person.position}
                    onChange={(e) => updatePersonnel(index, 'position', e.target.value)}
                    placeholder="Position/Title"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Division/Agency</Label>
                  <Input
                    value={person.division_agency}
                    onChange={(e) => updatePersonnel(index, 'division_agency', e.target.value)}
                    placeholder="Division or Agency"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removePersonnel(index)}
                  disabled={formData.personnel.length === 1}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Purpose Section */}
        <Card>
          <CardHeader>
            <CardTitle>Purpose of Travel</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              placeholder="Enter purpose of travel"
              rows={3}
            />
          </CardContent>
        </Card>

        {/* Travel Expenses Section */}
        <Card>
          <CardHeader>
            <CardTitle>Travel Expenses</CardTitle>
            <CardDescription>Select expense type and method</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Label className="text-base font-medium">Expense Type</Label>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="general_fund"
                    checked={formData.expense_type === 'general_fund'}
                    onCheckedChange={() => setFormData({ ...formData, expense_type: 'general_fund' })}
                  />
                  <Label htmlFor="general_fund">General Fund</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="project_funds"
                    checked={formData.expense_type === 'project_funds'}
                    onCheckedChange={() => setFormData({ ...formData, expense_type: 'project_funds' })}
                  />
                  <Label htmlFor="project_funds">Project Funds</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="others"
                    checked={formData.expense_type === 'others'}
                    onCheckedChange={() => setFormData({ ...formData, expense_type: 'others' })}
                  />
                  <Label htmlFor="others">Others</Label>
                  {formData.expense_type === 'others' && (
                    <Input
                      value={formData.expense_type_other}
                      onChange={(e) => setFormData({ ...formData, expense_type_other: e.target.value })}
                      placeholder="Specify"
                      className="ml-2 flex-1"
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-base font-medium">Expense Method</Label>
              <div className="flex gap-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="actual_expenses"
                    checked={formData.has_actual_expenses}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, has_actual_expenses: checked as boolean })
                    }
                  />
                  <Label htmlFor="actual_expenses">Actual Expenses</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="per_diem"
                    checked={formData.has_per_diem}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, has_per_diem: checked as boolean })
                    }
                  />
                  <Label htmlFor="per_diem">Per Diem</Label>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-base font-medium">Mode of Transportation</Label>
              <div className="flex gap-6">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="official_vehicle"
                    checked={formData.transportation_type === 'official_vehicle'}
                    onCheckedChange={() =>
                      setFormData({ ...formData, transportation_type: 'official_vehicle' })
                    }
                  />
                  <Label htmlFor="official_vehicle">Use of Official Vehicle</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="public_conveyance"
                    checked={formData.transportation_type === 'public_conveyance'}
                    onCheckedChange={() =>
                      setFormData({ ...formData, transportation_type: 'public_conveyance' })
                    }
                  />
                  <Label htmlFor="public_conveyance">Public Conveyance</Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Remarks & Approval Section */}
        <Card>
          <CardHeader>
            <CardTitle>Remarks & Approval</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="remarks">Special Instructions/Remarks</Label>
              <Textarea
                id="remarks"
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                placeholder="Any special instructions or remarks"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="approved_by">Approved By</Label>
              <Input
                id="approved_by"
                value={formData.approved_by}
                onChange={(e) => setFormData({ ...formData, approved_by: e.target.value })}
                placeholder="Approver name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="approved_by_position">Position</Label>
              <Input
                id="approved_by_position"
                value={formData.approved_by_position}
                onChange={(e) => setFormData({ ...formData, approved_by_position: e.target.value })}
                placeholder="Approver position"
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/travel-orders')}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? 'Update Travel Order' : 'Create Travel Order'}
          </Button>
        </div>
      </form>
    </div>
  );
}

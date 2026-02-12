import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, ArrowLeft, Save } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

const PROVINCES = ['Abra', 'Apayao', 'Benguet', 'Ifugao', 'Kalinga', 'Mountain Province', 'Baguio City'];

export default function TrainingForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEdit = !!id;
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    province: '',
    title: '',
    training_date_start: undefined as Date | undefined,
    training_date_end: undefined as Date | undefined,
    venue: '',
    participants_total: 0,
    participants_female: 0,
    participants_male: 0,
    participants_senior: 0,
    participants_differently_abled: 0,
    firms_assisted: 0,
    firm_names: '',
    resource_persons: '',
    counterpart: '',
    approved_amount: 0,
    actual_expenses: 0,
    remarks: '',
    status: 'draft',
  });

  useEffect(() => {
    if (!isEdit) return;
    supabase.from('technology_trainings').select('*').eq('id', id).single().then(({ data, error }) => {
      if (error || !data) { navigate('/trainings'); return; }
      setForm({
        ...data,
        training_date_start: data.training_date_start ? new Date(data.training_date_start) : undefined,
        training_date_end: data.training_date_end ? new Date(data.training_date_end) : undefined,
        approved_amount: Number(data.approved_amount) || 0,
        actual_expenses: Number(data.actual_expenses) || 0,
      });
      setLoading(false);
    });
  }, [id]);

  // Auto-calculate total
  useEffect(() => {
    const total = (form.participants_female || 0) + (form.participants_male || 0);
    if (total > 0) setForm(f => ({ ...f, participants_total: total }));
  }, [form.participants_female, form.participants_male]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.province) {
      toast({ title: 'Validation', description: 'Title and Province are required.', variant: 'destructive' });
      return;
    }
    if (form.approved_amount > 0 && form.actual_expenses > form.approved_amount) {
      toast({ title: 'Validation', description: 'Actual expenses cannot exceed the approved amount.', variant: 'destructive' });
      return;
    }
    setSaving(true);

    const payload = {
      ...form,
      training_date_start: form.training_date_start ? format(form.training_date_start, 'yyyy-MM-dd') : null,
      training_date_end: form.training_date_end ? format(form.training_date_end, 'yyyy-MM-dd') : null,
      created_by: user?.id,
    };

    let error;
    if (isEdit) {
      const { created_by, ...updatePayload } = payload;
      ({ error } = await supabase.from('technology_trainings').update(updatePayload).eq('id', id));
    } else {
      ({ error } = await supabase.from('technology_trainings').insert(payload));
    }

    setSaving(false);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: isEdit ? 'Updated' : 'Created', description: 'Training record saved.' });
      navigate('/trainings');
    }
  }

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;

  const set = (key: string, value: any) => setForm(f => ({ ...f, [key]: value }));

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/trainings')}><ArrowLeft className="h-5 w-5" /></Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">{isEdit ? 'Edit Training' : 'New Training'}</h1>
          <p className="text-muted-foreground mt-1">Fill in the training details</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label>Title *</Label>
              <Input value={form.title} onChange={e => set('title', e.target.value)} required />
            </div>
            <div>
              <Label>Province *</Label>
              <Select value={form.province} onValueChange={v => set('province', v)}>
                <SelectTrigger><SelectValue placeholder="Select province" /></SelectTrigger>
                <SelectContent>{PROVINCES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={v => set('status', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <div className="relative">
                    <Input
                      type="date"
                      value={form.training_date_start ? format(form.training_date_start, 'yyyy-MM-dd') : ''}
                      onChange={e => {
                        const val = e.target.value;
                        set('training_date_start', val ? new Date(val + 'T00:00:00') : undefined);
                      }}
                      className="w-full pr-10"
                    />
                    <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={form.training_date_start} onSelect={d => set('training_date_start', d)} className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <div className="relative">
                    <Input
                      type="date"
                      value={form.training_date_end ? format(form.training_date_end, 'yyyy-MM-dd') : ''}
                      onChange={e => {
                        const val = e.target.value;
                        set('training_date_end', val ? new Date(val + 'T00:00:00') : undefined);
                      }}
                      className="w-full pr-10"
                    />
                    <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={form.training_date_end} onSelect={d => set('training_date_end', d)} className="p-3 pointer-events-auto" />
                </PopoverContent>
              </Popover>
            </div>
            <div className="sm:col-span-2">
              <Label>Venue (Municipality / Barangay)</Label>
              <Input value={form.venue || ''} onChange={e => set('venue', e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Participants</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label>Female</Label>
              <Input type="number" min={0} value={form.participants_female} onChange={e => set('participants_female', parseInt(e.target.value) || 0)} />
            </div>
            <div>
              <Label>Male</Label>
              <Input type="number" min={0} value={form.participants_male} onChange={e => set('participants_male', parseInt(e.target.value) || 0)} />
            </div>
            <div>
              <Label>Total (auto-calculated)</Label>
              <Input type="number" value={form.participants_total} readOnly className="bg-muted" />
            </div>
            <div>
              <Label>Senior Citizens</Label>
              <Input type="number" min={0} value={form.participants_senior} onChange={e => set('participants_senior', parseInt(e.target.value) || 0)} />
            </div>
            <div>
              <Label>Differently-Abled</Label>
              <Input type="number" min={0} value={form.participants_differently_abled} onChange={e => set('participants_differently_abled', parseInt(e.target.value) || 0)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Firms & Resource Persons</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>No. of Firms Assisted</Label>
              <Input type="number" min={0} value={form.firms_assisted} onChange={e => set('firms_assisted', parseInt(e.target.value) || 0)} />
            </div>
            <div>
              <Label>Firm Names</Label>
              <Input value={form.firm_names || ''} onChange={e => set('firm_names', e.target.value)} />
            </div>
            <div>
              <Label>Resource Person(s)</Label>
              <Input value={form.resource_persons || ''} onChange={e => set('resource_persons', e.target.value)} />
            </div>
            <div>
              <Label>Counterpart</Label>
              <Input value={form.counterpart || ''} onChange={e => set('counterpart', e.target.value)} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Expenditures</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Approved Amount (₱)</Label>
              <Input type="number" min={0} step="0.01" value={form.approved_amount} onChange={e => set('approved_amount', parseFloat(e.target.value) || 0)} />
            </div>
            <div>
              <Label>Actual DOST-CAR Expenses (₱)</Label>
              <Input type="number" min={0} step="0.01" value={form.actual_expenses} onChange={e => set('actual_expenses', parseFloat(e.target.value) || 0)} />
            </div>
            <div className="sm:col-span-2">
              <Label>Remarks</Label>
              <Textarea value={form.remarks || ''} onChange={e => set('remarks', e.target.value)} rows={3} />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate('/trainings')}>Cancel</Button>
          <Button type="submit" disabled={saving} className="gap-2">
            {saving ? <LoadingSpinner size="sm" /> : <Save className="h-4 w-4" />}
            {isEdit ? 'Update' : 'Create'} Training
          </Button>
        </div>
      </form>
    </div>
  );
}

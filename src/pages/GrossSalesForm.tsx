import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Save } from 'lucide-react';

const PROVINCES = ['Abra', 'Apayao', 'Baguio - Benguet', 'Ifugao', 'Kalinga', 'Mountain Province'];
const FUNDING_TYPES = ['SETUP', 'LGIA/SSCP'];
const MONTHS = [
  { key: 'jan', label: 'January' },
  { key: 'feb', label: 'February' },
  { key: 'mar', label: 'March' },
  { key: 'apr', label: 'April' },
  { key: 'may', label: 'May' },
  { key: 'jun', label: 'June' },
  { key: 'jul', label: 'July' },
  { key: 'aug', label: 'August' },
  { key: 'sep', label: 'September' },
  { key: 'oct', label: 'October' },
  { key: 'nov', label: 'November' },
  { key: 'dec', label: 'December' },
] as const;

type MonthKey = typeof MONTHS[number]['key'];

interface FormData {
  province: string;
  funding_type: string;
  firm_name: string;
  year: number;
  jan: number; feb: number; mar: number; apr: number; may: number; jun: number;
  jul: number; aug: number; sep: number; oct: number; nov: number; dec: number;
  remarks: string;
}

const defaultForm: FormData = {
  province: '', funding_type: 'SETUP', firm_name: '', year: new Date().getFullYear(),
  jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 0,
  jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0,
  remarks: '',
};

export default function GrossSalesForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [form, setForm] = useState<FormData>(defaultForm);
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const isEdit = !!id;

  useEffect(() => {
    if (!id) return;
    supabase.from('gross_sales').select('*').eq('id', id).single().then(({ data }) => {
      if (data) {
        setForm({
          province: data.province,
          funding_type: data.funding_type,
          firm_name: data.firm_name,
          year: data.year,
          jan: Number(data.jan || 0), feb: Number(data.feb || 0), mar: Number(data.mar || 0),
          apr: Number(data.apr || 0), may: Number(data.may || 0), jun: Number(data.jun || 0),
          jul: Number(data.jul || 0), aug: Number(data.aug || 0), sep: Number(data.sep || 0),
          oct: Number(data.oct || 0), nov: Number(data.nov || 0), dec: Number(data.dec || 0),
          remarks: data.remarks || '',
        });
      }
      setLoading(false);
    });
  }, [id]);

  const set = (key: keyof FormData, val: any) => setForm(prev => ({ ...prev, [key]: val }));

  const q1 = form.jan + form.feb + form.mar;
  const q2 = form.apr + form.may + form.jun;
  const q3 = form.jul + form.aug + form.sep;
  const q4 = form.oct + form.nov + form.dec;
  const sem1 = q1 + q2;
  const sem2 = q3 + q4;
  const total = sem1 + sem2;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.province || !form.firm_name) {
      toast({ title: 'Validation', description: 'Province and firm name are required.', variant: 'destructive' });
      return;
    }

    setSaving(true);
    const payload = { ...form, created_by: user?.id };

    if (isEdit) {
      const { created_by, ...updatePayload } = payload;
      const { error } = await supabase.from('gross_sales').update(updatePayload).eq('id', id);
      if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); }
      else { toast({ title: 'Updated' }); navigate(`/gross-sales/${id}`); }
    } else {
      const { error } = await supabase.from('gross_sales').insert(payload);
      if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); }
      else { toast({ title: 'Created' }); navigate('/gross-sales'); }
    }
    setSaving(false);
  }

  if (loading) return <div className="flex items-center justify-center py-20"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5" /></Button>
        <h1 className="text-3xl font-bold text-foreground">{isEdit ? 'Edit' : 'Add'} Gross Sales Record</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle>Firm Information</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Province *</Label>
              <Select value={form.province} onValueChange={v => set('province', v)}>
                <SelectTrigger><SelectValue placeholder="Select province" /></SelectTrigger>
                <SelectContent>{PROVINCES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Funding Type *</Label>
              <Select value={form.funding_type} onValueChange={v => set('funding_type', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{FUNDING_TYPES.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Firm Name *</Label>
              <Input value={form.firm_name} onChange={e => set('firm_name', e.target.value)} placeholder="Enter firm name" />
            </div>
            <div className="space-y-2">
              <Label>Year *</Label>
              <Input type="number" value={form.year} onChange={e => set('year', parseInt(e.target.value) || 2026)} />
            </div>
          </CardContent>
        </Card>

        {/* Q1 */}
        <Card>
          <CardHeader><CardTitle>1st Quarter ('000)</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            {MONTHS.slice(0, 3).map(m => (
              <div key={m.key} className="space-y-2">
                <Label>{m.label}</Label>
                <Input type="number" step="0.01" value={form[m.key] || ''} onChange={e => set(m.key, parseFloat(e.target.value) || 0)} placeholder="0" />
              </div>
            ))}
            <div className="md:col-span-3 text-right font-semibold text-muted-foreground">
              Sub-total: ₱{q1.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        {/* Q2 */}
        <Card>
          <CardHeader><CardTitle>2nd Quarter ('000)</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            {MONTHS.slice(3, 6).map(m => (
              <div key={m.key} className="space-y-2">
                <Label>{m.label}</Label>
                <Input type="number" step="0.01" value={form[m.key] || ''} onChange={e => set(m.key, parseFloat(e.target.value) || 0)} placeholder="0" />
              </div>
            ))}
            <div className="md:col-span-3 text-right font-semibold text-muted-foreground">
              Sub-total: ₱{q2.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <div className="text-center p-3 bg-primary/10 rounded-lg font-semibold">
          1st Semester Total: ₱{sem1.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </div>

        {/* Q3 */}
        <Card>
          <CardHeader><CardTitle>3rd Quarter ('000)</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            {MONTHS.slice(6, 9).map(m => (
              <div key={m.key} className="space-y-2">
                <Label>{m.label}</Label>
                <Input type="number" step="0.01" value={form[m.key]} onChange={e => set(m.key, parseFloat(e.target.value) || 0)} />
              </div>
            ))}
            <div className="md:col-span-3 text-right font-semibold text-muted-foreground">
              Sub-total: ₱{q3.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        {/* Q4 */}
        <Card>
          <CardHeader><CardTitle>4th Quarter ('000)</CardTitle></CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            {MONTHS.slice(9, 12).map(m => (
              <div key={m.key} className="space-y-2">
                <Label>{m.label}</Label>
                <Input type="number" step="0.01" value={form[m.key]} onChange={e => set(m.key, parseFloat(e.target.value) || 0)} />
              </div>
            ))}
            <div className="md:col-span-3 text-right font-semibold text-muted-foreground">
              Sub-total: ₱{q4.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>

        <div className="text-center p-3 bg-primary/10 rounded-lg font-semibold">
          2nd Semester Total: ₱{sem2.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </div>

        <div className="text-center p-4 bg-primary/20 rounded-lg font-bold text-lg">
          Annual Total: ₱{total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </div>

        <Card>
          <CardHeader><CardTitle>Remarks</CardTitle></CardHeader>
          <CardContent>
            <Textarea value={form.remarks} onChange={e => set('remarks', e.target.value)} placeholder="Additional notes..." rows={3} />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="submit" disabled={saving} className="gap-2">
            <Save className="h-4 w-4" /> {saving ? 'Saving...' : isEdit ? 'Update' : 'Save'}
          </Button>
        </div>
      </form>
    </div>
  );
}

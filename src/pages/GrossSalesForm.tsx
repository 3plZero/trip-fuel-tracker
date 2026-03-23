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
import { ArrowLeft, Save, Upload } from 'lucide-react';
import GrossSalesImportDialog, { ImportedGrossSalesData } from '@/components/GrossSalesImportDialog';
import { GrossSalesMonthlyDetails, MonthlyDetail, emptyMonthlyDetail } from '@/components/GrossSalesMonthlyDetails';

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

interface FormData {
  province: string;
  funding_type: string;
  firm_name: string;
  email: string;
  mobile_number: string;
  year: number;
  jan: number; feb: number; mar: number; apr: number; may: number; jun: number;
  jul: number; aug: number; sep: number; oct: number; nov: number; dec: number;
  remarks: string;
}

const defaultForm: FormData = {
  province: '', funding_type: 'SETUP', firm_name: '', email: '', mobile_number: '',
  year: new Date().getFullYear(),
  jan: 0, feb: 0, mar: 0, apr: 0, may: 0, jun: 0,
  jul: 0, aug: 0, sep: 0, oct: 0, nov: 0, dec: 0,
  remarks: '',
};

type MonthKey = typeof MONTHS[number]['key'];

export default function GrossSalesForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [form, setForm] = useState<FormData>(defaultForm);
  const [monthlyDetails, setMonthlyDetails] = useState<Record<string, MonthlyDetail>>(
    Object.fromEntries(MONTHS.map(m => [m.key, { ...emptyMonthlyDetail }]))
  );
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const isEdit = !!id;

  const handleImport = (data: ImportedGrossSalesData) => {
    setForm(prev => ({
      ...prev,
      email: data.email || prev.email,
      mobile_number: data.mobile_number || prev.mobile_number,
      year: data.year || prev.year,
      ...Object.fromEntries(MONTHS.map(m => [m.key, data.monthlySales[m.key] || prev[m.key as keyof FormData]])),
    }));
    setMonthlyDetails(prev => {
      const updated = { ...prev };
      MONTHS.forEach(m => {
        const d = data.monthlyDetails[m.key];
        const hasData = d && (d.products || d.production_volume || d.business_status ||
          d.existing_workers_male || d.existing_workers_female ||
          d.new_workers_male || d.new_workers_female ||
          d.market_outlets_male || d.market_outlets_female ||
          d.raw_material_suppliers_male || d.raw_material_suppliers_female);
        if (hasData) updated[m.key] = d;
      });
      return updated;
    });
    toast({ title: 'Imported', description: 'Data filled from Excel file.' });
  };

  useEffect(() => {
    if (!id) return;
    Promise.all([
      supabase.from('gross_sales').select('*').eq('id', id).single(),
      supabase.from('gross_sales_monthly_details' as any).select('*').eq('gross_sales_id', id),
    ]).then(([{ data }, { data: details }]) => {
      if (data) {
        setForm({
          province: data.province, funding_type: data.funding_type, firm_name: data.firm_name,
          email: (data as any).email || '', mobile_number: (data as any).mobile_number || '',
          year: data.year,
          jan: Number(data.jan || 0), feb: Number(data.feb || 0), mar: Number(data.mar || 0),
          apr: Number(data.apr || 0), may: Number(data.may || 0), jun: Number(data.jun || 0),
          jul: Number(data.jul || 0), aug: Number(data.aug || 0), sep: Number(data.sep || 0),
          oct: Number(data.oct || 0), nov: Number(data.nov || 0), dec: Number(data.dec || 0),
          remarks: data.remarks || '',
        });
      }
      if (details && Array.isArray(details)) {
        const detailMap = { ...Object.fromEntries(MONTHS.map(m => [m.key, { ...emptyMonthlyDetail }])) };
        details.forEach((d: any) => {
          if (detailMap[d.month]) {
            detailMap[d.month] = {
              products: d.products || '',
              production_volume: d.production_volume || '',
              existing_workers_male: d.existing_workers_male || 0,
              existing_workers_female: d.existing_workers_female || 0,
              new_workers_male: d.new_workers_male || 0,
              new_workers_female: d.new_workers_female || 0,
              market_outlets_male: d.market_outlets_male || 0,
              market_outlets_female: d.market_outlets_female || 0,
              raw_material_suppliers_male: d.raw_material_suppliers_male || 0,
              raw_material_suppliers_female: d.raw_material_suppliers_female || 0,
              business_status: d.business_status || '',
            };
          }
        });
        setMonthlyDetails(detailMap);
      }
      setLoading(false);
    });
  }, [id]);

  const set = (key: keyof FormData, val: any) => setForm(prev => ({ ...prev, [key]: val }));

  const handleMonthlyDetailChange = (monthKey: string, detail: MonthlyDetail) => {
    setMonthlyDetails(prev => ({ ...prev, [monthKey]: detail }));
  };

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
    const { email, mobile_number, ...rest } = form;
    const payload = { ...rest, email, mobile_number, created_by: user?.id };

    let recordId = id;

    if (isEdit) {
      const { created_by, ...updatePayload } = payload;
      const { error } = await supabase.from('gross_sales').update(updatePayload as any).eq('id', id);
      if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); setSaving(false); return; }
    } else {
      const { data: inserted, error } = await supabase.from('gross_sales').insert(payload as any).select('id').single();
      if (error) { toast({ title: 'Error', description: error.message, variant: 'destructive' }); setSaving(false); return; }
      recordId = inserted.id;
    }

    // Save monthly details - delete existing then insert
    if (recordId) {
      await supabase.from('gross_sales_monthly_details' as any).delete().eq('gross_sales_id', recordId);

      const detailRows = MONTHS.map(m => {
        const d = monthlyDetails[m.key];
        const hasData = d.products || d.production_volume || d.business_status ||
          d.existing_workers_male || d.existing_workers_female ||
          d.new_workers_male || d.new_workers_female ||
          d.market_outlets_male || d.market_outlets_female ||
          d.raw_material_suppliers_male || d.raw_material_suppliers_female;
        if (!hasData) return null;
        return { gross_sales_id: recordId, month: m.key, ...d };
      }).filter(Boolean);

      if (detailRows.length > 0) {
        await supabase.from('gross_sales_monthly_details' as any).insert(detailRows);
      }
    }

    toast({ title: isEdit ? 'Updated' : 'Created' });
    navigate(isEdit ? `/gross-sales/${id}` : '/gross-sales');
    setSaving(false);
  }

  if (loading) return <div className="flex items-center justify-center py-20"><LoadingSpinner size="lg" /></div>;

  const renderQuarter = (label: string, monthSlice: number[], subtotal: number) => (
    <Card>
      <CardHeader><CardTitle>{label} ('000)</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          {MONTHS.slice(monthSlice[0], monthSlice[1]).map(m => (
            <div key={m.key} className="space-y-2">
              <Label>{m.label}</Label>
              <Input type="number" step="0.01" value={form[m.key as MonthKey] || ''} onChange={e => set(m.key as keyof FormData, parseFloat(e.target.value) || 0)} placeholder="0" />
            </div>
          ))}
        </div>
        <div className="text-right font-semibold text-muted-foreground">
          Sub-total: ₱{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </div>

        <div className="border-t pt-3 space-y-2">
          <p className="text-sm font-medium text-muted-foreground">Monthly Details (Products, Workers, Outlets, etc.)</p>
          {MONTHS.slice(monthSlice[0], monthSlice[1]).map(m => (
            <GrossSalesMonthlyDetails
              key={m.key}
              monthKey={m.key}
              monthLabel={m.label}
              detail={monthlyDetails[m.key]}
              onChange={handleMonthlyDetailChange}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );

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
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="firm@email.com" />
            </div>
            <div className="space-y-2">
              <Label>Mobile Number</Label>
              <Input value={form.mobile_number} onChange={e => set('mobile_number', e.target.value)} placeholder="09XX XXX XXXX" />
            </div>
          </CardContent>
        </Card>

        {renderQuarter('1st Quarter', [0, 3], q1)}
        {renderQuarter('2nd Quarter', [3, 6], q2)}

        <div className="text-center p-3 bg-primary/10 rounded-lg font-semibold">
          1st Semester Total: ₱{sem1.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </div>

        {renderQuarter('3rd Quarter', [6, 9], q3)}
        {renderQuarter('4th Quarter', [9, 12], q4)}

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

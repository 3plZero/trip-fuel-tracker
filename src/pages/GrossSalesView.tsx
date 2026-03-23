import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Pencil, Mail, Phone } from 'lucide-react';

const MONTHS = [
  { key: 'jan', label: 'January' }, { key: 'feb', label: 'February' }, { key: 'mar', label: 'March' },
  { key: 'apr', label: 'April' }, { key: 'may', label: 'May' }, { key: 'jun', label: 'June' },
  { key: 'jul', label: 'July' }, { key: 'aug', label: 'August' }, { key: 'sep', label: 'September' },
  { key: 'oct', label: 'October' }, { key: 'nov', label: 'November' }, { key: 'dec', label: 'December' },
];

export default function GrossSalesView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [details, setDetails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase.from('gross_sales').select('*').eq('id', id).single(),
      supabase.from('gross_sales_monthly_details' as any).select('*').eq('gross_sales_id', id),
    ]).then(([{ data: d }, { data: det }]) => {
      setData(d);
      setDetails(det || []);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <div className="flex items-center justify-center py-20"><LoadingSpinner size="lg" /></div>;
  if (!data) return <div className="text-center py-20 text-muted-foreground">Record not found</div>;

  const q1 = Number(data.jan || 0) + Number(data.feb || 0) + Number(data.mar || 0);
  const q2 = Number(data.apr || 0) + Number(data.may || 0) + Number(data.jun || 0);
  const q3 = Number(data.jul || 0) + Number(data.aug || 0) + Number(data.sep || 0);
  const q4 = Number(data.oct || 0) + Number(data.nov || 0) + Number(data.dec || 0);
  const sem1 = q1 + q2;
  const sem2 = q3 + q4;
  const total = sem1 + sem2;

  const fmt = (v: number) => v.toLocaleString(undefined, { minimumFractionDigits: 2 });

  const getDetail = (monthKey: string) => details.find((d: any) => d.month === monthKey);

  const renderMonthDetail = (monthKey: string) => {
    const d = getDetail(monthKey);
    if (!d) return null;
    const hasData = d.products || d.production_volume || d.business_status ||
      d.existing_workers_male || d.existing_workers_female ||
      d.new_workers_male || d.new_workers_female ||
      d.market_outlets_male || d.market_outlets_female ||
      d.raw_material_suppliers_male || d.raw_material_suppliers_female;
    if (!hasData) return null;

    return (
      <TableRow className="bg-muted/20">
        <TableCell colSpan={3}>
          <div className="grid gap-2 text-sm pl-4">
            {d.products && <div><span className="font-medium">Products:</span> {d.products}</div>}
            {d.production_volume && <div><span className="font-medium">Production Volume:</span> {d.production_volume}</div>}
            {(d.existing_workers_male > 0 || d.existing_workers_female > 0) && (
              <div><span className="font-medium">Existing Workers:</span> {d.existing_workers_male}M / {d.existing_workers_female}F</div>
            )}
            {(d.new_workers_male > 0 || d.new_workers_female > 0) && (
              <div><span className="font-medium">New Workers:</span> {d.new_workers_male}M / {d.new_workers_female}F</div>
            )}
            {(d.market_outlets_male > 0 || d.market_outlets_female > 0) && (
              <div><span className="font-medium">Market Outlets:</span> {d.market_outlets_male}M / {d.market_outlets_female}F</div>
            )}
            {(d.raw_material_suppliers_male > 0 || d.raw_material_suppliers_female > 0) && (
              <div><span className="font-medium">Raw Material Suppliers:</span> {d.raw_material_suppliers_male}M / {d.raw_material_suppliers_female}F</div>
            )}
            {d.business_status && <div><span className="font-medium">Status/Concerns:</span> {d.business_status}</div>}
          </div>
        </TableCell>
      </TableRow>
    );
  };

  const renderQuarterRows = (label: string, monthSlice: [number, number], subtotal: number) => (
    <>
      {MONTHS.slice(monthSlice[0], monthSlice[1]).map((m, i) => (
        <>
          <TableRow key={m.key}>
            {i === 0 && <TableCell rowSpan={MONTHS.slice(monthSlice[0], monthSlice[1]).length * 2} className="font-semibold align-top">{label}</TableCell>}
            <TableCell>{m.label}</TableCell>
            <TableCell className="text-right">{fmt(Number(data[m.key] || 0))}</TableCell>
          </TableRow>
          {renderMonthDetail(m.key)}
        </>
      ))}
      <TableRow className="bg-muted/50 font-semibold">
        <TableCell colSpan={2}>{label} Sub-total</TableCell>
        <TableCell className="text-right">{fmt(subtotal)}</TableCell>
      </TableRow>
    </>
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/gross-sales')}><ArrowLeft className="h-5 w-5" /></Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{data.firm_name}</h1>
            <div className="flex gap-2 mt-1 flex-wrap">
              <Badge variant="outline">{data.province}</Badge>
              <Badge variant="secondary">{data.funding_type}</Badge>
              <Badge>{data.year}</Badge>
            </div>
            <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
              {data.email && <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{data.email}</span>}
              {data.mobile_number && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{data.mobile_number}</span>}
            </div>
          </div>
        </div>
        <Button onClick={() => navigate(`/gross-sales/${id}/edit`)} className="gap-2">
          <Pencil className="h-4 w-4" /> Edit
        </Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Monthly Sales & Details ('000)</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quarter</TableHead>
                <TableHead>Month</TableHead>
                <TableHead className="text-right">Gross Sales</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {renderQuarterRows('Q1', [0, 3], q1)}
              {renderQuarterRows('Q2', [3, 6], q2)}
              <TableRow className="bg-primary/10 font-bold">
                <TableCell colSpan={2}>1st Semester</TableCell>
                <TableCell className="text-right">{fmt(sem1)}</TableCell>
              </TableRow>
              {renderQuarterRows('Q3', [6, 9], q3)}
              {renderQuarterRows('Q4', [9, 12], q4)}
              <TableRow className="bg-primary/10 font-bold">
                <TableCell colSpan={2}>2nd Semester</TableCell>
                <TableCell className="text-right">{fmt(sem2)}</TableCell>
              </TableRow>
              <TableRow className="bg-primary/20 font-bold text-lg">
                <TableCell colSpan={2}>TOTAL</TableCell>
                <TableCell className="text-right">{fmt(total)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {data.remarks && (
        <Card>
          <CardHeader><CardTitle>Remarks</CardTitle></CardHeader>
          <CardContent><p className="text-muted-foreground">{data.remarks}</p></CardContent>
        </Card>
      )}
    </div>
  );
}

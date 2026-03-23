import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Pencil } from 'lucide-react';

export default function GrossSalesView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('gross_sales').select('*').eq('id', id).single().then(({ data: d }) => {
      setData(d);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <div className="flex items-center justify-center py-20"><LoadingSpinner size="lg" /></div>;
  if (!data) return <div className="text-center py-20 text-muted-foreground">Record not found</div>;

  const months = [
    { key: 'jan', label: 'January' }, { key: 'feb', label: 'February' }, { key: 'mar', label: 'March' },
    { key: 'apr', label: 'April' }, { key: 'may', label: 'May' }, { key: 'jun', label: 'June' },
    { key: 'jul', label: 'July' }, { key: 'aug', label: 'August' }, { key: 'sep', label: 'September' },
    { key: 'oct', label: 'October' }, { key: 'nov', label: 'November' }, { key: 'dec', label: 'December' },
  ];

  const q1 = Number(data.jan || 0) + Number(data.feb || 0) + Number(data.mar || 0);
  const q2 = Number(data.apr || 0) + Number(data.may || 0) + Number(data.jun || 0);
  const q3 = Number(data.jul || 0) + Number(data.aug || 0) + Number(data.sep || 0);
  const q4 = Number(data.oct || 0) + Number(data.nov || 0) + Number(data.dec || 0);
  const sem1 = q1 + q2;
  const sem2 = q3 + q4;
  const total = sem1 + sem2;

  const fmt = (v: number) => `₱${v.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/gross-sales')}><ArrowLeft className="h-5 w-5" /></Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{data.firm_name}</h1>
            <div className="flex gap-2 mt-1">
              <Badge variant="outline">{data.province}</Badge>
              <Badge variant="secondary">{data.funding_type}</Badge>
              <Badge>{data.year}</Badge>
            </div>
          </div>
        </div>
        <Button onClick={() => navigate(`/gross-sales/${id}/edit`)} className="gap-2">
          <Pencil className="h-4 w-4" /> Edit
        </Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Monthly Sales ('000)</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Quarter</TableHead>
                <TableHead>Month</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Q1 */}
              {months.slice(0, 3).map((m, i) => (
                <TableRow key={m.key}>
                  {i === 0 && <TableCell rowSpan={3} className="font-semibold align-top">Q1</TableCell>}
                  <TableCell>{m.label}</TableCell>
                  <TableCell className="text-right">{fmt(Number(data[m.key] || 0))}</TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-muted/50 font-semibold">
                <TableCell colSpan={2}>Q1 Sub-total</TableCell>
                <TableCell className="text-right">{fmt(q1)}</TableCell>
              </TableRow>

              {/* Q2 */}
              {months.slice(3, 6).map((m, i) => (
                <TableRow key={m.key}>
                  {i === 0 && <TableCell rowSpan={3} className="font-semibold align-top">Q2</TableCell>}
                  <TableCell>{m.label}</TableCell>
                  <TableCell className="text-right">{fmt(Number(data[m.key] || 0))}</TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-muted/50 font-semibold">
                <TableCell colSpan={2}>Q2 Sub-total</TableCell>
                <TableCell className="text-right">{fmt(q2)}</TableCell>
              </TableRow>

              <TableRow className="bg-primary/10 font-bold">
                <TableCell colSpan={2}>1st Semester</TableCell>
                <TableCell className="text-right">{fmt(sem1)}</TableCell>
              </TableRow>

              {/* Q3 */}
              {months.slice(6, 9).map((m, i) => (
                <TableRow key={m.key}>
                  {i === 0 && <TableCell rowSpan={3} className="font-semibold align-top">Q3</TableCell>}
                  <TableCell>{m.label}</TableCell>
                  <TableCell className="text-right">{fmt(Number(data[m.key] || 0))}</TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-muted/50 font-semibold">
                <TableCell colSpan={2}>Q3 Sub-total</TableCell>
                <TableCell className="text-right">{fmt(q3)}</TableCell>
              </TableRow>

              {/* Q4 */}
              {months.slice(9, 12).map((m, i) => (
                <TableRow key={m.key}>
                  {i === 0 && <TableCell rowSpan={3} className="font-semibold align-top">Q4</TableCell>}
                  <TableCell>{m.label}</TableCell>
                  <TableCell className="text-right">{fmt(Number(data[m.key] || 0))}</TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-muted/50 font-semibold">
                <TableCell colSpan={2}>Q4 Sub-total</TableCell>
                <TableCell className="text-right">{fmt(q4)}</TableCell>
              </TableRow>

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

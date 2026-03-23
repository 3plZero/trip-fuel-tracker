import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DollarSign, Building2, TrendingUp, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const PROVINCES = ['Abra', 'Apayao', 'Baguio - Benguet', 'Ifugao', 'Kalinga', 'Mountain Province'];
const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function GrossSalesDashboard() {
  const [allData, setAllData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<string>('all');

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase.from('gross_sales').select('*');
      setAllData(data || []);
      setLoading(false);
    }
    fetch();
  }, []);

  const years = Array.from(new Set(allData.map(d => d.year?.toString()).filter(Boolean))).sort().reverse();

  const data = selectedYear === 'all'
    ? allData
    : allData.filter(d => d.year?.toString() === selectedYear);

  if (loading) {
    return <div className="flex items-center justify-center py-20"><LoadingSpinner size="lg" /></div>;
  }

  const totalFirms = data.length;
  const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'] as const;
  
  const totalSales = data.reduce((sum, d) => {
    return sum + months.reduce((s, m) => s + Number(d[m] || 0), 0);
  }, 0);

  const q1Total = data.reduce((s, d) => s + Number(d.jan || 0) + Number(d.feb || 0) + Number(d.mar || 0), 0);
  const q2Total = data.reduce((s, d) => s + Number(d.apr || 0) + Number(d.may || 0) + Number(d.jun || 0), 0);
  const q3Total = data.reduce((s, d) => s + Number(d.jul || 0) + Number(d.aug || 0) + Number(d.sep || 0), 0);
  const q4Total = data.reduce((s, d) => s + Number(d.oct || 0) + Number(d.nov || 0) + Number(d.dec || 0), 0);
  const sem1 = q1Total + q2Total;
  const sem2 = q3Total + q4Total;

  const setupTotal = data.filter(d => d.funding_type === 'SETUP').reduce((sum, d) => sum + months.reduce((s, m) => s + Number(d[m] || 0), 0), 0);
  const lgiaTotal = data.filter(d => d.funding_type === 'LGIA/SSCP').reduce((sum, d) => sum + months.reduce((s, m) => s + Number(d[m] || 0), 0), 0);

  const byProvince = PROVINCES.map(p => ({
    name: p.length > 12 ? p.substring(0, 12) + '...' : p,
    sales: data.filter(d => d.province === p).reduce((sum, d) => months.reduce((s, m) => s + Number(d[m] || 0), sum), 0) / 1000,
  }));

  const fundingData = [
    { name: 'SETUP', value: setupTotal },
    { name: 'LGIA/SSCP', value: lgiaTotal },
  ].filter(d => d.value > 0);

  const quarterData = [
    { name: 'Q1', value: q1Total / 1000 },
    { name: 'Q2', value: q2Total / 1000 },
    { name: 'Q3', value: q3Total / 1000 },
    { name: 'Q4', value: q4Total / 1000 },
  ];

  const stats = [
    { label: 'Total Gross Sales', value: totalSales.toLocaleString(undefined, { minimumFractionDigits: 2 }), icon: DollarSign, color: 'text-emerald-500' },
    { label: 'Total Firms', value: totalFirms, icon: Building2, color: 'text-blue-500' },
    { label: '1st Semester', value: sem1.toLocaleString(undefined, { minimumFractionDigits: 2 }), icon: TrendingUp, color: 'text-amber-500' },
    { label: '2nd Semester', value: sem2.toLocaleString(undefined, { minimumFractionDigits: 2 }), icon: BarChart3, color: 'text-rose-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gross Sales Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of gross sales across CAR provinces (in '000)</p>
        </div>
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Filter by year" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Years</SelectItem>
            {years.map(y => <SelectItem key={y} value={y!}>{y}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map(s => (
          <Card key={s.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
              <s.icon className={`h-5 w-5 ${s.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-lg">Sales by Province ('000)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={byProvince}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-20} textAnchor="end" height={60} />
                <YAxis />
                <Tooltip formatter={(val: number) => `${val.toLocaleString()}K`} />
                <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Quarterly Breakdown ('000)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={quarterData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(val: number) => `${val.toLocaleString()}K`} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {quarterData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {fundingData.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-lg">Funding Type Breakdown</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={fundingData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  <Cell fill="#0ea5e9" />
                  <Cell fill="#10b981" />
                </Pie>
                <Tooltip formatter={(val: number) => `₱${val.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

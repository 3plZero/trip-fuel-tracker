import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GraduationCap, Users, Building2, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const PROVINCES = ['Abra', 'Apayao', 'Benguet', 'Ifugao', 'Kalinga', 'Mountain Province', 'Baguio City'];
const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

export default function TrainingsDashboard() {
  const [allTrainings, setAllTrainings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<string>('all');

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase.from('technology_trainings').select('*');
      setAllTrainings(data || []);
      setLoading(false);
    }
    fetch();
  }, []);

  const years = Array.from(new Set(allTrainings.map(t => {
    const d = t.training_date_start;
    return d ? new Date(d).getFullYear().toString() : null;
  }).filter(Boolean))).sort().reverse();

  const trainings = selectedYear === 'all'
    ? allTrainings
    : allTrainings.filter(t => t.training_date_start && new Date(t.training_date_start).getFullYear().toString() === selectedYear);

  if (loading) {
    return <div className="flex items-center justify-center py-20"><LoadingSpinner size="lg" /></div>;
  }

  const totalTrainings = trainings.length;
  const totalParticipants = trainings.reduce((s, t) => s + (t.participants_total || 0), 0);
  const totalFirms = trainings.reduce((s, t) => s + (t.firms_assisted || 0), 0);
  const totalExpenses = trainings.reduce((s, t) => s + Number(t.actual_expenses || 0), 0);
  const totalApproved = trainings.reduce((s, t) => s + Number(t.approved_amount || 0), 0);
  const totalFemale = trainings.reduce((s, t) => s + (t.participants_female || 0), 0);
  const totalMale = trainings.reduce((s, t) => s + (t.participants_male || 0), 0);

  const byProvince = PROVINCES.map(p => ({
    name: p,
    trainings: trainings.filter(t => t.province === p).length,
    participants: trainings.filter(t => t.province === p).reduce((s, t) => s + (t.participants_total || 0), 0),
  }));

  const genderData = [
    { name: 'Female', value: totalFemale },
    { name: 'Male', value: totalMale },
  ];

  const stats = [
    { label: 'Total Trainings', value: totalTrainings, icon: GraduationCap, color: 'text-rose-500' },
    { label: 'Total Participants', value: totalParticipants.toLocaleString(), icon: Users, color: 'text-blue-500' },
    { label: 'Firms Assisted', value: totalFirms.toLocaleString(), icon: Building2, color: 'text-emerald-500' },
    { label: 'Actual Expenses', value: `₱${totalExpenses.toLocaleString()}`, icon: DollarSign, color: 'text-amber-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Technology Trainings Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of trainings across CAR provinces</p>
        </div>
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Filter by year" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Years</SelectItem>
            {years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
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
          <CardHeader>
            <CardTitle className="text-lg">Trainings by Province</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={byProvince}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" height={60} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="trainings" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Gender Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={genderData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  <Cell fill="#ec4899" />
                  <Cell fill="#3b82f6" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Budget Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Approved Amount</p>
              <p className="text-2xl font-bold text-emerald-600">₱{totalApproved.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Actual Expenses</p>
              <p className="text-2xl font-bold text-amber-600">₱{totalExpenses.toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

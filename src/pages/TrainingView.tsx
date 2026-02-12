import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ArrowLeft, Pencil } from 'lucide-react';
import { format } from 'date-fns';

export default function TrainingView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [training, setTraining] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('technology_trainings').select('*').eq('id', id).single().then(({ data, error }) => {
      if (error || !data) { navigate('/trainings'); return; }
      setTraining(data);
      setLoading(false);
    });
  }, [id]);

  if (loading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>;
  if (!training) return null;

  const Field = ({ label, value }: { label: string; value: any }) => (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-medium">{value || '—'}</p>
    </div>
  );

  const dateRange = [
    training.training_date_start && format(new Date(training.training_date_start), 'MMM d, yyyy'),
    training.training_date_end && format(new Date(training.training_date_end), 'MMM d, yyyy'),
  ].filter(Boolean).join(' — ');

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/trainings')}><ArrowLeft className="h-5 w-5" /></Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">{training.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={training.status === 'completed' ? 'default' : 'secondary'}>{training.status}</Badge>
              <span className="text-muted-foreground">{training.province}</span>
            </div>
          </div>
        </div>
        <Button onClick={() => navigate(`/trainings/${id}/edit`)} className="gap-2">
          <Pencil className="h-4 w-4" /> Edit
        </Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Province" value={training.province} />
          <Field label="Date" value={dateRange} />
          <Field label="Venue" value={training.venue} />
          <Field label="Status" value={training.status} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Participants</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <Field label="Total" value={training.participants_total} />
          <Field label="Female" value={training.participants_female} />
          <Field label="Male" value={training.participants_male} />
          <Field label="Senior Citizens" value={training.participants_senior} />
          <Field label="Differently-Abled" value={training.participants_differently_abled} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Firms & Resource Persons</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Firms Assisted" value={training.firms_assisted} />
          <Field label="Firm Names" value={training.firm_names} />
          <Field label="Resource Person(s)" value={training.resource_persons} />
          <Field label="Counterpart" value={training.counterpart} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Expenditures</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Approved Amount" value={`₱${Number(training.approved_amount || 0).toLocaleString()}`} />
          <Field label="Actual Expenses" value={`₱${Number(training.actual_expenses || 0).toLocaleString()}`} />
          <div className="sm:col-span-2">
            <Field label="Remarks" value={training.remarks} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

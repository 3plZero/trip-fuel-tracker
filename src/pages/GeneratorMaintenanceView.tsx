import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowLeft, Pencil, Printer, Check, X } from 'lucide-react';
import { format } from 'date-fns';

const CHECKLIST_LABELS: Record<string, string> = {
  fuel_level: 'Check fuel level and refill if necessary',
  oil_level: 'Check engine oil level',
  coolant_level: 'Check coolant level',
  battery: 'Check battery condition and terminals',
  belts_hoses: 'Inspect belts and hoses for wear',
  air_filter: 'Check and clean air filter',
  test_run: 'Perform test run (10-15 minutes)',
};

export default function GeneratorMaintenanceView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: checklist, isLoading } = useQuery({
    queryKey: ['generator-maintenance-checklist', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('generator_maintenance_checklists')
        .select('*, generators(equipment_name, serial_no), generator_maintenance_checks(*)')
        .eq('id', id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return <div className="flex items-center justify-center py-8">Loading...</div>;
  }

  if (!checklist) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Checklist not found</p>
        <Link to="/generator-maintenance">
          <Button className="mt-4">Back to List</Button>
        </Link>
      </div>
    );
  }

  const renderCheckIcon = (value: boolean) => {
    return value ? (
      <Check className="h-4 w-4 text-green-600 mx-auto" />
    ) : (
      <X className="h-4 w-4 text-muted-foreground mx-auto" />
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/generator-maintenance')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold">Generator Maintenance Checklist</h1>
          <Badge variant={checklist.status === 'completed' ? 'default' : 'secondary'}>
            {checklist.status}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="h-4 w-4 mr-2" /> Print
          </Button>
          <Link to={`/generator-maintenance/${id}/edit`}>
            <Button>
              <Pencil className="h-4 w-4 mr-2" /> Edit
            </Button>
          </Link>
        </div>
      </div>

      {/* Header Info */}
      <Card>
        <CardHeader>
          <CardTitle>Checklist Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Generator</p>
              <p className="font-medium">
                {checklist.generators?.equipment_name || 'N/A'}
                {checklist.generators?.serial_no && ` (${checklist.generators.serial_no})`}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Month</p>
              <p className="font-medium">
                {format(new Date(checklist.checklist_month), 'MMMM yyyy')}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Performed By</p>
              <p className="font-medium">{checklist.performed_by || 'N/A'}</p>
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
              {checklist.generator_maintenance_checks?.map((check: any) => (
                <TableRow key={check.id}>
                  <TableCell className="text-sm">
                    {CHECKLIST_LABELS[check.check_item] || check.check_item}
                  </TableCell>
                  <TableCell className="text-center">{renderCheckIcon(check.week_2)}</TableCell>
                  <TableCell className="text-center">{renderCheckIcon(check.week_4)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {check.remarks || '-'}
                  </TableCell>
                </TableRow>
              )) || (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No checks recorded
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Monitoring Notes */}
      {checklist.monitoring_notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Monitoring Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{checklist.monitoring_notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

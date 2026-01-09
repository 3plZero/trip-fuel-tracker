import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Loader2, Pencil, Printer } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import TravelOrderPrintLayout from '@/components/TravelOrderPrintLayout';

interface TravelOrder {
  id: string;
  travel_order_no: string;
  order_date: string;
  inclusive_dates_start: string | null;
  inclusive_dates_end: string | null;
  destinations: string | null;
  purpose: string | null;
  expense_type: string | null;
  expense_type_other: string | null;
  transportation_type: string | null;
  has_actual_expenses: boolean;
  has_per_diem: boolean;
  remarks: string | null;
  approved_by: string | null;
  approved_by_position: string | null;
  status: string;
}

interface Personnel {
  id: string;
  name: string;
  position: string | null;
  division_agency: string | null;
}

export default function TravelOrderView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<TravelOrder | null>(null);
  const [personnel, setPersonnel] = useState<Personnel[]>([]);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    const { data: orderData, error } = await supabase
      .from('travel_orders')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !orderData) {
      toast({
        title: 'Error',
        description: 'Travel order not found',
        variant: 'destructive',
      });
      navigate('/travel-orders');
      return;
    }

    const { data: personnelData } = await supabase
      .from('travel_order_personnel')
      .select('*')
      .eq('travel_order_id', id)
      .order('sort_order');

    setOrder(orderData);
    setPersonnel(personnelData || []);
    setLoading(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-success text-success-foreground">Approved</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge className="bg-warning text-warning-foreground">Draft</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!order) return null;

  return (
    <>
      <div className="space-y-6 print:hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/travel-orders')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Travel Order {order.travel_order_no}</h1>
              <p className="text-muted-foreground">
                Created on {format(new Date(order.order_date), 'MMMM dd, yyyy')}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button asChild>
              <Link to={`/travel-orders/${id}/edit`}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">TO Number</p>
                  <p className="font-medium">{order.travel_order_no}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  {getStatusBadge(order.status)}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Order Date</p>
                  <p className="font-medium">{format(new Date(order.order_date), 'MMMM dd, yyyy')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Inclusive Dates</p>
                  <p className="font-medium">
                    {order.inclusive_dates_start && order.inclusive_dates_end
                      ? `${format(new Date(order.inclusive_dates_start), 'MMM dd')} - ${format(new Date(order.inclusive_dates_end), 'MMM dd, yyyy')}`
                      : '-'}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Destination(s)</p>
                <p className="font-medium">{order.destinations || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Purpose</p>
                <p className="font-medium">{order.purpose || '-'}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Travel Expenses</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Expense Type</p>
                <p className="font-medium capitalize">
                  {order.expense_type === 'others'
                    ? `Others: ${order.expense_type_other}`
                    : order.expense_type?.replace('_', ' ') || '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Expense Method</p>
                <p className="font-medium">
                  {[
                    order.has_actual_expenses && 'Actual Expenses',
                    order.has_per_diem && 'Per Diem',
                  ]
                    .filter(Boolean)
                    .join(', ') || '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Mode of Transportation</p>
                <p className="font-medium capitalize">
                  {order.transportation_type?.replace('_', ' ') || '-'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Personnel ({personnel.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {personnel.length === 0 ? (
                <p className="text-muted-foreground">No personnel assigned</p>
              ) : (
                <div className="space-y-3">
                  {personnel.map((person) => (
                    <div key={person.id} className="border-b pb-3 last:border-0 last:pb-0">
                      <p className="font-medium">{person.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {[person.position, person.division_agency].filter(Boolean).join(' • ')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Approval</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Approved By</p>
                <p className="font-medium">{order.approved_by || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Position</p>
                <p className="font-medium">{order.approved_by_position || '-'}</p>
              </div>
              {order.remarks && (
                <div>
                  <p className="text-sm text-muted-foreground">Remarks</p>
                  <p className="font-medium">{order.remarks}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Print Layout */}
      <div className="hidden print:block" ref={printRef}>
        <TravelOrderPrintLayout order={order} personnel={personnel} />
      </div>
    </>
  );
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, FileText, Eye, Pencil, Trash2, Loader2, Search, Plane } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface TravelOrder {
  id: string;
  travel_order_no: string;
  order_date: string;
  inclusive_dates_start: string | null;
  inclusive_dates_end: string | null;
  destinations: string | null;
  purpose: string | null;
  status: string;
  personnel_count?: number;
}

export default function TravelOrders() {
  const [travelOrders, setTravelOrders] = useState<TravelOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchTravelOrders();
  }, []);

  const fetchTravelOrders = async () => {
    const { data, error } = await supabase
      .from('travel_orders')
      .select(`
        id,
        travel_order_no,
        order_date,
        inclusive_dates_start,
        inclusive_dates_end,
        destinations,
        purpose,
        status
      `)
      .order('order_date', { ascending: false });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to load travel orders',
        variant: 'destructive',
      });
    } else {
      // Fetch personnel counts
      const ordersWithCounts = await Promise.all(
        (data || []).map(async (order) => {
          const { count } = await supabase
            .from('travel_order_personnel')
            .select('*', { count: 'exact', head: true })
            .eq('travel_order_id', order.id);
          return { ...order, personnel_count: count || 0 };
        })
      );
      setTravelOrders(ordersWithCounts);
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    const { error } = await supabase.from('travel_orders').delete().eq('id', deleteId);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete travel order',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Deleted',
        description: 'Travel order deleted successfully',
      });
      fetchTravelOrders();
    }
    setDeleteId(null);
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

  const filteredOrders = travelOrders.filter((order) => {
    const matchesSearch =
      searchQuery === '' ||
      order.travel_order_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.destinations?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.purpose?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Travel Orders</h1>
          <p className="text-muted-foreground">View and manage all travel orders</p>
        </div>
        <Button asChild>
          <Link to="/travel-orders/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Travel Order
          </Link>
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by TO No., destination, or purpose..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Travel Orders</CardTitle>
          <CardDescription>Complete list of all travel orders</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Plane className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium">No travel orders found</h3>
              <p className="text-muted-foreground">
                {travelOrders.length === 0
                  ? 'Create your first travel order to get started.'
                  : 'Try adjusting your search or filters.'}
              </p>
              {travelOrders.length === 0 && (
                <Button asChild className="mt-4">
                  <Link to="/travel-orders/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Travel Order
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>TO No.</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Inclusive Dates</TableHead>
                    <TableHead>Personnel</TableHead>
                    <TableHead>Destination</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.travel_order_no}</TableCell>
                      <TableCell>{format(new Date(order.order_date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>
                        {order.inclusive_dates_start && order.inclusive_dates_end
                          ? `${format(new Date(order.inclusive_dates_start), 'MMM dd')} - ${format(new Date(order.inclusive_dates_end), 'MMM dd, yyyy')}`
                          : '-'}
                      </TableCell>
                      <TableCell>{order.personnel_count || 0}</TableCell>
                      <TableCell className="max-w-[150px] truncate">
                        {order.destinations || '-'}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {order.purpose || '-'}
                      </TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" asChild>
                            <Link to={`/travel-orders/${order.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon" asChild>
                            <Link to={`/travel-orders/${order.id}/edit`}>
                              <Pencil className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteId(order.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Travel Order?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the travel order and all
              associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

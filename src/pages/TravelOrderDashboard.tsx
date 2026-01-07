import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Plane, Users, Calendar, FileCheck, Loader2, Eye, Pencil, Trash2 } from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useToast } from '@/hooks/use-toast';
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

interface TravelOrder {
  id: string;
  travel_order_no: string;
  order_date: string;
  status: string;
  destinations: string | null;
  inclusive_dates_start: string | null;
  inclusive_dates_end: string | null;
}

interface MonthlyStats {
  totalOrders: number;
  approvedOrders: number;
  pendingOrders: number;
  totalPersonnel: number;
}

interface ChartData {
  month: string;
  orders: number;
}

interface StatusData {
  name: string;
  value: number;
  color: string;
}

export default function TravelOrderDashboard() {
  const [travelOrders, setTravelOrders] = useState<TravelOrder[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats>({
    totalOrders: 0,
    approvedOrders: 0,
    pendingOrders: 0,
    totalPersonnel: 0,
  });
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [statusData, setStatusData] = useState<StatusData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, [selectedMonth]);

  const fetchData = async () => {
    setLoading(true);
    
    const [year, month] = selectedMonth.split('-').map(Number);
    const startDate = startOfMonth(new Date(year, month - 1));
    const endDate = endOfMonth(new Date(year, month - 1));

    // Fetch travel orders for current month
    const { data: orders, error: ordersError } = await supabase
      .from('travel_orders')
      .select('*')
      .gte('order_date', format(startDate, 'yyyy-MM-dd'))
      .lte('order_date', format(endDate, 'yyyy-MM-dd'))
      .order('order_date', { ascending: false });

    if (ordersError) {
      console.error('Error fetching orders:', ordersError);
    } else {
      setTravelOrders(orders || []);
      
      // Get personnel count
      let totalPersonnel = 0;
      if (orders && orders.length > 0) {
        const { count } = await supabase
          .from('travel_order_personnel')
          .select('*', { count: 'exact', head: true })
          .in('travel_order_id', orders.map(o => o.id));
        totalPersonnel = count || 0;
      }

      const approvedCount = (orders || []).filter(o => o.status === 'approved').length;
      const draftCount = (orders || []).filter(o => o.status === 'draft').length;
      const cancelledCount = (orders || []).filter(o => o.status === 'cancelled').length;

      setMonthlyStats({
        totalOrders: orders?.length || 0,
        approvedOrders: approvedCount,
        pendingOrders: draftCount,
        totalPersonnel,
      });

      setStatusData([
        { name: 'Approved', value: approvedCount, color: 'hsl(var(--success))' },
        { name: 'Draft', value: draftCount, color: 'hsl(var(--warning))' },
        { name: 'Cancelled', value: cancelledCount, color: 'hsl(var(--destructive))' },
      ].filter(s => s.value > 0));
    }

    // Fetch last 6 months data for chart
    const chartDataPromises = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(new Date(), i);
      const start = startOfMonth(monthDate);
      const end = endOfMonth(monthDate);
      
      chartDataPromises.push(
        supabase
          .from('travel_orders')
          .select('id', { count: 'exact', head: true })
          .gte('order_date', format(start, 'yyyy-MM-dd'))
          .lte('order_date', format(end, 'yyyy-MM-dd'))
          .then(({ count }) => ({
            month: format(monthDate, 'MMM'),
            orders: count || 0,
          }))
      );
    }

    const chartResults = await Promise.all(chartDataPromises);
    setChartData(chartResults);
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    const { error } = await supabase
      .from('travel_orders')
      .delete()
      .eq('id', deleteId);

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
      fetchData();
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

  // Generate month options for the last 12 months
  const monthOptions = [];
  for (let i = 0; i < 12; i++) {
    const date = subMonths(new Date(), i);
    monthOptions.push({
      value: format(date, 'yyyy-MM'),
      label: format(date, 'MMMM yyyy'),
    });
  }

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Travel Order Dashboard</h1>
          <p className="text-muted-foreground">Overview of travel orders and personnel</p>
        </div>
        <div className="flex gap-3">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button asChild>
            <Link to="/travel-orders/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Travel Order
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Plane className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monthlyStats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monthlyStats.approvedOrders}</div>
            <p className="text-xs text-muted-foreground">Approved orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monthlyStats.pendingOrders}</div>
            <p className="text-xs text-muted-foreground">Draft orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Personnel</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monthlyStats.totalPersonnel}</div>
            <p className="text-xs text-muted-foreground">Total travelers</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Travel Orders</CardTitle>
            <CardDescription>Travel orders over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px',
                    }}
                  />
                  <Bar dataKey="orders" fill="hsl(var(--chart-1))" name="Orders" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
            <CardDescription>Travel orders by status this month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              {statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  No data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Travel Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Travel Orders</CardTitle>
          <CardDescription>Travel orders for the selected month</CardDescription>
        </CardHeader>
        <CardContent>
          {travelOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Plane className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium">No travel orders found</h3>
              <p className="text-muted-foreground">
                Create your first travel order to get started.
              </p>
              <Button asChild className="mt-4">
                <Link to="/travel-orders/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Travel Order
                </Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>TO No.</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Inclusive Dates</TableHead>
                    <TableHead>Destination</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {travelOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.travel_order_no}</TableCell>
                      <TableCell>{format(new Date(order.order_date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>
                        {order.inclusive_dates_start && order.inclusive_dates_end
                          ? `${format(new Date(order.inclusive_dates_start), 'MMM dd')} - ${format(new Date(order.inclusive_dates_end), 'MMM dd')}`
                          : '-'}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {order.destinations || '-'}
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Travel Order?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the travel order and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

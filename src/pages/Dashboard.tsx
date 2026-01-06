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
import { Plus, FileText, Fuel, MapPin, TrendingUp, Loader2, Eye, Pencil, Trash2 } from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
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

interface TripTicket {
  id: string;
  tr_no: string;
  ticket_date: string;
  status: string;
  total_distance: number;
  gasoline_used: number;
  vehicles: { plate_no: string } | null;
  drivers: { full_name: string } | null;
}

interface MonthlyStats {
  totalTrips: number;
  totalFuel: number;
  totalDistance: number;
  avgConsumption: number;
}

interface ChartData {
  month: string;
  fuel: number;
  distance: number;
}

export default function Dashboard() {
  const [tripTickets, setTripTickets] = useState<TripTicket[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats>({
    totalTrips: 0,
    totalFuel: 0,
    totalDistance: 0,
    avgConsumption: 0,
  });
  const [chartData, setChartData] = useState<ChartData[]>([]);
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

    // Fetch trip tickets for current month
    const { data: tickets, error: ticketsError } = await supabase
      .from('trip_tickets')
      .select(`
        id,
        tr_no,
        ticket_date,
        status,
        total_distance,
        gasoline_used,
        vehicles (plate_no),
        drivers (full_name)
      `)
      .gte('ticket_date', format(startDate, 'yyyy-MM-dd'))
      .lte('ticket_date', format(endDate, 'yyyy-MM-dd'))
      .order('ticket_date', { ascending: false });

    if (ticketsError) {
      console.error('Error fetching tickets:', ticketsError);
    } else {
      setTripTickets(tickets || []);
      
      // Calculate monthly stats
      const totalFuel = (tickets || []).reduce((sum, t) => sum + (t.gasoline_used || 0), 0);
      const totalDistance = (tickets || []).reduce((sum, t) => sum + (t.total_distance || 0), 0);
      setMonthlyStats({
        totalTrips: tickets?.length || 0,
        totalFuel,
        totalDistance,
        avgConsumption: totalDistance > 0 ? totalDistance / totalFuel : 0,
      });
    }

    // Fetch last 6 months data for chart
    const chartDataPromises = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(new Date(), i);
      const start = startOfMonth(monthDate);
      const end = endOfMonth(monthDate);
      
      chartDataPromises.push(
        supabase
          .from('trip_tickets')
          .select('gasoline_used, total_distance')
          .gte('ticket_date', format(start, 'yyyy-MM-dd'))
          .lte('ticket_date', format(end, 'yyyy-MM-dd'))
          .then(({ data }) => ({
            month: format(monthDate, 'MMM'),
            fuel: (data || []).reduce((sum, t) => sum + (t.gasoline_used || 0), 0),
            distance: (data || []).reduce((sum, t) => sum + (t.total_distance || 0), 0),
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
      .from('trip_tickets')
      .delete()
      .eq('id', deleteId);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete trip ticket',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Deleted',
        description: 'Trip ticket deleted successfully',
      });
      fetchData();
    }
    setDeleteId(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-success text-success-foreground">Completed</Badge>;
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
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Overview of vehicle trip tickets and fuel consumption</p>
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
            <Link to="/trip-tickets/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Trip Ticket
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Trips</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monthlyStats.totalTrips}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fuel Consumed</CardTitle>
            <Fuel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monthlyStats.totalFuel.toFixed(2)} L</div>
            <p className="text-xs text-muted-foreground">Total liters used</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Distance Traveled</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monthlyStats.totalDistance.toFixed(0)} km</div>
            <p className="text-xs text-muted-foreground">Total kilometers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Consumption</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {monthlyStats.avgConsumption.toFixed(2)} km/L
            </div>
            <p className="text-xs text-muted-foreground">Distance per liter</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Fuel Usage</CardTitle>
            <CardDescription>Fuel consumption over the last 6 months</CardDescription>
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
                  <Bar dataKey="fuel" fill="hsl(var(--chart-1))" name="Fuel (L)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Distance Trend</CardTitle>
            <CardDescription>Total distance traveled over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
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
                  <Line
                    type="monotone"
                    dataKey="distance"
                    stroke="hsl(var(--chart-2))"
                    name="Distance (km)"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--chart-2))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trip Tickets Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Trip Tickets</CardTitle>
          <CardDescription>Trip tickets for the selected month</CardDescription>
        </CardHeader>
        <CardContent>
          {tripTickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium">No trip tickets found</h3>
              <p className="text-muted-foreground">
                Create your first trip ticket to get started.
              </p>
              <Button asChild className="mt-4">
                <Link to="/trip-tickets/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Trip Ticket
                </Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>TR No.</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Driver</TableHead>
                    <TableHead>Distance</TableHead>
                    <TableHead>Fuel Used</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tripTickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell className="font-medium">{ticket.tr_no}</TableCell>
                      <TableCell>{format(new Date(ticket.ticket_date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>{ticket.vehicles?.plate_no || '-'}</TableCell>
                      <TableCell>{ticket.drivers?.full_name || '-'}</TableCell>
                      <TableCell>{ticket.total_distance} km</TableCell>
                      <TableCell>{ticket.gasoline_used} L</TableCell>
                      <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" asChild>
                            <Link to={`/trip-tickets/${ticket.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon" asChild>
                            <Link to={`/trip-tickets/${ticket.id}/edit`}>
                              <Pencil className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteId(ticket.id)}
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
            <AlertDialogTitle>Delete Trip Ticket?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the trip ticket and all associated data.
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
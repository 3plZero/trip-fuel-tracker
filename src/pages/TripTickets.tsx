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
import { Plus, FileText, Eye, Pencil, Trash2, Loader2, Search } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface TripTicket {
  id: string;
  tr_no: string;
  ticket_date: string;
  status: string;
  purpose: string | null;
  total_distance: number;
  gasoline_used: number;
  vehicles: { plate_no: string } | null;
  drivers: { full_name: string } | null;
}

export default function TripTickets() {
  const [tripTickets, setTripTickets] = useState<TripTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterVehicle, setFilterVehicle] = useState<string>('all');
  const [filterDriver, setFilterDriver] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchTripTickets();
  }, []);

  const fetchTripTickets = async () => {
    const { data, error } = await supabase
      .from('trip_tickets')
      .select(`
        id,
        tr_no,
        ticket_date,
        status,
        purpose,
        total_distance,
        gasoline_used,
        vehicles (plate_no),
        drivers (full_name)
      `)
      .order('ticket_date', { ascending: false });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to load trip tickets',
        variant: 'destructive',
      });
    } else {
      setTripTickets(data || []);
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    const { error } = await supabase.from('trip_tickets').delete().eq('id', deleteId);

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
      fetchTripTickets();
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

  // Get unique vehicles and drivers for filters
  const uniqueVehicles = [...new Set(tripTickets.map(t => t.vehicles?.plate_no).filter(Boolean))];
  const uniqueDrivers = [...new Set(tripTickets.map(t => t.drivers?.full_name).filter(Boolean))];

  // Filter trip tickets
  const filteredTickets = tripTickets.filter(ticket => {
    const matchesSearch = searchQuery === '' || 
      ticket.tr_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.vehicles?.plate_no?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.drivers?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.purpose?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
    const matchesVehicle = filterVehicle === 'all' || ticket.vehicles?.plate_no === filterVehicle;
    const matchesDriver = filterDriver === 'all' || ticket.drivers?.full_name === filterDriver;

    return matchesSearch && matchesStatus && matchesVehicle && matchesDriver;
  });

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Trip Tickets</h1>
          <p className="text-muted-foreground">View and manage all vehicle trip tickets</p>
        </div>
        <Button asChild>
          <Link to="/trip-tickets/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Trip Ticket
          </Link>
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by TR No., vehicle, driver, or purpose..."
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
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterVehicle} onValueChange={setFilterVehicle}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Vehicle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Vehicles</SelectItem>
            {uniqueVehicles.map((plate) => (
              <SelectItem key={plate} value={plate!}>{plate}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterDriver} onValueChange={setFilterDriver}>
          <SelectTrigger className="w-full sm:w-[150px]">
            <SelectValue placeholder="Driver" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Drivers</SelectItem>
            {uniqueDrivers.map((name) => (
              <SelectItem key={name} value={name!}>{name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Trip Tickets</CardTitle>
          <CardDescription>Complete list of all vehicle trip tickets</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredTickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium">No trip tickets found</h3>
              <p className="text-muted-foreground">
                {tripTickets.length === 0 
                  ? 'Create your first trip ticket to get started.'
                  : 'Try adjusting your search or filters.'}
              </p>
              {tripTickets.length === 0 && (
                <Button asChild className="mt-4">
                  <Link to="/trip-tickets/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Trip Ticket
                  </Link>
                </Button>
              )}
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
                    <TableHead>Purpose</TableHead>
                    <TableHead>Distance</TableHead>
                    <TableHead>Fuel Used</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell className="font-medium">{ticket.tr_no}</TableCell>
                      <TableCell>{format(new Date(ticket.ticket_date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>{ticket.vehicles?.plate_no || '-'}</TableCell>
                      <TableCell>{ticket.drivers?.full_name || '-'}</TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {ticket.purpose || '-'}
                      </TableCell>
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

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Trip Ticket?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the trip ticket and all
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
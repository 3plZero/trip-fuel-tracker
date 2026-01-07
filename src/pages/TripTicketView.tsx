import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
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
import { ArrowLeft, Loader2, Printer, Pencil } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import TripTicketPrintLayout from '@/components/TripTicketPrintLayout';

interface TripTicket {
  id: string;
  tr_no: string;
  ticket_date: string;
  status: string;
  purpose: string | null;
  balance_tank_start: number;
  issued_from_stock: number;
  purchased_outside: number;
  gasoline_used: number;
  balance_tank_end: number;
  gear_oil_used: number;
  motor_oil_used: number;
  brake_fluid_used: number;
  grease_used: number;
  total_distance: number;
  vehicles: { plate_no: string; description: string | null } | null;
  drivers: { full_name: string } | null;
}

interface Passenger {
  id: string;
  passenger_name: string;
}

interface Destination {
  id: string;
  destination: string;
}

interface TripDetail {
  id: string;
  trip_no: number;
  trip_date: string | null;
  departure_time: string | null;
  departure_place: string | null;
  arrival_time: string | null;
  arrival_place: string | null;
  odometer_initial: number | null;
  odometer_end: number | null;
}

export default function TripTicketView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [ticket, setTicket] = useState<TripTicket | null>(null);
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [tripDetails, setTripDetails] = useState<TripDetail[]>([]);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    const [ticketRes, passengersRes, destinationsRes, detailsRes] = await Promise.all([
      supabase
        .from('trip_tickets')
        .select(`
          *,
          vehicles (plate_no, description),
          drivers (full_name)
        `)
        .eq('id', id)
        .single(),
      supabase.from('trip_ticket_passengers').select('*').eq('trip_ticket_id', id).order('sort_order'),
      supabase.from('trip_ticket_destinations').select('*').eq('trip_ticket_id', id).order('sort_order'),
      supabase.from('trip_details').select('*').eq('trip_ticket_id', id).order('sort_order'),
    ]);

    if (ticketRes.error || !ticketRes.data) {
      toast({
        title: 'Error',
        description: 'Trip ticket not found',
        variant: 'destructive',
      });
      navigate('/trip-tickets');
      return;
    }

    setTicket(ticketRes.data);
    setPassengers(passengersRes.data || []);
    setDestinations(destinationsRes.data || []);
    setTripDetails(detailsRes.data || []);
    setLoading(false);
  };

  const handlePrint = () => {
    window.print();
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

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!ticket) return null;

  return (
    <div className="space-y-6">
      {/* Header - Hidden in print */}
      <div className="no-print flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/trip-tickets')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Trip Ticket {ticket.tr_no}</h1>
            <p className="text-muted-foreground">View trip ticket details</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button asChild>
            <Link to={`/trip-tickets/${id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
        </div>
      </div>

      {/* Print Layout - Only visible when printing */}
      <div className="print-only hidden">
        <TripTicketPrintLayout
          ticket={ticket}
          passengers={passengers}
          destinations={destinations}
          tripDetails={tripDetails}
        />
      </div>

      {/* Screen Content - Hidden when printing */}
      <div className="no-print space-y-6">
        {/* Trip Information */}
        <Card>
          <CardHeader>
            <CardTitle>Trip Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <p className="text-sm text-muted-foreground">TR No.</p>
                <p className="font-medium">{ticket.tr_no}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="font-medium">{format(new Date(ticket.ticket_date), 'MMMM dd, yyyy')}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Vehicle</p>
                <p className="font-medium">
                  {ticket.vehicles?.plate_no || '-'}
                  {ticket.vehicles?.description && ` - ${ticket.vehicles.description}`}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Driver</p>
                <p className="font-medium">{ticket.drivers?.full_name || '-'}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-muted-foreground">Purpose</p>
                <p className="font-medium">{ticket.purpose || '-'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <div className="mt-1">{getStatusBadge(ticket.status)}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Passengers & Destinations */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Authorized Passengers</CardTitle>
            </CardHeader>
            <CardContent>
              {passengers.length === 0 ? (
                <p className="text-muted-foreground">No passengers listed</p>
              ) : (
                <ul className="space-y-1">
                  {passengers.map((p, i) => (
                    <li key={p.id}>{i + 1}. {p.passenger_name}</li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Destinations</CardTitle>
            </CardHeader>
            <CardContent>
              {destinations.length === 0 ? (
                <p className="text-muted-foreground">No destinations listed</p>
              ) : (
                <ul className="space-y-1">
                  {destinations.map((d, i) => (
                    <li key={d.id}>{i + 1}. {d.destination}</li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Trip Details */}
        <Card>
          <CardHeader>
            <CardTitle>Trip Details</CardTitle>
          </CardHeader>
          <CardContent>
            {tripDetails.length === 0 ? (
              <p className="text-muted-foreground">No trip details recorded</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Trip No.</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Departure Time</TableHead>
                      <TableHead>Departure Place</TableHead>
                      <TableHead>Arrival Time</TableHead>
                      <TableHead>Arrival Place</TableHead>
                      <TableHead>Odometer (Initial)</TableHead>
                      <TableHead>Odometer (End)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tripDetails.map((td) => (
                      <TableRow key={td.id}>
                        <TableCell>{td.trip_no}</TableCell>
                        <TableCell>
                          {td.trip_date ? format(new Date(td.trip_date), 'MMM dd, yyyy') : '-'}
                        </TableCell>
                        <TableCell>{td.departure_time || '-'}</TableCell>
                        <TableCell>{td.departure_place || '-'}</TableCell>
                        <TableCell>{td.arrival_time || '-'}</TableCell>
                        <TableCell>{td.arrival_place || '-'}</TableCell>
                        <TableCell>{td.odometer_initial ?? '-'}</TableCell>
                        <TableCell>{td.odometer_end ?? '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Fuel & Lubricants */}
        <Card>
          <CardHeader>
            <CardTitle>Fuel & Lubricants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
              <div>
                <p className="text-sm text-muted-foreground">Balance in Tank (Start)</p>
                <p className="font-medium">{ticket.balance_tank_start} L</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Issued from Stock</p>
                <p className="font-medium">{ticket.issued_from_stock} L</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Purchased Outside</p>
                <p className="font-medium">{ticket.purchased_outside} L</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Gasoline Used</p>
                <p className="font-medium">{ticket.gasoline_used} L</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Balance in Tank (End)</p>
                <p className="font-medium">{ticket.balance_tank_end} L</p>
              </div>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-4">
              <div>
                <p className="text-sm text-muted-foreground">Gear Oil Used</p>
                <p className="font-medium">{ticket.gear_oil_used} L</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Motor Oil Used</p>
                <p className="font-medium">{ticket.motor_oil_used} L</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Brake Fluid Used</p>
                <p className="font-medium">{ticket.brake_fluid_used} L</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Grease Used</p>
                <p className="font-medium">{ticket.grease_used} L</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t">
              <div>
                <p className="text-sm text-muted-foreground">Total Distance Traveled</p>
                <p className="text-xl font-bold">{ticket.total_distance} km</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
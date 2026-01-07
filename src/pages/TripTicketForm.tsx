import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Loader2, Plus, Trash2, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import LocationPicker from '@/components/LocationPicker';

interface Vehicle {
  id: string;
  plate_no: string;
  description: string | null;
}

interface Driver {
  id: string;
  full_name: string;
}

interface TripDetail {
  id?: string;
  trip_no: number;
  trip_date: string;
  departure_time: string;
  departure_place: string;
  arrival_time: string;
  arrival_place: string;
  odometer_initial: string;
  odometer_end: string;
}

interface FormData {
  ticket_date: string;
  vehicle_id: string;
  driver_id: string;
  purpose: string;
  status: string;
  passengers: string[];
  destinations: string[];
  balance_tank_start: string;
  issued_from_stock: string;
  purchased_outside: string;
  gasoline_used: string;
  balance_tank_end: string;
  gear_oil_used: string;
  motor_oil_used: string;
  brake_fluid_used: string;
  grease_used: string;
  total_distance: string;
  tripDetails: TripDetail[];
}

export default function TripTicketForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const isEditing = !!id;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [trNo, setTrNo] = useState('');
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [formData, setFormData] = useState<FormData>({
    ticket_date: format(new Date(), 'yyyy-MM-dd'),
    vehicle_id: '',
    driver_id: '',
    purpose: '',
    status: 'draft',
    passengers: [''],
    destinations: [''],
    balance_tank_start: '0',
    issued_from_stock: '0',
    purchased_outside: '0',
    gasoline_used: '0',
    balance_tank_end: '0',
    gear_oil_used: '0',
    motor_oil_used: '0',
    brake_fluid_used: '0',
    grease_used: '0',
    total_distance: '0',
    tripDetails: [
      {
        trip_no: 1,
        trip_date: format(new Date(), 'yyyy-MM-dd'),
        departure_time: '',
        departure_place: '',
        arrival_time: '',
        arrival_place: '',
        odometer_initial: '',
        odometer_end: '',
      },
    ],
  });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    // Fetch vehicles and drivers
    const [vehiclesRes, driversRes] = await Promise.all([
      supabase.from('vehicles').select('id, plate_no, description').eq('is_active', true),
      supabase.from('drivers').select('id, full_name').eq('is_active', true),
    ]);

    setVehicles(vehiclesRes.data || []);
    setDrivers(driversRes.data || []);

    if (isEditing) {
      // Fetch existing trip ticket
      const { data: ticket, error } = await supabase
        .from('trip_tickets')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !ticket) {
        toast({
          title: 'Error',
          description: 'Trip ticket not found',
          variant: 'destructive',
        });
        navigate('/trip-tickets');
        return;
      }

      setTrNo(ticket.tr_no);

      // Fetch related data
      const [passengersRes, destinationsRes, detailsRes] = await Promise.all([
        supabase.from('trip_ticket_passengers').select('*').eq('trip_ticket_id', id).order('sort_order'),
        supabase.from('trip_ticket_destinations').select('*').eq('trip_ticket_id', id).order('sort_order'),
        supabase.from('trip_details').select('*').eq('trip_ticket_id', id).order('sort_order'),
      ]);

      setFormData({
        ticket_date: ticket.ticket_date,
        vehicle_id: ticket.vehicle_id || '',
        driver_id: ticket.driver_id || '',
        purpose: ticket.purpose || '',
        status: ticket.status,
        passengers: passengersRes.data?.map((p) => p.passenger_name) || [''],
        destinations: destinationsRes.data?.map((d) => d.destination) || [''],
        balance_tank_start: String(ticket.balance_tank_start || 0),
        issued_from_stock: String(ticket.issued_from_stock || 0),
        purchased_outside: String(ticket.purchased_outside || 0),
        gasoline_used: String(ticket.gasoline_used || 0),
        balance_tank_end: String(ticket.balance_tank_end || 0),
        gear_oil_used: String(ticket.gear_oil_used || 0),
        motor_oil_used: String(ticket.motor_oil_used || 0),
        brake_fluid_used: String(ticket.brake_fluid_used || 0),
        grease_used: String(ticket.grease_used || 0),
        total_distance: String(ticket.total_distance || 0),
        tripDetails: detailsRes.data?.map((d) => ({
          id: d.id,
          trip_no: d.trip_no,
          trip_date: d.trip_date || '',
          departure_time: d.departure_time || '',
          departure_place: d.departure_place || '',
          arrival_time: d.arrival_time || '',
          arrival_place: d.arrival_place || '',
          odometer_initial: String(d.odometer_initial || ''),
          odometer_end: String(d.odometer_end || ''),
        })) || [{
          trip_no: 1,
          trip_date: format(new Date(), 'yyyy-MM-dd'),
          departure_time: '',
          departure_place: '',
          arrival_time: '',
          arrival_place: '',
          odometer_initial: '',
          odometer_end: '',
        }],
      });
    } else {
      // Generate new TR number
      const { data } = await supabase.rpc('generate_tr_no');
      setTrNo(data || '');
    }

    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);

    try {
      const ticketData = {
        tr_no: trNo,
        ticket_date: formData.ticket_date,
        vehicle_id: formData.vehicle_id || null,
        driver_id: formData.driver_id || null,
        purpose: formData.purpose || null,
        status: formData.status,
        balance_tank_start: parseFloat(formData.balance_tank_start) || 0,
        issued_from_stock: parseFloat(formData.issued_from_stock) || 0,
        purchased_outside: parseFloat(formData.purchased_outside) || 0,
        gasoline_used: parseFloat(formData.gasoline_used) || 0,
        balance_tank_end: parseFloat(formData.balance_tank_end) || 0,
        gear_oil_used: parseFloat(formData.gear_oil_used) || 0,
        motor_oil_used: parseFloat(formData.motor_oil_used) || 0,
        brake_fluid_used: parseFloat(formData.brake_fluid_used) || 0,
        grease_used: parseFloat(formData.grease_used) || 0,
        total_distance: parseFloat(formData.total_distance) || 0,
        created_by: user.id,
      };

      let ticketId: string;

      if (isEditing) {
        const { error } = await supabase
          .from('trip_tickets')
          .update(ticketData)
          .eq('id', id);

        if (error) throw error;
        ticketId = id!;

        // Delete existing related data
        await Promise.all([
          supabase.from('trip_ticket_passengers').delete().eq('trip_ticket_id', id),
          supabase.from('trip_ticket_destinations').delete().eq('trip_ticket_id', id),
          supabase.from('trip_details').delete().eq('trip_ticket_id', id),
        ]);
      } else {
        const { data, error } = await supabase
          .from('trip_tickets')
          .insert(ticketData)
          .select('id')
          .single();

        if (error) throw error;
        ticketId = data.id;
      }

      // Insert passengers
      const validPassengers = formData.passengers.filter((p) => p.trim());
      if (validPassengers.length > 0) {
        await supabase.from('trip_ticket_passengers').insert(
          validPassengers.map((p, i) => ({
            trip_ticket_id: ticketId,
            passenger_name: p,
            sort_order: i,
          }))
        );
      }

      // Insert destinations
      const validDestinations = formData.destinations.filter((d) => d.trim());
      if (validDestinations.length > 0) {
        await supabase.from('trip_ticket_destinations').insert(
          validDestinations.map((d, i) => ({
            trip_ticket_id: ticketId,
            destination: d,
            sort_order: i,
          }))
        );
      }

      // Insert trip details
      if (formData.tripDetails.length > 0) {
        await supabase.from('trip_details').insert(
          formData.tripDetails.map((td, i) => ({
            trip_ticket_id: ticketId,
            trip_no: td.trip_no,
            trip_date: td.trip_date || null,
            departure_time: td.departure_time || null,
            departure_place: td.departure_place || null,
            arrival_time: td.arrival_time || null,
            arrival_place: td.arrival_place || null,
            odometer_initial: parseFloat(td.odometer_initial) || null,
            odometer_end: parseFloat(td.odometer_end) || null,
            sort_order: i,
          }))
        );
      }

      // Update vehicle location if status is completed and location was selected
      if (formData.status === 'completed' && selectedLocation && formData.vehicle_id) {
        await supabase
          .from('vehicles')
          .update({
            last_location_lat: selectedLocation.lat,
            last_location_lng: selectedLocation.lng,
            last_location_updated_at: new Date().toISOString(),
          })
          .eq('id', formData.vehicle_id);
      }

      toast({
        title: isEditing ? 'Updated' : 'Created',
        description: `Trip ticket ${isEditing ? 'updated' : 'created'} successfully`,
      });
      navigate('/trip-tickets');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const addPassenger = () => {
    if (formData.passengers.length < 9) {
      setFormData({ ...formData, passengers: [...formData.passengers, ''] });
    }
  };

  const removePassenger = (index: number) => {
    const newPassengers = formData.passengers.filter((_, i) => i !== index);
    setFormData({ ...formData, passengers: newPassengers.length ? newPassengers : [''] });
  };

  const updatePassenger = (index: number, value: string) => {
    const newPassengers = [...formData.passengers];
    newPassengers[index] = value;
    setFormData({ ...formData, passengers: newPassengers });
  };

  const addDestination = () => {
    if (formData.destinations.length < 9) {
      setFormData({ ...formData, destinations: [...formData.destinations, ''] });
    }
  };

  const removeDestination = (index: number) => {
    const newDestinations = formData.destinations.filter((_, i) => i !== index);
    setFormData({ ...formData, destinations: newDestinations.length ? newDestinations : [''] });
  };

  const updateDestination = (index: number, value: string) => {
    const newDestinations = [...formData.destinations];
    newDestinations[index] = value;
    setFormData({ ...formData, destinations: newDestinations });
  };

  const addTripDetail = () => {
    const newTripNo = formData.tripDetails.length + 1;
    setFormData({
      ...formData,
      tripDetails: [
        ...formData.tripDetails,
        {
          trip_no: newTripNo,
          trip_date: format(new Date(), 'yyyy-MM-dd'),
          departure_time: '',
          departure_place: '',
          arrival_time: '',
          arrival_place: '',
          odometer_initial: '',
          odometer_end: '',
        },
      ],
    });
  };

  const removeTripDetail = (index: number) => {
    const newDetails = formData.tripDetails.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      tripDetails: newDetails.map((td, i) => ({ ...td, trip_no: i + 1 })),
    });
  };

  const updateTripDetail = (index: number, field: keyof TripDetail, value: string | number) => {
    const newDetails = [...formData.tripDetails];
    newDetails[index] = { ...newDetails[index], [field]: value };
    setFormData({ ...formData, tripDetails: newDetails });
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/trip-tickets')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {isEditing ? 'Edit Trip Ticket' : 'Create Trip Ticket'}
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? `Editing ${trNo}` : `New ticket: ${trNo}`}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header Section */}
        <Card>
          <CardHeader>
            <CardTitle>Trip Information</CardTitle>
            <CardDescription>Basic trip ticket details</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label>TR No.</Label>
              <Input value={trNo} disabled className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ticket_date">Date</Label>
              <Input
                id="ticket_date"
                type="date"
                value={formData.ticket_date}
                onChange={(e) => setFormData({ ...formData, ticket_date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicle_id">Vehicle</Label>
              <Select
                value={formData.vehicle_id}
                onValueChange={(value) => setFormData({ ...formData, vehicle_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select vehicle" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.plate_no} {v.description ? `- ${v.description}` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="driver_id">Driver</Label>
              <Select
                value={formData.driver_id}
                onValueChange={(value) => setFormData({ ...formData, driver_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select driver" />
                </SelectTrigger>
                <SelectContent>
                  {drivers.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="purpose">Purpose</Label>
              <Textarea
                id="purpose"
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                placeholder="Purpose of the trip"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          
          {/* Vehicle Location Button - only show when completed and vehicle selected */}
          {formData.status === 'completed' && formData.vehicle_id && (
            <CardContent className="pt-0">
              <div className="rounded-lg border border-dashed border-primary/50 bg-primary/5 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">Set Vehicle Storage Location</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedLocation
                          ? `Location: ${selectedLocation.lat.toFixed(4)}, ${selectedLocation.lng.toFixed(4)}`
                          : 'Mark where the vehicle is stored after this trip'}
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant={selectedLocation ? 'default' : 'outline'}
                    onClick={() => setShowLocationPicker(true)}
                  >
                    <MapPin className="mr-2 h-4 w-4" />
                    {selectedLocation ? 'Change Location' : 'Set Location'}
                  </Button>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Location Picker Dialog */}
        <LocationPicker
          open={showLocationPicker}
          onOpenChange={setShowLocationPicker}
          onLocationSelect={(lat, lng) => setSelectedLocation({ lat, lng })}
          initialLocation={selectedLocation}
        />

        {/* Passengers & Destinations */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Authorized Passengers</CardTitle>
                <CardDescription>Up to 9 passengers</CardDescription>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addPassenger} disabled={formData.passengers.length >= 9}>
                <Plus className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              {formData.passengers.map((passenger, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={passenger}
                    onChange={(e) => updatePassenger(index, e.target.value)}
                    placeholder={`Passenger ${index + 1}`}
                  />
                  {formData.passengers.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => removePassenger(index)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Destinations</CardTitle>
                <CardDescription>Up to 9 destinations</CardDescription>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addDestination} disabled={formData.destinations.length >= 9}>
                <Plus className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-2">
              {formData.destinations.map((destination, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={destination}
                    onChange={(e) => updateDestination(index, e.target.value)}
                    placeholder={`Destination ${index + 1}`}
                  />
                  {formData.destinations.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeDestination(index)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Trip Details */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Trip Details</CardTitle>
              <CardDescription>Departure, arrival, and odometer readings</CardDescription>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addTripDetail}>
              <Plus className="mr-2 h-4 w-4" />
              Add Trip
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.tripDetails.map((trip, index) => (
              <Card key={index} className="bg-muted/30">
                <CardContent className="pt-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="font-medium">Trip {trip.trip_no}</span>
                    {formData.tripDetails.length > 1 && (
                      <Button type="button" variant="ghost" size="sm" onClick={() => removeTripDetail(index)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Input
                        type="date"
                        value={trip.trip_date}
                        onChange={(e) => updateTripDetail(index, 'trip_date', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Departure Time</Label>
                      <Input
                        type="time"
                        value={trip.departure_time}
                        onChange={(e) => updateTripDetail(index, 'departure_time', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Departure Place</Label>
                      <Input
                        value={trip.departure_place}
                        onChange={(e) => updateTripDetail(index, 'departure_place', e.target.value)}
                        placeholder="e.g., DOST-CAR Office"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Odometer (Initial)</Label>
                      <Input
                        type="number"
                        value={trip.odometer_initial}
                        onChange={(e) => updateTripDetail(index, 'odometer_initial', e.target.value)}
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Arrival Time</Label>
                      <Input
                        type="time"
                        value={trip.arrival_time}
                        onChange={(e) => updateTripDetail(index, 'arrival_time', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Arrival Place</Label>
                      <Input
                        value={trip.arrival_place}
                        onChange={(e) => updateTripDetail(index, 'arrival_place', e.target.value)}
                        placeholder="e.g., La Trinidad, Benguet"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Odometer (End)</Label>
                      <Input
                        type="number"
                        value={trip.odometer_end}
                        onChange={(e) => updateTripDetail(index, 'odometer_end', e.target.value)}
                        placeholder="0"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>

        {/* Fuel & Oil Section */}
        <Card>
          <CardHeader>
            <CardTitle>Fuel & Lubricants</CardTitle>
            <CardDescription>Gasoline and oil consumption data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
              <div className="space-y-2">
                <Label>Balance in Tank (Start)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.balance_tank_start}
                  onChange={(e) => setFormData({ ...formData, balance_tank_start: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Issued from Stock</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.issued_from_stock}
                  onChange={(e) => setFormData({ ...formData, issued_from_stock: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Purchased Outside</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.purchased_outside}
                  onChange={(e) => setFormData({ ...formData, purchased_outside: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Gasoline Used</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.gasoline_used}
                  onChange={(e) => setFormData({ ...formData, gasoline_used: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Balance in Tank (End)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.balance_tank_end}
                  onChange={(e) => setFormData({ ...formData, balance_tank_end: e.target.value })}
                />
              </div>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label>Gear Oil Used</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.gear_oil_used}
                  onChange={(e) => setFormData({ ...formData, gear_oil_used: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Motor Oil Used</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.motor_oil_used}
                  onChange={(e) => setFormData({ ...formData, motor_oil_used: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Brake Fluid Used</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.brake_fluid_used}
                  onChange={(e) => setFormData({ ...formData, brake_fluid_used: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Grease Used</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.grease_used}
                  onChange={(e) => setFormData({ ...formData, grease_used: e.target.value })}
                />
              </div>
            </div>
            <div className="mt-4">
              <div className="space-y-2 max-w-xs">
                <Label>Total Distance (km)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.total_distance}
                  onChange={(e) => setFormData({ ...formData, total_distance: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate('/trip-tickets')}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : isEditing ? (
              'Update Trip Ticket'
            ) : (
              'Create Trip Ticket'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
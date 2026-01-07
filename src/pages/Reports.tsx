import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Loader2, Printer, FileText, Search, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

interface FuelReportRow {
  id: string;
  tr_no: string;
  ticket_date: string;
  plate_no: string;
  vehicle_description: string | null;
  driver_name: string | null;
  balance_tank_start: number;
  purchased_outside: number;
  issued_from_stock: number;
  total_fuel_in_tank: number;
  gasoline_used: number;
  balance_tank_end: number;
  total_distance: number;
  distance_per_liter: number;
  odometer_start: number | null;
  odometer_end: number | null;
  motor_oil_used: number;
  grease_used: number;
}

interface Vehicle {
  id: string;
  plate_no: string;
}

interface Driver {
  id: string;
  full_name: string;
}

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<FuelReportRow[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterVehicle, setFilterVehicle] = useState('all');
  const [filterDriver, setFilterDriver] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);

    const [ticketsRes, vehiclesRes, driversRes] = await Promise.all([
      supabase
        .from('trip_tickets')
        .select(`
          id,
          tr_no,
          ticket_date,
          balance_tank_start,
          purchased_outside,
          issued_from_stock,
          gasoline_used,
          balance_tank_end,
          total_distance,
          motor_oil_used,
          grease_used,
          vehicles (plate_no, description),
          drivers (full_name),
          trip_details (
            odometer_initial,
            odometer_end
          )
        `)
        .eq('status', 'completed')
        .order('ticket_date', { ascending: false }),
      supabase.from('vehicles').select('id, plate_no').eq('is_active', true).order('plate_no'),
      supabase.from('drivers').select('id, full_name').eq('is_active', true).order('full_name'),
    ]);

    if (vehiclesRes.data) setVehicles(vehiclesRes.data);
    if (driversRes.data) setDrivers(driversRes.data);

    if (!ticketsRes.error && ticketsRes.data) {
      const formattedData: FuelReportRow[] = ticketsRes.data.map((t) => {
        const tripDetails = t.trip_details || [];
        const odometerStart = tripDetails.length > 0 ? tripDetails[0].odometer_initial : null;
        const odometerEnd = tripDetails.length > 0 ? tripDetails[tripDetails.length - 1].odometer_end : null;
        
        const totalFuelInTank = (t.balance_tank_start || 0) + (t.purchased_outside || 0) + (t.issued_from_stock || 0);
        const distancePerLiter = t.gasoline_used > 0 ? (t.total_distance || 0) / t.gasoline_used : 0;

        return {
          id: t.id,
          tr_no: t.tr_no,
          ticket_date: t.ticket_date,
          plate_no: t.vehicles?.plate_no || '-',
          vehicle_description: t.vehicles?.description || null,
          driver_name: t.drivers?.full_name || null,
          balance_tank_start: t.balance_tank_start || 0,
          purchased_outside: t.purchased_outside || 0,
          issued_from_stock: t.issued_from_stock || 0,
          total_fuel_in_tank: totalFuelInTank,
          gasoline_used: t.gasoline_used || 0,
          balance_tank_end: t.balance_tank_end || 0,
          total_distance: t.total_distance || 0,
          distance_per_liter: distancePerLiter,
          odometer_start: odometerStart,
          odometer_end: odometerEnd,
          motor_oil_used: t.motor_oil_used || 0,
          grease_used: t.grease_used || 0,
        };
      });
      setReportData(formattedData);
    }
    setLoading(false);
  };

  const handlePrint = () => {
    window.print();
  };

  // Filter data
  const filteredData = reportData.filter((row) => {
    const matchesSearch =
      searchQuery === '' ||
      row.tr_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
      row.plate_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (row.driver_name && row.driver_name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesVehicle = filterVehicle === 'all' || row.plate_no === filterVehicle;
    const matchesDriver = filterDriver === 'all' || row.driver_name === filterDriver;
    
    return matchesSearch && matchesVehicle && matchesDriver;
  });

  // Calculate totals
  const totals = filteredData.reduce(
    (acc, row) => ({
      purchased: acc.purchased + row.purchased_outside + row.issued_from_stock,
      consumed: acc.consumed + row.gasoline_used,
      distance: acc.distance + row.total_distance,
      oil: acc.oil + row.motor_oil_used,
      grease: acc.grease + row.grease_used,
    }),
    { purchased: 0, consumed: 0, distance: 0, oil: 0, grease: 0 }
  );

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header - Hidden in print */}
      <div className="no-print flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Fuel Consumption Report</h1>
          <p className="text-muted-foreground">All completed trip tickets with fuel consumption data</p>
        </div>
        <Button variant="outline" onClick={handlePrint}>
          <Printer className="mr-2 h-4 w-4" />
          Print
        </Button>
      </div>

      {/* Filters */}
      <div className="no-print flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by TR No., vehicle, or driver..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterVehicle} onValueChange={setFilterVehicle}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Vehicles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Vehicles</SelectItem>
            {vehicles.map((v) => (
              <SelectItem key={v.id} value={v.plate_no}>
                {v.plate_no}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterDriver} onValueChange={setFilterDriver}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Drivers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Drivers</SelectItem>
            {drivers.map((d) => (
              <SelectItem key={d.id} value={d.full_name}>
                {d.full_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Print Header */}
      <div className="print-only hidden text-center mb-6">
        <h1 className="text-lg font-bold">Department of Science and Technology</h1>
        <h2 className="text-base">Cordillera Administrative Region</h2>
        <h3 className="text-lg font-bold mt-4">FUEL CONSUMPTION REPORT</h3>
        <p className="mt-2">All Completed Trip Tickets</p>
      </div>

      {/* Report Table */}
      <Card>
        <CardHeader className="no-print">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Trip Tickets ({filteredData.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FileText className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium">No data found</h3>
              <p className="text-muted-foreground">
                No completed trip tickets match your search criteria.
              </p>
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
                    <TableHead className="text-right">Fuel In (L)</TableHead>
                    <TableHead className="text-right">Consumed (L)</TableHead>
                    <TableHead className="text-right">Distance (km)</TableHead>
                    <TableHead className="text-right">Km/L</TableHead>
                    <TableHead className="text-right">Oil (L)</TableHead>
                    <TableHead className="text-right">Grease (L)</TableHead>
                    <TableHead className="no-print w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-medium">{row.tr_no}</TableCell>
                      <TableCell>{format(new Date(row.ticket_date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>{row.plate_no}</TableCell>
                      <TableCell>{row.driver_name || '-'}</TableCell>
                      <TableCell className="text-right">{row.total_fuel_in_tank.toFixed(2)}</TableCell>
                      <TableCell className="text-right">{row.gasoline_used.toFixed(2)}</TableCell>
                      <TableCell className="text-right">{row.total_distance.toFixed(0)}</TableCell>
                      <TableCell className="text-right">{row.distance_per_liter.toFixed(2)}</TableCell>
                      <TableCell className="text-right">{row.motor_oil_used.toFixed(2)}</TableCell>
                      <TableCell className="text-right">{row.grease_used.toFixed(2)}</TableCell>
                      <TableCell className="no-print">
                        <Button variant="ghost" size="icon" asChild>
                          <Link to={`/trip-tickets/${row.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {/* Totals Row */}
                  <TableRow className="bg-muted/50 font-bold">
                    <TableCell colSpan={4}>TOTAL</TableCell>
                    <TableCell className="text-right">{totals.purchased.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{totals.consumed.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{totals.distance.toFixed(0)}</TableCell>
                    <TableCell className="text-right">
                      {totals.consumed > 0 ? (totals.distance / totals.consumed).toFixed(2) : '0.00'}
                    </TableCell>
                    <TableCell className="text-right">{totals.oil.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{totals.grease.toFixed(2)}</TableCell>
                    <TableCell className="no-print"></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Section */}
      {filteredData.length > 0 && (
        <Card className="no-print">
          <CardHeader>
            <CardTitle>Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm text-muted-foreground">Total Trips</p>
                <p className="text-2xl font-bold">{filteredData.length}</p>
              </div>
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm text-muted-foreground">Fuel Purchased</p>
                <p className="text-2xl font-bold">{totals.purchased.toFixed(2)} L</p>
              </div>
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm text-muted-foreground">Fuel Consumed</p>
                <p className="text-2xl font-bold">{totals.consumed.toFixed(2)} L</p>
              </div>
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm text-muted-foreground">Total Distance</p>
                <p className="text-2xl font-bold">{totals.distance.toFixed(0)} km</p>
              </div>
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm text-muted-foreground">Avg. Consumption</p>
                <p className="text-2xl font-bold">
                  {totals.consumed > 0 ? (totals.distance / totals.consumed).toFixed(2) : '0.00'} km/L
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Loader2, Printer, FileText, Car, ArrowLeft, Fuel, TrendingUp } from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, ResponsiveContainer } from 'recharts';

interface Vehicle {
  id: string;
  plate_no: string;
  description: string | null;
  make_brand: string | null;
}

interface VehicleSummary {
  id: string;
  plate_no: string;
  description: string | null;
  make_brand: string | null;
  total_trips: number;
  total_fuel: number;
  total_distance: number;
  avg_consumption: number;
}

interface FuelReportRow {
  tr_no: string;
  ticket_date: string;
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

export default function Reports() {
  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [vehicleSummaries, setVehicleSummaries] = useState<VehicleSummary[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [reportData, setReportData] = useState<FuelReportRow[]>([]);
  const [vehicleInfo, setVehicleInfo] = useState<Vehicle | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchVehiclesWithSummary();
  }, [selectedMonth]);

  useEffect(() => {
    if (selectedVehicle && selectedMonth) {
      fetchReportData();
    }
  }, [selectedVehicle, selectedMonth]);

  const fetchVehiclesWithSummary = async () => {
    setLoading(true);
    const [year, month] = selectedMonth.split('-').map(Number);
    const startDate = startOfMonth(new Date(year, month - 1));
    const endDate = endOfMonth(new Date(year, month - 1));

    const { data: vehicleData, error: vehicleError } = await supabase
      .from('vehicles')
      .select('id, plate_no, description, make_brand')
      .eq('is_active', true)
      .order('plate_no');

    if (vehicleError || !vehicleData) {
      setLoading(false);
      return;
    }

    setVehicles(vehicleData);

    // Fetch trip tickets for all vehicles for the selected month
    const { data: tickets } = await supabase
      .from('trip_tickets')
      .select('vehicle_id, gasoline_used, total_distance')
      .gte('ticket_date', format(startDate, 'yyyy-MM-dd'))
      .lte('ticket_date', format(endDate, 'yyyy-MM-dd'));

    const summaries: VehicleSummary[] = vehicleData.map((v) => {
      const vehicleTickets = (tickets || []).filter((t) => t.vehicle_id === v.id);
      const totalFuel = vehicleTickets.reduce((sum, t) => sum + (t.gasoline_used || 0), 0);
      const totalDistance = vehicleTickets.reduce((sum, t) => sum + (t.total_distance || 0), 0);

      return {
        ...v,
        total_trips: vehicleTickets.length,
        total_fuel: totalFuel,
        total_distance: totalDistance,
        avg_consumption: totalFuel > 0 ? totalDistance / totalFuel : 0,
      };
    });

    setVehicleSummaries(summaries);
    setLoading(false);
  };

  const fetchReportData = async () => {
    if (!selectedVehicle) return;
    setLoading(true);

    const [year, month] = selectedMonth.split('-').map(Number);
    const startDate = startOfMonth(new Date(year, month - 1));
    const endDate = endOfMonth(new Date(year, month - 1));

    const vehicle = vehicles.find((v) => v.id === selectedVehicle);
    setVehicleInfo(vehicle || null);

    const { data: tickets, error } = await supabase
      .from('trip_tickets')
      .select(`
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
        trip_details (
          odometer_initial,
          odometer_end
        )
      `)
      .eq('vehicle_id', selectedVehicle)
      .gte('ticket_date', format(startDate, 'yyyy-MM-dd'))
      .lte('ticket_date', format(endDate, 'yyyy-MM-dd'))
      .order('ticket_date');

    if (error) {
      console.error('Error fetching report data:', error);
      setReportData([]);
    } else {
      const formattedData: FuelReportRow[] = (tickets || []).map((t) => {
        const tripDetails = t.trip_details || [];
        const odometerStart = tripDetails.length > 0 ? tripDetails[0].odometer_initial : null;
        const odometerEnd = tripDetails.length > 0 ? tripDetails[tripDetails.length - 1].odometer_end : null;

        const totalFuelInTank = (t.balance_tank_start || 0) + (t.purchased_outside || 0) + (t.issued_from_stock || 0);
        const distancePerLiter = t.gasoline_used > 0 ? (t.total_distance || 0) / t.gasoline_used : 0;

        return {
          tr_no: t.tr_no,
          ticket_date: t.ticket_date,
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

  const handleVehicleClick = (vehicleId: string) => {
    setSelectedVehicle(vehicleId);
  };

  const handleBack = () => {
    setSelectedVehicle(null);
    setReportData([]);
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

  // Calculate totals
  const totals = reportData.reduce(
    (acc, row) => ({
      purchased: acc.purchased + row.purchased_outside + row.issued_from_stock,
      consumed: acc.consumed + row.gasoline_used,
      distance: acc.distance + row.total_distance,
      oil: acc.oil + row.motor_oil_used,
      grease: acc.grease + row.grease_used,
    }),
    { purchased: 0, consumed: 0, distance: 0, oil: 0, grease: 0 }
  );

  // Chart data
  const chartData = reportData.map((row) => ({
    date: format(new Date(row.ticket_date), 'MM/dd'),
    fuel: row.gasoline_used,
    distance: row.total_distance,
    efficiency: row.distance_per_liter,
  }));

  const chartConfig = {
    fuel: {
      label: 'Fuel (L)',
      color: 'hsl(var(--primary))',
    },
    distance: {
      label: 'Distance (km)',
      color: 'hsl(var(--secondary))',
    },
    efficiency: {
      label: 'Efficiency (km/L)',
      color: 'hsl(var(--accent))',
    },
  };

  if (loading && vehicles.length === 0) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Vehicle List View
  if (!selectedVehicle) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Fuel Consumption Report</h1>
            <p className="text-muted-foreground">Select a vehicle to view detailed fuel analysis</p>
          </div>
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
        </div>

        {loading ? (
          <div className="flex h-[40vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {vehicleSummaries.map((vehicle) => (
              <Card
                key={vehicle.id}
                className="cursor-pointer transition-all hover:shadow-lg hover:border-primary"
                onClick={() => handleVehicleClick(vehicle.id)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Car className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{vehicle.plate_no}</CardTitle>
                      <CardDescription className="text-xs">
                        {vehicle.make_brand || vehicle.description || 'Vehicle'}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-md bg-muted p-2">
                      <p className="text-xs text-muted-foreground">Trips</p>
                      <p className="font-semibold">{vehicle.total_trips}</p>
                    </div>
                    <div className="rounded-md bg-muted p-2">
                      <p className="text-xs text-muted-foreground">Fuel Used</p>
                      <p className="font-semibold">{vehicle.total_fuel.toFixed(1)} L</p>
                    </div>
                    <div className="rounded-md bg-muted p-2">
                      <p className="text-xs text-muted-foreground">Distance</p>
                      <p className="font-semibold">{vehicle.total_distance.toFixed(0)} km</p>
                    </div>
                    <div className="rounded-md bg-muted p-2">
                      <p className="text-xs text-muted-foreground">Avg. km/L</p>
                      <p className="font-semibold">{vehicle.avg_consumption.toFixed(1)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Vehicle Detail View
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="no-print flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {vehicleInfo?.plate_no} {vehicleInfo?.description && `- ${vehicleInfo.description}`}
            </h1>
            <p className="text-muted-foreground">
              Fuel Analysis for {format(new Date(selectedMonth + '-01'), 'MMMM yyyy')}
            </p>
          </div>
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
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
        </div>
      </div>

      {/* Report Content */}
      <div ref={printRef}>
        {/* Print Header */}
        <div className="print-only hidden text-center mb-6">
          <h1 className="text-lg font-bold">Department of Science and Technology</h1>
          <h2 className="text-base">Cordillera Administrative Region</h2>
          <h3 className="text-lg font-bold mt-4">FUEL CONSUMPTION REPORT</h3>
          <p className="mt-2">
            Vehicle: {vehicleInfo?.plate_no} {vehicleInfo?.description && `(${vehicleInfo.description})`}
          </p>
          <p>Month: {selectedMonth && format(new Date(selectedMonth + '-01'), 'MMMM yyyy')}</p>
        </div>

        {reportData.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="flex flex-col items-center justify-center text-center">
                <FileText className="h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-medium">No data found</h3>
                <p className="text-muted-foreground">
                  No trip tickets found for this vehicle in the selected month.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 no-print">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Trips</p>
                      <p className="text-2xl font-bold">{reportData.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/10">
                      <Fuel className="h-5 w-5 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Fuel Purchased</p>
                      <p className="text-2xl font-bold">{totals.purchased.toFixed(2)} L</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10">
                      <Fuel className="h-5 w-5 text-red-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Fuel Consumed</p>
                      <p className="text-2xl font-bold">{totals.consumed.toFixed(2)} L</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/10">
                      <Car className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Distance</p>
                      <p className="text-2xl font-bold">{totals.distance.toFixed(0)} km</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/10">
                      <TrendingUp className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Avg. Consumption</p>
                      <p className="text-2xl font-bold">
                        {totals.consumed > 0 ? (totals.distance / totals.consumed).toFixed(2) : '0.00'} km/L
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-4 md:grid-cols-2 no-print">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Fuel Consumption per Trip</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[250px] w-full">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" fontSize={12} />
                      <YAxis fontSize={12} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="fuel" fill="hsl(var(--primary))" radius={4} />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Fuel Efficiency Trend (km/L)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[250px] w-full">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" fontSize={12} />
                      <YAxis fontSize={12} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line
                        type="monotone"
                        dataKey="efficiency"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={{ fill: 'hsl(var(--primary))' }}
                      />
                    </LineChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Table */}
            <Card>
              <CardHeader>
                <CardTitle>Trip Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead rowSpan={2}>Trip Ticket No.</TableHead>
                        <TableHead rowSpan={2}>Date</TableHead>
                        <TableHead rowSpan={2}>Beginning Balance (L)</TableHead>
                        <TableHead colSpan={2} className="text-center border-x">
                          Purchase in Tank
                        </TableHead>
                        <TableHead rowSpan={2}>Total Fuel (L)</TableHead>
                        <TableHead rowSpan={2}>Consumed (L)</TableHead>
                        <TableHead rowSpan={2}>Ending Balance (L)</TableHead>
                        <TableHead rowSpan={2}>Km/L</TableHead>
                        <TableHead colSpan={2} className="text-center border-x">
                          Odometer
                        </TableHead>
                        <TableHead rowSpan={2}>Distance (km)</TableHead>
                        <TableHead rowSpan={2}>Oil (L)</TableHead>
                        <TableHead rowSpan={2}>Grease (L)</TableHead>
                      </TableRow>
                      <TableRow>
                        <TableHead className="border-l">Stock (L)</TableHead>
                        <TableHead className="border-r">Outside (L)</TableHead>
                        <TableHead className="border-l">Begin</TableHead>
                        <TableHead className="border-r">End</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportData.map((row) => (
                        <TableRow key={row.tr_no}>
                          <TableCell className="font-medium">{row.tr_no}</TableCell>
                          <TableCell>{format(new Date(row.ticket_date), 'MM/dd')}</TableCell>
                          <TableCell>{row.balance_tank_start.toFixed(2)}</TableCell>
                          <TableCell className="border-l">{row.issued_from_stock.toFixed(2)}</TableCell>
                          <TableCell className="border-r">{row.purchased_outside.toFixed(2)}</TableCell>
                          <TableCell>{row.total_fuel_in_tank.toFixed(2)}</TableCell>
                          <TableCell>{row.gasoline_used.toFixed(2)}</TableCell>
                          <TableCell>{row.balance_tank_end.toFixed(2)}</TableCell>
                          <TableCell>{row.distance_per_liter.toFixed(2)}</TableCell>
                          <TableCell className="border-l">{row.odometer_start ?? '-'}</TableCell>
                          <TableCell className="border-r">{row.odometer_end ?? '-'}</TableCell>
                          <TableCell>{row.total_distance.toFixed(0)}</TableCell>
                          <TableCell>{row.motor_oil_used.toFixed(2)}</TableCell>
                          <TableCell>{row.grease_used.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                      {/* Totals Row */}
                      <TableRow className="bg-muted/50 font-bold">
                        <TableCell colSpan={3}>TOTAL</TableCell>
                        <TableCell className="border-l" colSpan={2}>
                          {totals.purchased.toFixed(2)} L
                        </TableCell>
                        <TableCell colSpan={2}></TableCell>
                        <TableCell>{totals.consumed.toFixed(2)}</TableCell>
                        <TableCell></TableCell>
                        <TableCell className="border-l" colSpan={2}></TableCell>
                        <TableCell>{totals.distance.toFixed(0)}</TableCell>
                        <TableCell>{totals.oil.toFixed(2)}</TableCell>
                        <TableCell>{totals.grease.toFixed(2)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

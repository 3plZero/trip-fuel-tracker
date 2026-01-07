import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, Car, Pencil, Trash2, Loader2, Upload, Image, X, Search, MapPin } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';

interface Vehicle {
  id: string;
  plate_no: string;
  description: string | null;
  vehicle_type: string | null;
  is_active: boolean;
  engine_no: string | null;
  chassis_no: string | null;
  file_no: string | null;
  vehicle_category: string | null;
  make_brand: string | null;
  body_type: string | null;
  series: string | null;
  gross_weight: number | null;
  net_weight: number | null;
  year_model: string | null;
  year_rebuilt: string | null;
  piston_displacement: string | null;
  max_power: string | null;
  passenger_capacity: number | null;
  color: string | null;
  fuel_type: string | null;
  registration_classification: string | null;
  owner_name: string | null;
  owner_address: string | null;
  encumbered_to: string | null;
  or_no: string | null;
  or_date: string | null;
  cr_no: string | null;
  remarks: string | null;
  registration_image_url: string | null;
  last_location_lat: number | null;
  last_location_lng: number | null;
  last_location_updated_at: string | null;
  last_location_name: string | null;
}

export default function Vehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [formData, setFormData] = useState({
    plate_no: '',
    description: '',
    vehicle_type: '',
    is_active: true,
    engine_no: '',
    chassis_no: '',
    file_no: '',
    vehicle_category: '',
    make_brand: '',
    body_type: '',
    series: '',
    gross_weight: '',
    net_weight: '',
    year_model: '',
    year_rebuilt: '',
    piston_displacement: '',
    max_power: '',
    passenger_capacity: '',
    color: '',
    fuel_type: '',
    registration_classification: '',
    owner_name: '',
    owner_address: '',
    encumbered_to: '',
    or_no: '',
    or_date: '',
    cr_no: '',
    remarks: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [registrationFile, setRegistrationFile] = useState<File | null>(null);
  const [registrationPreview, setRegistrationPreview] = useState<string | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [viewImageUrl, setViewImageUrl] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMakeBrand, setFilterMakeBrand] = useState<string>('all');
  const [filterVehicleType, setFilterVehicleType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Get unique values for filters
  const uniqueMakeBrands = [...new Set(vehicles.map(v => v.make_brand).filter(Boolean))] as string[];
  const uniqueVehicleTypes = [...new Set(vehicles.map(v => v.vehicle_type).filter(Boolean))] as string[];

  // Filter vehicles
  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = searchQuery === '' || 
      vehicle.plate_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.make_brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.owner_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesMakeBrand = filterMakeBrand === 'all' || vehicle.make_brand === filterMakeBrand;
    const matchesVehicleType = filterVehicleType === 'all' || vehicle.vehicle_type === filterVehicleType;
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && vehicle.is_active) ||
      (filterStatus === 'inactive' && !vehicle.is_active);

    return matchesSearch && matchesMakeBrand && matchesVehicleType && matchesStatus;
  });

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .order('plate_no');

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to load vehicles',
        variant: 'destructive',
      });
    } else {
      setVehicles(data || []);
    }
    setLoading(false);
  };

  const handleOpenDialog = (vehicle?: Vehicle) => {
    if (vehicle) {
      setEditingVehicle(vehicle);
      setFormData({
        plate_no: vehicle.plate_no,
        description: vehicle.description || '',
        vehicle_type: vehicle.vehicle_type || '',
        is_active: vehicle.is_active,
        engine_no: vehicle.engine_no || '',
        chassis_no: vehicle.chassis_no || '',
        file_no: vehicle.file_no || '',
        vehicle_category: vehicle.vehicle_category || '',
        make_brand: vehicle.make_brand || '',
        body_type: vehicle.body_type || '',
        series: vehicle.series || '',
        gross_weight: vehicle.gross_weight?.toString() || '',
        net_weight: vehicle.net_weight?.toString() || '',
        year_model: vehicle.year_model || '',
        year_rebuilt: vehicle.year_rebuilt || '',
        piston_displacement: vehicle.piston_displacement || '',
        max_power: vehicle.max_power || '',
        passenger_capacity: vehicle.passenger_capacity?.toString() || '',
        color: vehicle.color || '',
        fuel_type: vehicle.fuel_type || '',
        registration_classification: vehicle.registration_classification || '',
        owner_name: vehicle.owner_name || '',
        owner_address: vehicle.owner_address || '',
        encumbered_to: vehicle.encumbered_to || '',
        or_no: vehicle.or_no || '',
        or_date: vehicle.or_date || '',
        cr_no: vehicle.cr_no || '',
        remarks: vehicle.remarks || '',
      });
      if (vehicle.registration_image_url) {
        setRegistrationPreview(vehicle.registration_image_url);
      }
    } else {
      setEditingVehicle(null);
      setFormData({
        plate_no: '',
        description: '',
        vehicle_type: '',
        is_active: true,
        engine_no: '',
        chassis_no: '',
        file_no: '',
        vehicle_category: '',
        make_brand: '',
        body_type: '',
        series: '',
        gross_weight: '',
        net_weight: '',
        year_model: '',
        year_rebuilt: '',
        piston_displacement: '',
        max_power: '',
        passenger_capacity: '',
        color: '',
        fuel_type: '',
        registration_classification: '',
        owner_name: '',
        owner_address: '',
        encumbered_to: '',
        or_no: '',
        or_date: '',
        cr_no: '',
        remarks: '',
      });
      setRegistrationPreview(null);
    }
    setRegistrationFile(null);
    setDialogOpen(true);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setRegistrationFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setRegistrationPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Extract info using OCR
    setExtracting(true);
    try {
      const base64Reader = new FileReader();
      base64Reader.onloadend = async () => {
        const base64 = base64Reader.result as string;
        
        const { data, error } = await supabase.functions.invoke('extract-vehicle-info', {
          body: { imageBase64: base64 },
        });

        if (error) {
          toast({
            title: 'OCR Failed',
            description: 'Could not extract info from the image. Please fill manually.',
            variant: 'destructive',
          });
        } else if (data?.data) {
          const extracted = data.data;
          setFormData(prev => ({
            ...prev,
            plate_no: extracted.plate_no || prev.plate_no,
            description: extracted.description || prev.description,
            vehicle_type: extracted.vehicle_type || prev.vehicle_type,
            engine_no: extracted.engine_no || prev.engine_no,
            chassis_no: extracted.chassis_no || prev.chassis_no,
            file_no: extracted.file_no || prev.file_no,
            vehicle_category: extracted.vehicle_category || prev.vehicle_category,
            make_brand: extracted.make_brand || prev.make_brand,
            body_type: extracted.body_type || prev.body_type,
            series: extracted.series || prev.series,
            gross_weight: extracted.gross_weight?.toString() || prev.gross_weight,
            net_weight: extracted.net_weight?.toString() || prev.net_weight,
            year_model: extracted.year_model || prev.year_model,
            year_rebuilt: extracted.year_rebuilt || prev.year_rebuilt,
            piston_displacement: extracted.piston_displacement || prev.piston_displacement,
            max_power: extracted.max_power || prev.max_power,
            passenger_capacity: extracted.passenger_capacity?.toString() || prev.passenger_capacity,
            color: extracted.color || prev.color,
            fuel_type: extracted.fuel_type || prev.fuel_type,
            registration_classification: extracted.registration_classification || prev.registration_classification,
            owner_name: extracted.owner_name || prev.owner_name,
            owner_address: extracted.owner_address || prev.owner_address,
            encumbered_to: extracted.encumbered_to || prev.encumbered_to,
            or_no: extracted.or_no || prev.or_no,
            or_date: extracted.or_date || prev.or_date,
            cr_no: extracted.cr_no || prev.cr_no,
            remarks: extracted.remarks || prev.remarks,
          }));
          toast({
            title: 'Extraction Complete',
            description: 'Vehicle registration info extracted. Please verify the data.',
          });
        }
        setExtracting(false);
      };
      base64Reader.readAsDataURL(file);
    } catch {
      setExtracting(false);
      toast({
        title: 'Error',
        description: 'Failed to process image',
        variant: 'destructive',
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    let registrationImageUrl = editingVehicle?.registration_image_url || null;

    // Upload registration image if a new one was selected
    if (registrationFile) {
      const fileExt = registrationFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('vehicle-registrations')
        .upload(filePath, registrationFile);

      if (uploadError) {
        toast({
          title: 'Upload Error',
          description: 'Failed to upload registration image',
          variant: 'destructive',
        });
        setSubmitting(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from('vehicle-registrations')
        .getPublicUrl(filePath);
      
      registrationImageUrl = urlData.publicUrl;
    }

    const vehicleData = {
      plate_no: formData.plate_no.toUpperCase(),
      description: formData.description || null,
      vehicle_type: formData.vehicle_type || null,
      is_active: formData.is_active,
      engine_no: formData.engine_no || null,
      chassis_no: formData.chassis_no || null,
      file_no: formData.file_no || null,
      vehicle_category: formData.vehicle_category || null,
      make_brand: formData.make_brand || null,
      body_type: formData.body_type || null,
      series: formData.series || null,
      gross_weight: formData.gross_weight ? parseFloat(formData.gross_weight) : null,
      net_weight: formData.net_weight ? parseFloat(formData.net_weight) : null,
      year_model: formData.year_model || null,
      year_rebuilt: formData.year_rebuilt || null,
      piston_displacement: formData.piston_displacement || null,
      max_power: formData.max_power || null,
      passenger_capacity: formData.passenger_capacity ? parseInt(formData.passenger_capacity) : null,
      color: formData.color || null,
      fuel_type: formData.fuel_type || null,
      registration_classification: formData.registration_classification || null,
      owner_name: formData.owner_name || null,
      owner_address: formData.owner_address || null,
      encumbered_to: formData.encumbered_to || null,
      or_no: formData.or_no || null,
      or_date: formData.or_date || null,
      cr_no: formData.cr_no || null,
      remarks: formData.remarks || null,
      registration_image_url: registrationImageUrl,
    };

    let error;
    if (editingVehicle) {
      const result = await supabase
        .from('vehicles')
        .update(vehicleData)
        .eq('id', editingVehicle.id);
      error = result.error;
    } else {
      const result = await supabase.from('vehicles').insert(vehicleData);
      error = result.error;
    }

    setSubmitting(false);

    if (error) {
      toast({
        title: 'Error',
        description: error.message.includes('duplicate')
          ? 'A vehicle with this plate number already exists'
          : error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: editingVehicle ? 'Updated' : 'Created',
        description: `Vehicle ${editingVehicle ? 'updated' : 'added'} successfully`,
      });
      setDialogOpen(false);
      fetchVehicles();
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    const { error } = await supabase.from('vehicles').delete().eq('id', deleteId);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete vehicle. It may be in use by trip tickets.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Deleted',
        description: 'Vehicle deleted successfully',
      });
      fetchVehicles();
    }
    setDeleteId(null);
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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Vehicles</h1>
          <p className="text-muted-foreground">Manage the vehicle registry</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Add Vehicle
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vehicle List</CardTitle>
          <CardDescription>All registered vehicles in the system</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by plate, description, make, or owner..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={filterMakeBrand} onValueChange={setFilterMakeBrand}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Make/Brand" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Makes</SelectItem>
                  {uniqueMakeBrands.map((brand) => (
                    <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterVehicleType} onValueChange={setFilterVehicleType}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Vehicle Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {uniqueVehicleTypes.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {vehicles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Car className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium">No vehicles found</h3>
              <p className="text-muted-foreground">Add your first vehicle to get started.</p>
              <Button className="mt-4" onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Add Vehicle
              </Button>
            </div>
          ) : filteredVehicles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Search className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium">No vehicles match your filters</h3>
              <p className="text-muted-foreground">Try adjusting your search or filter criteria.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plate No.</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Make/Brand</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>CR</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVehicles.map((vehicle) => (
                  <TableRow key={vehicle.id}>
                    <TableCell className="font-medium">{vehicle.plate_no}</TableCell>
                    <TableCell>{vehicle.description || '-'}</TableCell>
                    <TableCell>{vehicle.vehicle_type || '-'}</TableCell>
                    <TableCell>{vehicle.make_brand || '-'}</TableCell>
                    <TableCell>{vehicle.color || '-'}</TableCell>
                    <TableCell>
                      {vehicle.last_location_lat && vehicle.last_location_lng ? (
                        <a
                          href={`https://www.openstreetmap.org/?mlat=${vehicle.last_location_lat}&mlon=${vehicle.last_location_lng}#map=15/${vehicle.last_location_lat}/${vehicle.last_location_lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-primary hover:underline"
                        >
                          <MapPin className="h-4 w-4" />
                          <span className="text-xs">View</span>
                        </a>
                      ) : (
                        <span className="text-muted-foreground text-xs">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {vehicle.is_active ? (
                        <Badge className="bg-success text-success-foreground">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {vehicle.registration_image_url && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setViewImageUrl(vehicle.registration_image_url)}
                        >
                          <Image className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(vehicle)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(vehicle.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{editingVehicle ? 'Edit Vehicle' : 'Add Vehicle'}</DialogTitle>
            <DialogDescription>
              {editingVehicle
                ? 'Update the vehicle information'
                : 'Upload a Certificate of Registration to auto-fill or enter details manually'}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Registration Image Upload */}
              <div className="space-y-2">
                <Label>Certificate of Registration Image</Label>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={extracting}
                  >
                    {extracting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Extracting...
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload CR Image
                      </>
                    )}
                  </Button>
                  {registrationPreview && (
                    <div className="relative">
                      <img
                        src={registrationPreview}
                        alt="Registration preview"
                        className="h-16 w-24 object-cover rounded border"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setRegistrationFile(null);
                          setRegistrationPreview(null);
                        }}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="plate_no">Plate Number *</Label>
                  <Input
                    id="plate_no"
                    value={formData.plate_no}
                    onChange={(e) => setFormData({ ...formData, plate_no: e.target.value })}
                    placeholder="ABC 1234"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cr_no">CR Number</Label>
                  <Input
                    id="cr_no"
                    value={formData.cr_no}
                    onChange={(e) => setFormData({ ...formData, cr_no: e.target.value })}
                    placeholder="CR Number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="file_no">File Number</Label>
                  <Input
                    id="file_no"
                    value={formData.file_no}
                    onChange={(e) => setFormData({ ...formData, file_no: e.target.value })}
                    placeholder="File Number"
                  />
                </div>
              </div>

              {/* Engine & Chassis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="engine_no">Engine Number</Label>
                  <Input
                    id="engine_no"
                    value={formData.engine_no}
                    onChange={(e) => setFormData({ ...formData, engine_no: e.target.value })}
                    placeholder="Engine Number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="chassis_no">Chassis Number</Label>
                  <Input
                    id="chassis_no"
                    value={formData.chassis_no}
                    onChange={(e) => setFormData({ ...formData, chassis_no: e.target.value })}
                    placeholder="Chassis Number"
                  />
                </div>
              </div>

              {/* Vehicle Details */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vehicle_type">Vehicle Type</Label>
                  <Input
                    id="vehicle_type"
                    value={formData.vehicle_type}
                    onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value })}
                    placeholder="e.g., SUV"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vehicle_category">Vehicle Category</Label>
                  <Input
                    id="vehicle_category"
                    value={formData.vehicle_category}
                    onChange={(e) => setFormData({ ...formData, vehicle_category: e.target.value })}
                    placeholder="Category"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="make_brand">Make/Brand</Label>
                  <Input
                    id="make_brand"
                    value={formData.make_brand}
                    onChange={(e) => setFormData({ ...formData, make_brand: e.target.value })}
                    placeholder="e.g., Toyota"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="series">Series</Label>
                  <Input
                    id="series"
                    value={formData.series}
                    onChange={(e) => setFormData({ ...formData, series: e.target.value })}
                    placeholder="e.g., Innova"
                  />
                </div>
              </div>

              {/* Body & Specs */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="body_type">Body Type</Label>
                  <Input
                    id="body_type"
                    value={formData.body_type}
                    onChange={(e) => setFormData({ ...formData, body_type: e.target.value })}
                    placeholder="Body Type"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year_model">Year Model</Label>
                  <Input
                    id="year_model"
                    value={formData.year_model}
                    onChange={(e) => setFormData({ ...formData, year_model: e.target.value })}
                    placeholder="e.g., 2020"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year_rebuilt">Year Rebuilt</Label>
                  <Input
                    id="year_rebuilt"
                    value={formData.year_rebuilt}
                    onChange={(e) => setFormData({ ...formData, year_rebuilt: e.target.value })}
                    placeholder="If rebuilt"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <Input
                    id="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    placeholder="e.g., White"
                  />
                </div>
              </div>

              {/* Weight & Capacity */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gross_weight">Gross Weight (kg)</Label>
                  <Input
                    id="gross_weight"
                    type="number"
                    value={formData.gross_weight}
                    onChange={(e) => setFormData({ ...formData, gross_weight: e.target.value })}
                    placeholder="Gross Weight"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="net_weight">Net Weight (kg)</Label>
                  <Input
                    id="net_weight"
                    type="number"
                    value={formData.net_weight}
                    onChange={(e) => setFormData({ ...formData, net_weight: e.target.value })}
                    placeholder="Net Weight"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passenger_capacity">Passenger Capacity</Label>
                  <Input
                    id="passenger_capacity"
                    type="number"
                    value={formData.passenger_capacity}
                    onChange={(e) => setFormData({ ...formData, passenger_capacity: e.target.value })}
                    placeholder="Passengers"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fuel_type">Fuel Type</Label>
                  <Input
                    id="fuel_type"
                    value={formData.fuel_type}
                    onChange={(e) => setFormData({ ...formData, fuel_type: e.target.value })}
                    placeholder="e.g., Diesel"
                  />
                </div>
              </div>

              {/* Engine Specs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="piston_displacement">Piston Displacement</Label>
                  <Input
                    id="piston_displacement"
                    value={formData.piston_displacement}
                    onChange={(e) => setFormData({ ...formData, piston_displacement: e.target.value })}
                    placeholder="e.g., 2400cc"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_power">Max Power (KW)</Label>
                  <Input
                    id="max_power"
                    value={formData.max_power}
                    onChange={(e) => setFormData({ ...formData, max_power: e.target.value })}
                    placeholder="e.g., 110"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registration_classification">Registration Classification</Label>
                  <Input
                    id="registration_classification"
                    value={formData.registration_classification}
                    onChange={(e) => setFormData({ ...formData, registration_classification: e.target.value })}
                    placeholder="Classification"
                  />
                </div>
              </div>

              {/* Owner Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="owner_name">Owner's Name</Label>
                  <Input
                    id="owner_name"
                    value={formData.owner_name}
                    onChange={(e) => setFormData({ ...formData, owner_name: e.target.value })}
                    placeholder="Owner's Name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="owner_address">Owner's Address</Label>
                  <Input
                    id="owner_address"
                    value={formData.owner_address}
                    onChange={(e) => setFormData({ ...formData, owner_address: e.target.value })}
                    placeholder="Owner's Address"
                  />
                </div>
              </div>

              {/* Registration Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="or_no">O.R. Number</Label>
                  <Input
                    id="or_no"
                    value={formData.or_no}
                    onChange={(e) => setFormData({ ...formData, or_no: e.target.value })}
                    placeholder="O.R. Number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="or_date">O.R. Date</Label>
                  <Input
                    id="or_date"
                    type="date"
                    value={formData.or_date}
                    onChange={(e) => setFormData({ ...formData, or_date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="encumbered_to">Encumbered To</Label>
                  <Input
                    id="encumbered_to"
                    value={formData.encumbered_to}
                    onChange={(e) => setFormData({ ...formData, encumbered_to: e.target.value })}
                    placeholder="Encumbered To"
                  />
                </div>
              </div>

              {/* Description & Remarks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="e.g., Toyota Innova 2020"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="remarks">Remarks</Label>
                  <Input
                    id="remarks"
                    value={formData.remarks}
                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                    placeholder="Additional remarks"
                  />
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between">
                <Label htmlFor="is_active">Active Status</Label>
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting || extracting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : editingVehicle ? (
                    'Update'
                  ) : (
                    'Add Vehicle'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* View Registration Image Dialog */}
      <Dialog open={!!viewImageUrl} onOpenChange={() => setViewImageUrl(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Certificate of Registration</DialogTitle>
          </DialogHeader>
          {viewImageUrl && (
            <img
              src={viewImageUrl}
              alt="Certificate of Registration"
              className="w-full rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Vehicle?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the vehicle from the
              system.
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

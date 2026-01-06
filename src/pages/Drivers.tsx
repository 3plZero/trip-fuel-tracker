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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Users, Pencil, Trash2, Loader2, Upload, Image, Eye, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Driver {
  id: string;
  full_name: string;
  license_no: string | null;
  is_active: boolean;
  nationality: string | null;
  sex: string | null;
  birthdate: string | null;
  weight: number | null;
  height: number | null;
  address: string | null;
  license_image_url: string | null;
}

export default function Drivers() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [formData, setFormData] = useState({
    full_name: '',
    license_no: '',
    is_active: true,
    nationality: '',
    sex: '',
    birthdate: '',
    weight: '',
    height: '',
    address: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [licensePreview, setLicensePreview] = useState<string | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [viewingLicense, setViewingLicense] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    const { data, error } = await supabase
      .from('drivers')
      .select('*')
      .order('full_name');

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to load drivers',
        variant: 'destructive',
      });
    } else {
      setDrivers(data || []);
    }
    setLoading(false);
  };

  const handleOpenDialog = (driver?: Driver) => {
    if (driver) {
      setEditingDriver(driver);
      setFormData({
        full_name: driver.full_name,
        license_no: driver.license_no || '',
        is_active: driver.is_active,
        nationality: driver.nationality || '',
        sex: driver.sex || '',
        birthdate: driver.birthdate || '',
        weight: driver.weight?.toString() || '',
        height: driver.height?.toString() || '',
        address: driver.address || '',
      });
      setLicensePreview(driver.license_image_url);
    } else {
      setEditingDriver(null);
      setFormData({
        full_name: '',
        license_no: '',
        is_active: true,
        nationality: '',
        sex: '',
        birthdate: '',
        weight: '',
        height: '',
        address: '',
      });
      setLicensePreview(null);
    }
    setLicenseFile(null);
    setDialogOpen(true);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLicenseFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setLicensePreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const extractLicenseInfo = async () => {
    if (!licensePreview) return;

    setExtracting(true);
    try {
      const response = await supabase.functions.invoke('extract-license-info', {
        body: { imageBase64: licensePreview }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const data = response.data?.data;
      if (data) {
        setFormData(prev => ({
          ...prev,
          full_name: data.full_name || prev.full_name,
          license_no: data.license_no || prev.license_no,
          nationality: data.nationality || prev.nationality,
          sex: data.sex || prev.sex,
          birthdate: data.birthdate || prev.birthdate,
          weight: data.weight?.toString() || prev.weight,
          height: data.height?.toString() || prev.height,
          address: data.address || prev.address,
        }));
        toast({
          title: 'Success',
          description: 'License information extracted successfully',
        });
      }
    } catch (error) {
      console.error('Error extracting license info:', error);
      toast({
        title: 'Error',
        description: 'Failed to extract license information',
        variant: 'destructive',
      });
    } finally {
      setExtracting(false);
    }
  };

  const uploadLicenseImage = async (driverId: string): Promise<string | null> => {
    if (!licenseFile) return licensePreview;

    const fileExt = licenseFile.name.split('.').pop();
    const fileName = `${driverId}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('driver-licenses')
      .upload(fileName, licenseFile, { upsert: true });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError;
    }

    const { data: urlData } = supabase.storage
      .from('driver-licenses')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const driverData = {
        full_name: formData.full_name,
        license_no: formData.license_no || null,
        is_active: formData.is_active,
        nationality: formData.nationality || null,
        sex: formData.sex || null,
        birthdate: formData.birthdate || null,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        height: formData.height ? parseFloat(formData.height) : null,
        address: formData.address || null,
      };

      let driverId: string;
      let error;

      if (editingDriver) {
        driverId = editingDriver.id;
        const result = await supabase
          .from('drivers')
          .update(driverData)
          .eq('id', editingDriver.id);
        error = result.error;
      } else {
        const result = await supabase.from('drivers').insert(driverData).select().single();
        error = result.error;
        driverId = result.data?.id;
      }

      if (error) throw error;

      // Upload license image if there's a new file
      if (licenseFile && driverId) {
        const imageUrl = await uploadLicenseImage(driverId);
        if (imageUrl) {
          await supabase
            .from('drivers')
            .update({ license_image_url: imageUrl })
            .eq('id', driverId);
        }
      }

      toast({
        title: editingDriver ? 'Updated' : 'Created',
        description: `Driver ${editingDriver ? 'updated' : 'added'} successfully`,
      });
      setDialogOpen(false);
      fetchDrivers();
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

  const handleDelete = async () => {
    if (!deleteId) return;

    const { error } = await supabase.from('drivers').delete().eq('id', deleteId);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete driver. They may be assigned to trip tickets.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Deleted',
        description: 'Driver deleted successfully',
      });
      fetchDrivers();
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
          <h1 className="text-2xl font-bold text-foreground">Drivers</h1>
          <p className="text-muted-foreground">Manage authorized drivers</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Add Driver
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Driver List</CardTitle>
          <CardDescription>All registered drivers in the system</CardDescription>
        </CardHeader>
        <CardContent>
          {drivers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium">No drivers found</h3>
              <p className="text-muted-foreground">Add your first driver to get started.</p>
              <Button className="mt-4" onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Add Driver
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Full Name</TableHead>
                  <TableHead>License No.</TableHead>
                  <TableHead>Nationality</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>License</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {drivers.map((driver) => (
                  <TableRow key={driver.id}>
                    <TableCell className="font-medium">{driver.full_name}</TableCell>
                    <TableCell>{driver.license_no || '-'}</TableCell>
                    <TableCell>{driver.nationality || '-'}</TableCell>
                    <TableCell>
                      {driver.is_active ? (
                        <Badge className="bg-success text-success-foreground">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {driver.license_image_url ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setViewingLicense(driver.license_image_url)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(driver)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(driver.id)}
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
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{editingDriver ? 'Edit Driver' : 'Add Driver'}</DialogTitle>
            <DialogDescription>
              {editingDriver
                ? 'Update the driver information'
                : 'Upload a license image to auto-fill fields or enter details manually'}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* License Image Upload */}
              <div className="space-y-2">
                <Label>Driver's License Image</Label>
                <div className="flex flex-col gap-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload License
                    </Button>
                    {licensePreview && (
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={extractLicenseInfo}
                        disabled={extracting}
                      >
                        {extracting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Extracting...
                          </>
                        ) : (
                          <>
                            <Sparkles className="mr-2 h-4 w-4" />
                            Extract Info
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                  {licensePreview && (
                    <div className="relative rounded-lg border overflow-hidden">
                      <img
                        src={licensePreview}
                        alt="License preview"
                        className="w-full h-48 object-contain bg-muted"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="full_name">Full Name *</Label>
                  <Input
                    id="full_name"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="Juan Dela Cruz"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="license_no">License Number</Label>
                  <Input
                    id="license_no"
                    value={formData.license_no}
                    onChange={(e) => setFormData({ ...formData, license_no: e.target.value })}
                    placeholder="N01-23-456789"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nationality">Nationality</Label>
                  <Input
                    id="nationality"
                    value={formData.nationality}
                    onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                    placeholder="Filipino"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sex">Sex</Label>
                  <Select
                    value={formData.sex}
                    onValueChange={(value) => setFormData({ ...formData, sex: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select sex" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">Male</SelectItem>
                      <SelectItem value="F">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birthdate">Birth Date</Label>
                  <Input
                    id="birthdate"
                    type="date"
                    value={formData.birthdate}
                    onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    placeholder="70"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                    placeholder="170"
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="123 Main Street, City, Province"
                    rows={2}
                  />
                </div>
                <div className="col-span-2 flex items-center justify-between">
                  <Label htmlFor="is_active">Active Status</Label>
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : editingDriver ? (
                    'Update'
                  ) : (
                    'Add Driver'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* View License Dialog */}
      <Dialog open={!!viewingLicense} onOpenChange={() => setViewingLicense(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Driver's License</DialogTitle>
          </DialogHeader>
          {viewingLicense && (
            <div className="rounded-lg overflow-hidden">
              <img
                src={viewingLicense}
                alt="Driver's license"
                className="w-full object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Driver?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the driver from the
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

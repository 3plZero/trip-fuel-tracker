import { useEffect, useState } from 'react';
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
import { Plus, Car, Pencil, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';

interface Vehicle {
  id: string;
  plate_no: string;
  description: string | null;
  vehicle_type: string | null;
  is_active: boolean;
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
  });
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

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
      });
    } else {
      setEditingVehicle(null);
      setFormData({
        plate_no: '',
        description: '',
        vehicle_type: '',
        is_active: true,
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const vehicleData = {
      plate_no: formData.plate_no.toUpperCase(),
      description: formData.description || null,
      vehicle_type: formData.vehicle_type || null,
      is_active: formData.is_active,
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
        <CardContent>
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
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plate No.</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vehicles.map((vehicle) => (
                  <TableRow key={vehicle.id}>
                    <TableCell className="font-medium">{vehicle.plate_no}</TableCell>
                    <TableCell>{vehicle.description || '-'}</TableCell>
                    <TableCell>{vehicle.vehicle_type || '-'}</TableCell>
                    <TableCell>
                      {vehicle.is_active ? (
                        <Badge className="bg-success text-success-foreground">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingVehicle ? 'Edit Vehicle' : 'Add Vehicle'}</DialogTitle>
            <DialogDescription>
              {editingVehicle
                ? 'Update the vehicle information'
                : 'Enter the details of the new vehicle'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
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
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="e.g., Toyota Innova 2020"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vehicle_type">Vehicle Type</Label>
              <Input
                id="vehicle_type"
                value={formData.vehicle_type}
                onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value })}
                placeholder="e.g., SUV, Van, Sedan"
              />
            </div>
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
              <Button type="submit" disabled={submitting}>
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
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
import { Plus, Users, Pencil, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';

interface Driver {
  id: string;
  full_name: string;
  license_no: string | null;
  is_active: boolean;
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
  });
  const [submitting, setSubmitting] = useState(false);
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
      });
    } else {
      setEditingDriver(null);
      setFormData({
        full_name: '',
        license_no: '',
        is_active: true,
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const driverData = {
      full_name: formData.full_name,
      license_no: formData.license_no || null,
      is_active: formData.is_active,
    };

    let error;
    if (editingDriver) {
      const result = await supabase
        .from('drivers')
        .update(driverData)
        .eq('id', editingDriver.id);
      error = result.error;
    } else {
      const result = await supabase.from('drivers').insert(driverData);
      error = result.error;
    }

    setSubmitting(false);

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: editingDriver ? 'Updated' : 'Created',
        description: `Driver ${editingDriver ? 'updated' : 'added'} successfully`,
      });
      setDialogOpen(false);
      fetchDrivers();
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
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {drivers.map((driver) => (
                  <TableRow key={driver.id}>
                    <TableCell className="font-medium">{driver.full_name}</TableCell>
                    <TableCell>{driver.license_no || '-'}</TableCell>
                    <TableCell>
                      {driver.is_active ? (
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingDriver ? 'Edit Driver' : 'Add Driver'}</DialogTitle>
            <DialogDescription>
              {editingDriver
                ? 'Update the driver information'
                : 'Enter the details of the new driver'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
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
                ) : editingDriver ? (
                  'Update'
                ) : (
                  'Add Driver'
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
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2, Search, Zap } from 'lucide-react';
import { toast } from 'sonner';
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

interface Generator {
  id: string;
  equipment_name: string;
  serial_no: string | null;
  type_model_no: string | null;
  location: string | null;
  is_active: boolean;
}

export default function Generators() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGenerator, setEditingGenerator] = useState<Generator | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    equipment_name: '',
    serial_no: '',
    type_model_no: '',
    location: '',
    is_active: true,
  });

  const { data: generators, isLoading } = useQuery({
    queryKey: ['generators'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('generators')
        .select('*')
        .order('equipment_name');
      if (error) throw error;
      return data as Generator[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from('generators').insert([data]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['generators'] });
      toast.success('Generator added successfully');
      handleCloseDialog();
    },
    onError: (error) => {
      toast.error('Failed to add generator');
      console.error(error);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase.from('generators').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['generators'] });
      toast.success('Generator updated successfully');
      handleCloseDialog();
    },
    onError: (error) => {
      toast.error('Failed to update generator');
      console.error(error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('generators').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['generators'] });
      toast.success('Generator deleted successfully');
      setDeleteId(null);
    },
    onError: (error) => {
      toast.error('Failed to delete generator');
      console.error(error);
    },
  });

  const handleOpenDialog = (generator?: Generator) => {
    if (generator) {
      setEditingGenerator(generator);
      setFormData({
        equipment_name: generator.equipment_name,
        serial_no: generator.serial_no || '',
        type_model_no: generator.type_model_no || '',
        location: generator.location || '',
        is_active: generator.is_active,
      });
    } else {
      setEditingGenerator(null);
      setFormData({
        equipment_name: '',
        serial_no: '',
        type_model_no: '',
        location: '',
        is_active: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingGenerator(null);
    setFormData({
      equipment_name: '',
      serial_no: '',
      type_model_no: '',
      location: '',
      is_active: true,
    });
  };

  const handleSubmit = () => {
    if (!formData.equipment_name.trim()) {
      toast.error('Equipment name is required');
      return;
    }

    if (editingGenerator) {
      updateMutation.mutate({ id: editingGenerator.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const filteredGenerators = generators?.filter((generator) =>
    generator.equipment_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    generator.serial_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    generator.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Generators</h1>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" /> Add Generator
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search generators..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Equipment Name</TableHead>
              <TableHead>Serial No.</TableHead>
              <TableHead>Type/Model</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredGenerators && filteredGenerators.length > 0 ? (
              filteredGenerators.map((generator) => (
                <TableRow key={generator.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      {generator.equipment_name}
                    </div>
                  </TableCell>
                  <TableCell>{generator.serial_no || 'N/A'}</TableCell>
                  <TableCell>{generator.type_model_no || 'N/A'}</TableCell>
                  <TableCell>{generator.location || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant={generator.is_active ? 'default' : 'secondary'}>
                      {generator.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(generator)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(generator.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  No generators found. Add your first one!
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingGenerator ? 'Edit Generator' : 'Add Generator'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="equipment_name">Equipment Name *</Label>
              <Input
                id="equipment_name"
                value={formData.equipment_name}
                onChange={(e) => setFormData({ ...formData, equipment_name: e.target.value })}
                placeholder="Enter equipment name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="serial_no">Serial No.</Label>
              <Input
                id="serial_no"
                value={formData.serial_no}
                onChange={(e) => setFormData({ ...formData, serial_no: e.target.value })}
                placeholder="Enter serial number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type_model_no">Type/Model No.</Label>
              <Input
                id="type_model_no"
                value={formData.type_model_no}
                onChange={(e) => setFormData({ ...formData, type_model_no: e.target.value })}
                placeholder="Enter type or model number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Enter location"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="h-4 w-4"
              />
              <Label htmlFor="is_active">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingGenerator ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Generator</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this generator? This will also delete all associated maintenance checklists.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteId && deleteMutation.mutate(deleteId)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

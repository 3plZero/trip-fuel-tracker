import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ArrowLeft, Upload, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface FormData {
  name: string;
  description: string;
  category_id: string;
  date_received: string;
  current_location: string;
  status: string;
}

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'in-repair', label: 'In Repair' },
  { value: 'disposed', label: 'Disposed' },
];

export default function InventoryItemForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isEditing = !!id;

  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    category_id: '',
    date_received: '',
    current_location: '',
    status: 'active',
  });

  const [existingImages, setExistingImages] = useState<{ id: string; image_url: string }[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const { data: categories } = useQuery({
    queryKey: ['inventory-categories-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory_categories')
        .select('id, name')
        .order('name');
      if (error) throw error;
      return data;
    },
  });

  const { data: item, isLoading: isLoadingItem } = useQuery({
    queryKey: ['inventory-item', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: isEditing,
  });

  const { data: images } = useQuery({
    queryKey: ['inventory-item-images', id],
    queryFn: async () => {
      if (!id) return [];
      const { data, error } = await supabase
        .from('inventory_item_images')
        .select('*')
        .eq('item_id', id)
        .order('sort_order');
      if (error) throw error;
      return data;
    },
    enabled: isEditing,
  });

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        description: item.description || '',
        category_id: item.category_id || '',
        date_received: item.date_received || '',
        current_location: item.current_location || '',
        status: item.status || 'active',
      });
    }
  }, [item]);

  useEffect(() => {
    if (images) {
      setExistingImages(images);
    }
  }, [images]);

  const createMutation = useMutation({
    mutationFn: async () => {
      setIsUploading(true);

      // Generate product ID
      const { data: productIdData, error: productIdError } = await supabase.rpc('generate_product_id');
      if (productIdError) throw productIdError;

      // Create item
      const { data: newItem, error: itemError } = await supabase
        .from('inventory_items')
        .insert({
          product_id: productIdData,
          name: formData.name,
          description: formData.description || null,
          category_id: formData.category_id || null,
          date_received: formData.date_received || null,
          current_location: formData.current_location || null,
          status: formData.status,
          created_by: user?.id,
        })
        .select()
        .single();

      if (itemError) throw itemError;

      // Upload images
      for (let i = 0; i < newImages.length; i++) {
        const file = newImages[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${newItem.id}/${Date.now()}-${i}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('inventory-images')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('inventory-images')
          .getPublicUrl(fileName);

        await supabase.from('inventory_item_images').insert({
          item_id: newItem.id,
          image_url: urlData.publicUrl,
          sort_order: i,
        });
      }

      return newItem;
    },
    onSuccess: (newItem) => {
      setIsUploading(false);
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      toast.success('Item created successfully');
      navigate(`/inventory-items/${newItem.id}`);
    },
    onError: (error) => {
      setIsUploading(false);
      toast.error('Failed to create item: ' + error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!id) return;
      setIsUploading(true);

      // Update item
      const { error: itemError } = await supabase
        .from('inventory_items')
        .update({
          name: formData.name,
          description: formData.description || null,
          category_id: formData.category_id || null,
          date_received: formData.date_received || null,
          current_location: formData.current_location || null,
          status: formData.status,
        })
        .eq('id', id);

      if (itemError) throw itemError;

      // Delete removed images
      for (const imageId of imagesToDelete) {
        const img = existingImages.find((i) => i.id === imageId);
        if (img) {
          const path = img.image_url.split('/inventory-images/')[1];
          if (path) {
            await supabase.storage.from('inventory-images').remove([path]);
          }
          await supabase.from('inventory_item_images').delete().eq('id', imageId);
        }
      }

      // Upload new images
      const currentCount = existingImages.length - imagesToDelete.length;
      for (let i = 0; i < newImages.length; i++) {
        const file = newImages[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${id}/${Date.now()}-${i}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('inventory-images')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('inventory-images')
          .getPublicUrl(fileName);

        await supabase.from('inventory_item_images').insert({
          item_id: id,
          image_url: urlData.publicUrl,
          sort_order: currentCount + i,
        });
      }
    },
    onSuccess: () => {
      setIsUploading(false);
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-item', id] });
      queryClient.invalidateQueries({ queryKey: ['inventory-item-images', id] });
      toast.success('Item updated successfully');
      navigate(`/inventory-items/${id}`);
    },
    onError: (error) => {
      setIsUploading(false);
      toast.error('Failed to update item: ' + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      updateMutation.mutate();
    } else {
      createMutation.mutate();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setNewImages((prev) => [...prev, ...files]);
  };

  const removeNewImage = (index: number) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (imageId: string) => {
    setImagesToDelete((prev) => [...prev, imageId]);
  };

  if (isEditing && isLoadingItem) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>
        <h1 className="text-3xl font-bold">{isEditing ? 'Edit Item' : 'Add New Item'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Item Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Item Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter item name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories?.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date_received">Date Received</Label>
                <Input
                  id="date_received"
                  type="date"
                  value={formData.date_received}
                  onChange={(e) => setFormData({ ...formData, date_received: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="current_location">Current Location</Label>
                <Input
                  id="current_location"
                  value={formData.current_location}
                  onChange={(e) => setFormData({ ...formData, current_location: e.target.value })}
                  placeholder="e.g., Storage Room A"
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
                    {statusOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter item description..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Images Section */}
        <Card>
          <CardHeader>
            <CardTitle>Images</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Existing Images */}
            {existingImages.filter((img) => !imagesToDelete.includes(img.id)).length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {existingImages
                  .filter((img) => !imagesToDelete.includes(img.id))
                  .map((img) => (
                    <div key={img.id} className="relative group">
                      <img
                        src={img.image_url}
                        alt="Item"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(img.id)}
                        className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
              </div>
            )}

            {/* New Images Preview */}
            {newImages.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {newImages.map((file, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(file)}
                      alt="New"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeNewImage(index)}
                      className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Button */}
            <div className="border-2 border-dashed rounded-lg p-6 text-center">
              <input
                type="file"
                id="images"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="images" className="cursor-pointer">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Click to upload images or drag and drop
                </p>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending || isUploading}
          >
            {isUploading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isEditing ? 'Update Item' : 'Create Item'}
          </Button>
        </div>
      </form>
    </div>
  );
}

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
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { toast } from 'sonner';

interface FormData {
  name: string;
  description: string;
  category_id: string;
  date_received: string;
  current_location: string;
  status: string;
  brand_model: string;
  property_number: string;
  property_tag: string;
  serial_number: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
  condition: string;
  accountable_person: string;
  utilization_status: string;
  remarks: string;
  accountability_document: string;
  property_from: string;
}

const conditionOptions = [
  { value: 'Excellent Condition', label: 'Excellent Condition' },
  { value: 'Good Condition', label: 'Good Condition' },
  { value: 'Fair Condition', label: 'Fair Condition' },
  { value: 'Poor Condition', label: 'Poor Condition' },
];

const utilizationStatusOptions = [
  { value: 'In Use', label: 'In Use' },
  { value: 'Idle', label: 'Idle' },
  { value: 'Standby', label: 'Standby' },
  { value: 'Under Repair', label: 'Under Repair' },
  { value: 'For Disposal', label: 'For Disposal' },
];

const propertyTagOptions = [
  { value: 'Tagged', label: 'Tagged' },
  { value: 'No Tag', label: 'No Tag' },
];

const accountabilityDocumentOptions = [
  { value: 'PAR', label: 'PAR (Property Acknowledgement Receipt)' },
  { value: 'ICS', label: 'ICS (Inventory Custodian Slip)' },
];

const propertyFromOptions = [
  { value: 'MIS', label: 'MIS' },
  { value: 'Office Procured', label: 'Office Procured' },
  { value: 'Procurement Unit', label: 'Procurement Unit' },
  { value: 'Donation', label: 'Donation' },
  { value: 'Transfer', label: 'Transfer' },
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
    brand_model: '',
    property_number: '',
    property_tag: 'No Tag',
    serial_number: '',
    quantity: 1,
    unit_cost: 0,
    total_cost: 0,
    condition: 'Good Condition',
    accountable_person: '',
    utilization_status: 'In Use',
    remarks: '',
    accountability_document: '',
    property_from: '',
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
        brand_model: item.brand_model || '',
        property_number: item.property_number || '',
        property_tag: item.property_tag || 'No Tag',
        serial_number: item.serial_number || '',
        quantity: item.quantity || 1,
        unit_cost: item.unit_cost || 0,
        total_cost: item.total_cost || 0,
        condition: item.condition || 'Good Condition',
        accountable_person: item.accountable_person || '',
        utilization_status: item.utilization_status || 'In Use',
        remarks: item.remarks || '',
        accountability_document: item.accountability_document || '',
        property_from: item.property_from || '',
      });
    }
  }, [item]);

  useEffect(() => {
    if (images) {
      setExistingImages(images);
    }
  }, [images]);

  // Auto-calculate total cost when quantity or unit cost changes
  useEffect(() => {
    const total = formData.quantity * formData.unit_cost;
    if (total !== formData.total_cost) {
      setFormData(prev => ({ ...prev, total_cost: total }));
    }
  }, [formData.quantity, formData.unit_cost]);

  const createMutation = useMutation({
    mutationFn: async () => {
      setIsUploading(true);

      const { data: productIdData, error: productIdError } = await supabase.rpc('generate_product_id');
      if (productIdError) throw productIdError;

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
          brand_model: formData.brand_model || null,
          property_number: formData.property_number || null,
          property_tag: formData.property_tag,
          serial_number: formData.serial_number || null,
          quantity: formData.quantity,
          unit_cost: formData.unit_cost,
          total_cost: formData.total_cost,
          condition: formData.condition,
          accountable_person: formData.accountable_person || null,
          utilization_status: formData.utilization_status,
          remarks: formData.remarks || null,
          accountability_document: formData.accountability_document || null,
          property_from: formData.property_from || null,
          created_by: user?.id,
        })
        .select()
        .single();

      if (itemError) throw itemError;

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

      const { error: itemError } = await supabase
        .from('inventory_items')
        .update({
          name: formData.name,
          description: formData.description || null,
          category_id: formData.category_id || null,
          date_received: formData.date_received || null,
          current_location: formData.current_location || null,
          status: formData.status,
          brand_model: formData.brand_model || null,
          property_number: formData.property_number || null,
          property_tag: formData.property_tag,
          serial_number: formData.serial_number || null,
          quantity: formData.quantity,
          unit_cost: formData.unit_cost,
          total_cost: formData.total_cost,
          condition: formData.condition,
          accountable_person: formData.accountable_person || null,
          utilization_status: formData.utilization_status,
          remarks: formData.remarks || null,
          accountability_document: formData.accountability_document || null,
          property_from: formData.property_from || null,
        })
        .eq('id', id);

      if (itemError) throw itemError;

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
        <LoadingSpinner size="lg" />
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
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Item Name / Description *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter item name or description"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="brand_model">Brand / Model</Label>
                <Input
                  id="brand_model"
                  value={formData.brand_model}
                  onChange={(e) => setFormData({ ...formData, brand_model: e.target.value })}
                  placeholder="e.g., Dell Optiplex 7090"
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

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Specifications / Details</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter detailed specifications..."
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Property Details */}
        <Card>
          <CardHeader>
            <CardTitle>Property Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="property_number">Property Number</Label>
                <Input
                  id="property_number"
                  value={formData.property_number}
                  onChange={(e) => setFormData({ ...formData, property_number: e.target.value })}
                  placeholder="e.g., 2022-10605020-87-ICS-Be"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="serial_number">Serial Number</Label>
                <Input
                  id="serial_number"
                  value={formData.serial_number}
                  onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                  placeholder="Enter serial number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="property_tag">Property Tag</Label>
                <Select
                  value={formData.property_tag}
                  onValueChange={(value) => setFormData({ ...formData, property_tag: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {propertyTagOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accountability_document">Accountability Document</Label>
                <Select
                  value={formData.accountability_document}
                  onValueChange={(value) => setFormData({ ...formData, accountability_document: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    {accountabilityDocumentOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="property_from">Property From</Label>
                <Select
                  value={formData.property_from}
                  onValueChange={(value) => setFormData({ ...formData, property_from: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select source" />
                  </SelectTrigger>
                  <SelectContent>
                    {propertyFromOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quantity & Cost */}
        <Card>
          <CardHeader>
            <CardTitle>Quantity & Cost</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="unit_cost">Unit Cost (₱)</Label>
                <Input
                  id="unit_cost"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.unit_cost}
                  onChange={(e) => setFormData({ ...formData, unit_cost: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="total_cost">Total Cost (₱)</Label>
                <Input
                  id="total_cost"
                  type="number"
                  value={formData.total_cost}
                  readOnly
                  className="bg-muted"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location & Status */}
        <Card>
          <CardHeader>
            <CardTitle>Location & Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="current_location">Current Location</Label>
                <Input
                  id="current_location"
                  value={formData.current_location}
                  onChange={(e) => setFormData({ ...formData, current_location: e.target.value })}
                  placeholder="e.g., MIS Office"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date_received">Date Received/Acquired</Label>
                <Input
                  id="date_received"
                  type="date"
                  value={formData.date_received}
                  onChange={(e) => setFormData({ ...formData, date_received: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="condition">Condition</Label>
                <Select
                  value={formData.condition}
                  onValueChange={(value) => setFormData({ ...formData, condition: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {conditionOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="utilization_status">Utilization Status</Label>
                <Select
                  value={formData.utilization_status}
                  onValueChange={(value) => setFormData({ ...formData, utilization_status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {utilizationStatusOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Accountability */}
        <Card>
          <CardHeader>
            <CardTitle>Accountability</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="accountable_person">Accountable Person</Label>
                <Input
                  id="accountable_person"
                  value={formData.accountable_person}
                  onChange={(e) => setFormData({ ...formData, accountable_person: e.target.value })}
                  placeholder="Enter name of accountable person"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="remarks">Remarks</Label>
                <Textarea
                  id="remarks"
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  placeholder="Additional notes or remarks..."
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Images Section */}
        <Card>
          <CardHeader>
            <CardTitle>Images</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
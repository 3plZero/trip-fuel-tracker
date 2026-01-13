import { useState, useEffect, useRef } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Plus, Search, Eye, Pencil, Trash2, Package, Filter, Upload, LayoutGrid, List } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import InventoryImportDialog from '@/components/InventoryImportDialog';

const conditionColors: Record<string, string> = {
  'Excellent Condition': 'bg-green-500/10 text-green-600',
  'Good Condition': 'bg-blue-500/10 text-blue-600',
  'Fair Condition': 'bg-yellow-500/10 text-yellow-600',
  'Poor Condition': 'bg-red-500/10 text-red-600',
};

const utilizationColors: Record<string, string> = {
  'In Use': 'bg-green-500/10 text-green-600',
  'Idle': 'bg-gray-500/10 text-gray-600',
  'Standby': 'bg-blue-500/10 text-blue-600',
  'Under Repair': 'bg-yellow-500/10 text-yellow-600',
  'For Disposal': 'bg-red-500/10 text-red-600',
};

const conditionOptions = [
  { value: 'all', label: 'All Conditions' },
  { value: 'Excellent Condition', label: 'Excellent' },
  { value: 'Good Condition', label: 'Good' },
  { value: 'Fair Condition', label: 'Fair' },
  { value: 'Poor Condition', label: 'Poor' },
];

const utilizationOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'In Use', label: 'In Use' },
  { value: 'Idle', label: 'Idle' },
  { value: 'Standby', label: 'Standby' },
  { value: 'Under Repair', label: 'Under Repair' },
  { value: 'For Disposal', label: 'For Disposal' },
];

export default function InventoryItems() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categoryFilter = searchParams.get('category');
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryFilter || 'all');
  const [selectedCondition, setSelectedCondition] = useState<string>('all');
  const [selectedUtilization, setSelectedUtilization] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [deleteItem, setDeleteItem] = useState<{ id: string; name: string } | null>(null);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  
  // Barcode scanner detection
  const barcodeBuffer = useRef('');
  const barcodeTimeout = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input field
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      if (e.key === 'Enter' && barcodeBuffer.current.length > 0) {
        // Barcode scan complete - search for item by product_id
        const scannedCode = barcodeBuffer.current.trim();
        barcodeBuffer.current = '';
        
        // Look up item by product_id and navigate
        supabase
          .from('inventory_items')
          .select('id')
          .eq('product_id', scannedCode)
          .single()
          .then(({ data, error }) => {
            if (data && !error) {
              navigate(`/inventory-items/${data.id}`);
              toast.success(`Opening item: ${scannedCode}`);
            } else {
              toast.error(`Item not found: ${scannedCode}`);
            }
          });
        
        return;
      }
      
      // Only capture printable characters
      if (e.key.length === 1) {
        barcodeBuffer.current += e.key;
        
        // Clear buffer after 100ms of no input (barcode scanners input very fast)
        if (barcodeTimeout.current) {
          clearTimeout(barcodeTimeout.current);
        }
        barcodeTimeout.current = setTimeout(() => {
          barcodeBuffer.current = '';
        }, 100);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (barcodeTimeout.current) {
        clearTimeout(barcodeTimeout.current);
      }
    };
  }, [navigate]);

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

  const { data: items, isLoading } = useQuery({
    queryKey: ['inventory-items', selectedCategory, selectedCondition, selectedUtilization, searchQuery],
    queryFn: async () => {
      let query = supabase
        .from('inventory_items')
        .select(`
          *,
          category:inventory_categories(id, name),
          images:inventory_item_images(id, image_url, sort_order)
        `)
        .order('created_at', { ascending: false });

      if (selectedCategory && selectedCategory !== 'all') {
        query = query.eq('category_id', selectedCategory);
      }

      if (selectedCondition && selectedCondition !== 'all') {
        query = query.eq('condition', selectedCondition);
      }

      if (selectedUtilization && selectedUtilization !== 'all') {
        query = query.eq('utilization_status', selectedUtilization);
      }

      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,product_id.ilike.%${searchQuery}%,current_location.ilike.%${searchQuery}%,brand_model.ilike.%${searchQuery}%,property_number.ilike.%${searchQuery}%,serial_number.ilike.%${searchQuery}%,accountable_person.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data: images } = await supabase
        .from('inventory_item_images')
        .select('image_url')
        .eq('item_id', id);

      if (images) {
        for (const img of images) {
          const path = img.image_url.split('/inventory-images/')[1];
          if (path) {
            await supabase.storage.from('inventory-images').remove([path]);
          }
        }
      }

      const { error } = await supabase.from('inventory_items').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      toast.success('Item deleted successfully');
      setDeleteItem(null);
    },
    onError: (error) => {
      toast.error('Failed to delete item: ' + error.message);
    },
  });

  const activeFilterCount = [selectedCategory, selectedCondition, selectedUtilization].filter(f => f !== 'all').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Inventory Items</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsImportDialogOpen(true)}>
            <Upload className="h-4 w-4 mr-2" /> Import
          </Button>
          <Link to="/inventory-items/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" /> Add Item
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, ID, serial no., location, accountable person..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button 
              variant="outline" 
              onClick={() => setShowFilters(!showFilters)}
              className="relative"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
            <div className="flex border rounded-md">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="icon"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedCondition} onValueChange={setSelectedCondition}>
                <SelectTrigger>
                  <SelectValue placeholder="All Conditions" />
                </SelectTrigger>
                <SelectContent>
                  {conditionOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedUtilization} onValueChange={setSelectedUtilization}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  {utilizationOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Items Display */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : items && items.length > 0 ? (
        viewMode === 'grid' ? (
          /* Grid/Box View */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {items.map((item) => {
              const primaryImage = item.images?.sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))[0];
              return (
                <Link key={item.id} to={`/inventory-items/${item.id}`}>
                  <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group h-full">
                    <div className="aspect-square bg-muted relative overflow-hidden">
                      {primaryImage ? (
                        <img
                          src={primaryImage.image_url}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-12 w-12 text-muted-foreground/50" />
                        </div>
                      )}
                      {item.condition && (
                        <Badge className={`absolute top-2 right-2 text-xs ${conditionColors[item.condition] || 'bg-muted'}`}>
                          {item.condition.replace(' Condition', '')}
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-3">
                      <h3 className="font-medium text-sm line-clamp-2 mb-1">{item.name}</h3>
                      <p className="text-xs text-muted-foreground font-mono">{item.product_id}</p>
                      {item.utilization_status && (
                        <Badge variant="outline" className={`mt-2 text-xs ${utilizationColors[item.utilization_status] || ''}`}>
                          {item.utilization_status}
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        ) : (
          /* List/Table View */
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Product ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Brand/Model</TableHead>
                      <TableHead>Serial No.</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Condition</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Accountable Person</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item, index) => (
                      <TableRow key={item.id}>
                        <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                        <TableCell className="font-mono text-sm">{item.product_id}</TableCell>
                        <TableCell className="font-medium max-w-[200px] truncate">{item.name}</TableCell>
                        <TableCell className="max-w-[150px] truncate">{item.brand_model || '-'}</TableCell>
                        <TableCell className="font-mono text-sm">{item.serial_number || '-'}</TableCell>
                        <TableCell>{item.current_location || '-'}</TableCell>
                        <TableCell>
                          {item.condition && (
                            <Badge className={conditionColors[item.condition] || 'bg-muted'}>
                              {item.condition.replace(' Condition', '')}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {item.utilization_status && (
                            <Badge className={utilizationColors[item.utilization_status] || 'bg-muted'}>
                              {item.utilization_status}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{item.accountable_person || '-'}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Link to={`/inventory-items/${item.id}`}>
                              <Button variant="ghost" size="icon">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link to={`/inventory-items/${item.id}/edit`}>
                              <Button variant="ghost" size="icon">
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteItem({ id: item.id, name: item.name })}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No items found.</p>
            <Link to="/inventory-items/new">
              <Button variant="link">Add your first item</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Results Count */}
      {items && items.length > 0 && (
        <p className="text-sm text-muted-foreground text-center">
          Showing {items.length} item{items.length !== 1 ? 's' : ''}
        </p>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteItem} onOpenChange={() => setDeleteItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteItem?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteItem && deleteMutation.mutate(deleteItem.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Import Dialog */}
      <InventoryImportDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        categories={categories || []}
        onImportComplete={() => {
          queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
        }}
      />
    </div>
  );
}
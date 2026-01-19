import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Link } from 'react-router-dom';
import { Package, FolderOpen, Plus, Clock, HardDrive } from 'lucide-react';
import { format } from 'date-fns';

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const SUPABASE_FREE_TIER_LIMIT = 1 * 1024 * 1024 * 1024; // 1 GB in bytes

interface BucketUsage {
  bucket_id: string;
  total_bytes: number;
}

export default function InventoryDashboard() {
  const { data: categories } = useQuery({
    queryKey: ['inventory-categories-count'],
    queryFn: async () => {
      const { count } = await supabase
        .from('inventory_categories')
        .select('*', { count: 'exact', head: true });
      return count || 0;
    },
  });

  const { data: items } = useQuery({
    queryKey: ['inventory-items-count'],
    queryFn: async () => {
      const { count } = await supabase
        .from('inventory_items')
        .select('*', { count: 'exact', head: true });
      return count || 0;
    },
  });

  const { data: storageUsage } = useQuery({
    queryKey: ['storage-usage'],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_storage_usage');
      if (error) throw error;
      return data as BucketUsage[];
    },
  });

  const { data: recentItems } = useQuery({
    queryKey: ['recent-inventory-items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory_items')
        .select(`
          *,
          category:inventory_categories(name)
        `)
        .order('created_at', { ascending: false })
        .limit(5);
      if (error) throw error;
      return data;
    },
  });

  const totalStorageUsed = storageUsage?.reduce((acc, bucket) => acc + (bucket.total_bytes || 0), 0) || 0;
  const storagePercentage = (totalStorageUsed / SUPABASE_FREE_TIER_LIMIT) * 100;
  
  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-destructive';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-primary';
  };

  const bucketLabels: Record<string, string> = {
    'inventory-images': 'Inventory Images',
    'driver-licenses': 'Driver Licenses',
    'vehicle-registrations': 'Vehicle Registrations',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Inventory Dashboard</h1>
        <div className="flex gap-2">
          <Link to="/inventory-categories">
            <Button variant="outline">
              <FolderOpen className="h-4 w-4 mr-2" /> Categories
            </Button>
          </Link>
          <Link to="/inventory-items/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" /> Add Item
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Categories</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories ?? 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{items ?? 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{items ?? 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recently Added Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentItems && recentItems.length > 0 ? (
            <div className="space-y-4">
              {recentItems.map((item) => (
                <Link
                  key={item.id}
                  to={`/inventory-items/${item.id}`}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.product_id} • {item.category?.name || 'No category'}
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(item.created_at), 'MMM d, yyyy')}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              No items yet. Add your first item to get started.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

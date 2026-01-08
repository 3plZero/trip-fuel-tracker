import { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import ItemQRCode from '@/components/ItemQRCode';
import { ArrowLeft, Pencil, QrCode, MapPin, Calendar, FolderOpen, Package, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

const statusColors: Record<string, string> = {
  active: 'bg-green-500/10 text-green-600',
  'in-repair': 'bg-yellow-500/10 text-yellow-600',
  disposed: 'bg-red-500/10 text-red-600',
};

export default function InventoryItemView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isQRDialogOpen, setIsQRDialogOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const { data: item, isLoading } = useQuery({
    queryKey: ['inventory-item', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('inventory_items')
        .select(`
          *,
          category:inventory_categories(id, name)
        `)
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
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
  });

  const nextImage = () => {
    if (images && images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = () => {
    if (images && images.length > 0) {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Item not found</p>
        <Button variant="link" onClick={() => navigate('/inventory-items')}>
          Back to Items
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back
          </Button>
          <h1 className="text-3xl font-bold">{item.name}</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsQRDialogOpen(true)}>
            <QrCode className="h-4 w-4 mr-2" /> QR Code
          </Button>
          <Link to={`/inventory-items/${id}/edit`}>
            <Button>
              <Pencil className="h-4 w-4 mr-2" /> Edit
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Image Gallery */}
        <Card>
          <CardHeader>
            <CardTitle>Images</CardTitle>
          </CardHeader>
          <CardContent>
            {images && images.length > 0 ? (
              <div className="space-y-4">
                {/* Main Image */}
                <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                  <img
                    src={images[currentImageIndex].image_url}
                    alt={item.name}
                    className="w-full h-full object-contain"
                  />
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-background/80 rounded-full hover:bg-background transition-colors"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-background/80 rounded-full hover:bg-background transition-colors"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </>
                  )}
                </div>

                {/* Thumbnails */}
                {images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {images.map((img, index) => (
                      <button
                        key={img.id}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                          index === currentImageIndex
                            ? 'border-primary'
                            : 'border-transparent hover:border-muted-foreground/50'
                        }`}
                      >
                        <img
                          src={img.image_url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-2" />
                  <p>No images available</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Item Details */}
        <Card>
          <CardHeader>
            <CardTitle>Item Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-sm text-muted-foreground">Product ID</span>
                <span className="font-mono font-semibold">{item.product_id}</span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Badge className={statusColors[item.status] || 'bg-muted'}>
                    {item.status}
                  </Badge>
                </div>

                {item.category && (
                  <div className="flex items-center gap-2">
                    <FolderOpen className="h-4 w-4 text-muted-foreground" />
                    <span>{item.category.name}</span>
                  </div>
                )}

                {item.current_location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{item.current_location}</span>
                  </div>
                )}

                {item.date_received && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Received: {format(new Date(item.date_received), 'MMMM d, yyyy')}</span>
                  </div>
                )}
              </div>
            </div>

            {item.description && (
              <div className="space-y-2">
                <h3 className="font-medium">Description</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{item.description}</p>
              </div>
            )}

            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                Created: {format(new Date(item.created_at), 'MMM d, yyyy h:mm a')}
              </p>
              {item.updated_at !== item.created_at && (
                <p className="text-xs text-muted-foreground">
                  Updated: {format(new Date(item.updated_at), 'MMM d, yyyy h:mm a')}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* QR Code Dialog */}
      <Dialog open={isQRDialogOpen} onOpenChange={setIsQRDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Item QR Code</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center py-4">
            <ItemQRCode itemId={item.id} productId={item.product_id} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

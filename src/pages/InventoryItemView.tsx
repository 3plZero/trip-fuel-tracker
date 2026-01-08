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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ItemQRCode from '@/components/ItemQRCode';
import ItemBarcode from '@/components/ItemBarcode';
import { ArrowLeft, Pencil, QrCode, MapPin, Calendar, FolderOpen, Package, ChevronLeft, ChevronRight, User, FileText, Tag, Hash } from 'lucide-react';
import { format } from 'date-fns';

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

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(amount);
};

export default function InventoryItemView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isQRDialogOpen, setIsQRDialogOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const { data: item, isLoading, error } = useQuery({
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
      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }
      return data;
    },
    retry: false,
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

  if (!item || error) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Package className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Item Not Found</h2>
        <p className="text-muted-foreground mb-6">The inventory item you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => navigate('/inventory-items')}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Items
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
            <QrCode className="h-4 w-4 mr-2" /> Codes
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
        <div className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-sm text-muted-foreground">Product ID</span>
                <span className="font-mono font-semibold">{item.product_id}</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {item.condition && (
                  <Badge className={conditionColors[item.condition] || 'bg-muted'}>
                    {item.condition}
                  </Badge>
                )}
                {item.utilization_status && (
                  <Badge className={utilizationColors[item.utilization_status] || 'bg-muted'}>
                    {item.utilization_status}
                  </Badge>
                )}
                {item.property_tag === 'Tagged' && (
                  <Badge variant="outline" className="border-primary text-primary">
                    <Tag className="h-3 w-3 mr-1" /> Tagged
                  </Badge>
                )}
              </div>

              <div className="space-y-3">
                {item.brand_model && (
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Brand/Model:</span>
                    <span>{item.brand_model}</span>
                  </div>
                )}

                {item.category && (
                  <div className="flex items-center gap-2">
                    <FolderOpen className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Category:</span>
                    <span>{item.category.name}</span>
                  </div>
                )}

                {item.current_location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Location:</span>
                    <span>{item.current_location}</span>
                  </div>
                )}

                {item.date_received && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Date Received:</span>
                    <span>{format(new Date(item.date_received), 'MMMM d, yyyy')}</span>
                  </div>
                )}
              </div>

              {item.description && (
                <div className="pt-4 border-t">
                  <h4 className="text-sm font-medium mb-2">Specifications / Details</h4>
                  <p className="text-muted-foreground whitespace-pre-wrap text-sm">{item.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Property Details */}
          <Card>
            <CardHeader>
              <CardTitle>Property Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {item.property_number && (
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Property Number:</span>
                  <span className="font-mono">{item.property_number}</span>
                </div>
              )}

              {item.serial_number && (
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Serial Number:</span>
                  <span className="font-mono">{item.serial_number}</span>
                </div>
              )}

              {item.accountability_document && (
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Document:</span>
                  <span>{item.accountability_document}</span>
                </div>
              )}

              {item.property_from && (
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Property From:</span>
                  <span>{item.property_from}</span>
                </div>
              )}

              {!item.property_number && !item.serial_number && !item.accountability_document && !item.property_from && (
                <p className="text-muted-foreground text-sm">No property details available</p>
              )}
            </CardContent>
          </Card>

          {/* Quantity & Cost */}
          <Card>
            <CardHeader>
              <CardTitle>Quantity & Cost</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-2xl font-bold">{item.quantity || 1}</p>
                  <p className="text-xs text-muted-foreground">Quantity</p>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-lg font-semibold">{formatCurrency(item.unit_cost || 0)}</p>
                  <p className="text-xs text-muted-foreground">Unit Cost</p>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-lg font-semibold">{formatCurrency(item.total_cost || 0)}</p>
                  <p className="text-xs text-muted-foreground">Total Cost</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Accountability */}
          {(item.accountable_person || item.remarks) && (
            <Card>
              <CardHeader>
                <CardTitle>Accountability</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {item.accountable_person && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Accountable Person:</span>
                    <span className="font-medium">{item.accountable_person}</span>
                  </div>
                )}

                {item.remarks && (
                  <div className="pt-2 border-t">
                    <h4 className="text-sm font-medium mb-2">Remarks</h4>
                    <p className="text-muted-foreground whitespace-pre-wrap text-sm">{item.remarks}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Timestamps */}
          <Card>
            <CardContent className="pt-6">
              <p className="text-xs text-muted-foreground">
                Created: {format(new Date(item.created_at), 'MMM d, yyyy h:mm a')}
              </p>
              {item.updated_at !== item.created_at && (
                <p className="text-xs text-muted-foreground">
                  Updated: {format(new Date(item.updated_at), 'MMM d, yyyy h:mm a')}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Codes Dialog */}
      <Dialog open={isQRDialogOpen} onOpenChange={setIsQRDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Item Codes</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="qrcode" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="qrcode">QR Code</TabsTrigger>
              <TabsTrigger value="barcode">Barcode</TabsTrigger>
            </TabsList>
            <TabsContent value="qrcode" className="flex flex-col items-center py-4">
              <ItemQRCode itemId={item.id} productId={item.product_id} />
            </TabsContent>
            <TabsContent value="barcode" className="flex flex-col items-center py-4">
              <ItemBarcode value={item.product_id} productId={item.product_id} />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}
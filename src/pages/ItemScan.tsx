import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  MapPin, 
  Calendar, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { format } from 'date-fns';
import { toast } from 'sonner';
import dostLogo from '@/assets/dost-sticker-logo.png';

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

type LocationStatus = 'idle' | 'requesting' | 'granted' | 'denied' | 'unavailable' | 'logging' | 'logged';

export default function ItemScan() {
  const { id } = useParams();
  const [locationStatus, setLocationStatus] = useState<LocationStatus>('idle');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Fetch item details (publicly accessible basic info)
  const { data: item, isLoading, error } = useQuery({
    queryKey: ['public-inventory-item', id],
    queryFn: async () => {
      if (!id) return null;
      // Using anon key - will only get data if RLS allows public read
      // We need to add a public SELECT policy for this to work
      const { data, error } = await supabase
        .from('inventory_items')
        .select(`
          id,
          name,
          product_id,
          brand_model,
          condition,
          utilization_status,
          current_location,
          date_received,
          description,
          property_number,
          serial_number
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

  // Fetch item images
  const { data: images } = useQuery({
    queryKey: ['public-inventory-item-images', id],
    queryFn: async () => {
      if (!id) return [];
      const { data, error } = await supabase
        .from('inventory_item_images')
        .select('id, image_url')
        .eq('item_id', id)
        .order('sort_order');
      if (error) return [];
      return data;
    },
    enabled: !!id,
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

  // Request location and log the scan
  const requestLocationAndLog = async () => {
    if (!id) return;

    if (!navigator.geolocation) {
      setLocationStatus('unavailable');
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setLocationStatus('requesting');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude, accuracy });
        setLocationStatus('logging');

        try {
          // Insert scan log
          const { error } = await supabase
            .from('inventory_scan_logs')
            .insert({
              item_id: id,
              location_lat: latitude,
              location_lng: longitude,
              location_accuracy: accuracy,
              user_agent: navigator.userAgent,
            });

          if (error) {
            console.error('Failed to log scan:', error);
            toast.error('Failed to record location');
            setLocationStatus('granted');
          } else {
            setLocationStatus('logged');
            toast.success('Location recorded successfully!');
          }
        } catch (err) {
          console.error('Error logging scan:', err);
          setLocationStatus('granted');
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        setLocationStatus('denied');
        toast.error('Location access denied');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Auto-request location on mount
  useEffect(() => {
    if (item && locationStatus === 'idle') {
      // Small delay to let user see the item first
      const timer = setTimeout(() => {
        requestLocationAndLog();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [item, locationStatus]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!item || error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Package className="h-16 w-16 text-muted-foreground mb-4" />
              <h2 className="text-2xl font-semibold mb-2">Item Not Found</h2>
              <p className="text-muted-foreground">
                The inventory item you're looking for doesn't exist or has been removed.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Header with Logo */}
        <div className="flex items-center justify-center gap-3 py-4">
          <img src={dostLogo} alt="DOST CAR" className="h-12 w-auto" />
          <div className="text-center">
            <h1 className="text-lg font-bold">DOST-CAR</h1>
            <p className="text-xs text-muted-foreground">Inventory Tracking System</p>
          </div>
        </div>

        {/* Location Status Banner */}
        <Card className={`border-2 ${
          locationStatus === 'logged' ? 'border-green-500 bg-green-500/5' :
          locationStatus === 'denied' ? 'border-red-500 bg-red-500/5' :
          'border-blue-500 bg-blue-500/5'
        }`}>
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              {locationStatus === 'idle' && (
                <>
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm">Preparing to record location...</span>
                </>
              )}
              {locationStatus === 'requesting' && (
                <>
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                  <span className="text-sm">Requesting location access...</span>
                </>
              )}
              {locationStatus === 'logging' && (
                <>
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                  <span className="text-sm">Recording scan location...</span>
                </>
              )}
              {locationStatus === 'logged' && (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <span className="text-sm font-medium text-green-700">Location recorded successfully!</span>
                    {userLocation && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Coordinates: {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
                        {userLocation.accuracy && ` (±${Math.round(userLocation.accuracy)}m)`}
                      </p>
                    )}
                  </div>
                </>
              )}
              {locationStatus === 'denied' && (
                <>
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <div className="flex-1">
                    <span className="text-sm text-red-700">Location access denied</span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="ml-4"
                      onClick={() => {
                        setLocationStatus('idle');
                        requestLocationAndLog();
                      }}
                    >
                      Try Again
                    </Button>
                  </div>
                </>
              )}
              {locationStatus === 'unavailable' && (
                <>
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <span className="text-sm text-yellow-700">Geolocation not available on this device</span>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Image Gallery */}
        {images && images.length > 0 && (
          <Card>
            <CardContent className="p-4">
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
                <p className="text-xs text-center text-muted-foreground mt-2">
                  {currentImageIndex + 1} of {images.length}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Item Details */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg mb-2">
              <span className="text-sm text-muted-foreground">Product ID</span>
              <span className="font-mono font-semibold">{item.product_id}</span>
            </div>
            <CardTitle className="text-xl">{item.name}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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
            </div>

            <div className="space-y-2 text-sm">
              {item.brand_model && (
                <div className="flex items-start gap-2">
                  <Package className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <span className="text-muted-foreground">Brand/Model: </span>
                    <span>{item.brand_model}</span>
                  </div>
                </div>
              )}

              {item.current_location && (
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <span className="text-muted-foreground">Location: </span>
                    <span>{item.current_location}</span>
                  </div>
                </div>
              )}

              {item.date_received && (
                <div className="flex items-start gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <span className="text-muted-foreground">Date Received: </span>
                    <span>{format(new Date(item.date_received), 'MMMM d, yyyy')}</span>
                  </div>
                </div>
              )}

              {item.serial_number && (
                <div className="flex items-start gap-2">
                  <Package className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <span className="text-muted-foreground">Serial No: </span>
                    <span className="font-mono">{item.serial_number}</span>
                  </div>
                </div>
              )}

              {item.property_number && (
                <div className="flex items-start gap-2">
                  <Package className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <span className="text-muted-foreground">Property No: </span>
                    <span className="font-mono">{item.property_number}</span>
                  </div>
                </div>
              )}
            </div>

            {item.description && (
              <div className="pt-3 border-t">
                <h4 className="text-sm font-medium mb-1">Description</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{item.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-xs text-center text-muted-foreground pb-4">
          This is a verified DOST-CAR inventory item
        </p>
      </div>
    </div>
  );
}

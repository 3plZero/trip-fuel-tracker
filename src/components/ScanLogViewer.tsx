import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MapPin, Clock, Smartphone, Map } from 'lucide-react';
import { format } from 'date-fns';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icon issue
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface ScanLog {
  id: string;
  location_lat: number | null;
  location_lng: number | null;
  location_accuracy: number | null;
  scanned_at: string;
  user_agent: string | null;
}

interface ScanLogViewerProps {
  itemId: string;
  itemName: string;
}

interface MapDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  log: ScanLog;
  itemName: string;
}

function ScanMapDialog({ open, onOpenChange, log, itemName }: MapDialogProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [mapKey, setMapKey] = useState(0);

  useEffect(() => {
    if (open) {
      setMapKey(prev => prev + 1);
    }
  }, [open]);

  useEffect(() => {
    if (!open || !log.location_lat || !log.location_lng) {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      return;
    }

    const initMap = () => {
      if (!mapContainerRef.current) return;
      
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      try {
        const map = L.map(mapContainerRef.current, {
          center: [log.location_lat, log.location_lng],
          zoom: 15,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);

        L.marker([log.location_lat, log.location_lng], { icon: DefaultIcon })
          .addTo(map)
          .bindPopup(`<strong>Scanned Location</strong><br/>${format(new Date(log.scanned_at), 'MMM d, yyyy h:mm a')}`)
          .openPopup();

        // Add accuracy circle if available
        if (log.location_accuracy) {
          L.circle([log.location_lat, log.location_lng], {
            radius: log.location_accuracy,
            color: '#3b82f6',
            fillColor: '#3b82f6',
            fillOpacity: 0.1,
          }).addTo(map);
        }

        mapInstanceRef.current = map;

        setTimeout(() => {
          map.invalidateSize();
        }, 200);
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    };

    const timer = setTimeout(initMap, 150);

    return () => {
      clearTimeout(timer);
    };
  }, [open, log.location_lat, log.location_lng, log.scanned_at, log.location_accuracy, mapKey]);

  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  if (!log.location_lat || !log.location_lng) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Scan Location</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-3">
          <div className="text-sm">
            <p><strong>{itemName}</strong></p>
            <p className="text-muted-foreground">
              Scanned on {format(new Date(log.scanned_at), 'MMMM d, yyyy')} at {format(new Date(log.scanned_at), 'h:mm a')}
            </p>
          </div>

          <div className="h-[300px] w-full rounded-md overflow-hidden border bg-muted">
            <div 
              key={mapKey}
              ref={mapContainerRef} 
              className="h-full w-full" 
              style={{ minHeight: '300px', zIndex: 0 }} 
            />
          </div>

          <div className="text-xs text-muted-foreground">
            <p>Coordinates: {log.location_lat.toFixed(6)}, {log.location_lng.toFixed(6)}</p>
            {log.location_accuracy && (
              <p>Accuracy: ±{Math.round(log.location_accuracy)}m</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function ScanLogViewer({ itemId, itemName }: ScanLogViewerProps) {
  const [selectedLog, setSelectedLog] = useState<ScanLog | null>(null);

  const { data: logs, isLoading } = useQuery({
    queryKey: ['inventory-scan-logs', itemId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('inventory_scan_logs')
        .select('*')
        .eq('item_id', itemId)
        .order('scanned_at', { ascending: false });
      
      if (error) throw error;
      return data as ScanLog[];
    },
  });

  const getDeviceInfo = (userAgent: string | null) => {
    if (!userAgent) return 'Unknown device';
    if (userAgent.includes('iPhone') || userAgent.includes('iPad')) return 'iOS Device';
    if (userAgent.includes('Android')) return 'Android Device';
    if (userAgent.includes('Windows')) return 'Windows PC';
    if (userAgent.includes('Mac')) return 'Mac';
    return 'Unknown device';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner size="sm" />
      </div>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No scan logs yet</p>
        <p className="text-xs">Logs will appear here when the QR code is scanned</p>
      </div>
    );
  }

  return (
    <>
      <ScrollArea className="h-[300px]">
        <div className="space-y-2 pr-4">
          {logs.map((log) => (
            <Card 
              key={log.id} 
              className="cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => log.location_lat && log.location_lng && setSelectedLog(log)}
            >
              <CardContent className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                      <span className="font-medium">
                        {format(new Date(log.scanned_at), 'MMM d, yyyy h:mm a')}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <Smartphone className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{getDeviceInfo(log.user_agent)}</span>
                    </div>

                    {log.location_lat && log.location_lng && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <MapPin className="h-3 w-3 flex-shrink-0" />
                        <span className="font-mono">
                          {log.location_lat.toFixed(4)}, {log.location_lng.toFixed(4)}
                        </span>
                        {log.location_accuracy && (
                          <span>(±{Math.round(log.location_accuracy)}m)</span>
                        )}
                      </div>
                    )}
                  </div>

                  {log.location_lat && log.location_lng && (
                    <Button variant="ghost" size="sm" className="flex-shrink-0">
                      <Map className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>

      {selectedLog && (
        <ScanMapDialog
          open={!!selectedLog}
          onOpenChange={(open) => !open && setSelectedLog(null)}
          log={selectedLog}
          itemName={itemName}
        />
      )}
    </>
  );
}

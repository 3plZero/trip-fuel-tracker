import { useEffect, useRef, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MapPin } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icon issue with CDN URLs
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface ItemLocationViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  location: { lat: number; lng: number };
  itemName?: string;
}

export default function ItemLocationViewer({
  open,
  onOpenChange,
  location,
  itemName,
}: ItemLocationViewerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [mapKey, setMapKey] = useState(0);

  // Reset map key when dialog opens to force fresh render
  useEffect(() => {
    if (open) {
      setMapKey(prev => prev + 1);
    }
  }, [open]);

  useEffect(() => {
    if (!open) {
      // Clean up map when dialog closes
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      return;
    }

    // Wait for the container to be in the DOM
    const initMap = () => {
      if (!mapContainerRef.current) return;
      
      // Clean up any existing map first
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      try {
        // Initialize map
        const map = L.map(mapContainerRef.current, {
          center: [location.lat, location.lng],
          zoom: 15,
        });

        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);

        // Add marker
        L.marker([location.lat, location.lng], { icon: DefaultIcon })
          .addTo(map)
          .bindPopup(itemName || 'Item Location')
          .openPopup();

        mapInstanceRef.current = map;

        // Force resize after a short delay to ensure proper tile loading
        setTimeout(() => {
          map.invalidateSize();
        }, 200);
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    };

    // Delay initialization to ensure dialog content is rendered
    const timer = setTimeout(initMap, 150);

    return () => {
      clearTimeout(timer);
    };
  }, [open, location.lat, location.lng, itemName, mapKey]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Item Location
          </DialogTitle>
          <DialogDescription>
            {itemName ? `Location of ${itemName}` : 'Viewing item location on map'}
          </DialogDescription>
        </DialogHeader>

        <div className="h-[400px] w-full rounded-md overflow-hidden border bg-muted">
          <div 
            key={mapKey}
            ref={mapContainerRef} 
            className="h-full w-full" 
            style={{ minHeight: '400px', zIndex: 0 }} 
          />
        </div>

        <div className="text-sm text-muted-foreground">
          <span className="font-medium">Coordinates:</span>{' '}
          {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
        </div>

        <DialogFooter>
          <Button type="button" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

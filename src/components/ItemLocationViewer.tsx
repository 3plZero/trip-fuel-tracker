import { useEffect, useRef } from 'react';
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
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!open || !mapRef.current) return;

    // Small delay to ensure the dialog is fully rendered
    const timer = setTimeout(() => {
      if (!mapRef.current || mapInstanceRef.current) return;

      // Initialize map
      const map = L.map(mapRef.current).setView(
        [location.lat, location.lng],
        15
      );

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

      // Force a resize after initialization
      setTimeout(() => {
        map.invalidateSize();
      }, 100);
    }, 100);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [open, location.lat, location.lng, itemName]);

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

        <div className="h-[400px] w-full rounded-md overflow-hidden border">
          <div ref={mapRef} className="h-full w-full" style={{ minHeight: '400px' }} />
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

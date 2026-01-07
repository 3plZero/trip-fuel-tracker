import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
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

// Fix Leaflet default marker icon issue
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface LocationPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLocationSelect: (lat: number, lng: number) => void;
  initialLocation?: { lat: number; lng: number } | null;
}

interface MapClickHandlerProps {
  onLocationSelect: (lat: number, lng: number) => void;
}

function MapClickHandler({ onLocationSelect }: MapClickHandlerProps) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

export default function LocationPicker({
  open,
  onOpenChange,
  onLocationSelect,
  initialLocation,
}: LocationPickerProps) {
  // Default to CAR region (Baguio City area)
  const defaultCenter: [number, number] = [16.4023, 120.596];
  
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(
    initialLocation || null
  );

  useEffect(() => {
    if (initialLocation) {
      setPosition(initialLocation);
    }
  }, [initialLocation]);

  const handleMapClick = (lat: number, lng: number) => {
    setPosition({ lat, lng });
  };

  const handleConfirm = () => {
    if (position) {
      onLocationSelect(position.lat, position.lng);
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    setPosition(initialLocation || null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Set Vehicle Location
          </DialogTitle>
          <DialogDescription>
            Click on the map to pin the vehicle's last known location
          </DialogDescription>
        </DialogHeader>

        <div className="h-[400px] w-full rounded-md overflow-hidden border">
          <MapContainer
            center={position ? [position.lat, position.lng] : defaultCenter}
            zoom={13}
            className="h-full w-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapClickHandler onLocationSelect={handleMapClick} />
            {position && <Marker position={[position.lat, position.lng]} />}
          </MapContainer>
        </div>

        {position && (
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">Selected coordinates:</span>{' '}
            {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="button" onClick={handleConfirm} disabled={!position}>
            <MapPin className="mr-2 h-4 w-4" />
            Confirm Location
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

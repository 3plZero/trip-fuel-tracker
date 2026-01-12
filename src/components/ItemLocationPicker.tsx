import { useState, useEffect } from 'react';
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
import MapComponent from './MapComponent';

interface ItemLocationPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLocationSelect: (lat: number, lng: number) => void;
  initialLocation?: { lat: number; lng: number } | null;
}

export default function ItemLocationPicker({
  open,
  onOpenChange,
  onLocationSelect,
  initialLocation,
}: ItemLocationPickerProps) {
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(
    initialLocation || null
  );

  useEffect(() => {
    if (initialLocation) {
      setPosition(initialLocation);
    }
  }, [initialLocation]);

  // Reset position when dialog opens
  useEffect(() => {
    if (open) {
      setPosition(initialLocation || null);
    }
  }, [open, initialLocation]);

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

  if (!open) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Set Item Location
          </DialogTitle>
          <DialogDescription>
            Click on the map to pin the item's location
          </DialogDescription>
        </DialogHeader>

        <div className="h-[400px] w-full rounded-md overflow-hidden border">
          <MapComponent
            position={position}
            onLocationSelect={handleMapClick}
          />
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

import { useEffect, useRef } from 'react';
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

interface MapComponentProps {
  position: { lat: number; lng: number } | null;
  onLocationSelect: (lat: number, lng: number) => void;
}

export default function MapComponent({ position, onLocationSelect }: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  // Default to CAR region (Baguio City area)
  const defaultCenter: [number, number] = [16.4023, 120.596];

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map
    const map = L.map(mapRef.current).setView(
      position ? [position.lat, position.lng] : defaultCenter,
      13
    );

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Add click handler
    map.on('click', (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      onLocationSelect(lat, lng);
    });

    // Add initial marker if position exists
    if (position) {
      markerRef.current = L.marker([position.lat, position.lng], { icon: DefaultIcon }).addTo(map);
    }

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update marker when position changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Remove existing marker
    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }

    // Add new marker if position exists
    if (position) {
      markerRef.current = L.marker([position.lat, position.lng], { icon: DefaultIcon }).addTo(mapInstanceRef.current);
      mapInstanceRef.current.setView([position.lat, position.lng], mapInstanceRef.current.getZoom());
    }
  }, [position]);

  return <div ref={mapRef} className="h-full w-full" style={{ minHeight: '400px' }} />;
}

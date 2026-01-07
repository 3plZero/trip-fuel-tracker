import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
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
L.Marker.prototype.options.icon = DefaultIcon;

interface MapComponentProps {
  position: { lat: number; lng: number } | null;
  onLocationSelect: (lat: number, lng: number) => void;
}

function MapClickHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function MapUpdater({ position }: { position: { lat: number; lng: number } | null }) {
  const map = useMap();
  
  useEffect(() => {
    if (position) {
      map.setView([position.lat, position.lng], map.getZoom());
    }
  }, [position, map]);
  
  return null;
}

export default function MapComponent({ position, onLocationSelect }: MapComponentProps) {
  // Default to CAR region (Baguio City area)
  const defaultCenter: [number, number] = [16.4023, 120.596];

  return (
    <MapContainer
      center={position ? [position.lat, position.lng] : defaultCenter}
      zoom={13}
      className="h-full w-full"
      style={{ height: '100%', width: '100%' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapClickHandler onLocationSelect={onLocationSelect} />
      <MapUpdater position={position} />
      {position && <Marker position={[position.lat, position.lng]} />}
    </MapContainer>
  );
}

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { Restaurant } from '@shared/schema';
import L from 'leaflet';

// Fix Leaflet default marker icon issue
let DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Helper component to update map center
function ChangeMapView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

interface Props {
  restaurants: Restaurant[];
  center?: [number, number];
}

export default function RestaurantMap({ restaurants, center }: Props) {
  const defaultCenter: [number, number] = [40.7128, -74.0060]; // Default to NYC

  return (
    <div className="w-full h-[400px] rounded-lg overflow-hidden shadow-md">
      <MapContainer
        center={center || defaultCenter}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
      >
        {center && <ChangeMapView center={center} />}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {restaurants.map((restaurant) => (
          <Marker
            key={restaurant.id}
            position={[Number(restaurant.lat), Number(restaurant.lng)]}
          >
            <Popup>
              <div>
                <h3 className="font-semibold">{restaurant.name}</h3>
                <p className="text-sm">{restaurant.rating} ⭐</p>
                <p className="text-xs text-muted-foreground">{restaurant.address}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
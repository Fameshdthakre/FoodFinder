import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import type { Restaurant } from '@shared/schema';
import L from 'leaflet';

// Fix Leaflet default marker icon issue
// Had to use dynamic imports for marker icons since they're images
let DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface Props {
  restaurants: Restaurant[];
}

export default function RestaurantMap({ restaurants }: Props) {
  const defaultCenter: [number, number] = [40.730610, -73.935242]; // Default to NYC

  return (
    <div className="w-full h-[400px] rounded-lg overflow-hidden shadow-md">
      <MapContainer
        center={defaultCenter}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
      >
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
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
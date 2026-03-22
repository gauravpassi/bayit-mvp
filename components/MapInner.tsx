'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Property } from '@/types';
import { formatPrice } from '@/lib/properties';

// Fix Leaflet default icon path broken by webpack
const createGoldIcon = () =>
  L.divIcon({
    className: '',
    html: `
      <div style="
        width:32px;height:32px;
        background:linear-gradient(135deg,#A67A2E,#C8973F);
        border:2.5px solid #fff;
        border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);
        box-shadow:0 2px 8px rgba(0,0,0,0.3);
      "></div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -36],
  });

// Fit map bounds to show all markers
function BoundsController({ properties }: { properties: Property[] }) {
  const map = useMap();
  useEffect(() => {
    if (properties.length === 0) return;
    const bounds = L.latLngBounds(properties.map((p) => [p.lat, p.lng]));
    map.fitBounds(bounds, { padding: [50, 50] });
  }, [map, properties]);
  return null;
}

interface MapInnerProps {
  properties: Property[];
}

export default function MapInner({ properties }: MapInnerProps) {
  const goldIcon = createGoldIcon();

  return (
    <MapContainer
      center={[31.7917, -7.0926]} // Center of Morocco
      zoom={5}
      style={{ height: '480px', width: '100%', borderRadius: '16px' }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <BoundsController properties={properties} />

      {properties.map((p) => (
        <Marker key={p.id} position={[p.lat, p.lng]} icon={goldIcon}>
          <Popup maxWidth={240}>
            <div className="p-1">
              {p.imageUrl && (
                <img
                  src={p.imageUrl}
                  alt={p.title}
                  className="w-full h-28 object-cover rounded-lg mb-2"
                />
              )}
              <p className="font-semibold text-bayit-dark text-sm leading-snug">{p.title}</p>
              <p className="text-bayit-gray text-xs mt-0.5">{p.neighborhood}, {p.city}</p>
              <p className="text-bayit-gold font-bold text-sm mt-1">{formatPrice(p.price)}</p>
              <div className="flex gap-3 text-xs text-bayit-gray mt-1.5">
                <span>🛏 {p.bedrooms}</span>
                <span>🚿 {p.bathrooms}</span>
                <span>📐 {p.areaSqm} m²</span>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

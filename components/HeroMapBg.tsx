'use client';

/**
 * Non-interactive Leaflet map used as hero background.
 * Centered on Morocco with a few property pin markers.
 * All interaction is disabled so it sits purely as a visual element.
 */

import { MapContainer, TileLayer, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Sample marker positions across Moroccan cities
const PINS = [
  { lat: 31.6295, lng: -7.9811 },  // Marrakech
  { lat: 33.5731, lng: -7.5898 },  // Casablanca
  { lat: 34.0209, lng: -6.8416 },  // Rabat
  { lat: 35.7595, lng: -5.8340 },  // Tangier
  { lat: 30.4278, lng: -9.5981 },  // Agadir
  { lat: 34.0331, lng: -5.0003 },  // Fes
  { lat: 31.9314, lng: -4.4300 },  // Ouarzazate
];

export default function HeroMapBg() {
  return (
    <MapContainer
      center={[31.5, -7.0]}
      zoom={6}
      zoomControl={false}
      dragging={false}
      touchZoom={false}
      doubleClickZoom={false}
      scrollWheelZoom={false}
      boxZoom={false}
      keyboard={false}
      attributionControl={false}
      style={{ height: '100%', width: '100%' }}
    >
      {/* Light grey map tiles */}
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        attribution=""
      />

      {/* Subtle property pins */}
      {PINS.map((p, i) => (
        <CircleMarker
          key={i}
          center={[p.lat, p.lng]}
          radius={i === 0 ? 9 : 6}
          pathOptions={{
            color: '#5B9BD5',
            fillColor: '#5B9BD5',
            fillOpacity: i === 0 ? 0.9 : 0.6,
            weight: 2,
          }}
        />
      ))}
    </MapContainer>
  );
}

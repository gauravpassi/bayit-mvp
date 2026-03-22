'use client';

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Property } from '@/types';
import { formatPrice } from '@/lib/properties';
import { usePropertyModal } from '@/contexts/PropertyModalContext';

// ── Compact price formatter (keeps bubble short to avoid map label overlap) ────
function shortPrice(price: number): string {
  if (price >= 1_000_000) {
    const m = price / 1_000_000;
    return `${Number.isInteger(m) ? m : m.toFixed(1)}M MAD`;
  }
  if (price >= 1_000) return `${Math.round(price / 1_000)}K MAD`;
  return `${price} MAD`;
}

// ── Price-bubble marker factory ────────────────────────────────────────────────
// iconSize:[0,0] + iconAnchor:[0,0] puts the origin at the lat/lng point.
// CSS transform on the inner div centres the pill above that point.
function createPriceBubble(label: string, selected: boolean) {
  return L.divIcon({
    className: 'leaflet-price-bubble-wrapper',
    html: `<div class="price-bubble-marker${selected ? ' selected' : ''}">${label}</div>`,
    iconSize:    [0, 0],
    iconAnchor:  [0, 0],
    popupAnchor: [0, -14],
  });
}

/** Highlighted: pulsing ring pin */
const createHighlightIcon = () =>
  L.divIcon({
    className: '',
    html: `
      <div style="position:relative;width:42px;height:42px;">
        <div style="
          position:absolute;top:50%;left:50%;
          transform:translate(-50%,-50%);
          width:42px;height:42px;
          border-radius:50%;
          background:rgba(91,155,213,0.25);
          animation:bayit-pulse 1.4s ease-in-out infinite;
        "></div>
        <div style="
          position:absolute;top:6px;left:6px;
          width:30px;height:30px;
          background:linear-gradient(135deg,#4A84BE,#5B9BD5);
          border:3px solid #fff;
          border-radius:50% 50% 50% 0;
          transform:rotate(-45deg);
          box-shadow:0 3px 12px rgba(91,155,213,0.65);
        "></div>
      </div>
      <style>
        @keyframes bayit-pulse {
          0%,100%{transform:translate(-50%,-50%) scale(1);opacity:.7}
          50%{transform:translate(-50%,-50%) scale(1.55);opacity:.2}
        }
      </style>
    `,
    iconSize:    [42, 42],
    iconAnchor:  [21, 42],
    popupAnchor: [0, -46],
  });

// ── Fly-to + auto-open popup for highlighted properties ────────────────────────
function HighlightController({
  properties,
  highlightIds,
  markerRefs,
}: {
  properties: Property[];
  highlightIds: string[];
  markerRefs: React.MutableRefObject<Record<string, L.Marker>>;
}) {
  const map  = useMap();
  const done = useRef(false);

  useEffect(() => {
    if (done.current || highlightIds.length === 0) return;
    const highlighted = properties.filter(p => highlightIds.includes(String(p.id)));
    if (highlighted.length === 0) return;
    done.current = true;

    const bounds = L.latLngBounds(highlighted.map(p => [p.lat, p.lng]));
    map.fitBounds(bounds, { padding: [80, 80], maxZoom: 13 });

    map.once('moveend', () => {
      const firstId = String(highlighted[0].id);
      const marker  = markerRefs.current[firstId];
      if (marker) setTimeout(() => marker.openPopup(), 100);
    });
  }, [map, properties, highlightIds, markerRefs]);

  return null;
}

// ── Fly to selected property (from list panel clicks) ─────────────────────────
function SelectedController({
  properties,
  selectedId,
  markerRefs,
}: {
  properties: Property[];
  selectedId: string | null;
  markerRefs: React.MutableRefObject<Record<string, L.Marker>>;
}) {
  const map     = useMap();
  const prevRef = useRef<string | null>(null);

  useEffect(() => {
    if (!selectedId || selectedId === prevRef.current) return;
    prevRef.current = selectedId;

    const p = properties.find(x => String(x.id) === selectedId);
    if (!p) return;

    map.flyTo([p.lat, p.lng], Math.max(map.getZoom(), 13), { duration: 0.8 });
    setTimeout(() => {
      const marker = markerRefs.current[selectedId];
      if (marker) marker.openPopup();
    }, 900);
  }, [map, properties, selectedId, markerRefs]);

  return null;
}

// ── Fit all markers on initial load ───────────────────────────────────────────
function BoundsController({ properties }: { properties: Property[] }) {
  const map = useMap();
  useEffect(() => {
    if (properties.length === 0) return;
    const bounds = L.latLngBounds(properties.map(p => [p.lat, p.lng]));
    map.fitBounds(bounds, { padding: [50, 50] });
  }, [map, properties]);
  return null;
}

// ── Type colour palette for popup accent ──────────────────────────────────────
const POPUP_TYPE: Record<string, { bg: string; text: string; bar: string }> = {
  Riad:      { bg: '#FEF3C7', text: '#92400E', bar: '#F59E0B' },
  Villa:     { bg: '#D1FAE5', text: '#065F46', bar: '#10B981' },
  Apartment: { bg: '#DBEAFE', text: '#1E40AF', bar: '#5B9BD5' },
  Studio:    { bg: '#EDE9FE', text: '#5B21B6', bar: '#8B5CF6' },
  Penthouse: { bg: '#FFE4E6', text: '#9F1239', bar: '#F43F5E' },
  House:     { bg: '#CCFBF1', text: '#134E4A', bar: '#14B8A6' },
};
const DEFAULT_TYPE = { bg: '#F3F4F6', text: '#374151', bar: '#9CA3AF' };

// ── Main component ─────────────────────────────────────────────────────────────
interface MapInnerProps {
  properties:    Property[];
  highlightIds?: string[];
  selectedId?:   string | null;
  onSelect?:     (id: string) => void;
  height?:       string;
}

export default function MapInner({
  properties,
  highlightIds = [],
  selectedId   = null,
  onSelect,
  height       = '100%',
}: MapInnerProps) {
  const { openModal } = usePropertyModal();
  const markerRefs    = useRef<Record<string, L.Marker>>({});

  return (
    <MapContainer
      center={[31.7917, -7.0926]}
      zoom={5}
      style={{ height, width: '100%' }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Fit / fly logic */}
      {highlightIds.length > 0 ? (
        <HighlightController
          properties={properties}
          highlightIds={highlightIds}
          markerRefs={markerRefs}
        />
      ) : selectedId ? (
        <SelectedController
          properties={properties}
          selectedId={selectedId}
          markerRefs={markerRefs}
        />
      ) : (
        <BoundsController properties={properties} />
      )}

      {properties.map(p => {
        const isHighlighted = highlightIds.includes(String(p.id));
        const isSelected    = String(p.id) === selectedId;
        const priceLabel    = shortPrice(p.price);

        const icon = isHighlighted
          ? createHighlightIcon()
          : createPriceBubble(priceLabel, isSelected);

        return (
          <Marker
            key={p.id}
            position={[p.lat, p.lng]}
            icon={icon}
            zIndexOffset={isHighlighted ? 2000 : isSelected ? 1000 : 0}
            ref={(ref: L.Marker | null) => {
              if (ref) markerRefs.current[String(p.id)] = ref;
            }}
            eventHandlers={{
              click: () => onSelect?.(String(p.id)),
            }}
          >
            <Popup
              maxWidth={260}
              autoPan={true}
              autoPanPaddingTopLeft={[10, 80]}
              autoPanPaddingBottomRight={[10, 10]}
            >
              {(() => {
                const tc = POPUP_TYPE[p.type] ?? DEFAULT_TYPE;
                return (
                  <div style={{
                    fontFamily: "'Inter', system-ui, sans-serif",
                    width: 248,
                    overflow: 'hidden',
                  }}>
                    {/* Coloured top accent bar */}
                    <div style={{ height: 4, background: tc.bar }} />

                    {/* Card body */}
                    <div style={{ padding: '14px 16px 16px' }}>

                      {/* Badges row */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                        <span style={{
                          fontSize: 10, fontWeight: 700,
                          background: tc.bg, color: tc.text,
                          padding: '3px 9px', borderRadius: 99,
                          letterSpacing: '0.01em',
                        }}>
                          {p.type}
                        </span>
                        {isHighlighted && (
                          <span style={{
                            fontSize: 9, fontWeight: 700,
                            background: '#EBF4FC', color: '#4A84BE',
                            padding: '3px 8px', borderRadius: 99,
                            letterSpacing: '0.03em', textTransform: 'uppercase',
                          }}>
                            ✦ From search
                          </span>
                        )}
                      </div>

                      {/* Title */}
                      <p style={{
                        margin: '0 0 5px',
                        fontWeight: 700, fontSize: 14,
                        lineHeight: 1.35, color: '#1A1C2E',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}>
                        {p.title}
                      </p>

                      {/* Location */}
                      <p style={{
                        margin: '0 0 12px',
                        fontSize: 11, color: '#5A6072',
                        display: 'flex', alignItems: 'center', gap: 4,
                      }}>
                        <svg width="10" height="12" viewBox="0 0 10 12" fill="none" style={{ flexShrink: 0 }}>
                          <path d="M5 0C2.24 0 0 2.24 0 5c0 3.75 5 7 5 7s5-3.25 5-7c0-2.76-2.24-5-5-5zm0 6.5A1.5 1.5 0 1 1 5 3.5a1.5 1.5 0 0 1 0 3z" fill="#9BA3AF"/>
                        </svg>
                        {p.neighborhood}, {p.city}
                      </p>

                      {/* Price */}
                      <p style={{
                        margin: '0 0 12px',
                        fontWeight: 800, fontSize: 18,
                        color: '#5B9BD5', letterSpacing: '-0.01em',
                      }}>
                        {formatPrice(p.price)}
                      </p>

                      {/* Specs row */}
                      <div style={{
                        display: 'flex', gap: 0,
                        background: '#F8FAFB',
                        borderRadius: 10,
                        border: '1px solid #E4E8EF',
                        overflow: 'hidden',
                        marginBottom: 14,
                      }}>
                        {[
                          { icon: '🛏', val: `${p.bedrooms} bd`, show: p.bedrooms > 0 },
                          { icon: '🚿', val: `${p.bathrooms} ba`, show: true },
                          { icon: '⬜', val: `${p.areaSqm} m²`,  show: true },
                        ].filter(s => s.show).map((s, i, arr) => (
                          <div key={i} style={{
                            flex: 1, textAlign: 'center',
                            padding: '7px 4px',
                            borderRight: i < arr.length - 1 ? '1px solid #E4E8EF' : 'none',
                          }}>
                            <div style={{ fontSize: 13, lineHeight: 1 }}>{s.icon}</div>
                            <div style={{ fontSize: 10, color: '#5A6072', fontWeight: 600, marginTop: 3 }}>{s.val}</div>
                          </div>
                        ))}
                      </div>

                      {/* CTA */}
                      <button
                        onClick={() => openModal(p)}
                        style={{
                          width: '100%',
                          padding: '10px 0',
                          background: '#5B9BD5',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 10,
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: 'pointer',
                          letterSpacing: '0.02em',
                          transition: 'background 0.15s',
                        }}
                        onMouseOver={e => (e.currentTarget.style.background = '#4A84BE')}
                        onMouseOut={e  => (e.currentTarget.style.background = '#5B9BD5')}
                      >
                        View Details →
                      </button>
                    </div>
                  </div>
                );
              })()}
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}

import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { useEffect } from 'react';

export interface MapPoint {
  id: string;
  lat: number;
  lng: number;
  title: string;
  sub?: string;
  kind?: 'activity' | 'stay' | 'city' | 'person';
  color?: string;
  radius?: number;
}

function FitBounds({ points, center }: { points: MapPoint[]; center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    if (points.length > 1) {
      const lats = points.map((p) => p.lat);
      const lngs = points.map((p) => p.lng);
      map.fitBounds(
        [
          [Math.min(...lats), Math.min(...lngs)],
          [Math.max(...lats), Math.max(...lngs)],
        ],
        { padding: [30, 30], maxZoom: 12 }
      );
    } else {
      map.setView(center, 12);
    }
  }, [points, center, map]);
  return null;
}

const COLORS: Record<string, string> = {
  activity: '#4C82EC',
  stay: '#E4322B',
  city: '#1E2D4E',
  person: '#3A66C8',
};

export function MiniMap({
  points,
  center,
  height = 260,
}: {
  points: MapPoint[];
  center: [number, number];
  height?: number;
}) {
  return (
    <div style={{ height }} className="overflow-hidden rounded-3xl shadow-soft">
      <MapContainer
        center={center}
        zoom={12}
        scrollWheelZoom={false}
        style={{ height: '100%', width: '100%' }}
        attributionControl
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap'
        />
        {points.map((p) => (
          <CircleMarker
            key={p.id}
            center={[p.lat, p.lng]}
            radius={p.radius ?? (p.kind === 'stay' ? 9 : 7)}
            pathOptions={{
              color: '#fff',
              weight: 2,
              fillColor: p.color ?? COLORS[p.kind ?? 'activity'],
              fillOpacity: 0.95,
            }}
          >
            <Popup>
              <div style={{ fontWeight: 700 }}>{p.title}</div>
              {p.sub && <div style={{ fontSize: 12, color: '#6B746E' }}>{p.sub}</div>}
            </Popup>
          </CircleMarker>
        ))}
        <FitBounds points={points} center={center} />
      </MapContainer>
    </div>
  );
}

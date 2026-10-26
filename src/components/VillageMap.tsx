import "leaflet/dist/leaflet.css";
import { CircleMarker, MapContainer, Popup, TileLayer, useMapEvents } from "react-leaflet";

export type MapVillage = { slug: string; name: string; latitude: number; longitude: number; province?: string | null };

function ClickPicker({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({ click: (e) => onPick(Number(e.latlng.lat.toFixed(6)), Number(e.latlng.lng.toFixed(6))) });
  return null;
}

export default function VillageMap({
  villages,
  picked,
  onPick,
  className,
}: {
  villages: MapVillage[];
  picked?: { lat: number; lng: number } | null;
  onPick?: (lat: number, lng: number) => void;
  className?: string;
}) {
  return (
    <MapContainer center={[-2.5, 118]} zoom={5} scrollWheelZoom className={className ?? ""} style={{ height: "100%", width: "100%" }}>
      <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {villages.map((v) => (
        <CircleMarker key={v.slug} center={[v.latitude, v.longitude]} radius={9} pathOptions={{ color: "#1f4d3a", fillColor: "#d9a441", fillOpacity: 0.95, weight: 3 }}>
          <Popup>
            <strong>Desa {v.name}</strong>
            <br />
            {v.province}
            <br />
            <a href={`/${v.slug}`}>Kunjungi laman desa →</a>
          </Popup>
        </CircleMarker>
      ))}
      {picked && <CircleMarker center={[picked.lat, picked.lng]} radius={11} pathOptions={{ color: "#b4462b", fillColor: "#b4462b", fillOpacity: 0.6 }} />}
      {onPick && <ClickPicker onPick={onPick} />}
    </MapContainer>
  );
}

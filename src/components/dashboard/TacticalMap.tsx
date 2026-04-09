import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { mockAssets, mockEntities } from "@/data/mockData";

// Fix default marker icon issue in leaflet + bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const MAP_CENTER: [number, number] = [42.347, -71.055];
const MAP_ZOOM = 13;

const svgIcons: Record<string, string> = {
  uav: '<path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.4-.1.8.3 1.1L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.7.5 1.1.3l.5-.2c.4-.3.6-.7.5-1.2z"/>',
  drone: '<path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.4-.1.8.3 1.1L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.7.5 1.1.3l.5-.2c.4-.3.6-.7.5-1.2z"/>',
  robot: '<rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/>',
  ugv: '<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>',
  vehicle: '<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/>',
  sensor: '<path d="M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"/><path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"/>',
  camera: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>',
};

const typeColors: Record<string, string> = {
  uav: "#22c55e", drone: "#22c55e", robot: "#f59e0b",
  ugv: "#8b5cf6", vehicle: "#3b82f6", sensor: "#06b6d4", camera: "#ec4899",
};

const statusColors: Record<string, string> = {
  active: "#22c55e", deployed: "#22c55e",
  idle: "#eab308", offline: "#ef4444",
  maintenance: "#6b7280",
};

function createDivIcon(type: string, color: string, isSelected: boolean) {
  const svgPath = svgIcons[type] || svgIcons.sensor;
  const html = `<div style="display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:50%;background:hsl(222 47% 11% / 0.9);border:2px solid ${color};box-shadow:${isSelected ? `0 0 12px ${color}` : `0 0 6px ${color}40`}"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${svgPath}</svg></div>`;
  return L.divIcon({
    html,
    className: "custom-leaflet-icon",
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
  });
}

function createInfraIcon(isDamaged: boolean) {
  const color = isDamaged ? "#f97316" : "#94a3b8";
  const bg = isDamaged ? "hsl(24 95% 53% / 0.15)" : "hsl(222 47% 11% / 0.8)";
  const html = `<div style="display:flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:4px;background:${bg};border:1.5px solid ${color}80"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg></div>`;
  return L.divIcon({
    html,
    className: "custom-leaflet-icon",
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -14],
  });
}

function MapStyleController() {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
  }, [map]);
  return null;
}

export function TacticalMap() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const fireZone = mockEntities.find(e => e.subType === "Fire Zone");
  const floodZone = mockEntities.find(e => e.subType === "Flood Zone");

  const selectedAsset = mockAssets.find(a => a.id === selectedId);
  const selectedEntity = mockEntities.find(e => e.id === selectedId);
  const selectedItem = selectedAsset || selectedEntity;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="glass-card rounded-xl overflow-hidden"
    >
      <div className="flex items-center justify-between p-4 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-severity-low animate-pulse" />
          <h3 className="text-sm font-semibold text-foreground">Tactical Overview</h3>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-severity-low" /> Active</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-severity-medium" /> Idle</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-severity-critical" /> Offline</span>
          <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 text-severity-critical">🔥</span> Fire</span>
          <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 text-severity-info">💧</span> Flood</span>
        </div>
      </div>

      <div className="relative aspect-[16/9]">
        <MapContainer
          center={MAP_CENTER}
          zoom={MAP_ZOOM}
          scrollWheelZoom={true}
          zoomControl={false}
          attributionControl={false}
          className="h-full w-full z-0"
          style={{ background: "hsl(222 47% 8%)" }}
        >
          <MapStyleController />
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>'
          />

          {/* Fire Zone */}
          {fireZone && (
            <Circle
              center={[fireZone.location.y, fireZone.location.x]}
              radius={800}
              pathOptions={{
                color: "#ef4444",
                fillColor: "#ef4444",
                fillOpacity: 0.15,
                weight: 1.5,
                dashArray: "6 4",
              }}
            >
              <Popup className="tactical-popup">
                <div className="text-xs">
                  <p className="font-semibold text-red-400">{fireZone.name}</p>
                  <p className="text-muted-foreground">Status: {fireZone.status}</p>
                  <p className="text-muted-foreground">Area: {fireZone.attributes.area}</p>
                  <p className="text-muted-foreground">Intensity: {String(fireZone.attributes.intensity)}</p>
                </div>
              </Popup>
            </Circle>
          )}

          {/* Flood Zone */}
          {floodZone && (
            <Circle
              center={[floodZone.location.y, floodZone.location.x]}
              radius={600}
              pathOptions={{
                color: "#3b82f6",
                fillColor: "#3b82f6",
                fillOpacity: 0.12,
                weight: 1.5,
                dashArray: "6 4",
              }}
            >
              <Popup className="tactical-popup">
                <div className="text-xs">
                  <p className="font-semibold text-blue-400">{floodZone.name}</p>
                  <p className="text-muted-foreground">Status: {floodZone.status}</p>
                  <p className="text-muted-foreground">Water Level: {String(floodZone.attributes.waterLevel)}</p>
                  <p className="text-muted-foreground">Time to Breach: {String(floodZone.attributes.timeToBreech)}</p>
                </div>
              </Popup>
            </Circle>
          )}

          {/* Infrastructure */}
          {mockEntities.filter(e => e.type === "infrastructure").map(entity => (
            <Marker
              key={entity.id}
              position={[entity.location.y, entity.location.x]}
              icon={createInfraIcon(entity.status === "Damaged")}
              eventHandlers={{
                click: () => setSelectedId(entity.id === selectedId ? null : entity.id),
              }}
            >
              <Popup className="tactical-popup">
                <div className="text-xs">
                  <p className="font-semibold">{entity.name}</p>
                  <p className="text-muted-foreground">{entity.subType} • {entity.status}</p>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Assets */}
          {mockAssets.map(asset => {
            const color = statusColors[asset.status] || "#6b7280";
            return (
              <Marker
                key={asset.id}
                position={[asset.location.y, asset.location.x]}
                icon={createDivIcon(asset.type, color, selectedId === asset.id)}
                eventHandlers={{
                  click: () => setSelectedId(asset.id === selectedId ? null : asset.id),
                }}
              >
                <Popup className="tactical-popup">
                  <div className="text-xs">
                    <p className="font-semibold">{asset.name}</p>
                    <p className="text-muted-foreground">{asset.type.toUpperCase()} • {asset.status}</p>
                    <p className="text-muted-foreground">Battery: {asset.batteryLevel}%</p>
                    {asset.assignedMission && (
                      <p className="text-primary mt-1">Mission Active</p>
                    )}
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* Selected info bar */}
      {selectedItem && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className="border-t border-border/50 p-3 bg-secondary/30"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-foreground">{selectedItem.name}</p>
              <p className="text-[11px] text-muted-foreground">
                {selectedAsset
                  ? `${selectedAsset.type.toUpperCase()} • ${selectedAsset.status} • Battery: ${selectedAsset.batteryLevel}%`
                  : `${selectedEntity?.subType} • ${selectedEntity?.status}`}
              </p>
            </div>
            {selectedAsset?.assignedMission && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                Mission Active
              </span>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

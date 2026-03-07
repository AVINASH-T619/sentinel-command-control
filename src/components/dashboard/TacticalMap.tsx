import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { mockAssets, mockEntities } from "@/data/mockData";
import { Plane, Bot, Truck, Car, Radio, Camera, Flame, Droplets, Building2 } from "lucide-react";
import { renderToStaticMarkup } from "react-dom/server";

// Fix default marker icon issue in leaflet + bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const MAP_CENTER: [number, number] = [42.347, -71.055];
const MAP_ZOOM = 13;

const assetIcons: Record<string, React.ElementType> = {
  uav: Plane, drone: Plane, robot: Bot, ugv: Truck,
  vehicle: Car, sensor: Radio, camera: Camera,
};

const statusColors: Record<string, string> = {
  active: "#22c55e", deployed: "#22c55e",
  idle: "#eab308", offline: "#ef4444",
  maintenance: "#6b7280",
};

function createDivIcon(IconComponent: React.ElementType, color: string, isSelected: boolean) {
  const markup = renderToStaticMarkup(
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      width: 28, height: 28, borderRadius: "50%",
      background: "hsl(222 47% 11% / 0.9)", border: `2px solid ${color}`,
      boxShadow: isSelected ? `0 0 12px ${color}` : `0 0 6px ${color}40`,
    }}>
      <IconComponent style={{ width: 14, height: 14, color }} />
    </div>
  );
  return L.divIcon({
    html: markup,
    className: "custom-leaflet-icon",
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
  });
}

function createInfraIcon(isDamaged: boolean) {
  const color = isDamaged ? "#f97316" : "#94a3b8";
  const markup = renderToStaticMarkup(
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      width: 24, height: 24, borderRadius: 4,
      background: isDamaged ? "hsl(24 95% 53% / 0.15)" : "hsl(222 47% 11% / 0.8)",
      border: `1.5px solid ${color}80`,
    }}>
      <Building2 style={{ width: 12, height: 12, color }} />
    </div>
  );
  return L.divIcon({
    html: markup,
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
          <span className="flex items-center gap-1"><Flame className="h-2.5 w-2.5 text-severity-critical" /> Fire</span>
          <span className="flex items-center gap-1"><Droplets className="h-2.5 w-2.5 text-severity-info" /> Flood</span>
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
            const Icon = assetIcons[asset.type] || Radio;
            const color = statusColors[asset.status] || "#6b7280";
            return (
              <Marker
                key={asset.id}
                position={[asset.location.y, asset.location.x]}
                icon={createDivIcon(Icon, color, selectedId === asset.id)}
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

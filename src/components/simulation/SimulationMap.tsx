import { useEffect, useRef, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { renderToStaticMarkup } from "react-dom/server";
import { mockEntities, getAssetIcon, AssetType } from "@/data/mockData";
import { Plane, Bot, Truck, Car, Radio, Camera, Flame, Droplets, Building2 } from "lucide-react";
import type { PlacedEntity } from "@/pages/Simulations";

const MAP_CENTER: [number, number] = [42.347, -71.055];
const MAP_ZOOM = 13;

const assetIcons: Record<string, React.ElementType> = {
  uav: Plane, drone: Plane, robot: Bot, ugv: Truck,
  vehicle: Car, sensor: Radio, camera: Camera,
};

const typeColors: Record<string, string> = {
  uav: "#22c55e", drone: "#22c55e", robot: "#f59e0b",
  ugv: "#8b5cf6", vehicle: "#3b82f6", sensor: "#06b6d4", camera: "#ec4899",
};

function createEntityIcon(type: AssetType, isSelected?: boolean) {
  const IconComponent = assetIcons[type] || Radio;
  const color = typeColors[type] || "#22c55e";
  const markup = renderToStaticMarkup(
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      width: 32, height: 32, borderRadius: "50%",
      background: "hsl(222 47% 11% / 0.9)", border: `2px solid ${color}`,
      boxShadow: `0 0 8px ${color}60`,
      cursor: "grab",
    }}>
      <IconComponent style={{ width: 16, height: 16, color }} />
    </div>
  );
  return L.divIcon({
    html: markup,
    className: "custom-leaflet-icon",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18],
  });
}

interface SimulationMapProps {
  placedEntities: PlacedEntity[];
  onDropEntity: (lat: number, lng: number, type: AssetType) => void;
  onMoveEntity: (id: string, lat: number, lng: number) => void;
  draggedAssetType: AssetType | null;
  isRunning: boolean;
  simTime: number;
}

function DropHandler({ onDropEntity, draggedAssetType }: { onDropEntity: SimulationMapProps["onDropEntity"]; draggedAssetType: AssetType | null }) {
  const map = useMap();
  const containerRef = useRef(map.getContainer());

  useEffect(() => {
    const container = containerRef.current;

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.dataTransfer) e.dataTransfer.dropEffect = "copy";
      container.style.outline = "2px solid hsl(195 85% 45% / 0.5)";
      container.style.outlineOffset = "-2px";
    };

    const handleDragLeave = () => {
      container.style.outline = "none";
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      container.style.outline = "none";

      const assetType = e.dataTransfer?.getData("assetType") as AssetType;
      if (!assetType) return;

      const rect = container.getBoundingClientRect();
      const point = L.point(e.clientX - rect.left, e.clientY - rect.top);
      const latlng = map.containerPointToLatLng(point);
      onDropEntity(latlng.lat, latlng.lng, assetType);
    };

    container.addEventListener("dragover", handleDragOver);
    container.addEventListener("dragleave", handleDragLeave);
    container.addEventListener("drop", handleDrop);

    return () => {
      container.removeEventListener("dragover", handleDragOver);
      container.removeEventListener("dragleave", handleDragLeave);
      container.removeEventListener("drop", handleDrop);
    };
  }, [map, onDropEntity, draggedAssetType]);

  return null;
}

function DraggableMarker({ entity, onMove }: { entity: PlacedEntity; onMove: (id: string, lat: number, lng: number) => void }) {
  const markerRef = useRef<L.Marker>(null);

  const eventHandlers = {
    dragend() {
      const marker = markerRef.current;
      if (marker) {
        const pos = marker.getLatLng();
        onMove(entity.id, pos.lat, pos.lng);
      }
    },
  };

  return (
    <Marker
      ref={markerRef}
      position={[entity.lat, entity.lng]}
      icon={createEntityIcon(entity.type)}
      draggable={true}
      eventHandlers={eventHandlers}
    >
      <Popup className="tactical-popup">
        <div className="text-xs">
          <p className="font-semibold">{entity.name}</p>
          <p className="text-muted-foreground">{entity.type.toUpperCase()} • {entity.status}</p>
          <p className="text-muted-foreground font-mono text-[10px]">
            {entity.lat.toFixed(5)}, {entity.lng.toFixed(5)}
          </p>
          <p className="text-muted-foreground">Battery: {entity.batteryLevel}%</p>
        </div>
      </Popup>
    </Marker>
  );
}

export function SimulationMap({ placedEntities, onDropEntity, onMoveEntity, draggedAssetType, isRunning, simTime }: SimulationMapProps) {
  const fireZone = mockEntities.find(e => e.subType === "Fire Zone");
  const floodZone = mockEntities.find(e => e.subType === "Flood Zone");

  return (
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
        <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
        <DropHandler onDropEntity={onDropEntity} draggedAssetType={draggedAssetType} />

        {/* Fire Zone */}
        {fireZone && (
          <Circle
            center={[fireZone.location.y, fireZone.location.x]}
            radius={isRunning ? 800 + Math.sin(simTime * 0.1) * 200 : 800}
            pathOptions={{ color: "#ef4444", fillColor: "#ef4444", fillOpacity: 0.15, weight: 1.5, dashArray: "6 4" }}
          >
            <Popup className="tactical-popup">
              <div className="text-xs">
                <p className="font-semibold" style={{ color: "#ef4444" }}>{fireZone.name}</p>
                <p className="text-muted-foreground">Status: {fireZone.status}</p>
              </div>
            </Popup>
          </Circle>
        )}

        {/* Flood Zone */}
        {floodZone && (
          <Circle
            center={[floodZone.location.y, floodZone.location.x]}
            radius={isRunning ? 600 + Math.sin(simTime * 0.08) * 150 : 600}
            pathOptions={{ color: "#3b82f6", fillColor: "#3b82f6", fillOpacity: 0.12, weight: 1.5, dashArray: "6 4" }}
          >
            <Popup className="tactical-popup">
              <div className="text-xs">
                <p className="font-semibold" style={{ color: "#3b82f6" }}>{floodZone.name}</p>
                <p className="text-muted-foreground">Status: {floodZone.status}</p>
              </div>
            </Popup>
          </Circle>
        )}

        {/* Placed draggable entities */}
        {placedEntities.map(entity => (
          <DraggableMarker key={entity.id} entity={entity} onMove={onMoveEntity} />
        ))}
      </MapContainer>

      {/* Drop hint overlay */}
      {draggedAssetType && (
        <div className="absolute inset-0 z-[500] pointer-events-none flex items-center justify-center">
          <div className="bg-primary/10 border-2 border-dashed border-primary/40 rounded-xl px-6 py-3 backdrop-blur-sm">
            <p className="text-sm font-medium text-primary">Drop to place {draggedAssetType.toUpperCase()}</p>
          </div>
        </div>
      )}
    </div>
  );
}

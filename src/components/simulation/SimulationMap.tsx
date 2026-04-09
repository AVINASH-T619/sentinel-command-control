import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { PlacedEntity } from "@/pages/Simulations";
import type { EntityState, PatrolRoute, HazardZone, Waypoint } from "@/lib/simulation/engine";
import type { AssetType } from "@/data/mockData";

const MAP_CENTER: [number, number] = [42.347, -71.055];
const MAP_ZOOM = 13;

const svgIcons: Record<string, string> = {
  uav: '<path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.4-.1.8.3 1.1L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.7.5 1.1.3l.5-.2c.4-.3.6-.7.5-1.2z"/>',
  drone: '<path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.4-.1.8.3 1.1L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.7.5 1.1.3l.5-.2c.4-.3.6-.7.5-1.2z"/>',
  robot: '<rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/>',
  ugv: '<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>',
  vehicle: '<path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/>',
  sensor: '<path d="M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0"/><path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49"/>',
  camera: '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>',
};

const typeColors: Record<string, string> = {
  uav: "#22c55e", drone: "#22c55e", robot: "#f59e0b",
  ugv: "#8b5cf6", vehicle: "#3b82f6", sensor: "#06b6d4", camera: "#ec4899",
};

const hazardColors: Record<string, { stroke: string; fill: string }> = {
  fire: { stroke: "#ef4444", fill: "#ef4444" },
  flood: { stroke: "#3b82f6", fill: "#3b82f6" },
  chemical: { stroke: "#a855f7", fill: "#a855f7" },
  radiation: { stroke: "#eab308", fill: "#eab308" },
  epidemic: { stroke: "#f97316", fill: "#f97316" },
};

function createEntityIcon(type: AssetType, status?: string) {
  const svgPath = svgIcons[type] || svgIcons.sensor;
  const color = typeColors[type] || "#22c55e";
  const isPatrolling = status === "patrolling";
  const shadow = isPatrolling ? `0 0 12px ${color}90, 0 0 24px ${color}40` : `0 0 8px ${color}60`;
  const html = `<div style="display:flex;align-items:center;justify-content:center;width:32px;height:32px;border-radius:50%;background:hsl(222 47% 11% / 0.9);border:2px solid ${color};box-shadow:${shadow};cursor:grab"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${svgPath}</svg></div>`;
  return L.divIcon({
    html,
    className: "custom-leaflet-icon",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18],
  });
}

function createWaypointIcon(index: number) {
  const html = `<div style="width:14px;height:14px;border-radius:50%;background:hsl(195 85% 50% / 0.3);border:1.5px solid hsl(195 85% 50% / 0.6);display:flex;align-items:center;justify-content:center;font-size:7px;color:hsl(195 85% 60%);font-weight:600">${index + 1}</div>`;
  return L.divIcon({
    html,
    className: "custom-leaflet-icon",
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

function DropHandler({ onDropEntity, draggedAssetType }: {
  onDropEntity: (lat: number, lng: number, type: AssetType) => void;
  draggedAssetType: AssetType | null;
}) {
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
    const handleDragLeave = () => { container.style.outline = "none"; };
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

function AnimatedMarker({ entity, entityState, onMove }: {
  entity: PlacedEntity;
  entityState?: EntityState;
  onMove: (id: string, lat: number, lng: number) => void;
}) {
  const markerRef = useRef<L.Marker>(null);

  // Animate marker position when entity state updates
  useEffect(() => {
    if (markerRef.current && entityState) {
      markerRef.current.setLatLng([entityState.lat, entityState.lng]);
    }
  }, [entityState?.lat, entityState?.lng]);

  const lat = entityState?.lat ?? entity.lat;
  const lng = entityState?.lng ?? entity.lng;
  const status = entityState?.status ?? "idle";

  return (
    <Marker
      ref={markerRef}
      position={[lat, lng]}
      icon={createEntityIcon(entity.type, status)}
      draggable={status === "idle"}
      eventHandlers={{
        dragend() {
          const marker = markerRef.current;
          if (marker) {
            const pos = marker.getLatLng();
            onMove(entity.id, pos.lat, pos.lng);
          }
        },
      }}
    >
      <Popup className="tactical-popup">
        <div className="text-xs space-y-1">
          <p className="font-semibold">{entity.name}</p>
          <p className="text-muted-foreground capitalize">{entity.type.toUpperCase()} • {status}</p>
          <p className="text-muted-foreground font-mono text-[10px]">
            {lat.toFixed(5)}, {lng.toFixed(5)}
          </p>
          {entityState && (
            <>
              <p className="text-muted-foreground">Heading: {entityState.heading.toFixed(0)}°</p>
              <p className="text-muted-foreground">Speed: {entityState.speed.toFixed(1)} m/s</p>
              <p className="text-muted-foreground">Battery: {entityState.batteryLevel.toFixed(0)}%</p>
            </>
          )}
        </div>
      </Popup>
    </Marker>
  );
}

interface SimulationMapProps {
  placedEntities: PlacedEntity[];
  onDropEntity: (lat: number, lng: number, type: AssetType) => void;
  onMoveEntity: (id: string, lat: number, lng: number) => void;
  draggedAssetType: AssetType | null;
  isRunning: boolean;
  simTime: number;
  entityStates?: Map<string, EntityState>;
  routes?: Map<string, PatrolRoute>;
  hazardZones?: HazardZone[];
}

export function SimulationMap({
  placedEntities,
  onDropEntity,
  onMoveEntity,
  draggedAssetType,
  isRunning,
  simTime,
  entityStates,
  routes,
  hazardZones = [],
}: SimulationMapProps) {
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

        {/* Hazard zones */}
        {hazardZones.map(zone => {
          const colors = hazardColors[zone.type] || hazardColors.fire;
          return (
            <Circle
              key={zone.id}
              center={zone.center}
              radius={zone.radius}
              pathOptions={{
                color: colors.stroke,
                fillColor: colors.fill,
                fillOpacity: 0.12 + zone.intensity * 0.08,
                weight: 1.5,
                dashArray: "6 4",
              }}
            >
              <Popup className="tactical-popup">
                <div className="text-xs">
                  <p className="font-semibold" style={{ color: colors.stroke }}>
                    {zone.type.charAt(0).toUpperCase() + zone.type.slice(1)} Zone
                  </p>
                  <p className="text-muted-foreground">Radius: {zone.radius.toFixed(0)}m</p>
                  <p className="text-muted-foreground">Intensity: {(zone.intensity * 100).toFixed(0)}%</p>
                  <p className="text-muted-foreground">Spread: {zone.spreadRate} m/s</p>
                </div>
              </Popup>
            </Circle>
          );
        })}

        {/* Patrol routes (polylines + waypoint markers) */}
        {routes && Array.from(routes.entries()).map(([entityId, route]) => {
          const entity = placedEntities.find(e => e.id === entityId);
          if (!entity) return null;
          const color = typeColors[entity.type] || "#22c55e";
          const positions: [number, number][] = route.waypoints.map(w => [w.lat, w.lng]);
          if (route.loop && positions.length > 1) positions.push(positions[0]);

          return (
            <span key={`route-${entityId}`}>
              {/* Planned route */}
              <Polyline
                positions={positions}
                pathOptions={{
                  color,
                  weight: 1.5,
                  opacity: 0.35,
                  dashArray: "8 6",
                }}
              />
              {/* Waypoint markers */}
              {route.waypoints.map((wp, i) => (
                <Marker
                  key={`wp-${entityId}-${i}`}
                  position={[wp.lat, wp.lng]}
                  icon={createWaypointIcon(i)}
                  interactive={false}
                />
              ))}
            </span>
          );
        })}

        {/* Entity path history trails */}
        {entityStates && Array.from(entityStates.values()).map(es => {
          if (es.pathHistory.length < 2) return null;
          const entity = placedEntities.find(e => e.id === es.id);
          const color = entity ? typeColors[entity.type] || "#22c55e" : "#22c55e";
          return (
            <Polyline
              key={`trail-${es.id}`}
              positions={es.pathHistory as [number, number][]}
              pathOptions={{
                color,
                weight: 2,
                opacity: 0.6,
              }}
            />
          );
        })}

        {/* Animated entity markers */}
        {placedEntities.map(entity => (
          <AnimatedMarker
            key={entity.id}
            entity={entity}
            entityState={entityStates?.get(entity.id)}
            onMove={onMoveEntity}
          />
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

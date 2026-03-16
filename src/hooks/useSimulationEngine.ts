import { useState, useEffect, useCallback, useRef } from "react";
import type { PlacedEntity } from "@/pages/Simulations";
import {
  EntityState,
  PatrolRoute,
  HazardZone,
  SimEvent,
  ImpactAssessment,
  Waypoint,
  updateEntityPosition,
  propagateHazard,
  computeImpactAnalysis,
  generatePatrolWaypoints,
} from "@/lib/simulation/engine";

export interface SimEngineState {
  entityStates: Map<string, EntityState>;
  routes: Map<string, PatrolRoute>;
  hazardZones: HazardZone[];
  events: SimEvent[];
  impact: ImpactAssessment | null;
  windDirection: number;
  windSpeed: number;
}

const PATROL_PATTERNS: Array<"perimeter" | "spiral" | "grid" | "random"> = [
  "perimeter", "spiral", "grid", "random"
];

export function useSimulationEngine(
  placedEntities: PlacedEntity[],
  isRunning: boolean,
  simSpeed: number,
  simTime: number,
) {
  const [state, setState] = useState<SimEngineState>({
    entityStates: new Map(),
    routes: new Map(),
    hazardZones: [
      {
        id: "fire-1",
        type: "fire",
        center: [42.36, -71.04],
        radius: 800,
        intensity: 0.8,
        spreadRate: 2,
        direction: 45,
        cells: [],
      },
      {
        id: "flood-1",
        type: "flood",
        center: [42.325, -71.07],
        radius: 600,
        intensity: 0.6,
        spreadRate: 1,
        direction: 180,
        cells: [],
      },
    ],
    events: [],
    impact: null,
    windDirection: 45,
    windSpeed: 15,
  });

  const lastTickRef = useRef<number>(0);
  const animFrameRef = useRef<number>(0);

  // Initialize entity states and routes when entities are placed
  useEffect(() => {
    setState(prev => {
      const newEntityStates = new Map(prev.entityStates);
      const newRoutes = new Map(prev.routes);

      for (const entity of placedEntities) {
        if (!newEntityStates.has(entity.id)) {
          // Create entity state
          newEntityStates.set(entity.id, {
            id: entity.id,
            lat: entity.lat,
            lng: entity.lng,
            heading: 0,
            speed: 0,
            currentWaypointIndex: 0,
            dwellRemaining: 0,
            batteryLevel: entity.batteryLevel,
            status: "idle",
            pathHistory: [[entity.lat, entity.lng]],
          });

          // Generate a patrol route
          const pattern = PATROL_PATTERNS[Math.floor(Math.random() * PATROL_PATTERNS.length)];
          const waypoints = generatePatrolWaypoints(
            [entity.lat, entity.lng],
            pattern,
            0.005 + Math.random() * 0.005
          );

          newRoutes.set(entity.id, {
            entityId: entity.id,
            waypoints,
            loop: true,
            speed: entity.type === "uav" || entity.type === "drone" ? 40 : 15, // m/s
          });
        }
      }

      // Remove states for entities that were removed
      const entityIds = new Set(placedEntities.map(e => e.id));
      for (const id of newEntityStates.keys()) {
        if (!entityIds.has(id)) {
          newEntityStates.delete(id);
          newRoutes.delete(id);
        }
      }

      return { ...prev, entityStates: newEntityStates, routes: newRoutes };
    });
  }, [placedEntities]);

  // Main simulation loop
  useEffect(() => {
    if (!isRunning) {
      lastTickRef.current = 0;
      return;
    }

    const tick = (timestamp: number) => {
      if (lastTickRef.current === 0) lastTickRef.current = timestamp;
      const dt = Math.min((timestamp - lastTickRef.current) / 1000, 0.1); // cap at 100ms
      lastTickRef.current = timestamp;

      if (dt > 0) {
        setState(prev => {
          const newEntityStates = new Map<string, EntityState>();

          // Update entity positions
          for (const [id, entityState] of prev.entityStates) {
            const route = prev.routes.get(id);
            if (route) {
              newEntityStates.set(id, updateEntityPosition(entityState, route, dt, simSpeed));
            } else {
              newEntityStates.set(id, entityState);
            }
          }

          // Update hazard zones (every ~500ms to save perf)
          const shouldUpdateHazards = Math.floor(simTime * 2) !== Math.floor((simTime - dt * simSpeed) * 2);
          const newHazards = shouldUpdateHazards
            ? prev.hazardZones.map(z => propagateHazard(z, dt * simSpeed, prev.windDirection, prev.windSpeed))
            : prev.hazardZones;

          // Compute impact analysis periodically
          const shouldUpdateImpact = Math.floor(simTime) % 3 === 0 && shouldUpdateHazards;
          const entityPositions = Array.from(newEntityStates.values()).map(e => ({
            id: e.id, lat: e.lat, lng: e.lng, type: "asset"
          }));
          const newImpact = shouldUpdateImpact
            ? computeImpactAnalysis(newHazards, entityPositions)
            : prev.impact;

          return {
            ...prev,
            entityStates: newEntityStates,
            hazardZones: newHazards,
            impact: newImpact,
          };
        });
      }

      animFrameRef.current = requestAnimationFrame(tick);
    };

    animFrameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [isRunning, simSpeed, simTime]);

  const injectEvent = useCallback((event: Omit<SimEvent, "id" | "time" | "resolved">) => {
    const newEvent: SimEvent = {
      ...event,
      id: `evt-${Date.now()}`,
      time: simTime,
      resolved: false,
    };
    setState(prev => ({
      ...prev,
      events: [newEvent, ...prev.events].slice(0, 50),
    }));
  }, [simTime]);

  const setWind = useCallback((direction: number, speed: number) => {
    setState(prev => ({ ...prev, windDirection: direction, windSpeed: speed }));
  }, []);

  return {
    entityStates: state.entityStates,
    routes: state.routes,
    hazardZones: state.hazardZones,
    events: state.events,
    impact: state.impact,
    windDirection: state.windDirection,
    windSpeed: state.windSpeed,
    injectEvent,
    setWind,
  };
}

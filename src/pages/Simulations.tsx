import { useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { mockScenarios, AssetType, getAssetIcon } from "@/data/mockData";
import { Flame, Waves, Mountain, Zap, Users, Shield, Crosshair, Activity, Play, Pause, RotateCcw, SkipForward, Clock, Star, X, TerminalSquare, GripVertical, Trash2, Wind } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MonteCarloDashboard } from "@/components/MonteCarloDashboard";
import { SimulationMap } from "@/components/simulation/SimulationMap";
import { ImpactAnalysisPanel } from "@/components/simulation/ImpactAnalysisPanel";
import { EventInjectionPanel } from "@/components/simulation/EventInjectionPanel";
import { useSimulationEngine } from "@/hooks/useSimulationEngine";

import * as LucideIcons from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  Flame, Waves, Mountain, Zap, Users, Shield, Crosshair, Activity,
};

const difficultyLabels = ["", "Beginner", "Easy", "Moderate", "Hard", "Expert"];

const renderAssetIcon = (iconName: string) => {
  const Icon = (LucideIcons as any)[iconName] || LucideIcons.Box;
  return <Icon className="h-3 w-3" />;
};

export interface PlacedEntity {
  id: string;
  name: string;
  type: AssetType;
  lat: number;
  lng: number;
  status: "active" | "idle";
  batteryLevel: number;
}

const ASSET_PALETTE: { type: AssetType; label: string }[] = [
  { type: "uav", label: "Recon UAV" },
  { type: "drone", label: "Cargo Drone" },
  { type: "robot", label: "Rescue Bot" },
  { type: "ugv", label: "Patrol UGV" },
  { type: "vehicle", label: "Command Vehicle" },
  { type: "sensor", label: "Sensor Array" },
  { type: "camera", label: "Surveillance Cam" },
];

let entityCounter = 0;

export default function Simulations() {
  const [selectedLibraryId, setSelectedLibraryId] = useState<string | null>(null);
  const [activeScenarios, setActiveScenarios] = useState<string[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("library");
  const [isRunning, setIsRunning] = useState<Record<string, boolean>>({});
  const [simSpeed, setSimSpeed] = useState([1]);
  const [simTime, setSimTime] = useState<Record<string, number>>({});
  const [placedEntities, setPlacedEntities] = useState<PlacedEntity[]>([]);
  const [draggedAssetType, setDraggedAssetType] = useState<AssetType | null>(null);
  const simTimeRef = useRef(simTime);
  simTimeRef.current = simTime;

  const selectedLibraryScenario = mockScenarios.find(s => s.id === selectedLibraryId);
  const activeWorkspaceScenario = mockScenarios.find(s => s.id === activeWorkspaceId);

  // Simulation engine
  const currentIsRunning = activeWorkspaceId ? (isRunning[activeWorkspaceId] || false) : false;
  const currentSimTime = activeWorkspaceId ? (simTime[activeWorkspaceId] || 0) : 0;

  const engine = useSimulationEngine(
    placedEntities,
    currentIsRunning,
    simSpeed[0],
    currentSimTime,
  );

  // Timer for sim time
  const timerRef = useRef<NodeJS.Timeout>();
  const startTimer = useCallback((id: string) => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setSimTime(prev => {
        const next = { ...prev };
        if (isRunning[id]) {
          next[id] = (next[id] || 0) + simSpeed[0];
        }
        return next;
      });
    }, 1000);
  }, [isRunning, simSpeed]);

  // Keep timer running
  const activeRunningId = activeScenarios.find(id => isRunning[id]);
  if (activeRunningId && !timerRef.current) {
    startTimer(activeRunningId);
  }

  const handleLaunch = () => {
    if (!selectedLibraryId) return;
    if (!activeScenarios.includes(selectedLibraryId)) {
      setActiveScenarios(prev => [...prev, selectedLibraryId]);
      setIsRunning(prev => ({ ...prev, [selectedLibraryId]: true }));
      setSimTime(prev => ({ ...prev, [selectedLibraryId]: 0 }));
    }
    setActiveWorkspaceId(selectedLibraryId);
    setActiveTab("workspace");
    startTimer(selectedLibraryId);
  };

  const handleClose = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const newScenarios = activeScenarios.filter(sId => sId !== id);
    setActiveScenarios(newScenarios);
    if (activeWorkspaceId === id) {
      setActiveWorkspaceId(newScenarios.length > 0 ? newScenarios[0] : null);
    }
  };

  const toggleRun = (id: string) => {
    setIsRunning(prev => {
      const next = { ...prev, [id]: !prev[id] };
      if (next[id]) startTimer(id);
      return next;
    });
  };

  const resetSim = (id: string) => {
    setIsRunning(prev => ({ ...prev, [id]: false }));
    setSimTime(prev => ({ ...prev, [id]: 0 }));
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = undefined; }
  };

  const handleDropOnMap = useCallback((lat: number, lng: number, type: AssetType) => {
    entityCounter++;
    const paletteItem = ASSET_PALETTE.find(p => p.type === type);
    const newEntity: PlacedEntity = {
      id: `placed-${entityCounter}`,
      name: `${paletteItem?.label || type.toUpperCase()}-${String(entityCounter).padStart(2, "0")}`,
      type,
      lat,
      lng,
      status: "active",
      batteryLevel: 100,
    };
    setPlacedEntities(prev => [...prev, newEntity]);
  }, []);

  const handleEntityMove = useCallback((id: string, lat: number, lng: number) => {
    setPlacedEntities(prev =>
      prev.map(e => e.id === id ? { ...e, lat, lng } : e)
    );
  }, []);

  const handleRemoveEntity = useCallback((id: string) => {
    setPlacedEntities(prev => prev.filter(e => e.id !== id));
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground tracking-tight">Multi-Scenario Simulation</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Production-grade simulation with Monte Carlo, Bayesian analysis, and real-time impact assessment</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-secondary/50">
          <TabsTrigger value="library">Scenario Library</TabsTrigger>
          <TabsTrigger value="workspace">
            Simulation Workspace
            {activeScenarios.length > 0 && (
              <Badge variant="secondary" className="ml-2 h-4 px-1 text-[10px] bg-primary/20 text-primary">
                {activeScenarios.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ─── Scenario Library ─── */}
        <TabsContent value="library">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {mockScenarios.map((scenario, i) => {
              const Icon = iconMap[scenario.icon] || Activity;
              return (
                <motion.div key={scenario.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card
                    className={`glass-card cursor-pointer transition-all hover:border-primary/30 ${selectedLibraryId === scenario.id ? "border-primary glow-primary" : ""}`}
                    onClick={() => setSelectedLibraryId(scenario.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="rounded-lg bg-primary/10 p-2">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, si) => (
                            <Star key={si} className={`h-3 w-3 ${si < scenario.difficulty ? "text-severity-medium fill-severity-medium" : "text-border"}`} />
                          ))}
                        </div>
                      </div>
                      <CardTitle className="text-sm mt-3">{scenario.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-[11px] text-muted-foreground line-clamp-2">{scenario.description}</p>
                      <div className="flex items-center gap-2 mt-3">
                        <Badge variant="outline" className="text-[9px] h-4">{scenario.type}</Badge>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Clock className="h-3 w-3" />{scenario.duration}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {scenario.tags.map(tag => (
                          <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-secondary text-muted-foreground">{tag}</span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {selectedLibraryScenario && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 glass-card rounded-xl p-6 border-border/50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{selectedLibraryScenario.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1 max-w-2xl">{selectedLibraryScenario.description}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Difficulty: {difficultyLabels[selectedLibraryScenario.difficulty]} • Duration: {selectedLibraryScenario.duration}
                  </p>
                </div>
                <Button className="gap-2" onClick={handleLaunch}>
                  <Play className="h-4 w-4" /> Add to Workspace
                </Button>
              </div>
            </motion.div>
          )}
        </TabsContent>

        {/* ─── Workspace ─── */}
        <TabsContent value="workspace">
          {activeScenarios.length === 0 ? (
            <div className="glass-card rounded-xl p-12 text-center">
              <TerminalSquare className="h-12 w-12 text-muted-foreground/30 mx-auto" />
              <p className="text-sm text-muted-foreground/50 mt-3">No active scenarios. Select one from the library to begin.</p>
            </div>
          ) : (
            <div className="flex flex-col space-y-4">
              {/* Scenario tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {activeScenarios.map(id => {
                  const s = mockScenarios.find(x => x.id === id);
                  if (!s) return null;
                  const isActive = activeWorkspaceId === id;
                  return (
                    <div key={id}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs cursor-pointer transition-colors whitespace-nowrap ${isActive ? "bg-primary/10 border-primary/30 text-primary glow-primary" : "bg-secondary/30 border-border/50 text-muted-foreground hover:bg-secondary/50"}`}
                      onClick={() => setActiveWorkspaceId(id)}
                    >
                      <div className={`h-2 w-2 rounded-full ${isRunning[id] ? "bg-severity-low animate-pulse" : "bg-muted"}`} />
                      {s.name}
                      <button onClick={(e) => handleClose(e, id)} className="ml-1 p-0.5 hover:bg-background/20 rounded-full">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  );
                })}
              </div>

              {activeWorkspaceScenario && activeWorkspaceId && (
                <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
                  {/* Left: Map & Controls */}
                  <div className="xl:col-span-2 space-y-4">
                    {/* Asset Palette */}
                    <div className="glass-card rounded-xl p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Drag Assets to Map</h4>
                        <Badge variant="outline" className="text-[9px] h-4">{placedEntities.length} placed</Badge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {ASSET_PALETTE.map(item => (
                          <div key={item.type} draggable
                            onDragStart={(e) => { setDraggedAssetType(item.type); e.dataTransfer.setData("assetType", item.type); e.dataTransfer.effectAllowed = "copy"; }}
                            onDragEnd={() => setDraggedAssetType(null)}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border/50 bg-secondary/30 cursor-grab active:cursor-grabbing hover:border-primary/40 hover:bg-primary/5 transition-all select-none"
                          >
                            <GripVertical className="h-3 w-3 text-muted-foreground/50" />
                            <span className="text-primary">{renderAssetIcon(getAssetIcon(item.type))}</span>
                            <span className="text-[10px] font-medium text-foreground">{item.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Map */}
                    <div className="glass-card rounded-xl overflow-hidden relative">
                      <div className="absolute top-3 left-3 z-[1000]">
                        <Badge variant="outline" className="bg-background/50 backdrop-blur-md border-border text-[10px]">
                          {activeWorkspaceScenario.name}
                        </Badge>
                      </div>
                      <div className="absolute top-3 right-3 z-[1000] flex items-center gap-2 bg-background/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-border/50 shadow-sm">
                        <div className={`h-2 w-2 rounded-full ${isRunning[activeWorkspaceId] ? "bg-severity-low animate-pulse" : "bg-muted"}`} />
                        <span className="text-[10px] font-medium text-foreground">
                          {isRunning[activeWorkspaceId] ? "Live Tracking" : "Paused"}
                        </span>
                      </div>
                      <SimulationMap
                        placedEntities={placedEntities}
                        onDropEntity={handleDropOnMap}
                        onMoveEntity={handleEntityMove}
                        draggedAssetType={draggedAssetType}
                        isRunning={currentIsRunning}
                        simTime={currentSimTime}
                        entityStates={engine.entityStates}
                        routes={engine.routes}
                        hazardZones={engine.hazardZones}
                      />
                    </div>

                    {/* Controls */}
                    <div className="glass-card rounded-xl p-4 flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => resetSim(activeWorkspaceId)}>
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleRun(activeWorkspaceId)}>
                          {isRunning[activeWorkspaceId] ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSimTime(prev => ({ ...prev, [activeWorkspaceId!]: (prev[activeWorkspaceId!] || 0) + 30 }))}>
                          <SkipForward className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex-1 flex items-center gap-3">
                        <span className="text-[10px] text-muted-foreground w-12">Speed</span>
                        <Slider value={simSpeed} onValueChange={setSimSpeed} min={0.5} max={4} step={0.5} className="flex-1" />
                        <span className="text-[10px] text-foreground font-mono w-8">{simSpeed[0]}x</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Wind className="h-3 w-3" />
                          <span>{engine.windDirection}° / {engine.windSpeed} km/h</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-mono text-foreground">
                            {Math.floor(currentSimTime / 60)}:{String(Math.floor(currentSimTime) % 60).padStart(2, "0")}
                          </span>
                          <p className="text-[9px] text-muted-foreground">SIM TIME</p>
                        </div>
                      </div>
                    </div>

                    {/* Deployed Assets */}
                    <div className="glass-card rounded-xl p-4">
                      <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3 flex items-center justify-between">
                        <span>Deployed Assets</span>
                        <Badge variant="secondary" className="text-[9px] px-1 h-4">{placedEntities.length}</Badge>
                      </h4>
                      {placedEntities.length === 0 ? (
                        <p className="text-[11px] text-muted-foreground/50 text-center py-4">
                          Drag assets from the palette above and drop them on the map
                        </p>
                      ) : (
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {placedEntities.map(entity => {
                            const es = engine.entityStates.get(entity.id);
                            return (
                              <div key={entity.id} className="flex items-center justify-between p-2 rounded-lg bg-secondary/30 border border-border/50">
                                <div className="flex items-center gap-2">
                                  <div className="p-1.5 rounded bg-background/50 text-primary">
                                    {renderAssetIcon(getAssetIcon(entity.type))}
                                  </div>
                                  <div>
                                    <p className="text-[11px] font-medium text-foreground">{entity.name}</p>
                                    <p className="text-[9px] text-muted-foreground font-mono">
                                      {(es?.lat ?? entity.lat).toFixed(4)}°N, {Math.abs(es?.lng ?? entity.lng).toFixed(4)}°W
                                      {es && <span className="ml-2 capitalize text-primary">{es.status}</span>}
                                    </p>
                                  </div>
                                </div>
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-severity-critical" onClick={() => handleRemoveEntity(entity.id)}>
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Analysis panels */}
                  <div className="xl:col-span-2 space-y-4">
                    {/* Impact Analysis */}
                    <ImpactAnalysisPanel impact={engine.impact} isRunning={currentIsRunning} />

                    {/* Event Injection */}
                    <EventInjectionPanel onInject={engine.injectEvent} events={engine.events} isRunning={currentIsRunning} />

                    {/* Monte Carlo COA Analysis */}
                    <div className="glass-card rounded-xl p-4 border-border/50">
                      <MonteCarloDashboard scenarioId={activeWorkspaceId} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

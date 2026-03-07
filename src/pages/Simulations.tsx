import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { mockScenarios, mockAssets, getAssetIcon, getStatusColor } from "@/data/mockData";
import { Flame, Waves, Mountain, Zap, Users, Shield, Crosshair, Activity, Play, Pause, RotateCcw, SkipForward, ChevronRight, Clock, Star, X, TerminalSquare, Network } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { MonteCarloDashboard } from "@/components/MonteCarloDashboard";

const iconMap: Record<string, React.ElementType> = {
  Flame, Waves, Mountain, Zap, Users, Shield, Crosshair, Activity,
};

const difficultyLabels = ["", "Beginner", "Easy", "Moderate", "Hard", "Expert"];

// Pre-map icons for assets
import * as LucideIcons from "lucide-react";
const renderAssetIcon = (iconName: string) => {
  const Icon = (LucideIcons as any)[iconName] || LucideIcons.Box;
  return <Icon className="h-3 w-3" />;
};

export default function Simulations() {
  const [selectedLibraryId, setSelectedLibraryId] = useState<string | null>(null);
  const [activeScenarios, setActiveScenarios] = useState<string[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("library");
  const [isRunning, setIsRunning] = useState<Record<string, boolean>>({});
  const [simSpeed, setSimSpeed] = useState([1]);
  const [simTime, setSimTime] = useState<Record<string, number>>({});

  const selectedLibraryScenario = mockScenarios.find(s => s.id === selectedLibraryId);
  const activeWorkspaceScenario = mockScenarios.find(s => s.id === activeWorkspaceId);

  // Auto-increment sim time
  useEffect(() => {
    const interval = setInterval(() => {
      setSimTime(prev => {
        const next = { ...prev };
        activeScenarios.forEach(id => {
          if (isRunning[id]) {
            next[id] = (next[id] || 0) + (1 * simSpeed[0]);
          }
        });
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [activeScenarios, isRunning, simSpeed]);

  const handleLaunch = () => {
    if (!selectedLibraryId) return;
    if (!activeScenarios.includes(selectedLibraryId)) {
      setActiveScenarios(prev => [...prev, selectedLibraryId]);
      setIsRunning(prev => ({ ...prev, [selectedLibraryId]: true }));
      setSimTime(prev => ({ ...prev, [selectedLibraryId]: 0 }));
    }
    setActiveWorkspaceId(selectedLibraryId);
    setActiveTab("workspace");
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
    setIsRunning(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const resetSim = (id: string) => {
    setIsRunning(prev => ({ ...prev, [id]: false }));
    setSimTime(prev => ({ ...prev, [id]: 0 }));
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground tracking-tight">Multi-Scenario Simulation</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Military-grade strategic decision and scenario modeling</p>
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

        <TabsContent value="library">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {mockScenarios.map((scenario, i) => {
              const Icon = iconMap[scenario.icon] || Activity;
              return (
                <motion.div
                  key={scenario.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
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
                          <Clock className="h-3 w-3" />
                          {scenario.duration}
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
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 glass-card rounded-xl p-6 border-border/50"
            >
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

        <TabsContent value="workspace">
          {activeScenarios.length === 0 ? (
            <div className="glass-card rounded-xl p-12 text-center">
              <TerminalSquare className="h-12 w-12 text-muted-foreground/30 mx-auto" />
              <p className="text-sm text-muted-foreground/50 mt-3">No active scenarios. Select one from the library to begin.</p>
            </div>
          ) : (
            <div className="flex flex-col space-y-4">
              {/* Scenario selector tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {activeScenarios.map(id => {
                  const s = mockScenarios.find(x => x.id === id);
                  if (!s) return null;
                  const isActive = activeWorkspaceId === id;
                  return (
                    <div
                      key={id}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs cursor-pointer transition-colors whitespace-nowrap ${isActive ? 'bg-primary/10 border-primary/30 text-primary glow-primary' : 'bg-secondary/30 border-border/50 text-muted-foreground hover:bg-secondary/50'}`}
                      onClick={() => setActiveWorkspaceId(id)}
                    >
                      <div className={`h-2 w-2 rounded-full ${isRunning[id] ? 'bg-severity-low animate-pulse' : 'bg-muted'}`} />
                      {s.name}
                      <button onClick={(e) => handleClose(e, id)} className="ml-1 p-0.5 hover:bg-black/20 rounded-full">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  );
                })}
              </div>

              {activeWorkspaceScenario && (
                <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                  {/* Left Column: Map & Controls */}
                  <div className="xl:col-span-2 space-y-4">
                    <div className="glass-card rounded-xl overflow-hidden relative">
                      <div className="absolute top-3 left-3 z-10">
                        <Badge variant="outline" className="bg-background/50 backdrop-blur-md border-border text-[10px]">
                          {activeWorkspaceScenario.name}
                        </Badge>
                      </div>
                      <div className="relative aspect-[16/9] tactical-grid bg-secondary/30 overflow-hidden rounded-b-xl border-t border-border/50">
                        {mockAssets.slice(0, 5).map((asset, i) => {
                          const time = simTime[activeWorkspaceId] || 0;
                          const isRun = isRunning[activeWorkspaceId];

                          // Parametric offsets for simulated movement based on simTime
                          const moveRadius = 10;
                          const offsetX = isRun ? Math.sin(time * 0.05 + i) * moveRadius : Math.sin(i) * moveRadius;
                          const offsetY = isRun ? Math.cos(time * 0.05 + i) * moveRadius : Math.cos(i) * moveRadius;

                          return (
                            <motion.div
                              key={asset.id}
                              className="absolute z-20 flex flex-col items-center justify-center"
                              animate={{
                                left: `${Math.max(5, Math.min(95, asset.location.x + offsetX))}%`,
                                top: `${Math.max(5, Math.min(95, asset.location.y + offsetY))}%`
                              }}
                              transition={{ duration: 1.1, ease: "linear" }}
                              style={{ transform: "translate(-50%, -50%)" }}
                            >
                              <div className={`p-2 rounded-full border-2 bg-background/90 backdrop-blur shadow-lg relative ${getStatusColor(asset.status).replace('text-', 'border-')}`}>
                                {isRun && (
                                  <motion.div
                                    className="absolute inset-0 rounded-full border border-primary/50"
                                    animate={{ scale: [1, 2.5], opacity: [0.8, 0] }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: i * 0.2 }}
                                  />
                                )}
                                <div className={getStatusColor(asset.status)}>
                                  {renderAssetIcon(getAssetIcon(asset.type))}
                                </div>
                              </div>
                              <div className="mt-1.5 px-1.5 py-0.5 rounded bg-background/80 border border-border/50 text-[9px] font-mono whitespace-nowrap shadow-sm">
                                {asset.name}
                              </div>
                            </motion.div>
                          );
                        })}

                        {/* Event markers to show "action" */}
                        {isRunning[activeWorkspaceId] && (
                          <motion.div
                            className="absolute z-10 rounded-full bg-severity-critical/10 border border-severity-critical/30"
                            animate={{
                              left: ["30%", "40%", "30%"],
                              top: ["40%", "30%", "40%"],
                              width: ["100px", "120px", "100px"],
                              height: ["100px", "120px", "100px"],
                            }}
                            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                            style={{ transform: "translate(-50%, -50%)" }}
                          >
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Flame className="h-6 w-6 text-severity-critical/50" />
                            </div>
                          </motion.div>
                        )}

                        <div className="absolute top-4 right-4 z-30 flex items-center gap-2 bg-background/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-border/50 shadow-sm">
                          <div className={`h-2 w-2 rounded-full ${isRunning[activeWorkspaceId] ? 'bg-severity-low animate-pulse' : 'bg-muted'}`} />
                          <span className="text-[10px] font-medium text-foreground">
                            {isRunning[activeWorkspaceId] ? 'Live Tracking' : 'Paused'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Simulation Controls */}
                    <div className="glass-card rounded-xl p-4 flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => resetSim(activeWorkspaceId)}>
                          <RotateCcw className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleRun(activeWorkspaceId)}>
                          {isRunning[activeWorkspaceId] ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSimTime(prev => ({ ...prev, [activeWorkspaceId]: (prev[activeWorkspaceId] || 0) + 30 }))}>
                          <SkipForward className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex-1 flex items-center gap-3">
                        <span className="text-[10px] text-muted-foreground w-12">Speed</span>
                        <Slider value={simSpeed} onValueChange={setSimSpeed} min={0.5} max={4} step={0.5} className="flex-1" />
                        <span className="text-[10px] text-foreground font-mono w-8">{simSpeed[0]}x</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-mono text-foreground">
                          {Math.floor((simTime[activeWorkspaceId] || 0) / 60)}:{String(Math.floor(simTime[activeWorkspaceId] || 0) % 60).padStart(2, "0")}
                        </span>
                        <p className="text-[9px] text-muted-foreground">SIM TIME</p>
                      </div>
                    </div>

                    {/* Assets Panel */}
                    <div className="glass-card rounded-xl p-4">
                      <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3 flex items-center justify-between">
                        <span>Deployed Assets</span>
                        <Badge variant="secondary" className="text-[9px] px-1 h-4">{mockAssets.slice(0, 4).length}</Badge>
                      </h4>
                      <div className="space-y-2">
                        {mockAssets.slice(0, 4).map(asset => (
                          <div key={asset.id} className="flex items-center justify-between p-2 rounded-lg bg-secondary/30 border border-border/50">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 rounded bg-background/50 text-primary">
                                {renderAssetIcon(getAssetIcon(asset.type))}
                              </div>
                              <div>
                                <p className="text-[11px] font-medium text-foreground">{asset.name}</p>
                                <p className="text-[9px] text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                  <span className={`h-1.5 w-1.5 rounded-full ${getStatusColor(asset.status).replace('text-', 'bg-')}`} />
                                  {asset.status}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-[10px] text-foreground font-mono">{asset.batteryLevel}%</div>
                              <Progress value={asset.batteryLevel} className="h-1 w-12" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Monte Carlo & Parameters */}
                  <div className="xl:col-span-2 space-y-4">
                    <div className="glass-card rounded-xl p-4 h-full border-border/50">
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

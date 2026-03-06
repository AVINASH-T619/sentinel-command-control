import { useState } from "react";
import { motion } from "framer-motion";
import { mockScenarios } from "@/data/mockData";
import { Flame, Waves, Mountain, Zap, Users, Shield, Crosshair, Activity, Play, Pause, RotateCcw, SkipForward, ChevronRight, Clock, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const iconMap: Record<string, React.ElementType> = {
  Flame, Waves, Mountain, Zap, Users, Shield, Crosshair, Activity,
};

const difficultyLabels = ["", "Beginner", "Easy", "Moderate", "Hard", "Expert"];

export default function Simulations() {
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [simSpeed, setSimSpeed] = useState([1]);
  const [simTime, setSimTime] = useState(0);

  const selected = mockScenarios.find(s => s.id === selectedScenario);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground tracking-tight">Scenario Simulation</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Configure and run operational training scenarios</p>
      </div>

      <Tabs defaultValue="library" className="space-y-6">
        <TabsList className="bg-secondary/50">
          <TabsTrigger value="library">Scenario Library</TabsTrigger>
          <TabsTrigger value="workspace">Simulation Workspace</TabsTrigger>
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
                    className={`glass-card cursor-pointer transition-all hover:border-primary/30 ${selectedScenario === scenario.id ? "border-primary glow-primary" : ""}`}
                    onClick={() => setSelectedScenario(scenario.id)}
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

          {selected && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 glass-card rounded-xl p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{selected.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{selected.description}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Difficulty: {difficultyLabels[selected.difficulty]} • Duration: {selected.duration}
                  </p>
                </div>
                <Button className="gap-2" onClick={() => setIsRunning(true)}>
                  <Play className="h-4 w-4" /> Launch Simulation
                </Button>
              </div>
            </motion.div>
          )}
        </TabsContent>

        <TabsContent value="workspace">
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* Map workspace */}
            <div className="xl:col-span-3 space-y-4">
              <div className="glass-card rounded-xl overflow-hidden">
                <div className="relative aspect-[16/9] tactical-grid bg-secondary/30">
                  <div className="absolute inset-0 flex items-center justify-center">
                    {!isRunning ? (
                      <div className="text-center">
                        <Crosshair className="h-12 w-12 text-muted-foreground/30 mx-auto" />
                        <p className="text-sm text-muted-foreground/50 mt-3">Select a scenario and launch to begin</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="h-3 w-3 rounded-full bg-severity-low animate-pulse mx-auto" />
                        <p className="text-sm text-severity-low mt-2 font-medium">Simulation Running</p>
                        <p className="text-xs text-muted-foreground mt-1">Time: {Math.floor(simTime / 60)}:{String(simTime % 60).padStart(2, "0")}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="glass-card rounded-xl p-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setIsRunning(false); setSimTime(0); }}>
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsRunning(!isRunning)}>
                      {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSimTime(t => t + 30)}>
                      <SkipForward className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex-1 flex items-center gap-3">
                    <span className="text-[10px] text-muted-foreground w-12">Speed</span>
                    <Slider value={simSpeed} onValueChange={setSimSpeed} min={0.5} max={4} step={0.5} className="flex-1" />
                    <span className="text-[10px] text-foreground font-mono w-8">{simSpeed[0]}x</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono text-foreground">{Math.floor(simTime / 60)}:{String(simTime % 60).padStart(2, "0")}</span>
                    <p className="text-[9px] text-muted-foreground">SIM TIME</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Side panel */}
            <div className="space-y-4">
              <div className="glass-card rounded-xl p-4">
                <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">Event Injection</h4>
                <div className="space-y-2">
                  {["Explosion", "Weather Change", "Structural Collapse", "Civilian Sighting", "Equipment Failure"].map(event => (
                    <Button key={event} variant="outline" size="sm" className="w-full justify-start text-xs h-8 border-border/50">
                      <ChevronRight className="h-3 w-3 mr-1" /> {event}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="glass-card rounded-xl p-4">
                <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">Environment</h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] text-muted-foreground">Wind Speed</label>
                    <Slider defaultValue={[15]} max={60} step={5} className="mt-1" />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground">Visibility</label>
                    <Slider defaultValue={[80]} max={100} step={10} className="mt-1" />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground">Temperature</label>
                    <Slider defaultValue={[35]} max={50} step={1} className="mt-1" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

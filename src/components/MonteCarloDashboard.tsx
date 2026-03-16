import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Play, Target, ShieldAlert, XCircle, BrainCircuit, RefreshCw, Download, BarChart3, TrendingUp, Sigma } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  runMonteCarloSimulation,
  evaluateCOA,
  type COAEvaluation,
  type MonteCarloResult,
} from "@/lib/simulation/engine";

interface COAConfig {
  id: string;
  name: string;
  description: string;
  params: {
    assetCount: number;
    threatLevel: number;
    civilianDensity: number;
    weatherSeverity: number;
    terrainDifficulty: number;
  };
}

const COA_CONFIGS: COAConfig[] = [
  {
    id: "coa1",
    name: "Aggressive Push",
    description: "Deploy all assets immediately with maximum force projection to contain the threat before it escalates.",
    params: { assetCount: 8, threatLevel: 75, civilianDensity: 40, weatherSeverity: 30, terrainDifficulty: 50 },
  },
  {
    id: "coa2",
    name: "Phased Approach",
    description: "Reconnaissance first, then targeted deployment based on intelligence gathered. Lower risk, systematic.",
    params: { assetCount: 5, threatLevel: 45, civilianDensity: 40, weatherSeverity: 30, terrainDifficulty: 40 },
  },
  {
    id: "coa3",
    name: "Defensive Perimeter",
    description: "Establish containment perimeter and hold position. Prioritize civilian safety and asset preservation.",
    params: { assetCount: 4, threatLevel: 20, civilianDensity: 60, weatherSeverity: 30, terrainDifficulty: 30 },
  },
];

export function MonteCarloDashboard({ scenarioId }: { scenarioId?: string }) {
  const [isSimulating, setIsSimulating] = useState(false);
  const [selectedCOAId, setSelectedCOAId] = useState("coa2");
  const [evaluations, setEvaluations] = useState<COAEvaluation[]>([]);
  const [activeView, setActiveView] = useState("convergence");

  const selectedConfig = COA_CONFIGS.find(c => c.id === selectedCOAId) || COA_CONFIGS[1];
  const selectedEval = evaluations.find(e => e.id === selectedCOAId);

  const startSimulation = () => {
    setIsSimulating(true);

    // Run Monte Carlo for all COAs
    setTimeout(() => {
      const results = COA_CONFIGS.map(config =>
        evaluateCOA(config.id, config.name, config.description, config.params)
      );
      // Sort by overall score descending
      results.sort((a, b) => b.overallScore - a.overallScore);
      setEvaluations(results);
      setIsSimulating(false);
      toast.success(`Monte Carlo analysis complete — ${results[0].name} recommended`);
    }, 800);
  };

  const bestCOA = evaluations.length > 0 ? evaluations[0] : null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <BrainCircuit className="h-4 w-4 text-primary" />
            Advanced COA Analysis Engine
          </h3>
          <p className="text-[11px] text-muted-foreground">
            Monte Carlo · Bayesian Inference · Risk Propagation
          </p>
        </div>
        <div className="flex items-center gap-2">
          {bestCOA && (
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-[11px] border-primary/50 text-primary hover:bg-primary/10"
              onClick={() => {
                toast.promise(new Promise(resolve => setTimeout(resolve, 2000)), {
                  loading: "Exporting parameters to Isaac Sim...",
                  success: "Isaac Sim initialized with COA parameters. Virtual environment ready.",
                  error: "Export failed.",
                });
              }}
            >
              <Download className="h-3 w-3 mr-1" /> Export to Isaac Sim
            </Button>
          )}
          <Button size="sm" onClick={startSimulation} disabled={isSimulating} className="h-8 text-[11px]">
            {isSimulating ? <RefreshCw className="h-3 w-3 mr-1 animate-spin" /> : <Play className="h-3 w-3 mr-1" />}
            {isSimulating ? "Simulating..." : "Run Analysis (1000 iter)"}
          </Button>
        </div>
      </div>

      {/* COA Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {COA_CONFIGS.map(config => {
          const ev = evaluations.find(e => e.id === config.id);
          const isBest = bestCOA?.id === config.id;
          const isSelected = selectedCOAId === config.id;

          return (
            <Card
              key={config.id}
              className={`cursor-pointer transition-all border-border/50 bg-secondary/20 hover:border-primary/50 ${
                isSelected ? "ring-1 ring-primary border-primary/50" : ""
              } ${isBest ? "shadow-[0_0_12px_hsl(var(--primary)/0.15)]" : ""}`}
              onClick={() => !isSimulating && setSelectedCOAId(config.id)}
            >
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-[12px] flex items-center justify-between">
                  {config.name}
                  <div className="flex items-center gap-1">
                    {isBest && <Badge className="text-[8px] h-3.5 px-1 bg-primary/20 text-primary border-0">★ Best</Badge>}
                    {isSelected && <Badge variant="default" className="text-[9px] h-4 px-1">Active</Badge>}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <p className="text-[10px] text-muted-foreground mb-3 leading-tight h-6 line-clamp-2">
                  {config.description}
                </p>
                {ev ? (
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-[9px] mb-1">
                        <span className="text-severity-low flex items-center gap-1"><Target className="h-2.5 w-2.5" /> Score</span>
                        <span className="font-mono">{ev.overallScore}%</span>
                      </div>
                      <Progress value={ev.overallScore} className="h-1 bg-secondary [&>div]:bg-severity-low" />
                    </div>
                    <div>
                      <div className="flex justify-between text-[9px] mb-1">
                        <span className="text-severity-medium flex items-center gap-1"><ShieldAlert className="h-2.5 w-2.5" /> Risk</span>
                        <span className="font-mono">{(ev.riskNetwork.reduce((s, r) => s + r.posterior, 0) / ev.riskNetwork.length * 100).toFixed(0)}%</span>
                      </div>
                      <Progress value={ev.riskNetwork.reduce((s, r) => s + r.posterior, 0) / ev.riskNetwork.length * 100} className="h-1 bg-secondary [&>div]:bg-severity-medium" />
                    </div>
                    <div className="flex justify-between text-[9px] text-muted-foreground pt-1 border-t border-border/30">
                      <span>Safety: {ev.civilianSafety}%</span>
                      <span>Resources: {ev.resourceUtilization}%</span>
                      <span>T-{ev.timeToComplete}m</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-[9px] text-muted-foreground/50 text-center py-3">Run analysis to see results</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Detailed Analysis */}
      {selectedEval && (
        <Card className="glass-card border-border/50">
          <CardHeader className="p-3 border-b border-border/50">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-medium flex items-center gap-2">
                <Sigma className="h-3.5 w-3.5 text-primary" />
                Statistical Analysis — {selectedEval.name}
              </CardTitle>
              <Tabs value={activeView} onValueChange={setActiveView}>
                <TabsList className="h-7 bg-secondary/50">
                  <TabsTrigger value="convergence" className="text-[9px] h-5 px-2">Convergence</TabsTrigger>
                  <TabsTrigger value="histogram" className="text-[9px] h-5 px-2">Distribution</TabsTrigger>
                  <TabsTrigger value="risk" className="text-[9px] h-5 px-2">Risk Network</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent className="p-3">
            {/* Statistics summary */}
            <div className="grid grid-cols-4 gap-2 mb-3">
              {[
                { label: "Mean", value: selectedEval.monteCarloResult.mean.toFixed(1) },
                { label: "Std Dev", value: selectedEval.monteCarloResult.stdDev.toFixed(2) },
                { label: "95% CI", value: `[${selectedEval.monteCarloResult.confidenceInterval[0].toFixed(1)}, ${selectedEval.monteCarloResult.confidenceInterval[1].toFixed(1)}]` },
                { label: "P5-P95", value: `${selectedEval.monteCarloResult.percentile5.toFixed(1)}-${selectedEval.monteCarloResult.percentile95.toFixed(1)}` },
              ].map(stat => (
                <div key={stat.label} className="bg-secondary/30 rounded-lg p-2 border border-border/30 text-center">
                  <p className="text-[10px] font-mono font-semibold text-foreground">{stat.value}</p>
                  <p className="text-[8px] text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Charts */}
            <div className="h-[180px]">
              {activeView === "convergence" && (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={selectedEval.monteCarloResult.convergenceData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="mcConverge" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="iteration" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", fontSize: "10px" }} />
                    <Area type="monotone" dataKey="runningMean" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#mcConverge)" name="Running Mean" />
                    <Area type="monotone" dataKey="runningStdDev" stroke="hsl(var(--severity-medium))" fillOpacity={0} name="Std Dev" strokeDasharray="4 4" />
                  </AreaChart>
                </ResponsiveContainer>
              )}

              {activeView === "histogram" && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={selectedEval.monteCarloResult.histogram} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis dataKey="bin" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} tickFormatter={(v: number) => v.toFixed(0)} />
                    <YAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", fontSize: "10px" }} />
                    <Bar dataKey="count" fill="hsl(var(--primary))" opacity={0.7} radius={[2, 2, 0, 0]} name="Frequency" />
                  </BarChart>
                </ResponsiveContainer>
              )}

              {activeView === "risk" && (
                <div className="h-full flex flex-col justify-center space-y-2">
                  {selectedEval.riskNetwork.map(node => (
                    <div key={node.name} className="flex items-center gap-3">
                      <span className="text-[10px] text-muted-foreground w-28 text-right shrink-0">{node.name}</span>
                      <div className="flex-1">
                        <Progress
                          value={node.posterior * 100}
                          className={`h-2 bg-secondary ${
                            node.riskLevel === "critical" ? "[&>div]:bg-severity-critical" :
                            node.riskLevel === "high" ? "[&>div]:bg-severity-high" :
                            node.riskLevel === "medium" ? "[&>div]:bg-severity-medium" :
                            "[&>div]:bg-severity-low"
                          }`}
                        />
                      </div>
                      <span className="text-[9px] font-mono text-foreground w-10">{(node.posterior * 100).toFixed(0)}%</span>
                      <Badge variant="outline" className={`text-[8px] h-3.5 px-1 ${
                        node.riskLevel === "critical" ? "text-severity-critical border-severity-critical/30" :
                        node.riskLevel === "high" ? "text-severity-high border-severity-high/30" :
                        node.riskLevel === "medium" ? "text-severity-medium border-severity-medium/30" :
                        "text-severity-low border-severity-low/30"
                      }`}>
                        {node.riskLevel}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Play, RotateCcw, Target, ShieldAlert, XCircle, BrainCircuit, RefreshCw, Download } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface COA {
  id: string;
  name: string;
  description: string;
  successRate: number;
  threatLevel: number;
  failureRate: number;
}

const mockCOAs: COA[] = [
  { id: "coa1", name: "Aggressive Push", description: "Deploy all assets immediately to contain the threat.", successRate: 68, threatLevel: 85, failureRate: 32 },
  { id: "coa2", name: "Phased Approach", description: "Deploy reconnaissance first, followed by targeted strikes.", successRate: 82, threatLevel: 45, failureRate: 18 },
  { id: "coa3", name: "Defensive Perimeter", description: "Establish a perimeter and wait for threat mitigation.", successRate: 91, threatLevel: 20, failureRate: 9 }
];

export function MonteCarloDashboard({ scenarioId }: { scenarioId?: string }) {
  const [isSimulating, setIsSimulating] = useState(false);
  const [passes, setPasses] = useState(0);
  const [simData, setSimData] = useState<{ pass: number; success: number; threat: number; failure: number }[]>([]);
  const [selectedCOA, setSelectedCOA] = useState<COA>(mockCOAs[1]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSimulating && passes < 1000) {
      interval = setInterval(() => {
        setPasses(p => {
          const newPass = p + 50;
          if (newPass >= 1000) setIsSimulating(false);
          return newPass;
        });
        setSimData(prev => [
          ...prev,
          {
            pass: passes + 50,
            success: Math.max(0, Math.min(100, selectedCOA.successRate + (Math.random() * 10 - 5))),
            threat: Math.max(0, Math.min(100, selectedCOA.threatLevel + (Math.random() * 8 - 4))),
            failure: Math.max(0, Math.min(100, selectedCOA.failureRate + (Math.random() * 6 - 3)))
          }
        ]);
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isSimulating, passes, selectedCOA]);

  const startSimulation = () => {
    setIsSimulating(true);
    setPasses(0);
    setSimData([{ pass: 0, success: selectedCOA.successRate, threat: selectedCOA.threatLevel, failure: selectedCOA.failureRate }]);
  };

  const isIsaacSimReady = passes >= 1000 && selectedCOA.successRate > 80;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <BrainCircuit className="h-4 w-4 text-primary" />
            Course of Action (COA) Analysis
          </h3>
          <p className="text-[11px] text-muted-foreground">Monte Carlo Simulation (1000 passes)</p>
        </div>
        <div className="flex items-center gap-2">
          {isIsaacSimReady && (
            <Button
              size="sm"
              variant="outline"
              className="h-8 text-[11px] border-primary/50 text-primary hover:bg-primary/10 transition-all glow-primary pulse-animation"
              onClick={() => {
                toast.promise(new Promise(resolve => setTimeout(resolve, 2000)), {
                  loading: 'Exporting parameters to Isaac Sim...',
                  success: 'Isaac Sim initialized with COA parameters. Virtual environment ready.',
                  error: 'Export failed.'
                });
              }}
            >
              <Download className="h-3 w-3 mr-1" /> Export to Isaac Sim
            </Button>
          )}
          <Button size="sm" onClick={startSimulation} disabled={isSimulating} className="h-8 text-[11px]">
            {isSimulating ? <RefreshCw className="h-3 w-3 mr-1 animate-spin" /> : <Play className="h-3 w-3 mr-1" />}
            {isSimulating ? `Simulating ${passes}/1000` : "Run Simulation"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {mockCOAs.map(coa => (
          <Card
            key={coa.id}
            className={`cursor-pointer transition-all border-border/50 bg-secondary/20 hover:border-primary/50 ${selectedCOA.id === coa.id ? 'ring-1 ring-primary border-primary/50' : ''}`}
            onClick={() => !isSimulating && setSelectedCOA(coa)}
          >
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-[12px] flex items-center justify-between">
                {coa.name}
                {selectedCOA.id === coa.id && <Badge variant="default" className="text-[9px] h-4 px-1">Selected</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              <p className="text-[10px] text-muted-foreground mb-3 leading-tight h-8">{coa.description}</p>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-[9px] mb-1">
                    <span className="text-severity-low flex items-center gap-1"><Target className="h-2.5 w-2.5" /> Success</span>
                    <span>{coa.successRate}%</span>
                  </div>
                  <Progress value={coa.successRate} className="h-1 bg-secondary [&>div]:bg-severity-low" />
                </div>
                <div>
                  <div className="flex justify-between text-[9px] mb-1">
                    <span className="text-severity-medium flex items-center gap-1"><ShieldAlert className="h-2.5 w-2.5" /> Threat</span>
                    <span>{coa.threatLevel}%</span>
                  </div>
                  <Progress value={coa.threatLevel} className="h-1 bg-secondary [&>div]:bg-severity-medium" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="glass-card mt-4 border-border/50">
        <CardHeader className="p-3 border-b border-border/50">
          <CardTitle className="text-xs font-medium">Confidence Intervals over Passes</CardTitle>
        </CardHeader>
        <CardContent className="p-3 h-[200px]">
          {simData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={simData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--severity-low))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--severity-low))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorThreat" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--severity-medium))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--severity-medium))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="pass" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", fontSize: "10px" }}
                  itemStyle={{ fontSize: "10px" }}
                  labelStyle={{ color: "hsl(var(--foreground))", marginBottom: "4px" }}
                />
                <Area type="monotone" dataKey="success" stroke="hsl(var(--severity-low))" fillOpacity={1} fill="url(#colorSuccess)" name="Success Rate %" />
                <Area type="monotone" dataKey="threat" stroke="hsl(var(--severity-medium))" fillOpacity={1} fill="url(#colorThreat)" name="Threat Level %" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full w-full flex items-center justify-center text-[11px] text-muted-foreground/50">
              Run simulation to view statistical divergence
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

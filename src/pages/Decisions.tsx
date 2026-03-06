import { useState } from "react";
import { motion } from "framer-motion";
import { Brain, TrendingUp, Shield, Zap, BarChart3, CheckCircle2, Clock, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Strategy {
  id: string;
  name: string;
  description: string;
  successProbability: number;
  safetyScore: number;
  efficiencyScore: number;
  timeEstimate: string;
  actions: string[];
  risks: string[];
}

const mockStrategies: Strategy[] = [
  {
    id: "s1",
    name: "Aerial Containment Priority",
    description: "Deploy all available UAVs for fire perimeter mapping while ground assets establish firebreaks at predicted spread vectors",
    successProbability: 81,
    safetyScore: 85,
    efficiencyScore: 72,
    timeEstimate: "45 min",
    actions: ["Deploy UAV Alpha & Bravo for thermal mapping", "Establish firebreaks at NE vector", "Pre-position rescue teams at Zone C", "Activate water supply relay from Station R-3"],
    risks: ["High wind may reduce UAV effectiveness", "Limited ground asset availability"],
  },
  {
    id: "s2",
    name: "Civilian-First Evacuation",
    description: "Prioritize evacuation of civilians in Zone C before engaging fire suppression, using all ground vehicles and UGVs for transport",
    successProbability: 74,
    safetyScore: 95,
    efficiencyScore: 58,
    timeEstimate: "60 min",
    actions: ["Dispatch all UGVs to evacuation routes", "Deploy UAVs for civilian tracking", "Establish medical triage at rally point", "Request mutual aid from adjacent sectors"],
    risks: ["Fire may advance during evacuation window", "Route congestion likely"],
  },
  {
    id: "s3",
    name: "Dual-Vector Response",
    description: "Split forces: half for containment, half for evacuation. Coordinate via Command Vehicle CV-1 as mobile HQ",
    successProbability: 68,
    safetyScore: 78,
    efficiencyScore: 84,
    timeEstimate: "50 min",
    actions: ["Split assets into Alpha and Bravo teams", "Alpha: fire containment with UAV support", "Bravo: civilian evacuation with UGV escort", "CV-1 as mobile command post at grid center"],
    risks: ["Resource dilution across objectives", "Complex coordination requirements", "Communication relay dependency"],
  },
];

const decisionLog = [
  { id: "d1", decision: "Deploy Recon UAV Alpha to Sector 7", outcome: "Fire perimeter mapped successfully", score: 92, time: "14:32" },
  { id: "d2", decision: "Evacuate Zone C civilians via Route B", outcome: "12 civilians safely relocated", score: 88, time: "14:18" },
  { id: "d3", decision: "Dispatch Rescue Bot R-01 to Building A", outcome: "Building searched, no survivors", score: 75, time: "13:55" },
  { id: "d4", decision: "Activate Comm Relay R-3", outcome: "Communications restored", score: 95, time: "13:40" },
];

export default function Decisions() {
  const [analyzing, setAnalyzing] = useState(false);
  const [showStrategies, setShowStrategies] = useState(true);

  const handleAnalyze = () => {
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      setShowStrategies(true);
    }, 2000);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">AI Decision Center</h1>
          <p className="text-xs text-muted-foreground mt-0.5">AI-assisted strategy evaluation and decision training</p>
        </div>
        <Button onClick={handleAnalyze} disabled={analyzing} className="gap-2">
          <Brain className="h-4 w-4" />
          {analyzing ? "Analyzing..." : "Analyze Situation"}
        </Button>
      </div>

      {/* Situation Summary */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Brain className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Situation Analysis</h3>
          <Badge variant="outline" className="text-[9px] h-4 border-primary/30 text-primary">AI Generated</Badge>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Active fire detected in Sector 7 spreading NE at 5km/h. 3 missions active with 8 operational assets deployed. 
          Bridge B-12 structurally compromised limiting northern route options. Flood warning issued for River Delta South 
          with 2-hour breach timeline. 12 civilians detected near Zone C requiring evacuation consideration. 
          Recommended priority: simultaneous fire containment and civilian evacuation with resource allocation of 60/40.
        </p>
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-severity-critical" />
            <span className="text-[10px] text-muted-foreground">2 Critical Threats</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-severity-high" />
            <span className="text-[10px] text-muted-foreground">1 High Risk</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-2 rounded-full bg-severity-low" />
            <span className="text-[10px] text-muted-foreground">8 Assets Available</span>
          </div>
        </div>
      </motion.div>

      {/* Strategy Cards */}
      {showStrategies && (
        <div>
          <h3 className="text-sm font-semibold text-foreground mb-4">Recommended Strategies</h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {mockStrategies.map((strategy, i) => (
              <motion.div
                key={strategy.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className={`glass-card h-full ${i === 0 ? "border-primary/30 glow-primary" : ""}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Badge variant={i === 0 ? "default" : "outline"} className="text-[9px] h-4">
                        {i === 0 ? "★ Recommended" : `Option ${i + 1}`}
                      </Badge>
                      <span className="text-lg font-bold text-foreground">{strategy.successProbability}%</span>
                    </div>
                    <CardTitle className="text-sm mt-2">{strategy.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-[11px] text-muted-foreground">{strategy.description}</p>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-muted-foreground flex items-center gap-1"><Shield className="h-3 w-3" /> Safety</span>
                        <span className="text-foreground font-medium">{strategy.safetyScore}%</span>
                      </div>
                      <Progress value={strategy.safetyScore} className="h-1" />

                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-muted-foreground flex items-center gap-1"><Zap className="h-3 w-3" /> Efficiency</span>
                        <span className="text-foreground font-medium">{strategy.efficiencyScore}%</span>
                      </div>
                      <Progress value={strategy.efficiencyScore} className="h-1" />
                    </div>

                    <div>
                      <p className="text-[10px] font-medium text-foreground mb-1.5">Key Actions:</p>
                      {strategy.actions.slice(0, 3).map((action, ai) => (
                        <div key={ai} className="flex items-start gap-1.5 mb-1">
                          <ArrowRight className="h-2.5 w-2.5 mt-0.5 text-primary shrink-0" />
                          <span className="text-[10px] text-muted-foreground">{action}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border/50">
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Clock className="h-3 w-3" /> {strategy.timeEstimate}
                      </div>
                      <Button size="sm" variant={i === 0 ? "default" : "outline"} className="h-7 text-[10px]">
                        Execute Strategy
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Decision Log */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card rounded-xl">
        <div className="p-4 border-b border-border/50">
          <h3 className="text-sm font-semibold text-foreground">Decision Log</h3>
        </div>
        <ScrollArea className="max-h-[250px]">
          <div className="p-4 space-y-3">
            {decisionLog.map((entry) => (
              <div key={entry.id} className="flex items-center gap-4 p-3 rounded-lg bg-secondary/30">
                <CheckCircle2 className={`h-4 w-4 shrink-0 ${entry.score >= 85 ? "text-severity-low" : entry.score >= 70 ? "text-severity-medium" : "text-severity-high"}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground">{entry.decision}</p>
                  <p className="text-[11px] text-muted-foreground">{entry.outcome}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-sm font-bold ${entry.score >= 85 ? "text-severity-low" : entry.score >= 70 ? "text-severity-medium" : "text-severity-high"}`}>
                    {entry.score}
                  </p>
                  <p className="text-[9px] text-muted-foreground">{entry.time}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </motion.div>
    </div>
  );
}

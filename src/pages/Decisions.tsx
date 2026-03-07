import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, TrendingUp, Shield, Zap, BarChart3, CheckCircle2, Clock, ArrowRight, ShieldAlert, Target, TerminalSquare, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

interface Strategy {
  id: string;
  name: string;
  description: string;
  successProbability: number;
  threatLevel: number;
  failureRate: number;
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
    threatLevel: 12,
    failureRate: 7,
    timeEstimate: "45 min",
    actions: ["Deploy UAV Alpha & Bravo for thermal mapping", "Establish firebreaks at NE vector", "Pre-position rescue teams at Zone C", "Activate water supply relay from Station R-3"],
    risks: ["High wind may reduce UAV effectiveness", "Limited ground asset availability"],
  },
  {
    id: "s2",
    name: "Civilian-First Evacuation",
    description: "Prioritize evacuation of civilians in Zone C before engaging fire suppression, using all ground vehicles and UGVs for transport",
    successProbability: 74,
    threatLevel: 18,
    failureRate: 8,
    timeEstimate: "60 min",
    actions: ["Dispatch all UGVs to evacuation routes", "Deploy UAVs for civilian tracking", "Establish medical triage at rally point", "Request mutual aid from adjacent sectors"],
    risks: ["Fire may advance during evacuation window", "Route congestion likely"],
  },
  {
    id: "s3",
    name: "Dual-Vector Response",
    description: "Split forces: half for containment, half for evacuation. Coordinate via Command Vehicle CV-1 as mobile HQ",
    successProbability: 68,
    threatLevel: 25,
    failureRate: 7,
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
  const [llmText, setLlmText] = useState("");
  const fullLlmText = "LLM Intelligence Feed:\nAnalyzing situation parameters...\nActive fire detected in Sector 7 spreading NE at 5km/h. 3 missions active with 8 operational assets deployed.\nBridge B-12 structurally compromised limiting northern route options.\nFlood warning issued for River Delta South with 2-hour breach timeline.\n12 civilians detected near Zone C requiring evacuation consideration.\n\nRunning Monte Carlo simulations for Course of Action (COA) generation...\nRecommended priority: Aerial Containment while preparing evacuation routes. Probability of cascading failure if fire crosses river is 84%.";

  useEffect(() => {
    if (analyzing) {
      setLlmText("");
      let i = 0;
      const interval = setInterval(() => {
        setLlmText(fullLlmText.substring(0, i));
        i += 3;
        if (i > fullLlmText.length) {
          clearInterval(interval);
          setAnalyzing(false);
          setShowStrategies(true);
        }
      }, 20);
      return () => clearInterval(interval);
    }
  }, [analyzing]);

  const handleAnalyze = () => {
    setAnalyzing(true);
    setShowStrategies(false);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">LLM Strategy Intelligence</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Automated COA Generation & Monte Carlo Validated Decisions</p>
        </div>
        <Button onClick={handleAnalyze} disabled={analyzing} className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
          <Brain className="h-4 w-4" />
          {analyzing ? "Synthesizing COAs..." : "Generate Strategic COAs"}
        </Button>
      </div>

      {/* Situation Summary / LLM Feed */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-xl p-5 border-border/50">
        <div className="flex items-center gap-2 mb-3">
          <TerminalSquare className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">LLM Operational Analysis Feed</h3>
          {analyzing && <Badge variant="outline" className="text-[9px] h-4 border-primary/30 text-primary animate-pulse">Processing Variables</Badge>}
        </div>
        <div className="bg-background/50 p-3 rounded-md min-h-[120px] font-mono text-[11px] text-muted-foreground whitespace-pre-wrap flex flex-col justify-end">
          {(!analyzing && llmText === "") ? fullLlmText : llmText}
          {analyzing && <span className="inline-block w-2 h-3 bg-primary animate-pulse ml-1" />}
        </div>
        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-border/50">
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
        <AnimatePresence>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" />
              Monte Carlo Validated COAs
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {mockStrategies.map((strategy, i) => (
                <motion.div
                  key={strategy.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className={`glass-card h-full ${i === 0 ? "border-primary/50 shadow-[0_0_15px_rgba(var(--primary),0.1)]" : "border-border/50 hover:border-primary/30"}`}>
                    <CardHeader className="pb-3 border-b border-border/50">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant={i === 0 ? "default" : "outline"} className="text-[9px] h-5 px-2">
                          {i === 0 ? "★ LLM Recommended" : `Alternative ${i}`}
                        </Badge>
                        <Badge variant="secondary" className="text-[9px] h-5 px-2 font-mono">
                          ID: {strategy.id.toUpperCase()}
                        </Badge>
                      </div>
                      <CardTitle className="text-sm">{strategy.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">
                      <p className="text-[11px] text-muted-foreground h-16">{strategy.description}</p>

                      <div className="space-y-3 bg-secondary/20 p-3 rounded-lg border border-border/50">
                        <div>
                          <div className="flex justify-between text-[10px] mb-1">
                            <span className="text-severity-low flex items-center gap-1"><Target className="h-3 w-3" /> Success Rate</span>
                            <span className="font-mono text-foreground">{strategy.successProbability}%</span>
                          </div>
                          <Progress value={strategy.successProbability} className="h-1 bg-secondary [&>div]:bg-severity-low" />
                        </div>
                        <div>
                          <div className="flex justify-between text-[10px] mb-1">
                            <span className="text-severity-medium flex items-center gap-1"><ShieldAlert className="h-3 w-3" /> Threat Level</span>
                            <span className="font-mono text-foreground">{strategy.threatLevel}%</span>
                          </div>
                          <Progress value={strategy.threatLevel} className="h-1 bg-secondary [&>div]:bg-severity-medium" />
                        </div>
                        <div>
                          <div className="flex justify-between text-[10px] mb-1">
                            <span className="text-severity-critical flex items-center gap-1"><XCircle className="h-3 w-3" /> Failure Rate</span>
                            <span className="font-mono text-foreground">{strategy.failureRate}%</span>
                          </div>
                          <Progress value={strategy.failureRate} className="h-1 bg-secondary [&>div]:bg-severity-critical" />
                        </div>
                      </div>

                      <div>
                        <p className="text-[10px] font-medium text-foreground mb-2 flex items-center gap-1"><Zap className="h-3 w-3" /> Execution Steps:</p>
                        {strategy.actions.slice(0, 3).map((action, ai) => (
                          <div key={ai} className="flex items-start gap-1.5 mb-1.5">
                            <ArrowRight className="h-3 w-3 mt-0.5 text-primary shrink-0" />
                            <span className="text-[10px] text-muted-foreground leading-tight">{action}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-border/50 mt-auto">
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono">
                          <Clock className="h-3 w-3" /> T-{strategy.timeEstimate}
                        </div>
                        <Button
                          size="sm"
                          variant={i === 0 ? "default" : "outline"}
                          className="h-8 text-[11px]"
                          onClick={() => {
                            toast.promise(new Promise(r => setTimeout(r, 1500)), {
                              loading: `Transmitting COA: ${strategy.name}...`,
                              success: `COA ${strategy.id.toUpperCase()} executed. Assets routing to waypoints.`,
                              error: 'Transmission failed.'
                            });
                          }}
                        >
                          Execute COA
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Decision Log */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card rounded-xl border-border/50">
        <div className="p-4 border-b border-border/50 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary" /> Action Matrix Log
          </h3>
          <Badge variant="outline" className="text-[9px] font-mono">Verified</Badge>
        </div>
        <ScrollArea className="max-h-[250px]">
          <div className="p-4 space-y-2">
            {decisionLog.map((entry) => (
              <div key={entry.id} className="flex items-center gap-4 p-3 rounded-lg bg-secondary/20 border border-border/30 hover:border-primary/30 transition-colors">
                <div className={`p-1.5 rounded bg-background/50`}>
                  <CheckCircle2 className={`h-4 w-4 shrink-0 ${entry.score >= 85 ? "text-severity-low" : entry.score >= 70 ? "text-severity-medium" : "text-severity-high"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground">{entry.decision}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{entry.outcome}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-xs font-mono font-bold ${entry.score >= 85 ? "text-severity-low" : entry.score >= 70 ? "text-severity-medium" : "text-severity-high"}`}>
                    P(s): {entry.score}%
                  </p>
                  <p className="text-[9px] text-muted-foreground font-mono mt-0.5">{entry.time}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </motion.div>
    </div>
  );
}
// We need to import XCircle at the top, let's just make sure it's valid. Added XCircle to lucide imports.

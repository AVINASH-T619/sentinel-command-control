import { motion } from "framer-motion";
import { AlertTriangle, Users, Building2, Shield, Clock, TrendingUp, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { ImpactAssessment } from "@/lib/simulation/engine";

interface ImpactAnalysisPanelProps {
  impact: ImpactAssessment | null;
  isRunning: boolean;
}

function getRiskColor(score: number): string {
  if (score > 70) return "text-severity-critical";
  if (score > 50) return "text-severity-high";
  if (score > 30) return "text-severity-medium";
  return "text-severity-low";
}

function getRiskBg(score: number): string {
  if (score > 70) return "[&>div]:bg-severity-critical";
  if (score > 50) return "[&>div]:bg-severity-high";
  if (score > 30) return "[&>div]:bg-severity-medium";
  return "[&>div]:bg-severity-low";
}

export function ImpactAnalysisPanel({ impact, isRunning }: ImpactAnalysisPanelProps) {
  if (!impact) {
    return (
      <Card className="glass-card border-border/50">
        <CardHeader className="p-3">
          <CardTitle className="text-xs flex items-center gap-2">
            <AlertTriangle className="h-3.5 w-3.5 text-primary" />
            Real-Time Impact Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <p className="text-[11px] text-muted-foreground/50 text-center py-4">
            {isRunning ? "Computing impact..." : "Start simulation to see impact analysis"}
          </p>
        </CardContent>
      </Card>
    );
  }

  const metrics = [
    { icon: MapPin, label: "Affected Area", value: `${impact.affectedArea} km²`, color: "text-severity-high" },
    { icon: Users, label: "Population at Risk", value: impact.populationAtRisk.toLocaleString(), color: "text-severity-critical" },
    { icon: Building2, label: "Infrastructure", value: `${impact.infrastructureAtRisk} at risk`, color: "text-severity-medium" },
    { icon: Shield, label: "Assets in Danger", value: `${impact.assetsInDanger.length}`, color: "text-severity-high" },
    { icon: TrendingUp, label: "Est. Damage", value: `$${impact.estimatedDamage}M`, color: "text-severity-critical" },
    { icon: Clock, label: "Evac Time", value: `${impact.evacuationTime} min`, color: "text-severity-medium" },
  ];

  return (
    <Card className="glass-card border-border/50">
      <CardHeader className="p-3 border-b border-border/50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs flex items-center gap-2">
            <AlertTriangle className="h-3.5 w-3.5 text-primary" />
            Real-Time Impact Analysis
          </CardTitle>
          <Badge
            variant="outline"
            className={`text-[9px] h-4 ${impact.riskScore > 70 ? "border-severity-critical/50 text-severity-critical" : "border-severity-medium/50 text-severity-medium"}`}
          >
            Risk Score: {impact.riskScore}/100
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-3 space-y-3">
        {/* Risk score bar */}
        <div>
          <div className="flex justify-between text-[9px] mb-1">
            <span className={getRiskColor(impact.riskScore)}>Overall Risk Level</span>
            <span className="font-mono text-foreground">{impact.riskScore}%</span>
          </div>
          <Progress value={impact.riskScore} className={`h-1.5 bg-secondary ${getRiskBg(impact.riskScore)}`} />
        </div>

        {/* Metrics grid */}
        <div className="grid grid-cols-3 gap-2">
          {metrics.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="bg-secondary/30 rounded-lg p-2 border border-border/30"
            >
              <m.icon className={`h-3 w-3 ${m.color} mb-1`} />
              <p className="text-[10px] font-mono font-semibold text-foreground">{m.value}</p>
              <p className="text-[8px] text-muted-foreground uppercase tracking-wider">{m.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Recommendations */}
        <div>
          <p className="text-[9px] font-semibold text-foreground uppercase tracking-wider mb-1.5">
            AI Recommendations
          </p>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {impact.recommendations.map((rec, i) => (
              <div key={i} className="flex items-start gap-1.5 text-[10px] text-muted-foreground">
                <span className="text-primary mt-0.5 shrink-0">▸</span>
                <span className="leading-tight">{rec}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

import { useState } from "react";
import { Zap, Flame, CloudRain, Building2, Users, AlertTriangle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { SimEvent } from "@/lib/simulation/engine";
import { toast } from "sonner";

interface EventInjectionPanelProps {
  onInject: (event: Omit<SimEvent, "id" | "time" | "resolved">) => void;
  events: SimEvent[];
  isRunning: boolean;
}

const EVENT_TEMPLATES = [
  { type: "explosion" as const, icon: Zap, label: "Explosion", description: "Secondary explosion detected", severity: 0.9, color: "text-severity-critical" },
  { type: "weather_change" as const, icon: CloudRain, label: "Weather Shift", description: "Wind direction change affecting spread models", severity: 0.5, color: "text-severity-medium" },
  { type: "infrastructure_failure" as const, icon: Building2, label: "Infra Failure", description: "Bridge collapse blocking evacuation route", severity: 0.8, color: "text-severity-high" },
  { type: "civilian_movement" as const, icon: Users, label: "Civilian Surge", description: "Large civilian group moving toward hazard zone", severity: 0.6, color: "text-severity-high" },
  { type: "asset_failure" as const, icon: AlertTriangle, label: "Asset Down", description: "UAV communication lost — possible crash", severity: 0.7, color: "text-severity-high" },
  { type: "reinforcement" as const, icon: Plus, label: "Reinforcement", description: "Additional assets arriving from adjacent sector", severity: 0.2, color: "text-severity-low" },
];

export function EventInjectionPanel({ onInject, events, isRunning }: EventInjectionPanelProps) {
  const handleInject = (template: typeof EVENT_TEMPLATES[0]) => {
    if (!isRunning) {
      toast.error("Start simulation before injecting events");
      return;
    }
    // Random location near Boston
    const location: [number, number] = [
      42.33 + Math.random() * 0.04,
      -71.08 + Math.random() * 0.06,
    ];
    onInject({
      type: template.type,
      description: template.description,
      location,
      severity: template.severity,
    });
    toast.success(`Event injected: ${template.label}`);
  };

  return (
    <Card className="glass-card border-border/50">
      <CardHeader className="p-3 border-b border-border/50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xs flex items-center gap-2">
            <Zap className="h-3.5 w-3.5 text-primary" />
            Event Injection
          </CardTitle>
          <Badge variant="outline" className="text-[9px] h-4">
            {events.length} events
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-3 space-y-3">
        <div className="grid grid-cols-2 gap-1.5">
          {EVENT_TEMPLATES.map(template => (
            <Button
              key={template.type}
              variant="outline"
              size="sm"
              className="h-auto py-2 px-2.5 flex flex-col items-start gap-0.5 border-border/50 hover:border-primary/40 hover:bg-primary/5"
              onClick={() => handleInject(template)}
            >
              <div className="flex items-center gap-1.5">
                <template.icon className={`h-3 w-3 ${template.color}`} />
                <span className="text-[10px] font-medium">{template.label}</span>
              </div>
            </Button>
          ))}
        </div>

        {/* Event log */}
        {events.length > 0 && (
          <div className="space-y-1 max-h-32 overflow-y-auto">
            <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">Event Log</p>
            {events.slice(0, 8).map(evt => (
              <div key={evt.id} className="flex items-center gap-2 text-[10px] p-1.5 rounded bg-secondary/30 border border-border/30">
                <div className={`h-1.5 w-1.5 rounded-full shrink-0 ${
                  evt.severity > 0.7 ? "bg-severity-critical" : evt.severity > 0.4 ? "bg-severity-medium" : "bg-severity-low"
                }`} />
                <span className="text-muted-foreground truncate flex-1">{evt.description}</span>
                <span className="text-muted-foreground/50 font-mono text-[8px] shrink-0">
                  T+{Math.floor(evt.time / 60)}:{String(Math.floor(evt.time) % 60).padStart(2, "0")}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

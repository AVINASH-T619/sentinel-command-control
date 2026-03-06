import { useState } from "react";
import { motion } from "framer-motion";
import { mockAssets, mockEntities } from "@/data/mockData";
import { Plane, Bot, Truck, Car, Radio, Camera, Flame, Droplets, Building2 } from "lucide-react";

const assetIcons: Record<string, React.ElementType> = {
  uav: Plane, drone: Plane, robot: Bot, ugv: Truck,
  vehicle: Car, sensor: Radio, camera: Camera,
};

const statusColors: Record<string, string> = {
  active: "bg-severity-low", deployed: "bg-severity-low",
  idle: "bg-severity-medium", offline: "bg-severity-critical",
  maintenance: "bg-muted-foreground",
};

export function TacticalMap() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const fireZone = mockEntities.find(e => e.subType === "Fire Zone");
  const floodZone = mockEntities.find(e => e.subType === "Flood Zone");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="glass-card rounded-xl overflow-hidden"
    >
      <div className="flex items-center justify-between p-4 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-severity-low animate-pulse" />
          <h3 className="text-sm font-semibold text-foreground">Tactical Overview</h3>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-severity-low" /> Active</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-severity-medium" /> Idle</span>
          <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-severity-critical" /> Offline</span>
          <span className="flex items-center gap-1"><Flame className="h-2.5 w-2.5 text-severity-critical" /> Fire</span>
          <span className="flex items-center gap-1"><Droplets className="h-2.5 w-2.5 text-severity-info" /> Flood</span>
        </div>
      </div>

      <div className="relative aspect-[16/9] tactical-grid bg-secondary/30">
        {/* Fire zone */}
        {fireZone && (
          <div
            className="absolute rounded-full bg-severity-critical/15 border border-severity-critical/30 animate-pulse-slow"
            style={{
              left: `${fireZone.location.x - 12}%`,
              top: `${fireZone.location.y - 12}%`,
              width: "24%",
              height: "24%",
            }}
          >
            <Flame className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-severity-critical/60" />
          </div>
        )}

        {/* Flood zone */}
        {floodZone && (
          <div
            className="absolute rounded-full bg-severity-info/10 border border-severity-info/30 animate-pulse-slow"
            style={{
              left: `${floodZone.location.x - 10}%`,
              top: `${floodZone.location.y - 10}%`,
              width: "20%",
              height: "20%",
            }}
          >
            <Droplets className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-5 w-5 text-severity-info/60" />
          </div>
        )}

        {/* Infrastructure */}
        {mockEntities.filter(e => e.type === "infrastructure").map(entity => (
          <div
            key={entity.id}
            className="absolute group cursor-pointer"
            style={{ left: `${entity.location.x}%`, top: `${entity.location.y}%` }}
            onClick={() => setSelectedId(entity.id === selectedId ? null : entity.id)}
          >
            <div className={`-translate-x-1/2 -translate-y-1/2 p-1.5 rounded border ${entity.status === "Damaged" ? "border-severity-high/50 bg-severity-high/10" : "border-border/50 bg-card/60"}`}>
              <Building2 className={`h-3 w-3 ${entity.status === "Damaged" ? "text-severity-high" : "text-muted-foreground"}`} />
            </div>
            <div className="absolute left-1/2 -translate-x-1/2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity bg-card border border-border rounded px-2 py-1 whitespace-nowrap z-10">
              <p className="text-[10px] font-medium text-foreground">{entity.name}</p>
              <p className="text-[9px] text-muted-foreground">{entity.status}</p>
            </div>
          </div>
        ))}

        {/* Assets */}
        {mockAssets.map(asset => {
          const Icon = assetIcons[asset.type] || Radio;
          const color = statusColors[asset.status] || "bg-muted-foreground";
          return (
            <div
              key={asset.id}
              className="absolute group cursor-pointer"
              style={{ left: `${asset.location.x}%`, top: `${asset.location.y}%` }}
              onClick={() => setSelectedId(asset.id === selectedId ? null : asset.id)}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="-translate-x-1/2 -translate-y-1/2 relative"
              >
                <div className={`p-1.5 rounded-full border border-border/50 bg-card/80 backdrop-blur-sm ${selectedId === asset.id ? "ring-2 ring-primary" : ""}`}>
                  <Icon className="h-3 w-3 text-foreground" />
                </div>
                <div className={`absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full ${color} border border-card`} />
              </motion.div>
              <div className="absolute left-1/2 -translate-x-1/2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity bg-card border border-border rounded px-2 py-1 whitespace-nowrap z-10">
                <p className="text-[10px] font-medium text-foreground">{asset.name}</p>
                <p className="text-[9px] text-muted-foreground">{asset.status} • {asset.batteryLevel}%</p>
              </div>
            </div>
          );
        })}

        {/* Grid overlay labels */}
        <div className="absolute bottom-2 left-2 text-[9px] text-muted-foreground/40 font-mono">
          GRID REF: 42.3°N 71.1°W
        </div>
        <div className="absolute top-2 right-2 text-[9px] text-muted-foreground/40 font-mono">
          SCALE: 1:50000
        </div>
      </div>

      {/* Selected info */}
      {selectedId && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          className="border-t border-border/50 p-3 bg-secondary/30"
        >
          {(() => {
            const asset = mockAssets.find(a => a.id === selectedId);
            const entity = mockEntities.find(e => e.id === selectedId);
            const item = asset || entity;
            if (!item) return null;
            return (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-foreground">{item.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {asset ? `${asset.type.toUpperCase()} • ${asset.status} • Battery: ${asset.batteryLevel}%` : `${(entity as any)?.subType} • ${entity?.status}`}
                  </p>
                </div>
                {asset?.assignedMission && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                    Mission Active
                  </span>
                )}
              </div>
            );
          })()}
        </motion.div>
      )}
    </motion.div>
  );
}

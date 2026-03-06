import { motion } from "framer-motion";
import { mockAssets } from "@/data/mockData";
import { Plane, Bot, Truck, Car, Radio, Camera, Battery } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const iconMap: Record<string, React.ElementType> = {
  uav: Plane, drone: Plane, robot: Bot, ugv: Truck,
  vehicle: Car, sensor: Radio, camera: Camera,
};

const statusStyles: Record<string, string> = {
  active: "bg-severity-low/10 text-severity-low border-severity-low/20",
  deployed: "bg-severity-low/10 text-severity-low border-severity-low/20",
  idle: "bg-severity-medium/10 text-severity-medium border-severity-medium/20",
  offline: "bg-severity-critical/10 text-severity-critical border-severity-critical/20",
  maintenance: "bg-muted text-muted-foreground border-border",
};

export function AssetTable() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass-card rounded-xl overflow-hidden"
    >
      <div className="flex items-center justify-between p-4 border-b border-border/50">
        <h3 className="text-sm font-semibold text-foreground">Asset Status</h3>
        <span className="text-[11px] text-muted-foreground">
          {mockAssets.filter(a => a.status === "active" || a.status === "deployed").length}/{mockAssets.length} operational
        </span>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-border/50">
            <TableHead className="text-[10px] tracking-wider">ASSET</TableHead>
            <TableHead className="text-[10px] tracking-wider">TYPE</TableHead>
            <TableHead className="text-[10px] tracking-wider">STATUS</TableHead>
            <TableHead className="text-[10px] tracking-wider">BATTERY</TableHead>
            <TableHead className="text-[10px] tracking-wider">MISSION</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockAssets.slice(0, 8).map((asset) => {
            const Icon = iconMap[asset.type] || Radio;
            return (
              <TableRow key={asset.id} className="border-border/30 hover:bg-secondary/30 cursor-pointer">
                <TableCell className="py-2.5">
                  <div className="flex items-center gap-2">
                    <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs font-medium text-foreground">{asset.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-[11px] text-muted-foreground uppercase">{asset.type}</span>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={`text-[10px] h-5 ${statusStyles[asset.status]}`}>
                    {asset.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <Battery className={`h-3 w-3 ${asset.batteryLevel < 20 ? "text-severity-critical" : asset.batteryLevel < 50 ? "text-severity-medium" : "text-severity-low"}`} />
                    <span className="text-[11px] text-muted-foreground">{asset.batteryLevel}%</span>
                  </div>
                </TableCell>
                <TableCell>
                  {asset.assignedMission ? (
                    <span className="text-[11px] text-primary font-medium">{asset.assignedMission}</span>
                  ) : (
                    <span className="text-[11px] text-muted-foreground/50">—</span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </motion.div>
  );
}

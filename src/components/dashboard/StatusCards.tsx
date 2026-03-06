import { motion } from "framer-motion";
import { Target, Plane, AlertTriangle, Users, Radio, Crosshair } from "lucide-react";
import { mockMissions, mockAssets, mockAlerts } from "@/data/mockData";

const stats = [
  {
    label: "Active Missions",
    value: mockMissions.filter(m => m.status === "active").length,
    icon: Target,
    change: "+1 last hour",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    label: "Deployed Assets",
    value: mockAssets.filter(a => a.status === "active" || a.status === "deployed").length,
    total: mockAssets.length,
    icon: Plane,
    change: `${mockAssets.length} total`,
    color: "text-severity-low",
    bgColor: "bg-severity-low/10",
  },
  {
    label: "Active Alerts",
    value: mockAlerts.filter(a => !a.acknowledged).length,
    icon: AlertTriangle,
    change: `${mockAlerts.filter(a => a.severity === "critical").length} critical`,
    color: "text-severity-critical",
    bgColor: "bg-severity-critical/10",
  },
  {
    label: "Personnel",
    value: 24,
    icon: Users,
    change: "All stations manned",
    color: "text-severity-info",
    bgColor: "bg-severity-info/10",
  },
];

export function StatusCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="glass-card rounded-xl p-4"
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">{stat.label}</p>
              <p className="mt-2 text-3xl font-bold text-foreground">
                {stat.value}
                {stat.total && <span className="text-sm font-normal text-muted-foreground">/{stat.total}</span>}
              </p>
              <p className={`mt-1 text-[11px] ${stat.color}`}>{stat.change}</p>
            </div>
            <div className={`rounded-lg p-2 ${stat.bgColor}`}>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

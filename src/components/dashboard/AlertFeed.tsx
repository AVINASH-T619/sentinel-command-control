import { motion } from "framer-motion";
import { AlertTriangle, Info, AlertOctagon, Bell } from "lucide-react";
import { mockAlerts, timeAgo, getSeverityColor, type Severity } from "@/data/mockData";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

const severityIcons: Record<Severity, React.ElementType> = {
  critical: AlertOctagon,
  high: AlertTriangle,
  medium: AlertTriangle,
  low: Info,
  info: Bell,
};

export function AlertFeed() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass-card rounded-xl flex flex-col"
    >
      <div className="flex items-center justify-between p-4 border-b border-border/50">
        <h3 className="text-sm font-semibold text-foreground">Alert Feed</h3>
        <Badge variant="outline" className="text-[10px] h-5 text-severity-critical border-severity-critical/30">
          {mockAlerts.filter(a => !a.acknowledged).length} Unread
        </Badge>
      </div>
      <ScrollArea className="flex-1 max-h-[400px]">
        <div className="p-2 space-y-1">
          {mockAlerts.map((alert, i) => {
            const Icon = severityIcons[alert.severity];
            return (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`flex items-start gap-3 p-3 rounded-lg transition-colors cursor-pointer hover:bg-secondary/50 ${
                  !alert.acknowledged ? "bg-secondary/30" : ""
                }`}
              >
                <div className={`mt-0.5 rounded-md p-1 ${getSeverityColor(alert.severity)}/10`}>
                  <Icon className={`h-3.5 w-3.5 text-severity-${alert.severity}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-xs font-medium truncate ${!alert.acknowledged ? "text-foreground" : "text-muted-foreground"}`}>
                      {alert.title}
                    </p>
                    {!alert.acknowledged && (
                      <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-1">{alert.description}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-muted-foreground/70">{alert.location}</span>
                    <span className="text-[10px] text-muted-foreground/50">•</span>
                    <span className="text-[10px] text-muted-foreground/70">{timeAgo(alert.timestamp)}</span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </ScrollArea>
    </motion.div>
  );
}

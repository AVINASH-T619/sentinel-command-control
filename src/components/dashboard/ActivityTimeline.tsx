import { motion } from "framer-motion";
import { mockTimeline, timeAgo } from "@/data/mockData";
import { ScrollArea } from "@/components/ui/scroll-area";

const typeColors: Record<string, string> = {
  alert: "bg-severity-high",
  mission: "bg-primary",
  asset: "bg-severity-medium",
  system: "bg-muted-foreground",
};

export function ActivityTimeline() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass-card rounded-xl"
    >
      <div className="p-4 border-b border-border/50">
        <h3 className="text-sm font-semibold text-foreground">Activity Timeline</h3>
      </div>
      <ScrollArea className="max-h-[350px]">
        <div className="p-4">
          <div className="relative">
            <div className="absolute left-[5px] top-2 bottom-2 w-px bg-border/50" />
            <div className="space-y-4">
              {mockTimeline.map((event, i) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex gap-3 relative"
                >
                  <div className={`h-[10px] w-[10px] rounded-full mt-1 shrink-0 border-2 border-card ${typeColors[event.type]}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-medium text-foreground truncate">{event.title}</p>
                      <span className="text-[10px] text-muted-foreground/70 shrink-0">{timeAgo(event.timestamp)}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{event.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>
    </motion.div>
  );
}

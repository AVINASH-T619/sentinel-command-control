import { motion } from "framer-motion";
import { mockTrainingSessions } from "@/data/mockData";
import { GraduationCap, Trophy, Clock, Target, TrendingUp, Calendar, Play, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const performanceMetrics = [
  { label: "Avg. Decision Score", value: 83, icon: Target, color: "text-primary" },
  { label: "Avg. Response Time", value: "4.2s", icon: Clock, color: "text-severity-medium" },
  { label: "Sessions Completed", value: 24, icon: Trophy, color: "text-severity-low" },
  { label: "Improvement Rate", value: "+18%", icon: TrendingUp, color: "text-severity-info" },
];

const statusStyles: Record<string, string> = {
  completed: "bg-severity-low/10 text-severity-low border-severity-low/20",
  "in-progress": "bg-severity-medium/10 text-severity-medium border-severity-medium/20",
  scheduled: "bg-severity-info/10 text-severity-info border-severity-info/20",
};

export default function Training() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">Training & Reports</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Performance tracking and training session management</p>
        </div>
        <Button
          className="gap-2"
          onClick={() => {
            toast.promise(new Promise(resolve => setTimeout(resolve, 1500)), {
              loading: 'Initializing new training session environment...',
              success: 'Session environment deployed. Ready for trainee connection.',
              error: 'Failed to initialize session'
            });
          }}
        >
          <Play className="h-4 w-4" /> New Session
        </Button>
      </div>

      {/* Performance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {performanceMetrics.map((metric, i) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card rounded-xl p-4"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-secondary p-2">
                <metric.icon className={`h-4 w-4 ${metric.color}`} />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{metric.label}</p>
                <p className="text-xl font-bold text-foreground">{metric.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Performance Chart Placeholder */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card rounded-xl p-5"
      >
        <h3 className="text-sm font-semibold text-foreground mb-4">Performance Trend</h3>
        <div className="grid grid-cols-7 gap-2 h-32">
          {[72, 68, 78, 82, 85, 87, 91].map((score, i) => (
            <div key={i} className="flex flex-col items-center justify-end gap-1">
              <div
                className="w-full rounded-t bg-primary/20 relative overflow-hidden"
                style={{ height: `${score}%` }}
              >
                <div className="absolute inset-0 bg-primary/40 rounded-t" style={{ height: `${score}%` }} />
              </div>
              <span className="text-[9px] text-muted-foreground">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Session Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card rounded-xl overflow-hidden"
      >
        <div className="p-4 border-b border-border/50">
          <h3 className="text-sm font-semibold text-foreground">Training Sessions</h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border/50">
              <TableHead className="text-[10px] tracking-wider">SESSION</TableHead>
              <TableHead className="text-[10px] tracking-wider">SCENARIO</TableHead>
              <TableHead className="text-[10px] tracking-wider">TRAINEE</TableHead>
              <TableHead className="text-[10px] tracking-wider">STATUS</TableHead>
              <TableHead className="text-[10px] tracking-wider">DURATION</TableHead>
              <TableHead className="text-[10px] tracking-wider">SCORE</TableHead>
              <TableHead className="text-[10px] tracking-wider"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockTrainingSessions.map((session) => (
              <TableRow key={session.id} className="border-border/30 hover:bg-secondary/30 cursor-pointer">
                <TableCell className="py-3">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs font-medium text-foreground">{session.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-[11px] text-muted-foreground">{session.scenario}</span>
                </TableCell>
                <TableCell>
                  <span className="text-[11px] text-foreground">{session.trainee}</span>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={`text-[9px] h-4 ${statusStyles[session.status]}`}>
                    {session.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-[11px] text-muted-foreground">{session.duration}</span>
                </TableCell>
                <TableCell>
                  {session.score > 0 ? (
                    <div className="flex items-center gap-2">
                      <Progress value={session.score} className="h-1.5 w-16" />
                      <span className={`text-xs font-bold ${session.score >= 85 ? "text-severity-low" : session.score >= 70 ? "text-severity-medium" : "text-severity-high"}`}>
                        {session.score}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[11px] text-muted-foreground/50">—</span>
                  )}
                </TableCell>
                <TableCell>
                  {session.status === "completed" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-[10px] gap-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        toast.promise(new Promise(resolve => setTimeout(resolve, 2000)), {
                          loading: 'Loading session telemetry...',
                          success: `Replay environment for ${session.name} ready.`,
                          error: 'Failed to load replay'
                        });
                      }}
                    >
                      Replay <ChevronRight className="h-3 w-3" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </motion.div>
    </div>
  );
}

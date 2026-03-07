import { StatusCards } from "@/components/dashboard/StatusCards";
import { TacticalMap } from "@/components/dashboard/TacticalMap";
import { AlertFeed } from "@/components/dashboard/AlertFeed";
import { AssetTable } from "@/components/dashboard/AssetTable";
import { ActivityTimeline } from "@/components/dashboard/ActivityTimeline";
import { Button } from "@/components/ui/button";
import { FileText, BarChart, Activity } from "lucide-react";
import { toast } from "sonner";

const Index = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">Operational Dashboard</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Real-time situational awareness • Last updated: just now</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-8"
            onClick={() => {
              toast.promise(new Promise(resolve => setTimeout(resolve, 2000)), {
                loading: 'Generating Situation Report...',
                success: 'Situation Report generated and saved to vault.',
                error: 'Failed to generate report'
              });
            }}
          >
            <FileText className="h-3.5 w-3.5 mr-1.5" /> Report Generation
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-xs h-8"
            onClick={() => {
              toast.promise(new Promise(resolve => setTimeout(resolve, 3000)), {
                loading: 'Running Scenario Analysis...',
                success: 'Scenario Analysis complete. Models updated.',
                error: 'Analysis failed'
              });
            }}
          >
            <BarChart className="h-3.5 w-3.5 mr-1.5" /> Scenario Analysis
          </Button>
          <Button
            size="sm"
            className="text-xs h-8"
            onClick={() => {
              toast.promise(new Promise(resolve => setTimeout(resolve, 2500)), {
                loading: 'Calculating Impact Radius...',
                success: 'Impact Analysis finalized. Alerts dispatched.',
                error: 'Impact Analysis failed'
              });
            }}
          >
            <Activity className="h-3.5 w-3.5 mr-1.5" /> Impact Analysis
          </Button>
        </div>
      </div>

      <StatusCards />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <TacticalMap />
        </div>
        <div>
          <AlertFeed />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AssetTable />
        </div>
        <div>
          <ActivityTimeline />
        </div>
      </div>
    </div>
  );
};

export default Index;

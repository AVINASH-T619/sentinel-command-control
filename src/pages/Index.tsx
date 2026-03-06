import { StatusCards } from "@/components/dashboard/StatusCards";
import { TacticalMap } from "@/components/dashboard/TacticalMap";
import { AlertFeed } from "@/components/dashboard/AlertFeed";
import { AssetTable } from "@/components/dashboard/AssetTable";
import { ActivityTimeline } from "@/components/dashboard/ActivityTimeline";

const Index = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">Operational Dashboard</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Real-time situational awareness • Last updated: just now</p>
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

import { useState } from "react";
import { motion } from "framer-motion";
import { mockEntities, mockAssets } from "@/data/mockData";
import { User, Bot, Building2, TreePine, Search, Filter, ChevronRight, MapPin, Link } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { EntityGraph } from "@/components/EntityGraph";

const typeIcons: Record<string, React.ElementType> = {
  person: User, asset: Bot, infrastructure: Building2, environment: TreePine,
};

const typeColors: Record<string, string> = {
  person: "bg-severity-info/10 text-severity-info",
  asset: "bg-severity-low/10 text-severity-low",
  infrastructure: "bg-severity-medium/10 text-severity-medium",
  environment: "bg-severity-high/10 text-severity-high",
};

const allEntities = [
  ...mockEntities,
  ...mockAssets.map(a => ({
    id: a.id, name: a.name, type: "asset" as const, subType: a.type.toUpperCase(),
    status: a.status, location: a.location,
    attributes: { batteryLevel: a.batteryLevel, capabilities: a.capabilities.join(", ") },
    relationships: a.assignedMission ? [{ targetId: a.assignedMission, type: "assigned_to" }] : [],
  })),
];

export default function Entities() {
  const [search, setSearch] = useState("");
  const [selectedEntity, setSelectedEntity] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>("all");

  const filtered = allEntities.filter(e => {
    const matchesSearch = e.name.toLowerCase().includes(search.toLowerCase()) || e.subType.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === "all" || e.type === filterType;
    return matchesSearch && matchesType;
  });

  const selected = allEntities.find(e => e.id === selectedEntity);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground tracking-tight">Entity Explorer</h1>
        <p className="text-xs text-muted-foreground mt-0.5">Browse and inspect all operational entities and their relationships</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search entities..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 h-9 text-xs bg-secondary/50 border-border/50"
          />
        </div>
        <div className="flex gap-1">
          {["all", "person", "asset", "infrastructure", "environment"].map(type => (
            <Button
              key={type}
              variant={filterType === type ? "default" : "ghost"}
              size="sm"
              className="text-[10px] h-7 capitalize"
              onClick={() => setFilterType(type)}
            >
              {type}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Entity List */}
        <div className="xl:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filtered.map((entity, i) => {
              const Icon = typeIcons[entity.type] || Bot;
              return (
                <motion.div
                  key={entity.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                >
                  <Card
                    className={`glass-card cursor-pointer transition-all hover:border-primary/30 ${selectedEntity === entity.id ? "border-primary glow-primary" : ""}`}
                    onClick={() => setSelectedEntity(entity.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`rounded-lg p-2 ${typeColors[entity.type]}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-medium text-foreground truncate">{entity.name}</p>
                            <ChevronRight className="h-3 w-3 text-muted-foreground" />
                          </div>
                          <p className="text-[10px] text-muted-foreground">{entity.subType}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className={`text-[9px] h-4 ${entity.status === "Deployed" || entity.status === "active" ? "border-severity-low/30 text-severity-low" : entity.status === "offline" || entity.status === "Damaged" ? "border-severity-critical/30 text-severity-critical" : "border-border"}`}>
                              {entity.status}
                            </Badge>
                            {entity.relationships.length > 0 && (
                              <span className="text-[9px] text-muted-foreground flex items-center gap-0.5">
                                <Link className="h-2.5 w-2.5" /> {entity.relationships.length} links
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Detail Panel */}
        <div>
          {selected ? (
            <motion.div
              key={selected.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-card rounded-xl sticky top-6"
            >
              <div className="p-5 border-b border-border/50">
                <div className="flex items-center gap-3">
                  <div className={`rounded-lg p-2.5 ${typeColors[selected.type]}`}>
                    {(() => { const Icon = typeIcons[selected.type] || Bot; return <Icon className="h-5 w-5" />; })()}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{selected.name}</h3>
                    <p className="text-[11px] text-muted-foreground">{selected.subType} • {selected.type}</p>
                  </div>
                </div>
              </div>

              <Tabs defaultValue="graph" className="p-4">
                <TabsList className="bg-secondary/50 w-full">
                  <TabsTrigger value="graph" className="flex-1 text-[10px]">Graph</TabsTrigger>
                  <TabsTrigger value="attributes" className="flex-1 text-[10px]">Attributes</TabsTrigger>
                  <TabsTrigger value="relationships" className="flex-1 text-[10px]">Links</TabsTrigger>
                  <TabsTrigger value="location" className="flex-1 text-[10px]">Location</TabsTrigger>
                </TabsList>

                <TabsContent value="attributes" className="mt-3 space-y-2">
                  <div className="flex items-center justify-between p-2 rounded bg-secondary/30">
                    <span className="text-[10px] text-muted-foreground">Status</span>
                    <span className="text-[10px] text-foreground font-medium">{selected.status}</span>
                  </div>
                  {Object.entries(selected.attributes).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between p-2 rounded bg-secondary/30">
                      <span className="text-[10px] text-muted-foreground capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
                      <span className="text-[10px] text-foreground font-medium">{String(value)}</span>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="relationships" className="mt-3">
                  {selected.relationships.length > 0 ? (
                    <div className="space-y-2">
                      {selected.relationships.map((rel, i) => (
                        <div key={i} className="flex items-center gap-2 p-2 rounded bg-secondary/30">
                          <Link className="h-3 w-3 text-primary" />
                          <span className="text-[10px] text-muted-foreground">{rel.type}</span>
                          <span className="text-[10px] text-foreground font-medium">{rel.targetId}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-muted-foreground text-center py-4">No relationships</p>
                  )}
                </TabsContent>

                <TabsContent value="location" className="mt-3">
                  <div className="aspect-square tactical-grid bg-secondary/30 rounded-lg relative">
                    <div
                      className="absolute h-3 w-3 rounded-full bg-primary border-2 border-card"
                      style={{ left: `${selected.location.x}%`, top: `${selected.location.y}%`, transform: "translate(-50%, -50%)" }}
                    />
                    <MapPin className="absolute text-primary h-4 w-4" style={{ left: `${selected.location.x}%`, top: `${selected.location.y - 5}%`, transform: "translate(-50%, -50%)" }} />
                  </div>
                  <p className="text-[10px] text-muted-foreground text-center mt-2">
                    Grid: {selected.location.x}, {selected.location.y}
                  </p>
                </TabsContent>

                <TabsContent value="graph" className="mt-3">
                  <EntityGraph centerEntity={selected} allEntities={allEntities} />
                </TabsContent>
              </Tabs>
            </motion.div>
          ) : (
            <div className="glass-card rounded-xl p-8 text-center">
              <Search className="h-8 w-8 text-muted-foreground/30 mx-auto" />
              <p className="text-xs text-muted-foreground mt-3">Select an entity to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

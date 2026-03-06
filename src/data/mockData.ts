export type Severity = "critical" | "high" | "medium" | "low" | "info";
export type AssetStatus = "active" | "idle" | "offline" | "deployed" | "maintenance";
export type AssetType = "drone" | "robot" | "ugv" | "uav" | "vehicle" | "sensor" | "camera";
export type EntityType = "person" | "asset" | "infrastructure" | "environment";
export type MissionStatus = "active" | "planned" | "completed" | "aborted";

export interface Alert {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  timestamp: Date;
  location: string;
  acknowledged: boolean;
}

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  status: AssetStatus;
  batteryLevel: number;
  location: { x: number; y: number };
  assignedMission?: string;
  capabilities: string[];
}

export interface Mission {
  id: string;
  name: string;
  status: MissionStatus;
  priority: Severity;
  assignedAssets: string[];
  startTime: Date;
  description: string;
}

export interface Entity {
  id: string;
  name: string;
  type: EntityType;
  subType: string;
  status: string;
  location: { x: number; y: number };
  attributes: Record<string, string | number>;
  relationships: { targetId: string; type: string }[];
}

export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  timestamp: Date;
  type: "alert" | "mission" | "asset" | "system";
  severity?: Severity;
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  type: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  duration: string;
  icon: string;
  tags: string[];
}

export interface TrainingSession {
  id: string;
  name: string;
  scenario: string;
  date: Date;
  duration: string;
  score: number;
  status: "completed" | "in-progress" | "scheduled";
  trainee: string;
}

// Mock Data
export const mockAlerts: Alert[] = [
  { id: "a1", title: "Fire Detected - Sector 7", description: "Thermal sensors detected fire spread in Sector 7, expanding northeast", severity: "critical", timestamp: new Date(Date.now() - 120000), location: "Sector 7-NE", acknowledged: false },
  { id: "a2", title: "Drone D-04 Low Battery", description: "UAV D-04 battery at 12%, requesting RTB authorization", severity: "high", timestamp: new Date(Date.now() - 300000), location: "Grid Ref 42.5N", acknowledged: false },
  { id: "a3", title: "Structural Integrity Warning", description: "Bridge B-12 showing stress fractures, load capacity reduced", severity: "high", timestamp: new Date(Date.now() - 600000), location: "Bridge B-12", acknowledged: true },
  { id: "a4", title: "Civilian Movement Detected", description: "12 civilians detected moving toward evacuation zone C", severity: "medium", timestamp: new Date(Date.now() - 900000), location: "Zone C perimeter", acknowledged: true },
  { id: "a5", title: "Comm Relay Restored", description: "Communication relay station R-3 back online", severity: "low", timestamp: new Date(Date.now() - 1200000), location: "Relay Station R-3", acknowledged: true },
  { id: "a6", title: "Weather Update", description: "Wind direction shifting NW, may affect fire spread model", severity: "info", timestamp: new Date(Date.now() - 1500000), location: "Area-wide", acknowledged: true },
  { id: "a7", title: "Robot R-02 Task Complete", description: "Search and rescue sweep of Building A complete, no survivors found", severity: "info", timestamp: new Date(Date.now() - 1800000), location: "Building A", acknowledged: true },
  { id: "a8", title: "Flood Warning - River Delta", description: "Water levels rising, expected breach in 2 hours", severity: "critical", timestamp: new Date(Date.now() - 60000), location: "River Delta South", acknowledged: false },
];

export const mockAssets: Asset[] = [
  { id: "d1", name: "Recon UAV Alpha", type: "uav", status: "active", batteryLevel: 87, location: { x: 35, y: 25 }, assignedMission: "m1", capabilities: ["thermal", "video", "mapping"] },
  { id: "d2", name: "Strike UAV Bravo", type: "uav", status: "active", batteryLevel: 62, location: { x: 65, y: 40 }, assignedMission: "m1", capabilities: ["thermal", "video", "payload"] },
  { id: "d3", name: "Survey UAV Charlie", type: "uav", status: "idle", batteryLevel: 95, location: { x: 20, y: 60 }, capabilities: ["lidar", "mapping", "photo"] },
  { id: "d4", name: "Recon UAV Delta", type: "uav", status: "offline", batteryLevel: 12, location: { x: 50, y: 30 }, capabilities: ["thermal", "video"] },
  { id: "r1", name: "Rescue Bot R-01", type: "robot", status: "deployed", batteryLevel: 74, location: { x: 45, y: 55 }, assignedMission: "m2", capabilities: ["lifting", "cutting", "search"] },
  { id: "r2", name: "Rescue Bot R-02", type: "robot", status: "active", batteryLevel: 56, location: { x: 55, y: 50 }, assignedMission: "m2", capabilities: ["lifting", "search", "medical"] },
  { id: "g1", name: "Patrol UGV-01", type: "ugv", status: "active", batteryLevel: 91, location: { x: 30, y: 70 }, assignedMission: "m3", capabilities: ["patrol", "surveillance", "transport"] },
  { id: "g2", name: "Supply UGV-02", type: "ugv", status: "idle", batteryLevel: 100, location: { x: 15, y: 80 }, capabilities: ["transport", "supply"] },
  { id: "v1", name: "Command Vehicle CV-1", type: "vehicle", status: "active", batteryLevel: 80, location: { x: 25, y: 45 }, assignedMission: "m1", capabilities: ["command", "comms", "medical"] },
  { id: "s1", name: "Thermal Sensor Array", type: "sensor", status: "active", batteryLevel: 99, location: { x: 70, y: 20 }, capabilities: ["thermal", "motion"] },
  { id: "c1", name: "Surveillance Cam Net", type: "camera", status: "active", batteryLevel: 100, location: { x: 40, y: 15 }, capabilities: ["video", "night-vision"] },
  { id: "d5", name: "Cargo Drone Echo", type: "drone", status: "maintenance", batteryLevel: 45, location: { x: 10, y: 35 }, capabilities: ["cargo", "delivery"] },
];

export const mockMissions: Mission[] = [
  { id: "m1", name: "Operation Firewatch", status: "active", priority: "critical", assignedAssets: ["d1", "d2", "v1"], startTime: new Date(Date.now() - 3600000), description: "Monitor and contain fire spread in Sector 7" },
  { id: "m2", name: "Urban Search & Rescue", status: "active", priority: "high", assignedAssets: ["r1", "r2"], startTime: new Date(Date.now() - 7200000), description: "Search collapsed structures for survivors" },
  { id: "m3", name: "Perimeter Patrol", status: "active", priority: "medium", assignedAssets: ["g1"], startTime: new Date(Date.now() - 1800000), description: "Secure and patrol evacuation zone perimeter" },
  { id: "m4", name: "River Delta Monitoring", status: "planned", priority: "high", assignedAssets: [], startTime: new Date(Date.now() + 3600000), description: "Deploy sensors for flood level monitoring" },
];

export const mockEntities: Entity[] = [
  { id: "p1", name: "Cdr. Sarah Chen", type: "person", subType: "Commander", status: "On Duty", location: { x: 25, y: 45 }, attributes: { organization: "FEMA", role: "Incident Commander", clearance: "Top Secret" }, relationships: [{ targetId: "m1", type: "commands" }, { targetId: "p2", type: "supervises" }] },
  { id: "p2", name: "Lt. James Park", type: "person", subType: "Operator", status: "On Duty", location: { x: 30, y: 42 }, attributes: { organization: "FEMA", role: "Drone Operator", clearance: "Secret" }, relationships: [{ targetId: "d1", type: "operates" }, { targetId: "d2", type: "operates" }] },
  { id: "p3", name: "Dr. Maria Santos", type: "person", subType: "Analyst", status: "On Duty", location: { x: 25, y: 48 }, attributes: { organization: "USGS", role: "Seismic Analyst", specialization: "Structural Assessment" }, relationships: [{ targetId: "i2", type: "monitors" }] },
  { id: "p4", name: "Sgt. Mike Torres", type: "person", subType: "First Responder", status: "Deployed", location: { x: 45, y: 55 }, attributes: { organization: "Fire Dept", role: "Squad Leader", unit: "Rescue Team Alpha" }, relationships: [{ targetId: "r1", type: "coordinates_with" }, { targetId: "m2", type: "assigned_to" }] },
  { id: "i1", name: "City Hall Complex", type: "infrastructure", subType: "Building", status: "Intact", location: { x: 40, y: 30 }, attributes: { capacity: 500, floors: 8, type: "Government" }, relationships: [] },
  { id: "i2", name: "Highway Bridge B-12", type: "infrastructure", subType: "Bridge", status: "Damaged", location: { x: 60, y: 45 }, attributes: { span: "120m", loadCapacity: "40t", condition: "Compromised" }, relationships: [{ targetId: "a3", type: "source_of" }] },
  { id: "i3", name: "Power Station PS-1", type: "infrastructure", subType: "Power Station", status: "Operational", location: { x: 75, y: 65 }, attributes: { output: "500MW", fuelType: "Natural Gas", backupPower: "Yes" }, relationships: [] },
  { id: "e1", name: "Fire Zone Alpha", type: "environment", subType: "Fire Zone", status: "Active", location: { x: 55, y: 25 }, attributes: { area: "2.5 sq km", intensity: "High", spreadRate: "NE at 5km/h" }, relationships: [{ targetId: "m1", type: "target_of" }] },
  { id: "e2", name: "Flood Risk Zone", type: "environment", subType: "Flood Zone", status: "Warning", location: { x: 35, y: 75 }, attributes: { area: "1.8 sq km", waterLevel: "Rising", timeToBreech: "2h" }, relationships: [{ targetId: "m4", type: "target_of" }] },
];

export const mockTimeline: TimelineEvent[] = [
  { id: "t1", title: "Flood warning issued", description: "River Delta water levels exceeding threshold", timestamp: new Date(Date.now() - 60000), type: "alert", severity: "critical" },
  { id: "t2", title: "Fire detected in Sector 7", description: "Thermal imaging confirms active fire", timestamp: new Date(Date.now() - 120000), type: "alert", severity: "critical" },
  { id: "t3", title: "Operation Firewatch launched", description: "3 assets deployed for fire monitoring", timestamp: new Date(Date.now() - 300000), type: "mission" },
  { id: "t4", title: "UAV D-04 battery critical", description: "Requesting return to base", timestamp: new Date(Date.now() - 600000), type: "asset", severity: "high" },
  { id: "t5", title: "Bridge B-12 stress alert", description: "Structural integrity compromised", timestamp: new Date(Date.now() - 900000), type: "alert", severity: "high" },
  { id: "t6", title: "Search & Rescue started", description: "Robots deployed to collapsed structures", timestamp: new Date(Date.now() - 1200000), type: "mission" },
  { id: "t7", title: "Civilian evacuation update", description: "12 civilians approaching Zone C", timestamp: new Date(Date.now() - 1500000), type: "alert", severity: "medium" },
  { id: "t8", title: "Comm relay R-3 restored", description: "Communications re-established", timestamp: new Date(Date.now() - 1800000), type: "system", severity: "low" },
  { id: "t9", title: "Perimeter patrol initiated", description: "UGV-01 deployed to Zone C", timestamp: new Date(Date.now() - 2100000), type: "mission" },
  { id: "t10", title: "System startup complete", description: "All sensors online and calibrated", timestamp: new Date(Date.now() - 3600000), type: "system", severity: "info" },
];

export const mockScenarios: Scenario[] = [
  { id: "sc1", name: "Wildfire Response", description: "Coordinate aerial and ground assets to monitor and contain a spreading wildfire across mountainous terrain", type: "disaster", difficulty: 3, duration: "45 min", icon: "Flame", tags: ["fire", "aerial", "evacuation"] },
  { id: "sc2", name: "Urban Flood Crisis", description: "Manage flood response in a metropolitan area with rising water levels and trapped civilians", type: "disaster", difficulty: 4, duration: "60 min", icon: "Waves", tags: ["flood", "urban", "rescue"] },
  { id: "sc3", name: "Earthquake Aftermath", description: "Deploy search and rescue teams to collapsed structures after a 7.2 magnitude earthquake", type: "disaster", difficulty: 5, duration: "90 min", icon: "Mountain", tags: ["earthquake", "search-rescue", "triage"] },
  { id: "sc4", name: "Infrastructure Failure", description: "Respond to cascading power grid failure affecting hospital and emergency services", type: "infrastructure", difficulty: 3, duration: "30 min", icon: "Zap", tags: ["power", "critical-infra", "coordination"] },
  { id: "sc5", name: "Mass Evacuation", description: "Coordinate evacuation of 50,000 civilians from a coastal city ahead of a hurricane", type: "evacuation", difficulty: 4, duration: "75 min", icon: "Users", tags: ["evacuation", "logistics", "transport"] },
  { id: "sc6", name: "Multi-Agency Response", description: "Coordinate between fire, police, medical, and military assets during a chemical plant incident", type: "crisis", difficulty: 5, duration: "120 min", icon: "Shield", tags: ["multi-agency", "hazmat", "command"] },
  { id: "sc7", name: "Tactical Reconnaissance", description: "Deploy UAV swarm for tactical area reconnaissance and threat assessment", type: "military", difficulty: 3, duration: "40 min", icon: "Crosshair", tags: ["military", "reconnaissance", "UAV"] },
  { id: "sc8", name: "Epidemic Containment", description: "Manage quarantine zones and medical supply distribution during a disease outbreak", type: "crisis", difficulty: 4, duration: "60 min", icon: "Activity", tags: ["epidemic", "medical", "logistics"] },
];

export const mockTrainingSessions: TrainingSession[] = [
  { id: "ts1", name: "Wildfire Response Drill", scenario: "Wildfire Response", date: new Date(Date.now() - 86400000), duration: "42 min", score: 87, status: "completed", trainee: "Lt. Park" },
  { id: "ts2", name: "Flood Crisis Exercise", scenario: "Urban Flood Crisis", date: new Date(Date.now() - 172800000), duration: "58 min", score: 72, status: "completed", trainee: "Sgt. Torres" },
  { id: "ts3", name: "Earthquake SAR Training", scenario: "Earthquake Aftermath", date: new Date(Date.now() - 259200000), duration: "85 min", score: 91, status: "completed", trainee: "Cdr. Chen" },
  { id: "ts4", name: "Evacuation Drill", scenario: "Mass Evacuation", date: new Date(), duration: "—", score: 0, status: "in-progress", trainee: "Lt. Park" },
  { id: "ts5", name: "Multi-Agency Exercise", scenario: "Multi-Agency Response", date: new Date(Date.now() + 86400000), duration: "—", score: 0, status: "scheduled", trainee: "Full Team" },
];

export function getAssetIcon(type: AssetType): string {
  switch (type) {
    case "uav": case "drone": return "Plane";
    case "robot": return "Bot";
    case "ugv": return "Truck";
    case "vehicle": return "Car";
    case "sensor": return "Radio";
    case "camera": return "Camera";
    default: return "Box";
  }
}

export function getStatusColor(status: AssetStatus): string {
  switch (status) {
    case "active": case "deployed": return "text-severity-low";
    case "idle": return "text-severity-medium";
    case "offline": return "text-severity-critical";
    case "maintenance": return "text-muted-foreground";
    default: return "text-foreground";
  }
}

export function getSeverityColor(severity: Severity): string {
  switch (severity) {
    case "critical": return "bg-severity-critical";
    case "high": return "bg-severity-high";
    case "medium": return "bg-severity-medium";
    case "low": return "bg-severity-low";
    case "info": return "bg-severity-info";
  }
}

export function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

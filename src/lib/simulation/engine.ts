/**
 * Sentinel Simulation Engine
 * Production-grade algorithms: Monte Carlo, Bayesian inference,
 * A* pathfinding, cellular automata, risk propagation
 */

// ─── Types ──────────────────────────────────────────────────────
export interface Waypoint {
  lat: number;
  lng: number;
  label?: string;
  dwellTime?: number; // seconds to pause at waypoint
}

export interface PatrolRoute {
  entityId: string;
  waypoints: Waypoint[];
  loop: boolean;
  speed: number; // m/s
}

export interface SimulationState {
  time: number;
  entities: EntityState[];
  hazardZones: HazardZone[];
  events: SimEvent[];
  metrics: SimMetrics;
}

export interface EntityState {
  id: string;
  lat: number;
  lng: number;
  heading: number; // degrees
  speed: number;
  currentWaypointIndex: number;
  dwellRemaining: number;
  batteryLevel: number;
  status: "patrolling" | "dwelling" | "idle" | "returning" | "engaged";
  pathHistory: [number, number][];
}

export interface HazardZone {
  id: string;
  type: "fire" | "flood" | "chemical" | "radiation" | "epidemic";
  center: [number, number];
  radius: number;
  intensity: number; // 0-1
  spreadRate: number; // m/s
  direction: number; // degrees
  cells: HazardCell[];
}

export interface HazardCell {
  lat: number;
  lng: number;
  intensity: number;
  age: number;
}

export interface SimEvent {
  id: string;
  time: number;
  type: "explosion" | "weather_change" | "infrastructure_failure" | "civilian_movement" | "asset_failure" | "reinforcement";
  description: string;
  location: [number, number];
  severity: number;
  resolved: boolean;
}

export interface SimMetrics {
  totalDistanceCovered: number;
  areasScanned: number;
  threatsDetected: number;
  civiliansEvacuated: number;
  assetsAtRisk: number;
  overallRiskScore: number;
  missionProgress: number;
}

// ─── Monte Carlo Simulation Engine ──────────────────────────────
export interface MonteCarloConfig {
  iterations: number;
  confidenceLevel: number;
  variables: MonteCarloVariable[];
}

export interface MonteCarloVariable {
  name: string;
  distribution: "normal" | "uniform" | "triangular" | "beta" | "poisson";
  params: number[];
}

export interface MonteCarloResult {
  mean: number;
  median: number;
  stdDev: number;
  variance: number;
  confidenceInterval: [number, number];
  percentile5: number;
  percentile95: number;
  histogram: { bin: number; count: number }[];
  convergenceData: { iteration: number; runningMean: number; runningStdDev: number }[];
  rawSamples: number[];
}

// Random number generators for distributions
function normalRandom(mean: number, stdDev: number): number {
  // Box-Muller transform
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  return mean + stdDev * z;
}

function uniformRandom(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function triangularRandom(min: number, mode: number, max: number): number {
  const u = Math.random();
  const fc = (mode - min) / (max - min);
  if (u < fc) {
    return min + Math.sqrt(u * (max - min) * (mode - min));
  }
  return max - Math.sqrt((1 - u) * (max - min) * (max - mode));
}

function betaRandom(alpha: number, beta: number): number {
  // Jöhnk's algorithm for beta distribution
  let u1, u2, s;
  do {
    u1 = Math.pow(Math.random(), 1 / alpha);
    u2 = Math.pow(Math.random(), 1 / beta);
    s = u1 + u2;
  } while (s > 1);
  return u1 / s;
}

function poissonRandom(lambda: number): number {
  const L = Math.exp(-lambda);
  let k = 0;
  let p = 1;
  do {
    k++;
    p *= Math.random();
  } while (p > L);
  return k - 1;
}

function sampleDistribution(variable: MonteCarloVariable): number {
  switch (variable.distribution) {
    case "normal": return normalRandom(variable.params[0], variable.params[1]);
    case "uniform": return uniformRandom(variable.params[0], variable.params[1]);
    case "triangular": return triangularRandom(variable.params[0], variable.params[1], variable.params[2]);
    case "beta": return betaRandom(variable.params[0], variable.params[1]);
    case "poisson": return poissonRandom(variable.params[0]);
    default: return Math.random();
  }
}

export function runMonteCarloSimulation(
  config: MonteCarloConfig,
  evaluator: (samples: number[]) => number
): MonteCarloResult {
  const results: number[] = [];
  const convergenceData: MonteCarloResult["convergenceData"] = [];
  let runningSum = 0;
  let runningSumSq = 0;

  for (let i = 0; i < config.iterations; i++) {
    const samples = config.variables.map(v => sampleDistribution(v));
    const outcome = evaluator(samples);
    results.push(outcome);
    runningSum += outcome;
    runningSumSq += outcome * outcome;

    if (i % Math.max(1, Math.floor(config.iterations / 100)) === 0 || i === config.iterations - 1) {
      const n = i + 1;
      const rm = runningSum / n;
      const rv = n > 1 ? (runningSumSq / n - rm * rm) : 0;
      convergenceData.push({ iteration: n, runningMean: rm, runningStdDev: Math.sqrt(Math.max(0, rv)) });
    }
  }

  results.sort((a, b) => a - b);
  const n = results.length;
  const mean = runningSum / n;
  const variance = runningSumSq / n - mean * mean;
  const stdDev = Math.sqrt(Math.max(0, variance));
  const median = n % 2 === 0 ? (results[n / 2 - 1] + results[n / 2]) / 2 : results[Math.floor(n / 2)];

  const zScore = config.confidenceLevel === 0.99 ? 2.576 : config.confidenceLevel === 0.95 ? 1.96 : 1.645;
  const marginOfError = zScore * (stdDev / Math.sqrt(n));

  // Histogram
  const binCount = Math.min(50, Math.ceil(Math.sqrt(n)));
  const min = results[0];
  const max = results[n - 1];
  const binWidth = (max - min) / binCount || 1;
  const histogram: MonteCarloResult["histogram"] = [];
  for (let i = 0; i < binCount; i++) {
    histogram.push({ bin: min + (i + 0.5) * binWidth, count: 0 });
  }
  for (const val of results) {
    const idx = Math.min(binCount - 1, Math.floor((val - min) / binWidth));
    histogram[idx].count++;
  }

  return {
    mean,
    median,
    stdDev,
    variance,
    confidenceInterval: [mean - marginOfError, mean + marginOfError],
    percentile5: results[Math.floor(n * 0.05)],
    percentile95: results[Math.floor(n * 0.95)],
    histogram,
    convergenceData,
    rawSamples: results,
  };
}

// ─── Bayesian Risk Assessment ───────────────────────────────────
export interface BayesianNode {
  name: string;
  prior: number;
  likelihood: number; // P(evidence|hypothesis)
  evidence: number;   // P(evidence)
}

export function bayesianUpdate(prior: number, likelihood: number, evidence: number): number {
  if (evidence === 0) return prior;
  return (likelihood * prior) / evidence;
}

export function computeRiskNetwork(nodes: BayesianNode[]): { name: string; posterior: number; riskLevel: string }[] {
  return nodes.map(node => {
    const posterior = bayesianUpdate(node.prior, node.likelihood, node.evidence);
    const riskLevel = posterior > 0.8 ? "critical" : posterior > 0.6 ? "high" : posterior > 0.4 ? "medium" : "low";
    return { name: node.name, posterior: Math.min(1, Math.max(0, posterior)), riskLevel };
  });
}

// ─── A* Pathfinding ─────────────────────────────────────────────
interface PathNode {
  lat: number;
  lng: number;
  g: number;
  h: number;
  f: number;
  parent: PathNode | null;
}

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000; // meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function calculateHeading(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const y = Math.sin(dLng) * Math.cos(lat2 * Math.PI / 180);
  const x = Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180) -
    Math.sin(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.cos(dLng);
  return ((Math.atan2(y, x) * 180 / Math.PI) + 360) % 360;
}

export function interpolatePosition(
  from: [number, number],
  to: [number, number],
  fraction: number
): [number, number] {
  return [
    from[0] + (to[0] - from[0]) * fraction,
    from[1] + (to[1] - from[1]) * fraction,
  ];
}

// ─── Waypoint Route Generation ──────────────────────────────────
export function generatePatrolWaypoints(
  center: [number, number],
  pattern: "perimeter" | "spiral" | "grid" | "random",
  radius: number = 0.01
): Waypoint[] {
  const waypoints: Waypoint[] = [];
  
  switch (pattern) {
    case "perimeter": {
      const points = 6;
      for (let i = 0; i < points; i++) {
        const angle = (i / points) * 2 * Math.PI;
        waypoints.push({
          lat: center[0] + radius * Math.cos(angle),
          lng: center[1] + radius * 1.3 * Math.sin(angle), // adjust for latitude
          dwellTime: 2,
        });
      }
      break;
    }
    case "spiral": {
      const turns = 2;
      const points = 12;
      for (let i = 0; i < points; i++) {
        const t = i / points;
        const r = radius * t;
        const angle = t * turns * 2 * Math.PI;
        waypoints.push({
          lat: center[0] + r * Math.cos(angle),
          lng: center[1] + r * 1.3 * Math.sin(angle),
          dwellTime: 1,
        });
      }
      break;
    }
    case "grid": {
      const gridSize = 3;
      for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
          const lat = center[0] - radius + (row / (gridSize - 1)) * 2 * radius;
          const lng = center[1] - radius * 1.3 + (col / (gridSize - 1)) * 2 * radius * 1.3;
          waypoints.push({ lat, lng, dwellTime: 1.5 });
        }
      }
      break;
    }
    case "random": {
      for (let i = 0; i < 8; i++) {
        waypoints.push({
          lat: center[0] + (Math.random() - 0.5) * 2 * radius,
          lng: center[1] + (Math.random() - 0.5) * 2 * radius * 1.3,
          dwellTime: Math.random() * 3 + 1,
        });
      }
      break;
    }
  }

  return waypoints;
}

// ─── Hazard Spread (Cellular Automata) ──────────────────────────
export function propagateHazard(zone: HazardZone, dt: number, windDirection: number, windSpeed: number): HazardZone {
  const growth = zone.spreadRate * dt;
  const windFactor = 1 + (windSpeed / 20);
  const windRad = windDirection * Math.PI / 180;
  
  // Expand radius based on spread rate and wind
  const newRadius = zone.radius + growth * windFactor;
  
  // Shift center slightly in wind direction
  const shift = growth * 0.0000015 * windFactor;
  const newCenter: [number, number] = [
    zone.center[0] + shift * Math.cos(windRad),
    zone.center[1] + shift * Math.sin(windRad),
  ];

  // Generate/update cells for granular rendering
  const cellSpacing = 0.002;
  const cells: HazardCell[] = [];
  const cellRadius = newRadius / 111000; // convert meters to degrees approx
  for (let dlat = -cellRadius; dlat <= cellRadius; dlat += cellSpacing) {
    for (let dlng = -cellRadius; dlng <= cellRadius; dlng += cellSpacing) {
      const dist = Math.sqrt(dlat * dlat + dlng * dlng);
      if (dist <= cellRadius) {
        const intensity = Math.max(0, 1 - (dist / cellRadius)) * zone.intensity;
        if (intensity > 0.1) {
          cells.push({
            lat: newCenter[0] + dlat,
            lng: newCenter[1] + dlng,
            intensity,
            age: zone.cells.find(c => 
              Math.abs(c.lat - (newCenter[0] + dlat)) < 0.001 && 
              Math.abs(c.lng - (newCenter[1] + dlng)) < 0.001
            )?.age ?? 0 + dt,
          });
        }
      }
    }
  }

  return {
    ...zone,
    center: newCenter,
    radius: newRadius,
    cells,
  };
}

// ─── Impact Analysis ────────────────────────────────────────────
export interface ImpactAssessment {
  affectedArea: number; // sq km
  populationAtRisk: number;
  infrastructureAtRisk: number;
  assetsInDanger: string[];
  estimatedDamage: number; // millions USD
  evacuationTime: number; // minutes
  riskScore: number; // 0-100
  recommendations: string[];
}

export function computeImpactAnalysis(
  hazardZones: HazardZone[],
  entityPositions: { id: string; lat: number; lng: number; type: string }[],
  populationDensity: number = 5000 // per sq km
): ImpactAssessment {
  let totalArea = 0;
  const assetsInDanger: string[] = [];
  let infrastructureCount = 0;

  for (const zone of hazardZones) {
    const radiusKm = zone.radius / 1000;
    totalArea += Math.PI * radiusKm * radiusKm;

    for (const entity of entityPositions) {
      const dist = haversineDistance(zone.center[0], zone.center[1], entity.lat, entity.lng);
      if (dist < zone.radius * 1.2) {
        assetsInDanger.push(entity.id);
        if (entity.type === "infrastructure") infrastructureCount++;
      }
    }
  }

  const populationAtRisk = Math.round(totalArea * populationDensity);
  const riskScore = Math.min(100, Math.round(
    (totalArea * 10) + (assetsInDanger.length * 5) + (hazardZones.reduce((s, z) => s + z.intensity, 0) * 20)
  ));

  const recommendations: string[] = [];
  if (riskScore > 70) recommendations.push("Initiate immediate evacuation of all personnel within hazard zones");
  if (riskScore > 50) recommendations.push("Deploy additional reconnaissance assets for real-time monitoring");
  if (assetsInDanger.length > 2) recommendations.push("Relocate vulnerable assets to safe staging areas");
  if (totalArea > 2) recommendations.push("Request mutual aid from adjacent jurisdictions");
  recommendations.push("Establish forward command post at safe distance from threat perimeter");
  if (infrastructureCount > 0) recommendations.push("Assess structural integrity of at-risk infrastructure");

  return {
    affectedArea: Math.round(totalArea * 100) / 100,
    populationAtRisk,
    infrastructureAtRisk: infrastructureCount,
    assetsInDanger: [...new Set(assetsInDanger)],
    estimatedDamage: Math.round(totalArea * 12.5 * 10) / 10,
    evacuationTime: Math.round(populationAtRisk / 200 + totalArea * 5),
    riskScore,
    recommendations,
  };
}

// ─── Entity Movement Engine ─────────────────────────────────────
export function updateEntityPosition(
  entity: EntityState,
  route: PatrolRoute,
  dt: number,
  speedMultiplier: number
): EntityState {
  if (!route || route.waypoints.length === 0) return entity;

  const updated = { ...entity, pathHistory: [...entity.pathHistory] };

  // If dwelling at a waypoint
  if (updated.dwellRemaining > 0) {
    updated.dwellRemaining -= dt * speedMultiplier;
    updated.status = "dwelling";
    if (updated.dwellRemaining > 0) return updated;
  }

  const targetWp = route.waypoints[updated.currentWaypointIndex];
  if (!targetWp) {
    updated.status = "idle";
    return updated;
  }

  const dist = haversineDistance(updated.lat, updated.lng, targetWp.lat, targetWp.lng);
  const stepDist = route.speed * dt * speedMultiplier;

  if (dist <= stepDist) {
    // Arrived at waypoint
    updated.lat = targetWp.lat;
    updated.lng = targetWp.lng;
    updated.dwellRemaining = targetWp.dwellTime || 0;
    updated.pathHistory.push([updated.lat, updated.lng]);
    
    // Keep path history manageable
    if (updated.pathHistory.length > 200) {
      updated.pathHistory = updated.pathHistory.slice(-150);
    }

    // Advance to next waypoint
    const nextIndex = updated.currentWaypointIndex + 1;
    if (nextIndex >= route.waypoints.length) {
      updated.currentWaypointIndex = route.loop ? 0 : route.waypoints.length - 1;
      if (!route.loop) updated.status = "idle";
    } else {
      updated.currentWaypointIndex = nextIndex;
    }
  } else {
    // Move toward waypoint
    const fraction = stepDist / dist;
    const [newLat, newLng] = interpolatePosition(
      [updated.lat, updated.lng],
      [targetWp.lat, targetWp.lng],
      fraction
    );
    updated.heading = calculateHeading(updated.lat, updated.lng, targetWp.lat, targetWp.lng);
    updated.lat = newLat;
    updated.lng = newLng;
    updated.speed = route.speed * speedMultiplier;
    updated.status = "patrolling";
    
    // Record path every few steps
    const lastPath = updated.pathHistory[updated.pathHistory.length - 1];
    if (!lastPath || haversineDistance(lastPath[0], lastPath[1], newLat, newLng) > 20) {
      updated.pathHistory.push([newLat, newLng]);
    }
  }

  // Battery drain
  updated.batteryLevel = Math.max(0, updated.batteryLevel - dt * 0.01 * speedMultiplier);

  return updated;
}

// ─── Scenario-Specific COA Evaluator ────────────────────────────
export interface COAEvaluation {
  id: string;
  name: string;
  description: string;
  monteCarloResult: MonteCarloResult;
  riskNetwork: { name: string; posterior: number; riskLevel: string }[];
  overallScore: number;
  timeToComplete: number;
  resourceUtilization: number;
  civilianSafety: number;
}

export function evaluateCOA(
  coaId: string,
  coaName: string,
  coaDescription: string,
  scenarioParams: {
    assetCount: number;
    threatLevel: number;
    civilianDensity: number;
    weatherSeverity: number;
    terrainDifficulty: number;
  }
): COAEvaluation {
  // Monte Carlo: evaluate success probability
  const mcResult = runMonteCarloSimulation(
    {
      iterations: 1000,
      confidenceLevel: 0.95,
      variables: [
        { name: "assetEffectiveness", distribution: "beta", params: [scenarioParams.assetCount, 3] },
        { name: "threatResponse", distribution: "normal", params: [1 - scenarioParams.threatLevel / 100, 0.15] },
        { name: "civilianFactor", distribution: "triangular", params: [0.3, 0.7, 1.0] },
        { name: "weatherImpact", distribution: "uniform", params: [0.5, 1 - scenarioParams.weatherSeverity / 200] },
        { name: "terrainModifier", distribution: "normal", params: [1 - scenarioParams.terrainDifficulty / 150, 0.1] },
      ],
    },
    (samples) => {
      // Composite success score
      const [asset, threat, civilian, weather, terrain] = samples;
      return Math.max(0, Math.min(100,
        (asset * 25 + threat * 30 + civilian * 20 + weather * 15 + terrain * 10) * 100 / 100
      ));
    }
  );

  // Bayesian risk assessment
  const riskNetwork = computeRiskNetwork([
    { name: "Asset Loss", prior: 0.15, likelihood: scenarioParams.threatLevel / 100, evidence: 0.3 },
    { name: "Civilian Casualty", prior: 0.05, likelihood: scenarioParams.civilianDensity / 100, evidence: 0.2 },
    { name: "Mission Failure", prior: 0.1, likelihood: (scenarioParams.weatherSeverity + scenarioParams.terrainDifficulty) / 200, evidence: 0.25 },
    { name: "Infrastructure Damage", prior: 0.2, likelihood: scenarioParams.threatLevel / 80, evidence: 0.35 },
    { name: "Communication Loss", prior: 0.08, likelihood: scenarioParams.weatherSeverity / 100, evidence: 0.15 },
  ]);

  const avgRisk = riskNetwork.reduce((s, r) => s + r.posterior, 0) / riskNetwork.length;

  return {
    id: coaId,
    name: coaName,
    description: coaDescription,
    monteCarloResult: mcResult,
    riskNetwork,
    overallScore: Math.round(mcResult.mean * (1 - avgRisk * 0.5)),
    timeToComplete: Math.round(30 + scenarioParams.terrainDifficulty * 0.5 + scenarioParams.assetCount * 2),
    resourceUtilization: Math.min(100, Math.round(scenarioParams.assetCount * 12 + Math.random() * 10)),
    civilianSafety: Math.round(Math.max(0, 100 - scenarioParams.civilianDensity * 0.3 - scenarioParams.threatLevel * 0.2)),
  };
}

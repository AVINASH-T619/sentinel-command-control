## Sentinel — Simulation & Decision Training Platform

### Design System

- **Dark theme** with modern color themes, clean typography (Inter/system font)
- Modern SaaS aesthetic (Linear/Vercel-inspired): minimal chrome, generous spacing, glass-morphism cards
- Color-coded severity levels (green → yellow → orange → red)
- Consistent iconography using Lucide icons
- Modern icons for all assets like drones, robots, UGVs , UAVs, Combat vehicles , fires etc.
- Use modern and real world maps for realtime simulations where necessary 

---

### Pages & Layout

**App Shell**: Sidebar navigation + top command bar with global search and notifications

#### 1. **Operational Dashboard** (`/`)

- **Status overview cards**: Active missions, deployed assets, active alerts, personnel count
- **Live map panel** (interactive grid/SVG map showing asset positions, incident zones, hazard areas)
- **Alert feed**: Real-time scrollable alert list with severity badges
- **Asset status table**: Drones, robots, vehicles with status indicators (active/idle/offline)
- **Activity timeline**: Chronological event log with filtering

#### 2. **Scenario Simulation** (`/simulations`)

- **Scenario library**: Cards for disaster types (fire, flood, evacuation, etc.) with difficulty ratings
- **Simulation workspace**: 
  - Map view with entity placement (drag entities onto the map grid)
  - Simulation controls: Play / Pause / Step / Speed slider / Reset
  - Event injection panel (instructor can trigger: explosion, weather change, infrastructure failure)
  - Real-time status panel showing agent states, environmental conditions
  - Timeline scrubber for replay
- **Scenario builder**: Create custom scenarios with configurable parameters (terrain, weather, asset count, civilian population)

#### 3. **AI Decision Center** (`/decisions`)

- **Situation analysis panel**: AI-generated summary of current scenario state
- **Strategy cards**: AI-generated response strategies with success probability scores (Monte Carlo-style)
- **Strategy comparison view**: Side-by-side comparison of 2-3 strategies on safety, efficiency, speed
- **Decision log**: History of decisions made with outcomes and scoring
- Uses Lovable AI (Gemini) to generate real strategy recommendations based on scenario context

#### 4. **Entity Explorer** (`/entities`)

- **Entity browser**: Filterable list/grid of all entities (people, assets, infrastructure)
- **Entity detail view**: Attributes, relationships, location, status history
- **Relationship graph**: Visual node-link diagram showing entity connections (e.g., Drone → observes → Location)

#### 5. **Training & Reports** (`/training`)

- **Training session list**: Past and scheduled sessions
- **Performance scorecard**: Trainee decision accuracy, response times, mission outcomes
- **Session replay**: Step through past simulation with annotated decisions

---

### Simulation Engine (Frontend)

- Time-step simulation loop using requestAnimationFrame
- Agent behavior: movement along paths, task assignment, status changes
- Environment modeling: fire spread (cell automata), flood zones expanding over time
- Probabilistic outcomes: randomized event triggers, success/failure rolls
- All computed client-side with mock data — no backend required initially

### AI Integration

- Edge function calling Lovable AI Gateway
- Given a scenario state (entities, events, conditions), AI generates:
  - Situation summary
  - 3-5 ranked strategy recommendations with probability scores
  - Risk assessments
- Streaming responses displayed in the Decision Center

### Data Model (In-Memory)

- Entities: People, Assets, Infrastructure, Environment zones
- Events: Timestamped incidents with type, severity, location
- Relationships: Entity-to-entity connections
- Simulation state: Time step, active agents, environmental grid
- All stored in React state/context initially — ready to migrate to Supabase later

---

### Key Interactions

- Click map zones to see details and assign assets
- Drag-and-drop entity placement in scenario builder
- Real-time simulation with visual updates (moving agents, spreading hazards)
- AI generates recommendations on-demand when user clicks "Analyze"
- Instructor can inject events mid-simulation via control panel
- It should also have map interface which will help in doing tactical analysis of various simulations like military warfare or epidemic spread or fire spread etc.
- Also add functionality which will do and tell real time impact analysis and areas affected.
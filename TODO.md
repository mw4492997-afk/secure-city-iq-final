# TODO: Unified Dashboard Implementation

## Tasks
- [x] Update src/app/page.tsx to arrange Radar, Terminal, Topology, and ThreatCharts in a 2x2 grid layout
- [x] Ensure hexagonal background CSS is applied
- [ ] Add video background or overlay if assets are available
- [x] Remove navigation to separate pages (topology, security) since it's a single dashboard
- [ ] Test the layout and ensure components are properly imported

## Components Mapping
- Radar: RadarHUD
- Terminal: TerminalLogs
- Topology: ThreatMap
- ThreatCharts: SecurityCharts

## Layout Plan
- Top-left: ThreatCharts (SecurityCharts)
- Top-right: Topology (ThreatMap)
- Bottom-left: Terminal (TerminalLogs)
- Bottom-right: Radar (RadarHUD)

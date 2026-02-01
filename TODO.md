# TODO: Create Single-Page Dashboard

## Steps to Complete
- [ ] Add necessary imports to src/app/page.tsx (Tabs, ThreatMap, ThreatCard, icons, motion)
- [ ] Add state variables for vulnerability scanner (url, isScanning, scanResult)
- [ ] Define StatBox component inline in src/app/page.tsx
- [ ] Update header navigation to remove /topology and /security links
- [ ] Replace left column with Tabs component for 'Threat Analysis' and 'Neural Topology'
- [ ] Implement 'Threat Analysis' tab: SecurityCharts + vulnerability scanner form and results
- [ ] Implement 'Neural Topology' tab: ThreatMap + stats grid + action grid with ThreatCards
- [ ] Add handleScan function for scanner logic
- [ ] Ensure TerminalLogs and RadarHUD remain always visible in middle and right columns
- [ ] Test tab switching, scanner functionality, and layout responsiveness
- [ ] Verify unified Command Center works as expected

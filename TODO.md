# TODO: Transform Dashboard to Real Tool

## SCAN_URL Integration with Real APIs
- [ ] Update `python-app/vulnerability_scanner.py` to integrate VirusTotal API
- [ ] Add environment variable handling for VirusTotal API key
- [ ] Update response format to include real threat data from VirusTotal

## NET_STAT Real IP/Location Integration
- [ ] Create new API endpoint `/api/net-stat/route.ts` for IP geolocation
- [ ] Update `src/components/TerminalLogs.tsx` to call new net-stat endpoint
- [ ] Use free IP geolocation API (ipapi.co)

## Dependencies and Configuration
- [ ] Update `python-app/requirements.txt` if additional libraries needed
- [ ] Add environment variables for API keys

## Testing and Validation
- [ ] Test SCAN_URL with real URLs
- [ ] Test NET_STAT with real IP/location data
- [ ] Handle API rate limits and errors gracefully

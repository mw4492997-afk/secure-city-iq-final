# TODO: Add Phone Tracker Button to Dashboard

## Tasks to Complete:
- [x] Add FontAwesome CSS link in the <head> section of templates/dashboard.html
- [x] Add CSS for pulsing animation on the icon and neon green border for the new button
- [x] Insert the 7th action-card in the actions-grid with pulsing fa-phone-alt icon, "SIGNAL INTERCEPTOR" label, and onclick="openModal('TELECOM INTELLIGENCE')"
- [x] Update the openModal() function to add a case for 'TELECOM INTELLIGENCE': play the cyber sound (playTypingSound), display a modal with a map, phone number input, and target profile status
- [x] Add initPhoneTrackerMap() function: initializes Leaflet map, adds input event listener; if number starts with +964, flyTo Iraq coordinates with zoom 6, update status to [INTERCEPTING...] then [LOCATED] after 2 seconds
- [ ] Test the new button and modal functionality locally
- [x] Run git add ., git commit -m "Added Signal Interceptor Button and Linked Phone Tracking", git push origin master

# SECURE CITY INTELLIGENCE

Advanced security intelligence platform for comprehensive threat monitoring and response coordination.

## Overview

SECURE CITY INTELLIGENCE is a cutting-edge Next.js-based application designed to provide robust security monitoring, threat detection, and response capabilities. Built with modern web technologies, it offers a comprehensive dashboard for real-time threat analysis, vulnerability scanning, and emergency response coordination.

## Features

- **Real-time Threat Monitoring**: Continuous surveillance and alerting for security threats
- **Vulnerability Scanning**: Integrated IP and URL scanning capabilities
- **Emergency Response**: Lockdown protocols and rapid response coordination
- **Terminal Interface**: Command-line style interaction for advanced operations
- **Radar System**: Visual threat detection and mapping
- **Security Reports**: Automated generation of system and threat reports
- **Network Statistics**: Real-time network monitoring and analysis

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm, yarn, pnpm, or bun package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd secure-city-intelligence
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser to access the application.

## Project Structure

- `src/app/` - Next.js app router pages and API routes
- `src/components/` - Reusable React components
- `src/lib/` - Utility functions and configurations
- `public/` - Static assets
- `python-app/` - Backend Python services for vulnerability scanning

## API Endpoints

- `/api/scan-vulnerability` - Vulnerability scanning service
- `/api/net-stat` - Network statistics
- `/api/security-reports` - Security report generation

## Technologies Used

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Python (Flask for additional services)
- **Database**: Supabase for data storage and real-time features
- **UI Components**: Custom components with shadcn/ui
- **Animations**: Framer Motion

## Security Features

- Authentication portal with secure access controls
- Encrypted communications
- Real-time threat detection algorithms
- Emergency lockdown protocols
- Comprehensive logging and auditing

## User Guide

### Terminal Commands

The application features a command-line style terminal interface for advanced operations. Use the terminal input at the bottom of the right sidebar to execute commands.

#### Basic Commands

- `help` - Display available commands
- `clear` - Clear the terminal logs
- `lockdown` - Initiate emergency lockdown protocol
- `decrypt` - Simulate packet decryption
- `trace` - Network tracing operations
- `nodes` - Display node information

#### Secret Commands

These are advanced, undocumented commands that trigger special system behaviors. Use with caution:

- `/OVERRIDE` - Changes the entire UI glow color from Neon Green to 'Alert Red' and plays a warning sound
- `/RECON` - Triggers a rapid-fire sequence of IP scans on random global targets in the terminal logs
- `/GHOST` - Sets the UI opacity to 50% to simulate a 'Stealth Mode' for discreet operations
- `/SUDO_ACCESS` - Displays a scrolling text of 'Decrypted Passwords' in the terminal for visual effect
- `/SAFE` - Reverts all colors and settings back to the default Green professional mode

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting pull requests.

## License

This project is proprietary software. All rights reserved.

## Support

For support and inquiries, please contact the development team.

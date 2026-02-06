"use client";

import { useState, useEffect, useRef } from "react";
import RadarHUD from "@/components/RadarHUD";
import TerminalLogs from "@/components/TerminalLogs";
import SecurityPortal from "@/components/SecurityPortal";
import ThreatMap from "@/components/ThreatMap";
import { Toaster, toast } from "sonner";
import {
  Shield, Lock, AlertTriangle, CheckCircle, XCircle,
  Loader2, Activity, Globe, Database, Server,
  Terminal, ShieldCheck, Zap, Menu, Bell, User,
  ArrowRight, Search, BarChart3, Radio, Scan,
  Wifi, Layers, Eye, Target, Cpu as CpuIcon,
  ShieldAlert, HardDrive, Network, Key,
  Fingerprint, Cpu, ZapOff, RefreshCcw,
  Maximize2, Crosshair, Map as MapIcon,
  Activity as PulseIcon, ShieldX, TerminalSquare,
  LockKeyhole, Signal, Binary, DatabaseZap, FileText, X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CyberPulse from "@/components/CyberPulse";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1
  }
};

export default function Home() {
  const [consoleLogs, setConsoleLogs] = useState<string[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [emergency, setEmergency] = useState(false);
  const [command, setCommand] = useState("");
  const [redAlert, setRedAlert] = useState(false);
  const [scanTarget, setScanTarget] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [osintResults, setOsintResults] = useState<any>(null);
  const [isOsintScanning, setIsOsintScanning] = useState(false);
  const [showLogsModal, setShowLogsModal] = useState(false);
  const [logsHistory, setLogsHistory] = useState<string[]>([]);
  const [logsSearch, setLogsSearch] = useState("");
  const [showAuditLogsModal, setShowAuditLogsModal] = useState(false);
  const [showKaliToolset, setShowKaliToolset] = useState(false);
  const [isProcessingTool, setIsProcessingTool] = useState(false);
  const [liveLogs, setLiveLogs] = useState<string[]>([]);
  const [isLiveFeedConnected, setIsLiveFeedConnected] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [headerInfo, setHeaderInfo] = useState("NODE: OSL-CENTRAL // CRYPTO_SECURED");
  const [showSecurityCard, setShowSecurityCard] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [lockPassword, setLockPassword] = useState("");
  const [isAlertMode, setIsAlertMode] = useState(false);
  const [isStealthMode, setIsStealthMode] = useState(false);
  const [systemStats, setSystemStats] = useState({
    cpu: 12,
    ram: 45,
    network: 1.2,
    threats: 3,
    uptime: "124:12:44",
    encryption: 256,
    encryptionKey: 'AES-256-GCM-' + Math.random().toString(36).substr(2, 16).toUpperCase()
  });

  const [firewallBlocks, setFirewallBlocks] = useState(1247);

  const [activeThreats, setActiveThreats] = useState([
    { id: 1, type: "DDoS Attempt", origin: "RU_NODE_X", severity: "High", time: "2s ago" },
    { id: 2, type: "SQL Injection", origin: "CN_PROXY_0", severity: "Medium", time: "15s ago" },
    { id: 3, type: "Brute Force", origin: "UNKNOWN_IP", severity: "Low", time: "1m ago" },
    { id: 4, type: "Malware Payload", origin: "DE_STUTTGART", severity: "High", time: "5s ago" },
  ]);

  const [networkMetrics, setNetworkMetrics] = useState({
    connectionType: 'unknown',
    downlink: 0,
    rtt: 0
  });

  const [networkStability, setNetworkStability] = useState<number[]>([]);

const [nodeLatencies, setNodeLatencies] = useState({
  '8.8.8.8': 0,
  '1.1.1.1': 0
});

const [testLabMode, setTestLabMode] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    const baseCpu = (navigator.hardwareConcurrency || 4) * 10; // Scale CPU cores to percentage
    const baseRam = ((navigator as any).deviceMemory || 8) * 10; // Scale RAM to percentage
    const interval = setInterval(() => {
      setSystemStats(prev => ({
        ...prev,
        cpu: Math.min(100, Math.max(0, baseCpu + (Math.random() * 20 - 10))),
        ram: Math.min(100, Math.max(0, baseRam + (Math.random() * 10 - 5))),
        network: Math.max(0.1, prev.network + (Math.random() * 0.8 - 0.4)),
        threats: Math.max(0, prev.threats + (Math.random() > 0.85 ? 1 : Math.random() < 0.15 ? -1 : 0))
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  useEffect(() => {
    document.documentElement.setAttribute("data-emergency", emergency.toString());
  }, [emergency]);

  useEffect(() => {
    const authStatus = localStorage.getItem("authenticated");
    if (authStatus === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  // Professional Voice Alerts - System Initialization
  useEffect(() => {
    if (isAuthenticated && window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance('System initialized. All modules operational. Network monitoring active.');
      utterance.rate = 0.8;
      utterance.pitch = 0.8;
      utterance.volume = 0.7;
      window.speechSynthesis.speak(utterance);
    }
  }, [isAuthenticated]);

  // Real-Time Network Analytics
  useEffect(() => {
    if (isAuthenticated) {
      const updateNetworkMetrics = () => {
        const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
        if (connection) {
          const newDownlink = connection.downlink || 0;
          setNetworkMetrics({
            connectionType: connection.effectiveType || 'unknown',
            downlink: newDownlink,
            rtt: connection.rtt || 0
          });

          // Update network stability chart
          setNetworkStability(prev => {
            const newStability = [...prev, Math.min(100, Math.max(0, newDownlink * 10))];
            return newStability.slice(-20); // Keep last 20 points
          });
        }
      };

      updateNetworkMetrics();
      const interval = setInterval(updateNetworkMetrics, 5000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  // Fallback: Generate small random fluctuations every second for active chart appearance
  useEffect(() => {
    if (isAuthenticated && activeTab === 'signal') {
      const interval = setInterval(() => {
        setNetworkStability(prev => {
          if (prev.length === 0) return prev;
          const lastValue = prev[prev.length - 1];
          const fluctuation = (Math.random() - 0.5) * 1; // ±0.5 Mbps fluctuation
          const newValue = Math.min(100, Math.max(0, lastValue + fluctuation));
          return [...prev.slice(1), newValue]; // Shift and add new point
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, activeTab]);

  // Global Node Latency - Ping Function
  useEffect(() => {
    if (isAuthenticated && activeTab === 'topology') {
      const ping = async (url: string): Promise<number> => {
        const start = performance.now();
        try {
          await fetch(url, { method: 'HEAD', mode: 'no-cors' });
          return performance.now() - start;
        } catch {
          return -1;
        }
      };

      const updateLatencies = async () => {
        const [googleLatency, cloudflareLatency] = await Promise.all([
          ping('https://8.8.8.8'),
          ping('https://1.1.1.1')
        ]);

        setNodeLatencies({
          '8.8.8.8': googleLatency > 0 ? Math.round(googleLatency) : 0,
          '1.1.1.1': cloudflareLatency > 0 ? Math.round(cloudflareLatency) : 0
        });
      };

      updateLatencies();
      const interval = setInterval(updateLatencies, 10000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, activeTab]);

  // Firewall Intrusion Simulation - Logs simulated blocks when firewall tab is active
  useEffect(() => {
    if (isAuthenticated && activeTab === 'firewall') {
      const maliciousIPs = [
        '185.12.4.92', '203.0.113.1', '198.51.100.1', '192.0.2.1',
        '10.0.0.1', '172.16.0.1', '192.168.1.1', '127.0.0.1'
      ];

      const intrusionTypes = [
        'DDoS Attempt', 'SQL Injection', 'Brute Force', 'Malware Payload',
        'Port Scan', 'XSS Attack', 'CSRF Attempt', 'Directory Traversal'
      ];

      const logIntrusion = () => {
        const ip = maliciousIPs[Math.floor(Math.random() * maliciousIPs.length)];
        const type = intrusionTypes[Math.floor(Math.random() * intrusionTypes.length)];
        const severity = Math.random() > 0.7 ? 'High' : Math.random() > 0.4 ? 'Medium' : 'Low';

        setConsoleLogs(prev => [...prev.slice(-15), `[${new Date().toLocaleTimeString()}] FIREWALL_BLOCK: ${type} from ${ip} - ${severity} threat neutralized`]);
        setFirewallBlocks(prev => prev + 1);

        // Voice alert for high severity
        if (severity === 'High' && window.speechSynthesis) {
          const utterance = new SpeechSynthesisUtterance(`High threat blocked from ${ip}`);
          utterance.rate = 0.9;
          utterance.pitch = 0.7;
          utterance.volume = 0.6;
          window.speechSynthesis.speak(utterance);
        }
      };

      const interval = setInterval(logIntrusion, 3000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, activeTab]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(() => {
      const logs = [
        "HEURISTIC ANALYSIS: 98.4% Confidence Score",
        "BLOCKING IP: 185.12.4.92 (Excessive Handshakes)",
        "ENCRYPTION ROTATED: Key SHA-512 Refreshed",
        "SIGNAL INTERCEPT: Proxy-Layer-4 Decrypted",
        "DATABASE SHARDING: Node-Asia Balanced",
        "INTRUSION DETECTED: Node 14 - Auto-Quarantined",
        "FIREWALL: Rule #402 Updated for Zero-Day Protection",
        "MALWARE SCAN: Clean - 0 objects found in Buffer",
        "UPTIME STABLE: All microservices responding in <4ms",
        "AI_SENTINEL: Pattern matching complete. No anomalies.",
        "KERNEL: Memory allocation optimized for threat analysis"
      ];
      const newLog = `[${new Date().toLocaleTimeString()}] ${logs[Math.floor(Math.random() * logs.length)]}`;
      setConsoleLogs(prev => [...prev.slice(-25), newLog]);
    }, 3500);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetch('https://ipapi.co/json/')
      .then(res => res.json())
      .then(data => {
        setConsoleLogs(prev => [...prev.slice(-25), `[${new Date().toLocaleTimeString()}] IP DETECTED: ${data.ip} | CITY: ${data.city} | ISP: ${data.org}`]);
        setHeaderInfo(`NODE: ${data.city} // ${data.org}`);
      })
      .catch(err => {
        setConsoleLogs(prev => [...prev.slice(-25), `[${new Date().toLocaleTimeString()}] IP FETCH FAILED: ${err.message}`]);
      });
  }, [isAuthenticated]);

  // Live logs monitoring
  useEffect(() => {
    if (!isAuthenticated || !showAuditLogsModal) return;

    const fetchLiveLogs = async () => {
      try {
        const response = await fetch('/api/live-logs');
        if (response.ok) {
          const data = await response.json();
          setLiveLogs(data.logs);
          setIsLiveFeedConnected(true);
        }
      } catch (error) {
        console.error('Failed to fetch live logs:', error);
        setIsLiveFeedConnected(false);
      }
    };

    // Initial fetch
    fetchLiveLogs();

    // Poll every 2 seconds
    const interval = setInterval(fetchLiveLogs, 2000);

    return () => clearInterval(interval);
  }, [isAuthenticated, showAuditLogsModal]);

  const handleAccessGranted = () => {
    setIsAuthenticated(true);
    localStorage.setItem("authenticated", "true");
    toast.success("BIOMETRIC VERIFIED. WELCOME ADMIN.");
  };

  const handleActivateLockdown = () => {
    const nextState = !redAlert;
    setRedAlert(nextState);
    document.documentElement.setAttribute("data-red-alert", nextState.toString());
    
    if (nextState) {
      toast.error("PROTOCOL 9-RED: TOTAL LOCKDOWN ENGAGED");
      setConsoleLogs(prev => [...prev.slice(-15), `[${new Date().toLocaleTimeString()}] !!! CRITICAL: FULL SYSTEM ISOLATION INITIATED !!!`]);
    } else {
      toast.success("Lockdown terminated. Syncing nodes...");
      setConsoleLogs(prev => [...prev.slice(-15), `[${new Date().toLocaleTimeString()}] STATUS: Security level normalized. Re-establishing uplinks.`]);
    }
  };

  const handleQuickScan = async () => {
    if (!scanTarget.trim()) return;
    setIsScanning(true);
    setScanResult(null);
    toast.info(`Initializing Neural Scan: ${scanTarget}`);

    try {
      const response = await fetch(`https://ipapi.co/${scanTarget.trim()}/json/`);

      if (!response.ok) throw new Error("Invalid IP or network error");

      const data = await response.json();

      // Calculate Risk Score based on IP type
      let riskScore = 50; // Base score
      const hostingProviders = ['amazon', 'microsoft', 'google', 'digitalocean', 'linode', 'vultr', 'hetzner'];
      const isHostingProvider = hostingProviders.some(provider => data.org?.toLowerCase().includes(provider));

      if (isHostingProvider) {
        riskScore = 85; // High monitoring required
      } else if (data.country_name === 'United States') {
        riskScore = 25; // Low risk
      } else {
        riskScore = 60; // Medium risk
      }

      // Map IP API response to scanResult format
      const scanResult = {
        severity: riskScore > 80 ? 'High' : riskScore > 50 ? 'Medium' : 'Low',
        vulnerabilities: [], // No vulnerabilities for IP scan
        ssl_info: { valid: true }, // Assume valid for IP
        ip: data.ip,
        city: data.city,
        country: data.country_name,
        org: data.org,
        riskScore: riskScore
      };

      setScanResult(scanResult);

      // Professional Voice Alert
      if (window.speechSynthesis) {
        const voiceAlert = new SpeechSynthesisUtterance(`Target identified. Location: ${data.city}. ISP: ${data.org}. Security clearance: Verified.`);
        voiceAlert.rate = 0.8;
        voiceAlert.pitch = 0.8;
        voiceAlert.volume = 0.7;
        window.speechSynthesis.speak(voiceAlert);
      }

      setConsoleLogs(prev => [...prev.slice(-15),
        `[${new Date().toLocaleTimeString()}] NEURAL_SCAN: Analysis finished for target ${scanTarget}`,
        `[${new Date().toLocaleTimeString()}] IP_LOCATED: ${data.ip} | ${data.city}, ${data.country_name} | ${data.org}`,
        `[${new Date().toLocaleTimeString()}] RISK_ASSESS: Score ${riskScore}/100 - ${riskScore > 80 ? 'High Monitoring Required' : riskScore > 50 ? 'Medium Risk' : 'Low Risk'}`,
        `[${new Date().toLocaleTimeString()}] VULN_ASSESS: 0 vulnerabilities mapped`
      ]);
      toast.success(`Analysis Complete. Risk score: ${riskScore}/100.`);
    } catch (error) {
      toast.error("Scan engine timed out. Target might be invalid IP.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleCommand = (cmd: string) => {
    const commandText = cmd.trim().toLowerCase();
    if (!commandText) return;

    if (commandText === 'help') {
      setConsoleLogs(prev => [...prev.slice(-15),
        "COMMAND_LIST: scan, status, clear, lockdown, decrypt, trace, nodes, /scan_user",
        "SECRET_COMMANDS: /OVERRIDE, /RECON, /GHOST, /SUDO_ACCESS, /SAFE"
      ]);
    } else if (commandText === 'clear') {
      setConsoleLogs([]);
    } else if (commandText === 'lockdown') {
      handleActivateLockdown();
    } else if (commandText === 'decrypt') {
      toast.promise(new Promise(res => setTimeout(res, 2000)), {
        loading: 'Decrypting packet buffer...',
        success: 'Decryption complete. No hidden payloads.',
        error: 'Decryption failed.'
      });
    } else if (commandText === '/override') {
      setIsAlertMode(true);
      if (window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance('Alert mode activated. System override engaged.');
        utterance.rate = 0.9;
        utterance.pitch = 0.7;
        utterance.volume = 0.8;
        window.speechSynthesis.speak(utterance);
      }
      setConsoleLogs(prev => [...prev.slice(-15), `[${new Date().toLocaleTimeString()}] ALERT_MODE: UI color scheme changed to Alert Red`]);
      toast.error("ALERT MODE ACTIVATED - SYSTEM OVERRIDE");
    } else if (commandText === '/recon') {
      const targets = ['192.168.1.1', '10.0.0.1', '172.16.0.1', '8.8.8.8', '1.1.1.1', '208.67.222.222'];
      let index = 0;
      const interval = setInterval(() => {
        if (index >= targets.length) {
          clearInterval(interval);
          return;
        }
        const target = targets[index];
        setConsoleLogs(prev => [...prev.slice(-15), `[${new Date().toLocaleTimeString()}] RECON_SCAN: Scanning ${target} - ${Math.random() > 0.5 ? 'OPEN' : 'CLOSED'}`]);
        index++;
      }, 300);
      toast.info("RECON MODE ACTIVATED - Rapid IP scanning initiated");
    } else if (commandText === '/ghost') {
      setIsStealthMode(true);
      setConsoleLogs(prev => [...prev.slice(-15), `[${new Date().toLocaleTimeString()}] STEALTH_MODE: UI opacity reduced to 50%`]);
      toast.success("STEALTH MODE ACTIVATED - Discreet operations enabled");
    } else if (commandText === '/sudo_access') {
      const passwords = [
        'admin:password123',
        'root:qwerty',
        'user:letmein',
        'system:admin123',
        'network:securepass',
        'database:dbadmin',
        'server:serverpass',
        'api:key123456'
      ];
      passwords.forEach((pwd, i) => {
        setTimeout(() => {
          setConsoleLogs(prev => [...prev.slice(-15), `[${new Date().toLocaleTimeString()}] DECRYPTED: ${pwd}`]);
        }, i * 200);
      });
      toast.warning("SUDO ACCESS GRANTED - Passwords decrypted");
    } else if (commandText.startsWith('/scan_user ')) {
      const username = commandText.split(' ')[1];
      if (!username) {
        setConsoleLogs(prev => [...prev.slice(-15), `[${new Date().toLocaleTimeString()}] ERROR: Username required. Usage: /scan_user [username]`]);
        return;
      }

      // Voice alert
      if (window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance(`Initializing OSINT search for target ${username}`);
        utterance.rate = 0.8;
        utterance.pitch = 0.8;
        utterance.volume = 0.7;
        window.speechSynthesis.speak(utterance);
      }

      setIsOsintScanning(true);
      setOsintResults(null);

      // Simulate loading logs
      setConsoleLogs(prev => [...prev.slice(-15),
        `[${new Date().toLocaleTimeString()}] OSINT_INIT: Starting username analysis for ${username}`,
        `[${new Date().toLocaleTimeString()}] ACCESSING: Global databases...`,
        `[${new Date().toLocaleTimeString()}] SCANNING: Social media nodes...`
      ]);

      // Call OSINT API
      fetch('/api/osint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.error) {
            throw new Error(data.error);
          }

          setOsintResults(data.results);

          // Add completion logs
          setConsoleLogs(prev => [...prev.slice(-15),
            `[${new Date().toLocaleTimeString()}] OSINT_COMPLETE: Analysis finished for ${username}`,
            `[${new Date().toLocaleTimeString()}] RESULTS: ${data.results.filter((r: any) => r.found).length} platforms found`
          ]);

          toast.success(`OSINT scan complete. Found on ${data.results.filter((r: any) => r.found).length} platforms.`);
        })
        .catch(error => {
          setConsoleLogs(prev => [...prev.slice(-15), `[${new Date().toLocaleTimeString()}] OSINT_ERROR: ${error.message}`]);
          toast.error("OSINT scan failed. Check username and try again.");
        })
        .finally(() => {
          setIsOsintScanning(false);
        });
    } else if (commandText.startsWith('/nmap_scan ')) {
      const target = commandText.split(' ')[1];
      if (!target) {
        setConsoleLogs(prev => [...prev.slice(-15), `[${new Date().toLocaleTimeString()}] ERROR: Target required. Usage: /nmap_scan [target]`]);
        return;
      }

      // Show processing animation
      setIsProcessingTool(true);
      setConsoleLogs(prev => [...prev.slice(-15), `[${new Date().toLocaleTimeString()}] PROCESSING...`]);

      // Simulate nmap scan
      setTimeout(() => {
        const openPorts = [22, 80, 443, 8080].filter(() => Math.random() > 0.5);
        const results = openPorts.map(port => `Port ${port}: OPEN - ${port === 22 ? 'SSH' : port === 80 ? 'HTTP' : port === 443 ? 'HTTPS' : 'HTTP-ALT'}`);

        setConsoleLogs(prev => [...prev.slice(-15),
          `[${new Date().toLocaleTimeString()}] NMAP_SCAN: Starting port scan for ${target}`,
          ...results,
          `[${new Date().toLocaleTimeString()}] SCAN_COMPLETE: Found ${openPorts.length} open ports on ${target}`
        ]);

        setIsProcessingTool(false);
        toast.success(`Nmap scan complete. ${openPorts.length} open ports found.`);
      }, 3000);
    } else if (commandText.startsWith('/dns_lookup ')) {
      const domain = commandText.split(' ')[1];
      if (!domain) {
        setConsoleLogs(prev => [...prev.slice(-15), `[${new Date().toLocaleTimeString()}] ERROR: Domain required. Usage: /dns_lookup [domain]`]);
        return;
      }

      // Show processing animation
      setIsProcessingTool(true);
      setConsoleLogs(prev => [...prev.slice(-15), `[${new Date().toLocaleTimeString()}] PROCESSING...`]);

      // Simulate DNS lookup
      setTimeout(() => {
        const records = [
          `A: ${domain} -> 192.168.1.1`,
          `MX: ${domain} -> mail.${domain}`,
          `NS: ${domain} -> ns1.${domain}`,
          `TXT: ${domain} -> "v=spf1 -all"`
        ];

        setConsoleLogs(prev => [...prev.slice(-15),
          `[${new Date().toLocaleTimeString()}] DNS_LOOKUP: Resolving records for ${domain}`,
          ...records,
          `[${new Date().toLocaleTimeString()}] LOOKUP_COMPLETE: DNS enumeration finished for ${domain}`
        ]);

        setIsProcessingTool(false);
        toast.success(`DNS lookup complete for ${domain}.`);
      }, 2500);
    } else if (commandText.startsWith('/vuln_scan ')) {
      const target = commandText.split(' ')[1];
      if (!target) {
        setConsoleLogs(prev => [...prev.slice(-15), `[${new Date().toLocaleTimeString()}] ERROR: Target required. Usage: /vuln_scan [target]`]);
        return;
      }

      // Show processing animation
      setIsProcessingTool(true);
      setConsoleLogs(prev => [...prev.slice(-15), `[${new Date().toLocaleTimeString()}] PROCESSING...`]);

      // Simulate vulnerability scan
      setTimeout(() => {
        const vulnerabilities = [
          'CVE-2023-1234: Remote Code Execution - HIGH',
          'CVE-2023-5678: SQL Injection - MEDIUM',
          'CVE-2023-9012: XSS Vulnerability - LOW'
        ].filter(() => Math.random() > 0.6);

        setConsoleLogs(prev => [...prev.slice(-15),
          `[${new Date().toLocaleTimeString()}] VULN_SCAN: Starting vulnerability assessment for ${target}`,
          ...vulnerabilities,
          `[${new Date().toLocaleTimeString()}] SCAN_COMPLETE: Found ${vulnerabilities.length} vulnerabilities on ${target}`
        ]);

        setIsProcessingTool(false);
        toast.success(`Vulnerability scan complete. ${vulnerabilities.length} issues found.`);
      }, 4000);
    } else if (commandText === '/safe') {
      setIsAlertMode(false);
      setIsStealthMode(false);
      setConsoleLogs(prev => [...prev.slice(-15), `[${new Date().toLocaleTimeString()}] SAFE_MODE: All settings reverted to default Green mode`]);
      toast.success("SAFE MODE ACTIVATED - System normalized");
    } else {
      setConsoleLogs(prev => [...prev.slice(-15), `SYSTEM_RUN: ${commandText}`]);
      setTimeout(() => {
        setConsoleLogs(prev => [...prev.slice(-15), `[${new Date().toLocaleTimeString()}] Process ID ${Math.floor(Math.random() * 9999)} completed`]);
      }, 800);
    }
  };

  const handleVulnerabilityScan = async () => {
    if (!scanTarget.trim()) return;
    setIsScanning(true);

    // Voice alert
    if (window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance('Vulnerability scan initiated');
      utterance.rate = 0.8;
      utterance.pitch = 0.8;
      utterance.volume = 0.7;
      window.speechSynthesis.speak(utterance);
    }

    // Simulate scanning common ports
    const ports = [80, 443, 8080, 22, 21, 25, 53, 110, 143, 993];
    const scanResults: string[] = [];

    for (const port of ports) {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate scan time
      const isOpen = Math.random() > 0.7; // Simulate some ports being open
      if (isOpen) {
        scanResults.push(`Port ${port}: OPEN - ${port === 80 ? 'HTTP' : port === 443 ? 'HTTPS' : port === 22 ? 'SSH' : 'Unknown Service'}`);
      }
    }

    setConsoleLogs(prev => [...prev.slice(-15),
      `[${new Date().toLocaleTimeString()}] VULN_SCAN: Starting comprehensive port analysis for ${scanTarget}`,
      ...scanResults.map(result => `[${new Date().toLocaleTimeString()}] ${result}`),
      `[${new Date().toLocaleTimeString()}] SCAN_COMPLETE: Analysis finished. ${scanResults.length} open ports detected.`
    ]);

    toast.success(`Vulnerability scan complete. ${scanResults.length} open ports found.`);
    setIsScanning(false);
  };

  const handleKeyRotation = () => {
    const newKey = 'AES-256-GCM-' + Math.random().toString(36).substr(2, 16).toUpperCase();
    setSystemStats(prev => ({ ...prev, encryptionKey: newKey }));

    // Voice alert
    if (window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance('Keys rotated successfully');
      utterance.rate = 0.8;
      utterance.pitch = 0.8;
      utterance.volume = 0.7;
      window.speechSynthesis.speak(utterance);
    }

    setConsoleLogs(prev => [...prev.slice(-15),
      `[${new Date().toLocaleTimeString()}] KEY_ROTATION: Initiating cryptographic key rotation...`,
      `[${new Date().toLocaleTimeString()}] ENCRYPTION_UPDATE: New AES-256-GCM key generated`,
      `[${new Date().toLocaleTimeString()}] VAULT_UPDATE: All encrypted sessions updated with new key`
    ]);

    toast.success("Encryption keys rotated successfully.");
  };

  const handleUnlock = () => {
    if (lockPassword.toLowerCase() === 'orchids') {
      setIsLocked(false);
      setLockPassword('');
      toast.success("Terminal unlocked. Access restored.");
    } else {
      toast.error("Invalid passphrase. Access denied.");
    }
  };

  const handleLaunchSimulatedAttack = () => {
    if (!testLabMode) {
      toast.error("Test Lab mode must be enabled first.");
      return;
    }

    toast.info("LAUNCHING SIMULATED ATTACK SEQUENCE...");

    // Simulate Brute Force attack
    const bruteForceIPs = ['192.168.1.100', '10.0.0.50', '172.16.0.25'];
    const sqlInjectionPayloads = ["' OR '1'='1", "admin'--", "'; DROP TABLE users;--"];

    let attackIndex = 0;
    const totalAttacks = 10;

    const simulateAttack = () => {
      if (attackIndex >= totalAttacks) {
        // Assessment complete
        setConsoleLogs(prev => [...prev.slice(-15),
          `[${new Date().toLocaleTimeString()}] [TEST_MODE] VULNERABILITY ASSESSMENT COMPLETE: SYSTEM SECURE`,
          `[${new Date().toLocaleTimeString()}] [TEST_MODE] All simulated threats neutralized successfully.`
        ]);
        toast.success("VULNERABILITY ASSESSMENT COMPLETE: SYSTEM SECURE");
        return;
      }

      const isBruteForce = Math.random() > 0.5;
      const ip = bruteForceIPs[Math.floor(Math.random() * bruteForceIPs.length)];
      const type = isBruteForce ? 'Brute Force' : 'SQL Injection';
      const payload = isBruteForce ? 'Attempting password crack' : sqlInjectionPayloads[Math.floor(Math.random() * sqlInjectionPayloads.length)];

      // Display incoming malicious packet
      setConsoleLogs(prev => [...prev.slice(-15),
        `[${new Date().toLocaleTimeString()}] [TEST_MODE] INCOMING MALICIOUS PACKET: ${type} from ${ip}`,
        `[${new Date().toLocaleTimeString()}] [TEST_MODE] PAYLOAD: ${payload}`
      ]);

      // Simulate firewall block
      setTimeout(() => {
        setConsoleLogs(prev => [...prev.slice(-15),
          `[${new Date().toLocaleTimeString()}] [TEST_MODE] FIREWALL_BLOCK: ${type} from ${ip} - Threat neutralized`
        ]);
        setFirewallBlocks(prev => prev + 1);
        attackIndex++;
        setTimeout(simulateAttack, 1500); // Next attack in 1.5 seconds
      }, 500);
    };

    simulateAttack();
  };

  if (!isAuthenticated) {
    return <SecurityPortal onAccessGranted={handleAccessGranted} />;
  }

  if (!isAuthenticated) {
    return <SecurityPortal onAccessGranted={handleAccessGranted} />;
  }

  return (
    <div className={`min-h-screen bg-[#020202] text-zinc-300 font-mono selection:bg-[var(--active-neon)] selection:text-black overflow-hidden relative ${redAlert ? 'animate-pulse bg-red-950/20' : ''} ${isAlertMode ? 'alert-mode' : ''} ${isStealthMode ? 'stealth-mode' : ''}`}>
      {/* Cinematic Background Layer */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#0a0a0a_0%,#000_100%)]" />
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
        
        {/* Dynamic Light Streaks */}
        <motion.div 
          animate={{ x: [-1000, 2000], opacity: [0, 0.5, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/4 left-0 w-[500px] h-[1px] bg-gradient-to-r from-transparent via-[var(--active-neon)] to-transparent blur-sm" 
        />
        <motion.div 
          animate={{ x: [2000, -1000], opacity: [0, 0.3, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-3/4 left-0 w-[800px] h-[1px] bg-gradient-to-r from-transparent via-blue-500 to-transparent blur-sm" 
        />
      </div>
      
      {/* Red Alert Overlay */}
      <AnimatePresence>
        {redAlert && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] pointer-events-none border-[20px] border-red-500/20 shadow-[inset_0_0_100px_rgba(239,68,68,0.3)] animate-pulse"
          />
        )}
      </AnimatePresence>
      
      <div className="crt-overlay pointer-events-none fixed inset-0 z-50 opacity-[0.01]" />
      <Toaster position="bottom-right" theme="dark" closeButton />
      <CyberPulse />

      {/* Ultra-High-End Navigation */}
      <nav className="fixed top-0 left-0 right-0 h-20 border-b border-white/5 bg-black/80 backdrop-blur-2xl z-40 px-8 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <motion.div 
            whileHover={{ scale: 1.05, rotate: 90 }}
            className="w-12 h-12 bg-gradient-to-tr from-[var(--active-neon)]/20 to-emerald-500/20 border border-[var(--active-neon)]/40 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(0,255,153,0.15)] group transition-all"
          >
            <ShieldCheck className="w-7 h-7 text-[var(--active-neon)] group-hover:scale-110 transition-transform" />
          </motion.div>
          <div>
            <div className="flex items-baseline gap-2">
              <h1 className="text-white font-black tracking-[-0.05em] text-2xl">ORCHIDS</h1>
              <span className="text-[var(--active-neon)] font-black text-2xl">INTEL</span>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em]">
              <div className="flex gap-1">
                {[1,2,3].map(i => <div key={i} className="w-1 h-1 rounded-full bg-green-500 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />)}
              </div>
              {headerInfo}
            </div>
          </div>
        </div>

        {/* Global Live Stats Bar */}
        <div className="hidden xl:flex items-center gap-10 bg-white/5 px-8 py-3 rounded-full border border-white/5 backdrop-blur-md">
          <NavStatV3 label="CPU LOAD" value={`${systemStats.cpu.toFixed(0)}%`} progress={systemStats.cpu} color="neon" />
          <div className="w-[1px] h-6 bg-white/10" />
          <NavStatV3 label="ENCRYPTION" value={`${systemStats.encryption} BIT`} progress={100} color="blue" />
          <div className="w-[1px] h-6 bg-white/10" />
          <NavStatV3 label="ACTIVE THREATS" value={systemStats.threats.toString()} progress={systemStats.threats * 10} color="red" />
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden sm:flex flex-col items-end mr-2">
            <span className="text-[10px] text-zinc-500 font-black tracking-widest uppercase">UPTIME</span>
            <span className="text-xs font-black text-white">{systemStats.uptime}</span>
          </div>
          <button
            onClick={() => {
              setShowLogsModal(true);
              // Voice alert
              if (window.speechSynthesis) {
                const utterance = new SpeechSynthesisUtterance('Opening system execution logs. Secure City IQ history loaded.');
                utterance.rate = 0.8;
                utterance.pitch = 0.8;
                utterance.volume = 0.7;
                window.speechSynthesis.speak(utterance);
              }
            }}
            className="relative w-11 h-11 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center transition-all group"
            title="View System Logs"
          >
            <FileText className="w-5 h-5 text-zinc-400 group-hover:text-[var(--active-neon)]" />
          </button>
          <button className="relative w-11 h-11 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center transition-all group">
            <Bell className="w-5 h-5 text-zinc-400 group-hover:text-white" />
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-black animate-ping" />
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-black" />
          </button>
          <div className="flex items-center gap-4 pl-4 border-l border-white/10">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-black text-white leading-none mb-1">SUPER_USER</div>
              <div className="text-[9px] text-[var(--active-neon)] font-black uppercase tracking-widest">CLEARANCE LVL 5</div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-zinc-800 to-zinc-950 border border-white/10 p-[1px] shadow-2xl cursor-pointer" onClick={() => setShowSecurityCard(true)}>
              <div className="w-full h-full rounded-[inherit] bg-black flex items-center justify-center hover:bg-[var(--active-neon)]/5 transition-all">
                <User className="w-6 h-6 text-zinc-400 hover:text-[var(--active-neon)] transition-colors" />
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main OS Layout */}
      <div className="pt-20 h-screen flex">
        
        {/* Left Nav Menu - Sophisticated */}
        <aside className="w-72 border-r border-white/5 bg-black/40 backdrop-blur-md hidden lg:flex flex-col">
          <div className="p-8 flex-1 space-y-10 overflow-y-auto custom-scrollbar">
            <div>
              <h3 className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.4em] mb-6 flex items-center gap-2">
                <div className="w-4 h-[1px] bg-zinc-800" /> SYSTEM CONTROL
              </h3>
              <div className="space-y-1.5">
                <MenuLink icon={<BarChart3 className="w-4 h-4" />} label="Command Center" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
                <MenuLink icon={<Globe className="w-4 h-4" />} label="Global Intelligence" active={activeTab === 'intelligence'} onClick={() => setActiveTab('intelligence')} />
                <MenuLink icon={<Network className="w-4 h-4" />} label="Node Topology" active={activeTab === 'topology'} onClick={() => setActiveTab('topology')} />
                <MenuLink icon={<Radio className="w-4 h-4" />} label="Signal Intercept" active={activeTab === 'signal'} onClick={() => setActiveTab('signal')} />
              </div>
            </div>
            
            <div>
              <h3 className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.4em] mb-6 flex items-center gap-2">
                <div className="w-4 h-[1px] bg-zinc-800" /> DEFENSE DEPT
              </h3>
              <div className="space-y-1.5">
                <MenuLink icon={<ShieldAlert className="w-4 h-4" />} label="Active Firewall" onClick={() => setActiveTab('firewall')} />
                <MenuLink icon={<FileText className="w-4 h-4" />} label="SYSTEM AUDIT LOGS" onClick={() => {
                  setShowAuditLogsModal(true);
                  // Voice alert
                  if (window.speechSynthesis) {
                    const utterance = new SpeechSynthesisUtterance('Loading central archive. Accessing Secure City IQ audit trails.');
                    utterance.rate = 0.8;
                    utterance.pitch = 0.8;
                    utterance.volume = 0.7;
                    window.speechSynthesis.speak(utterance);
                  }
                }} />
                <MenuLink icon={<Terminal className="w-4 h-4" />} label="KALI TOOLSET" onClick={() => {
                  setShowKaliToolset(true);
                  // Voice alert
                  if (window.speechSynthesis) {
                    const utterance = new SpeechSynthesisUtterance('Accessing Kali Toolset Archive');
                    utterance.rate = 0.8;
                    utterance.pitch = 0.8;
                    utterance.volume = 0.7;
                    window.speechSynthesis.speak(utterance);
                  }
                }} />
                <MenuLink icon={<Scan className="w-4 h-4" />} label="Vulnerability Scan" onClick={() => setActiveTab('scan')} />
                <MenuLink icon={<Key className="w-4 h-4" />} label="Keys & Vaults" onClick={() => setActiveTab('vaults')} />
                <MenuLink icon={<Fingerprint className="w-4 h-4" />} label="Biometric Logs" onClick={() => setActiveTab('biometric')} />
                <MenuLink icon={<Zap className="w-4 h-4" />} label="LAUNCH SIMULATED ATTACK" onClick={() => handleLaunchSimulatedAttack()} />
              </div>
            </div>

            <div className="pt-4">
               <div className="p-6 rounded-3xl bg-gradient-to-br from-zinc-900/50 to-black border border-white/5 space-y-4 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                    <ShieldCheck className="w-12 h-12" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-zinc-500 font-black uppercase">Core Integrity</span>
                    <span className="text-xs text-[var(--active-neon)] font-black">STABLE</span>
                  </div>
                  <div className="flex gap-1.5 h-6 items-end">
                    {[40, 70, 45, 90, 65, 80, 50, 95, 85].map((h, i) => (
                      <motion.div 
                        key={i}
                        className="flex-1 bg-[var(--active-neon)]/30 rounded-t-sm"
                        animate={{ height: `${h}%` }}
                        transition={{ duration: 1, repeat: Infinity, repeatType: 'reverse', delay: i * 0.1 }}
                      />
                    ))}
                  </div>
               </div>
            </div>

            <div className="pt-4">
               <h3 className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.4em] mb-6 flex items-center gap-2">
                <div className="w-4 h-[1px] bg-zinc-800" /> DATA STREAM
              </h3>
              <div className="h-40 overflow-hidden bg-black/40 rounded-2xl border border-white/5 relative">
                <DataStream />
              </div>
            </div>
          </div>
          
          <div className="p-6 border-t border-white/5">
            <button 
              onClick={handleActivateLockdown}
              className={`w-full py-4 rounded-2xl border font-black text-[10px] uppercase tracking-[0.3em] transition-all duration-700 flex items-center justify-center gap-4 group ${
                redAlert 
                ? 'bg-red-500 border-red-500 text-white shadow-[0_0_50px_rgba(239,68,68,0.4)] animate-pulse' 
                : 'bg-zinc-900/50 border-white/10 text-zinc-400 hover:border-red-500/50 hover:text-red-500 hover:bg-red-500/5'
              }`}
            >
              {redAlert ? <ZapOff className="w-4 h-4 animate-bounce" /> : <Lock className="w-4 h-4 group-hover:rotate-12 transition-transform" />}
              {redAlert ? 'RELEASE PROTOCOLS' : 'INITIATE LOCKDOWN'}
            </button>
          </div>
        </aside>

        {/* Main Intelligence Workspace */}
        <main className="flex-1 overflow-y-auto relative custom-scrollbar">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-10 max-w-[1600px] mx-auto space-y-12 pb-32"
              >
            
            {/* Cinematic Intelligence Banner */}
            <motion.div 
              variants={itemVariants}
              className="relative min-h-[500px] rounded-[3rem] overflow-hidden border border-white/5 bg-[#050505] shadow-[0_0_100px_rgba(0,0,0,0.5)] group"
            >
              {/* Animated Background Visual */}
              <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(0,255,153,0.1)_0%,transparent_70%)]" />
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                  <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                </div>
                <div className="absolute right-[-5%] top-[-5%] w-[900px] h-[900px] opacity-15">
                   <RadarHUD />
                </div>
              </div>

              {/* Decorative Tech Corners */}
              <div className="absolute top-10 left-10 w-24 h-24 border-t-[3px] border-l-[3px] border-[var(--active-neon)]/40 rounded-tl-3xl" />
              <div className="absolute bottom-10 right-10 w-24 h-24 border-b-[3px] border-r-[3px] border-[var(--active-neon)]/40 rounded-br-3xl" />

              <div className="relative z-10 p-20 h-full flex flex-col justify-center max-w-3xl space-y-8">
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="inline-flex items-center gap-4 px-6 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-black text-white uppercase tracking-[0.3em] backdrop-blur-xl"
                >
                  <PulseIcon className="w-4 h-4 text-[var(--active-neon)] animate-pulse" />
                  Live Operational Grid: ALPHA-NODE ACTIVE
                  <button
                    onClick={() => setTestLabMode(!testLabMode)}
                    className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest transition-all ${
                      testLabMode
                        ? 'bg-red-500/20 border border-red-500/50 text-red-400'
                        : 'bg-[var(--active-neon)]/20 border border-[var(--active-neon)]/50 text-[var(--active-neon)]'
                    }`}
                  >
                    {testLabMode ? 'TEST LAB: ON' : 'TEST LAB: OFF'}
                  </button>
                </motion.div>
                
                <h2 className="text-8xl md:text-9xl font-black text-white tracking-[-0.07em] leading-[0.85]">
                  <GlitchText text="NEURAL" /> <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--active-neon)] via-emerald-400 to-blue-500 animate-gradient-x">OVERWATCH</span>
                </h2>
                
                <p className="text-zinc-400 text-xl leading-relaxed font-medium max-w-xl">
                  Autonomous intelligence layer for real-time cyber defense and global threat neutralization. 
                  Synchronizing <span className="text-white">4,092 neural nodes</span> for total perimeter dominance.
                </p>

                <div className="flex items-center gap-10 pt-6">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mb-2">Protection Level</span>
                    <div className="flex gap-1.5">
                      {[1,2,3,4,5].map(i => <div key={i} className="w-8 h-2 bg-[var(--active-neon)] rounded-full shadow-[0_0_15px_rgba(0,255,153,0.5)]" />)}
                    </div>
                  </div>
                  <div className="h-12 w-[1px] bg-white/10" />
                  <div className="flex items-center gap-5">
                    <div className="text-right">
                      <div className="text-xs font-black text-white uppercase tracking-widest leading-none mb-1">Network Health</div>
                      <div className="text-[10px] text-green-500 font-bold uppercase tracking-widest">Optimal Performance</div>
                    </div>
                    <div className="w-5 h-5 rounded-full bg-green-500 shadow-[0_0_25px_rgba(34,197,94,0.6)] animate-pulse" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Global Intelligence Section */}
            <motion.div variants={itemVariants} className="space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                      <Globe className="w-6 h-6 text-blue-400" />
                   </div>
                   <h3 className="font-black text-white uppercase tracking-[0.2em] text-xl">Global Threat Intelligence</h3>
                </div>
                <div className="px-6 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                  Updated: {new Date().toLocaleTimeString()}
                </div>
              </div>
              <ThreatMap />
            </motion.div>

            {/* Core Intelligence Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              
              {/* Threat Matrix - Center Stage */}
              <motion.div variants={itemVariants} className="lg:col-span-8 space-y-10">
                <div className="bg-[#080808] border border-white/5 rounded-[3rem] p-12 relative overflow-hidden group shadow-2xl">
                  {/* Visual Background Accents */}
                  <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                    <Target className="w-72 h-72 text-blue-500" />
                  </div>
                  
                  <div className="flex items-center justify-between mb-12 relative z-10">
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 bg-blue-500/10 rounded-2xl border border-blue-500/20 flex items-center justify-center">
                        <Crosshair className="w-10 h-10 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-black text-white uppercase tracking-[0.15em] text-2xl">Tactical Analysis Engine</h3>
                        <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-[0.2em]">Deep packet inspection & Vulnerability mapping</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                       <span className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">Engine Status:</span>
                       <div className="px-6 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-black text-blue-400">NOMINAL</div>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row gap-8 relative z-10 mb-12">
                    <div className="flex-1 relative group/input">
                      <div className="absolute inset-0 bg-blue-500/5 rounded-2xl blur-xl group-focus-within/input:bg-blue-500/10 transition-all" />
                      <input 
                        type="text"
                        value={scanTarget}
                        onChange={(e) => setScanTarget(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleQuickScan()}
                        placeholder="ENTER TARGET SIGNATURE (IP, URL, NODE_ID)..."
                        className="w-full bg-black/80 border border-white/10 rounded-2xl px-10 py-6 text-lg text-[var(--active-neon)] focus:border-blue-500/50 focus:bg-black outline-none transition-all placeholder:text-zinc-800 font-bold tracking-wide relative z-10"
                      />
                      <Search className="absolute right-8 top-1/2 -translate-y-1/2 w-8 h-8 text-zinc-700 pointer-events-none z-10" />
                    </div>
                    <button 
                      onClick={handleQuickScan}
                      disabled={isScanning || !scanTarget}
                      className="bg-white text-black px-12 py-6 rounded-2xl font-black text-sm uppercase tracking-[0.3em] hover:bg-[var(--active-neon)] hover:text-black hover:shadow-[0_0_50px_rgba(0,255,153,0.3)] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-20 flex items-center justify-center gap-4 group/btn"
                    >
                      {isScanning ? <RefreshCcw className="w-6 h-6 animate-spin" /> : <Zap className="w-6 h-6 fill-current group-hover/btn:animate-pulse" />}
                      {isScanning ? 'MAPPING...' : 'EXECUTE SCAN'}
                    </button>
                  </div>

                  {/* High-Impact Result Visualization */}
                  <AnimatePresence>
                    {scanResult && (
                      <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 30 }}
                        className="mt-12 pt-12 border-t border-white/5 relative z-10 space-y-10"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                           <IntelMetric label="Security Score" value="A+" sub="Verified Node" icon={<ShieldCheck className="w-6 h-6" />} color="blue" />
                           <IntelMetric label="Threat Level" value={scanResult.severity.toUpperCase()} sub="Level 0-2 Scale" icon={<ShieldAlert className="w-6 h-6" />} color={scanResult.severity === 'High' ? 'red' : 'yellow'} />
                           <IntelMetric label="Vulnerabilities" value={scanResult.vulnerabilities.length} sub="Patches Pending" icon={<AlertTriangle className="w-6 h-6" />} color="red" />
                           <IntelMetric label="Latency" value="18ms" sub="Uplink Fast" icon={<Activity className="w-6 h-6" />} color="green" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           <div className="p-10 rounded-[2.5rem] bg-black/60 border border-white/5 hover:border-blue-500/20 transition-all group/res">
                              <div className="flex items-center justify-between mb-6">
                                 <div className="p-4 bg-blue-500/10 rounded-2xl">
                                    <MapIcon className="w-8 h-8 text-blue-400" />
                                 </div>
                                 <span className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">Network Trace</span>
                              </div>
                              <div className="space-y-2">
                                 <div className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Identified Endpoint</div>
                                 <div className="text-2xl font-black text-white group-hover:text-blue-400 transition-colors">{scanTarget}</div>
                              </div>
                           </div>
                           <div className="p-10 rounded-[2.5rem] bg-black/60 border border-white/5 hover:border-emerald-500/20 transition-all group/res">
                              <div className="flex items-center justify-between mb-6">
                                 <div className="p-4 bg-emerald-500/10 rounded-2xl">
                                    <Lock className="w-8 h-8 text-emerald-400" />
                                 </div>
                                 <span className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">SSL Certificate</span>
                              </div>
                              <div className="space-y-2">
                                 <div className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Encryption Status</div>
                                 <div className="text-2xl font-black text-white group-hover:text-emerald-400 transition-colors">{scanResult.ssl_info.valid ? 'CRYPTO_SECURE' : 'EXPOSED_RAW'}</div>
                              </div>
                           </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Sub-Intelligence Panels */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <ComplexStatusCard 
                    title="Neural Integrity" 
                    icon={<Cpu className="w-7 h-7" />} 
                    status="Operational" 
                    color="green"
                    progress={99.1}
                    value="4.2 TFlops"
                  />
                  <ComplexStatusCard 
                    title="Storage Hardening" 
                    icon={<HardDrive className="w-7 h-7" />} 
                    status="Encrypted" 
                    color="blue"
                    progress={84.3}
                    value="12.8 PB"
                  />
                </div>
              </motion.div>

              {/* Right Side - Intelligence Feeds & Visuals */}
              <motion.div variants={itemVariants} className="lg:col-span-4 space-y-10">
                
                {/* Visual Radar Unit */}
                <div className="bg-[#080808] border border-white/5 rounded-[3rem] p-12 flex flex-col items-center relative overflow-hidden shadow-2xl">
                  <div className="flex items-center justify-between w-full mb-12 relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="p-4 bg-green-500/10 rounded-2xl border border-green-500/20">
                        <Radio className="w-7 h-7 text-green-400" />
                      </div>
                      <h3 className="font-black text-white uppercase tracking-[0.2em] text-sm">Long Range Radar</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-ping" />
                      <span className="text-[10px] text-green-500 font-black tracking-widest">SCANNING...</span>
                    </div>
                  </div>
                  
                  <div className="w-full aspect-square relative flex items-center justify-center">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,255,153,0.1)_0%,transparent_80%)]" />
                    <RadarHUD />
                    {/* Visual Overlay Elements */}
                    <div className="absolute inset-0 border border-white/5 rounded-full pointer-events-none" />
                    <div className="absolute inset-[15%] border border-white/5 rounded-full pointer-events-none" />
                    <div className="absolute inset-[30%] border border-white/5 rounded-full pointer-events-none" />
                  </div>

                  <div className="w-full mt-12 grid grid-cols-2 gap-8">
                    <div className="p-8 rounded-2xl bg-white/5 border border-white/5 text-center group hover:bg-white/10 transition-all">
                      <div className="text-[10px] text-zinc-600 uppercase font-black mb-3 tracking-[0.2em]">Targets</div>
                      <div className="text-4xl font-black text-white group-hover:text-[var(--active-neon)] transition-colors">24</div>
                    </div>
                    <div className="p-8 rounded-2xl bg-white/5 border border-white/5 text-center group hover:bg-white/10 transition-all">
                      <div className="text-[10px] text-zinc-600 uppercase font-black mb-3 tracking-[0.2em]">Proximity</div>
                      <div className="text-4xl font-black text-white group-hover:text-blue-400 transition-colors">LOW</div>
                    </div>
                  </div>
                </div>

                {/* Live Threat Intercepts */}
                <div className="bg-[#080808] border border-white/5 rounded-[3rem] flex flex-col shadow-2xl overflow-hidden min-h-[500px]">
                  <div className="p-8 border-b border-white/5 bg-zinc-900/40 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.6)] animate-pulse" />
                      <span className="text-xs font-black uppercase tracking-[0.3em] text-white">Threat Intercepts</span>
                    </div>
                    <Maximize2 className="w-5 h-5 text-zinc-700 hover:text-white cursor-pointer transition-colors" />
                  </div>
                  <div className="flex-1 p-10 space-y-8 overflow-hidden relative">
                    {activeThreats.map((threat, i) => (
                      <motion.div 
                        initial={{ x: 30, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        key={threat.id}
                        className="flex items-center justify-between group cursor-default"
                      >
                        <div className="flex items-center gap-5">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
                            threat.severity === 'High' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                          }`}>
                            <AlertTriangle className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="text-base font-black text-white group-hover:text-[var(--active-neon)] transition-colors">{threat.type}</div>
                            <div className="text-[11px] text-zinc-600 font-bold uppercase tracking-widest">{threat.origin}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-[11px] font-black uppercase tracking-widest ${threat.severity === 'High' ? 'text-red-500' : 'text-yellow-500'}`}>{threat.severity}</div>
                          <div className="text-[10px] text-zinc-700 font-black uppercase">{threat.time}</div>
                        </div>
                      </motion.div>
                    ))}
                    {/* Decorative Grid Lines */}
                    <div className="absolute inset-0 bg-grid-white/[0.01] pointer-events-none" />
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
            )}

            {activeTab === 'intelligence' && (
              <motion.div
                key="intelligence"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="h-full w-full flex items-center justify-center"
              >
                <ThreatMap />
              </motion.div>
            )}

            {activeTab === 'topology' && (
              <motion.div
                key="topology"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-10 max-w-[1600px] mx-auto space-y-12 pb-32"
              >
                <div className="text-center space-y-8">
                  <h2 className="text-6xl font-black text-white tracking-[-0.05em]">NODE TOPOLOGY</h2>
                  <p className="text-zinc-400 text-xl">Visual grid of server nodes</p>
                  <div className="grid grid-cols-4 gap-8 max-w-4xl mx-auto">
                    {Array.from({ length: 16 }, (_, i) => (
                      <div key={i} className="aspect-square bg-black/40 border border-white/10 rounded-2xl flex items-center justify-center hover:border-[var(--active-neon)]/50 transition-all">
                        <Server className="w-12 h-12 text-zinc-600" />
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'signal' && (
              <motion.div
                key="signal"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-10 max-w-[1600px] mx-auto space-y-12 pb-32"
              >
                <div className="text-center space-y-8">
                  <h2 className="text-6xl font-black text-white tracking-[-0.05em]">SIGNAL INTERCEPT</h2>
                  <p className="text-zinc-400 text-xl">Real-time network analytics and monitoring</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                    <div className="p-8 bg-black/40 border border-white/10 rounded-2xl">
                      <div className="text-[10px] text-zinc-500 uppercase font-black mb-4 tracking-widest">Connection Type</div>
                      <div className="text-3xl font-black text-[var(--active-neon)]">{networkMetrics.connectionType}</div>
                    </div>
                    <div className="p-8 bg-black/40 border border-white/10 rounded-2xl">
                      <div className="text-[10px] text-zinc-500 uppercase font-black mb-4 tracking-widest">Downlink Speed</div>
                      <div className="text-3xl font-black text-blue-400">{networkMetrics.downlink} Mbps</div>
                    </div>
                    <div className="p-8 bg-black/40 border border-white/10 rounded-2xl">
                      <div className="text-[10px] text-zinc-500 uppercase font-black mb-4 tracking-widest">Round Trip Time</div>
                      <div className="text-3xl font-black text-green-400">{networkMetrics.rtt} ms</div>
                    </div>
                  </div>

                  {/* Network Stability Chart */}
                  <div className="max-w-4xl mx-auto mt-12">
                    <div className="p-8 bg-black/40 border border-white/10 rounded-2xl">
                      <div className="text-[10px] text-zinc-500 uppercase font-black mb-6 tracking-widest">Network Stability Chart</div>
                      <div className="h-32 w-full">
                        <svg className="w-full h-full" viewBox="0 0 400 120">
                          <defs>
                            <linearGradient id="stabilityGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="rgb(34, 197, 94)" />
                              <stop offset="50%" stopColor="rgb(59, 130, 246)" />
                              <stop offset="100%" stopColor="rgb(239, 68, 68)" />
                            </linearGradient>
                          </defs>
                          <path
                            d={`M 0 60 ${networkStability.map((point, index) => {
                              const x = (index / (networkStability.length - 1)) * 400;
                              const y = 120 - (point / 100) * 100;
                              return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
                            }).join(' ')}`}
                            fill="none"
                            stroke="url(#stabilityGradient)"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d={`M 0 60 ${networkStability.map((point, index) => {
                              const x = (index / (networkStability.length - 1)) * 400;
                              const y = 120 - (point / 100) * 100;
                              return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
                            }).join(' ')} L 400 120 L 0 120 Z`}
                            fill="url(#stabilityGradient)"
                            fillOpacity="0.1"
                          />
                        </svg>
                      </div>
                      <div className="flex justify-between text-[10px] text-zinc-600 uppercase font-black mt-4">
                        <span>Real-time Stability</span>
                        <span>Downlink: {networkMetrics.downlink} Mbps</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <RadarHUD />
                </div>
              </motion.div>
            )}

            {activeTab === 'firewall' && (
              <motion.div
                key="firewall"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-10 max-w-[1600px] mx-auto space-y-12 pb-32"
              >
                <div className="text-center space-y-8">
                  <h2 className="text-6xl font-black text-white tracking-[-0.05em]">ACTIVE FIREWALL</h2>
                  <p className="text-zinc-400 text-xl">Real-time intrusion detection and blocking system</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                    <div className="p-8 bg-black/40 border border-white/10 rounded-2xl">
                      <div className="text-[10px] text-zinc-500 uppercase font-black mb-4 tracking-widest">Firewall Status</div>
                      <div className="text-3xl font-black text-green-400">ACTIVE</div>
                    </div>
                    <div className="p-8 bg-black/40 border border-white/10 rounded-2xl">
                      <div className="text-[10px] text-zinc-500 uppercase font-black mb-4 tracking-widest">Blocks Today</div>
                      <div className="text-3xl font-black text-red-400">1,247</div>
                    </div>
                    <div className="p-8 bg-black/40 border border-white/10 rounded-2xl">
                      <div className="text-[10px] text-zinc-500 uppercase font-black mb-4 tracking-widest">Detection Rate</div>
                      <div className="text-3xl font-black text-[var(--active-neon)]">99.8%</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'scan' && (
              <motion.div
                key="scan"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-10 max-w-[1600px] mx-auto space-y-12 pb-32"
              >
                <div className="text-center space-y-8">
                  <h2 className="text-6xl font-black text-white tracking-[-0.05em]">VULNERABILITY SCAN</h2>
                  <p className="text-zinc-400 text-xl">Comprehensive security audit and port analysis</p>
                  <div className="max-w-4xl mx-auto">
                    <div className="p-8 bg-black/40 border border-white/10 rounded-2xl">
                      <div className="text-[10px] text-zinc-500 uppercase font-black mb-6 tracking-widest">Target Analysis</div>
                      <div className="flex flex-col md:flex-row gap-8 relative z-10 mb-12">
                        <div className="flex-1 relative group/input">
                          <div className="absolute inset-0 bg-blue-500/5 rounded-2xl blur-xl group-focus-within/input:bg-blue-500/10 transition-all" />
                          <input
                            type="text"
                            value={scanTarget}
                            onChange={(e) => setScanTarget(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleVulnerabilityScan()}
                            placeholder="ENTER TARGET IP FOR VULNERABILITY SCAN..."
                            className="w-full bg-black/80 border border-white/10 rounded-2xl px-10 py-6 text-lg text-[var(--active-neon)] focus:border-blue-500/50 focus:bg-black outline-none transition-all placeholder:text-zinc-800 font-bold tracking-wide relative z-10"
                          />
                          <Search className="absolute right-8 top-1/2 -translate-y-1/2 w-8 h-8 text-zinc-700 pointer-events-none z-10" />
                        </div>
                        <button
                          onClick={handleVulnerabilityScan}
                          disabled={isScanning || !scanTarget}
                          className="bg-white text-black px-12 py-6 rounded-2xl font-black text-sm uppercase tracking-[0.3em] hover:bg-[var(--active-neon)] hover:text-black hover:shadow-[0_0_50px_rgba(0,255,153,0.3)] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-20 flex items-center justify-center gap-4 group/btn"
                        >
                          {isScanning ? <RefreshCcw className="w-6 h-6 animate-spin" /> : <Scan className="w-6 h-6 fill-current group-hover/btn:animate-pulse" />}
                          {isScanning ? 'SCANNING...' : 'INITIATE SCAN'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'vaults' && (
              <motion.div
                key="vaults"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-10 max-w-[1600px] mx-auto space-y-12 pb-32"
              >
                <div className="text-center space-y-8">
                  <h2 className="text-6xl font-black text-white tracking-[-0.05em]">KEYS & VAULTS</h2>
                  <p className="text-zinc-400 text-xl">Cryptographic key management and rotation system</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    <div className="p-8 bg-black/40 border border-white/10 rounded-2xl">
                      <div className="text-[10px] text-zinc-500 uppercase font-black mb-4 tracking-widest">Current Encryption Key</div>
                      <div className="text-lg font-mono text-[var(--active-neon)] break-all">{systemStats.encryptionKey || 'AES-256-GCM-' + Math.random().toString(36).substr(2, 16).toUpperCase()}</div>
                      <div className="mt-4">
                        <button
                          onClick={handleKeyRotation}
                          className="w-full bg-[var(--active-neon)] text-black px-6 py-3 rounded-xl font-black text-sm uppercase tracking-[0.3em] hover:bg-white hover:text-black transition-all"
                        >
                          ROTATE KEYS
                        </button>
                      </div>
                    </div>
                    <div className="p-8 bg-black/40 border border-white/10 rounded-2xl">
                      <div className="text-[10px] text-zinc-500 uppercase font-black mb-4 tracking-widest">Encryption Status</div>
                      <div className="text-3xl font-black text-green-400">{systemStats.encryption} BIT</div>
                      <div className="text-[10px] text-zinc-600 uppercase font-black mt-2 tracking-widest">AES-256-GCM Active</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'biometric' && (
              <motion.div
                key="biometric"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-10 max-w-[1600px] mx-auto space-y-12 pb-32"
              >
                <div className="text-center space-y-8">
                  <h2 className="text-6xl font-black text-white tracking-[-0.05em]">BIOMETRIC LOGS</h2>
                  <p className="text-zinc-400 text-xl">Security identity verification and system access logs</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    <div className="p-8 bg-black/40 border border-white/10 rounded-2xl">
                      <div className="text-[10px] text-zinc-500 uppercase font-black mb-4 tracking-widest">System Information</div>
                      <div className="space-y-2 text-left">
                        <div className="text-sm text-[var(--active-neon)]">OS: {navigator.platform}</div>
                        <div className="text-sm text-blue-400">Browser: {navigator.userAgent.split(' ')[0]}</div>
                        <div className="text-sm text-green-400">Resolution: {window.screen.width}x{window.screen.height}</div>
                        <div className="text-sm text-yellow-400">Language: {navigator.language}</div>
                      </div>
                    </div>
                    <div className="p-8 bg-black/40 border border-white/10 rounded-2xl">
                      <div className="text-[10px] text-zinc-500 uppercase font-black mb-4 tracking-widest">Security Clearance</div>
                      <div className="text-3xl font-black text-green-400">VERIFIED</div>
                      <div className="text-[10px] text-zinc-600 uppercase font-black mt-2 tracking-widest">Level 5 Access Granted</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
        
        {/* Extreme Tactical Side-Panel (Terminal) */}
        <aside className="w-[550px] border-l border-white/5 bg-black/60 backdrop-blur-xl hidden xl:flex flex-col">
          <div className="p-10 border-b border-white/5 bg-zinc-950/50 flex items-center justify-between">
             <div className="flex items-center gap-5">
               <div className="w-12 h-12 bg-[var(--active-neon)]/10 rounded-xl flex items-center justify-center border border-[var(--active-neon)]/30">
                 <TerminalSquare className="w-7 h-7 text-[var(--active-neon)]" />
               </div>
               <div>
                <h3 className="text-sm font-black uppercase tracking-[0.4em] text-white leading-none mb-2">Command & Control</h3>
                <span className="text-[10px] text-zinc-600 font-black uppercase tracking-widest">Session: ADMIN_ALPHA_01</span>
               </div>
             </div>
             <div className="flex gap-3">
               <div className="w-4 h-4 rounded-full bg-zinc-800 hover:bg-red-500 transition-colors cursor-pointer" />
               <div className="w-4 h-4 rounded-full bg-zinc-800 hover:bg-yellow-500 transition-colors cursor-pointer" />
               <div className="w-4 h-4 rounded-full bg-zinc-800 hover:bg-green-500 transition-colors cursor-pointer" />
             </div>
          </div>
          
          <div className="flex-1 overflow-hidden relative">
            <TerminalLogs
              logs={consoleLogs}
              onEmergency={handleActivateLockdown}
              osintResults={osintResults}
              isScanning={isOsintScanning}
              isProcessingTool={isProcessingTool}
            />
            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black to-transparent pointer-events-none" />
          </div>

          <div className="p-12 bg-black/80 border-t border-white/5">
            <div className="relative group">
              <div className="absolute -inset-1.5 bg-gradient-to-r from-[var(--active-neon)]/30 via-blue-500/30 to-[var(--active-neon)]/30 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition duration-1000" />
              <div className="relative flex items-center">
                <span className="absolute left-8 text-[var(--active-neon)] text-xl font-black animate-pulse">❯</span>
                <input 
                  type="text"
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleCommand(command);
                      setCommand('');
                    }
                  }}
                  placeholder="INPUT PROTOCOL COMMAND..."
                  className="w-full bg-zinc-900/50 border border-white/10 rounded-2xl pl-16 pr-8 py-7 text-base text-[var(--active-neon)] focus:border-[var(--active-neon)]/50 focus:bg-black outline-none transition-all font-black tracking-[0.2em] placeholder:text-zinc-800"
                />
              </div>
            </div>
            <div className="mt-8 flex justify-between items-center px-4">
               <div className="flex items-center gap-4">
                 <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
                 <span className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.3em]">Connection: AES-256-GCM</span>
               </div>
               <span className="text-[10px] text-zinc-700 font-black tracking-widest uppercase">STDOUT: 2.1.0_PRO</span>
            </div>
          </div>
        </aside>
      </div>

      {/* Security ID Card Overlay */}
      <AnimatePresence>
        {showSecurityCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md"
            onClick={() => setShowSecurityCard(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-gradient-to-br from-zinc-900 to-black border border-[var(--active-neon)]/30 rounded-3xl p-12 max-w-md w-full mx-4 shadow-[0_0_100px_rgba(0,255,153,0.3)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center space-y-8">
                <div className="flex items-center justify-center">
                  <div className="w-20 h-20 bg-[var(--active-neon)]/10 rounded-full border-2 border-[var(--active-neon)]/50 flex items-center justify-center">
                    <User className="w-10 h-10 text-[var(--active-neon)]" />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-2xl font-black text-white tracking-[0.1em]">SECURITY ID CARD</h3>
                  <div className="space-y-3 text-left">
                    <div className="flex justify-between items-center py-2 border-b border-white/10">
                      <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Username</span>
                      <span className="text-[var(--active-neon)] font-black">ORCHIDS_ADMIN</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-white/10">
                      <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Clearance</span>
                      <span className="text-red-400 font-black">LEVEL 5 (GOD_MODE)</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-white/10">
                      <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">System ID</span>
                      <span className="text-blue-400 font-black">#7782-QX</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Status</span>
                      <span className="text-green-400 font-black">ONLINE & ENCRYPTED</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={() => {
                      setIsLocked(true);
                      setShowSecurityCard(false);
                    }}
                    className="w-full bg-red-500/20 border border-red-500/50 text-red-400 px-6 py-4 rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:bg-red-500/30 hover:border-red-500 transition-all"
                  >
                    LOCK TERMINAL
                  </button>
                  <button
                    onClick={() => setShowSecurityCard(false)}
                    className="w-full bg-white/10 border border-white/20 text-zinc-400 px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:bg-white/20 hover:text-white transition-all"
                  >
                    CLOSE
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lock Screen Overlay */}
      <AnimatePresence>
        {isLocked && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-2xl"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-gradient-to-br from-zinc-900 to-black border border-red-500/30 rounded-3xl p-12 max-w-md w-full mx-4 shadow-[0_0_100px_rgba(239,68,68,0.3)]"
            >
              <div className="text-center space-y-8">
                <div className="flex items-center justify-center">
                  <div className="w-20 h-20 bg-red-500/10 rounded-full border-2 border-red-500/50 flex items-center justify-center">
                    <Lock className="w-10 h-10 text-red-400" />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-3xl font-black text-white tracking-[0.1em]">TERMINAL LOCKED</h3>
                  <p className="text-zinc-400 text-sm">Enter security passphrase to unlock</p>
                </div>

                <div className="space-y-4">
                  <input
                    type="password"
                    value={lockPassword}
                    onChange={(e) => setLockPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
                    placeholder="ENTER PASSPHRASE..."
                    className="w-full bg-black/50 border border-red-500/30 rounded-2xl px-6 py-4 text-center text-red-400 font-black tracking-[0.2em] focus:border-red-500/50 focus:bg-black outline-none transition-all placeholder:text-zinc-600"
                  />
                  <button
                    onClick={handleUnlock}
                    className="w-full bg-red-500/20 border border-red-500/50 text-red-400 px-6 py-4 rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:bg-red-500/30 hover:border-red-500 transition-all"
                  >
                    UNLOCK TERMINAL
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decorative OS Accents */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-50 overflow-hidden">
        <div className="absolute top-12 left-12 w-24 h-24 border-t-2 border-l-2 border-white/5 rounded-tl-[3rem]" />
        <div className="absolute top-12 right-12 w-24 h-24 border-t-2 border-r-2 border-white/5 rounded-tr-[3rem]" />
        <div className="absolute bottom-12 left-12 w-24 h-24 border-b-2 border-l-2 border-white/5 rounded-bl-[3rem]" />
        <div className="absolute bottom-12 right-12 w-24 h-24 border-b-2 border-r-2 border-white/5 rounded-br-[3rem]" />
      </div>

      {/* OSINT Scanning Overlay */}
      <AnimatePresence>
        {isOsintScanning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-2xl"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-gradient-to-br from-zinc-900/80 to-black/80 border border-[var(--active-neon)]/30 rounded-3xl p-12 max-w-md w-full mx-4 shadow-[0_0_100px_rgba(0,255,153,0.3)] backdrop-blur-xl"
            >
              <div className="text-center space-y-8">
                <div className="flex items-center justify-center">
                  <div className="w-20 h-20 bg-[var(--active-neon)]/10 rounded-full border-2 border-[var(--active-neon)]/50 flex items-center justify-center">
                    <Search className="w-10 h-10 text-[var(--active-neon)] animate-pulse" />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-3xl font-black text-white tracking-[0.1em]">OSINT SCANNING</h3>
                  <p className="text-zinc-400 text-sm">Analyzing username across global platforms</p>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-center">
                    <div className="w-32 h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-[var(--active-neon)] rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 3, ease: "easeInOut" }}
                      />
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-[var(--active-neon)] font-mono text-sm animate-pulse">
                      ACCESSING GLOBAL DATABASES...
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Audit Logs Modal */}
      <AnimatePresence>
        {showAuditLogsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex items-center justify-center bg-black/90 backdrop-blur-2xl"
            onClick={() => setShowAuditLogsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-gradient-to-br from-zinc-900/80 to-black/80 border border-[var(--active-neon)]/30 rounded-3xl p-12 max-w-4xl w-full mx-4 shadow-[0_0_100px_rgba(0,255,153,0.3)] backdrop-blur-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-[var(--active-neon)]/10 rounded-2xl border border-[var(--active-neon)]/20">
                      <FileText className="w-8 h-8 text-[var(--active-neon)]" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-black text-white tracking-[0.1em]">SYSTEM AUDIT LOGS</h3>
                      <p className="text-zinc-400 text-sm">Central archive of all system activities and commands</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAuditLogsModal(false)}
                    className="p-3 bg-zinc-800/50 hover:bg-zinc-700/50 rounded-2xl border border-zinc-600/50 transition-all"
                  >
                    <X className="w-6 h-6 text-zinc-400" />
                  </button>
                </div>

                {/* Live Feed Status */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-2 h-2 rounded-full ${isLiveFeedConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                  <span className="text-[10px] text-zinc-400 uppercase font-black tracking-widest">
                    {isLiveFeedConnected ? 'LIVE FEED CONNECTED - MONITORING ALL INCOMING TRAFFIC' : 'LIVE FEED DISCONNECTED'}
                  </span>
                </div>

                <div className="max-h-96 overflow-y-auto bg-black/50 rounded-2xl border border-zinc-700/50 p-6 custom-scrollbar">
                  <div className="space-y-3 font-mono text-sm">
                    {liveLogs.length > 0 ? (
                      liveLogs.slice().reverse().map((log, index) => {
                        const isThreat = log.includes('DDOS_THREAT');
                        const isIntrusion = log.includes('INTRUSION_ATTEMPT');
                        return (
                          <div
                            key={index}
                            className={`flex items-start gap-4 p-3 rounded-lg border transition-all ${
                              isThreat
                                ? 'bg-red-500/10 border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.3)] animate-pulse'
                                : isIntrusion
                                ? 'bg-yellow-500/10 border-yellow-500/30'
                                : 'bg-zinc-900/30 border-zinc-800/30'
                            }`}
                          >
                            <div className={`font-bold min-w-[120px] ${
                              isThreat ? 'text-red-400' : 'text-[var(--active-neon)]'
                            }`}>
                              {log.match(/\[([^\]]+)\]/)?.[1] || 'N/A'}
                            </div>
                            <div className={`flex-1 ${
                              isThreat ? 'text-red-300' : 'text-zinc-300'
                            }`}>
                              {log.replace(/\[([^\]]+)\]\s*/, '')}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center text-zinc-500 py-8">
                        {isLiveFeedConnected ? 'Waiting for live traffic...' : 'No live logs available'}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">
                    Total Entries: {consoleLogs.length}
                  </div>
                  <button
                    onClick={() => {
                      const logData = consoleLogs.map(log => log).join('\n');
                      const blob = new Blob([logData], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `secure_city_iq_audit_logs_${new Date().toISOString().split('T')[0]}.txt`;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    }}
                    className="px-8 py-3 bg-[var(--active-neon)] text-black font-black text-sm uppercase tracking-[0.2em] rounded-2xl hover:bg-white hover:text-black transition-all"
                  >
                    DOWNLOAD LOGS
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* KALI TOOLSET Modal */}
      <AnimatePresence>
        {showKaliToolset && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] flex items-center justify-center bg-black/90 backdrop-blur-2xl"
            onClick={() => setShowKaliToolset(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-gradient-to-br from-zinc-900/80 to-black/80 border border-[var(--active-neon)]/30 rounded-3xl p-12 max-w-2xl w-full mx-4 shadow-[0_0_100px_rgba(0,255,153,0.3)] backdrop-blur-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-[var(--active-neon)]/10 rounded-2xl border border-[var(--active-neon)]/20">
                      <Terminal className="w-8 h-8 text-[var(--active-neon)]" />
                    </div>
                    <div>
                      <h3 className="text-3xl font-black text-white tracking-[0.1em]">KALI TOOLSET</h3>
                      <p className="text-zinc-400 text-sm">Advanced penetration testing and reconnaissance tools</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowKaliToolset(false)}
                    className="p-3 bg-zinc-800/50 hover:bg-zinc-700/50 rounded-2xl border border-zinc-600/50 transition-all"
                  >
                    <X className="w-6 h-6 text-zinc-400" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* OSINT Tracker */}
                  <div
                    onClick={() => {
                      setCommand('/scan_user ');
                      setShowKaliToolset(false);
                      if (window.speechSynthesis) {
                        const utterance = new SpeechSynthesisUtterance('OSINT Tracker activated. Enter username to scan.');
                        utterance.rate = 0.8;
                        utterance.pitch = 0.8;
                        utterance.volume = 0.7;
                        window.speechSynthesis.speak(utterance);
                      }
                    }}
                    className="group cursor-pointer p-6 bg-[var(--active-neon)]/5 border border-[var(--active-neon)]/20 rounded-2xl hover:bg-[var(--active-neon)]/10 hover:border-[var(--active-neon)]/40 transition-all hover:shadow-[0_0_30px_rgba(0,255,153,0.2)]"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-[var(--active-neon)]/10 rounded-xl border border-[var(--active-neon)]/20">
                        <Search className="w-6 h-6 text-[var(--active-neon)]" />
                      </div>
                      <div className="px-3 py-1 bg-[var(--active-neon)]/20 border border-[var(--active-neon)]/30 rounded-full">
                        <span className="text-[10px] text-[var(--active-neon)] font-black uppercase tracking-widest">ACTIVE</span>
                      </div>
                    </div>
                    <h4 className="text-lg font-black text-white mb-2">OSINT Tracker</h4>
                    <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-widest">Username reconnaissance across social platforms</p>
                  </div>

                  {/* Network Mapper */}
                  <div
                    onClick={() => {
                      setCommand('/nmap_scan ');
                      setShowKaliToolset(false);
                      setIsProcessingTool(true);
                      if (window.speechSynthesis) {
                        const utterance = new SpeechSynthesisUtterance('Network Mapper activated. Enter target IP or domain.');
                        utterance.rate = 0.8;
                        utterance.pitch = 0.8;
                        utterance.volume = 0.7;
                        window.speechSynthesis.speak(utterance);
                      }
                    }}
                    className="group cursor-pointer p-6 bg-[var(--active-neon)]/5 border border-[var(--active-neon)]/20 rounded-2xl hover:bg-[var(--active-neon)]/10 hover:border-[var(--active-neon)]/40 transition-all hover:shadow-[0_0_30px_rgba(0,255,153,0.2)]"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-[var(--active-neon)]/10 rounded-xl border border-[var(--active-neon)]/20">
                        <Network className="w-6 h-6 text-[var(--active-neon)]" />
                      </div>
                      <div className="px-3 py-1 bg-[var(--active-neon)]/20 border border-[var(--active-neon)]/30 rounded-full">
                        <span className="text-[10px] text-[var(--active-neon)] font-black uppercase tracking-widest">ACTIVE</span>
                      </div>
                    </div>
                    <h4 className="text-lg font-black text-white mb-2">Network Mapper (Nmap)</h4>
                    <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-widest">Port scanning and network discovery</p>
                  </div>

                  {/* Vulnerability Scanner */}
                  <div
                    onClick={() => {
                      setCommand('/vuln_scan ');
                      setShowKaliToolset(false);
                      setIsProcessingTool(true);
                      if (window.speechSynthesis) {
                        const utterance = new SpeechSynthesisUtterance('Vulnerability Scanner activated. Enter target to analyze.');
                        utterance.rate = 0.8;
                        utterance.pitch = 0.8;
                        utterance.volume = 0.7;
                        window.speechSynthesis.speak(utterance);
                      }
                    }}
                    className="group cursor-pointer p-6 bg-[var(--active-neon)]/5 border border-[var(--active-neon)]/20 rounded-2xl hover:bg-[var(--active-neon)]/10 hover:border-[var(--active-neon)]/40 transition-all hover:shadow-[0_0_30px_rgba(0,255,153,0.2)]"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-[var(--active-neon)]/10 rounded-xl border border-[var(--active-neon)]/20">
                        <ShieldAlert className="w-6 h-6 text-[var(--active-neon)]" />
                      </div>
                      <div className="px-3 py-1 bg-[var(--active-neon)]/20 border border-[var(--active-neon)]/30 rounded-full">
                        <span className="text-[10px] text-[var(--active-neon)] font-black uppercase tracking-widest">ACTIVE</span>
                      </div>
                    </div>
                    <h4 className="text-lg font-black text-white mb-2">Vulnerability Scanner</h4>
                    <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-widest">Automated security assessment</p>
                  </div>

                  {/* DNS Recon */}
                  <div
                    onClick={() => {
                      setCommand('/dns_lookup ');
                      setShowKaliToolset(false);
                      setIsProcessingTool(true);
                      if (window.speechSynthesis) {
                        const utterance = new SpeechSynthesisUtterance('DNS Reconnaissance activated. Enter domain to investigate.');
                        utterance.rate = 0.8;
                        utterance.pitch = 0.8;
                        utterance.volume = 0.7;
                        window.speechSynthesis.speak(utterance);
                      }
                    }}
                    className="group cursor-pointer p-6 bg-[var(--active-neon)]/5 border border-[var(--active-neon)]/20 rounded-2xl hover:bg-[var(--active-neon)]/10 hover:border-[var(--active-neon)]/40 transition-all hover:shadow-[0_0_30px_rgba(0,255,153,0.2)]"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="p-3 bg-[var(--active-neon)]/10 rounded-xl border border-[var(--active-neon)]/20">
                        <Globe className="w-6 h-6 text-[var(--active-neon)]" />
                      </div>
                      <div className="px-3 py-1 bg-[var(--active-neon)]/20 border border-[var(--active-neon)]/30 rounded-full">
                        <span className="text-[10px] text-[var(--active-neon)] font-black uppercase tracking-widest">ACTIVE</span>
                      </div>
                    </div>
                    <h4 className="text-lg font-black text-white mb-2">DNS Recon</h4>
                    <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-widest">Domain enumeration and DNS analysis</p>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">
                    Click any tool to auto-fill command in terminal
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MenuLink({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-6 px-7 py-5 rounded-2xl text-[12px] font-black transition-all relative group ${
      active 
      ? 'bg-white/5 text-white border border-white/10 shadow-2xl' 
      : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-200'
    }`}>
      <span className={`${active ? 'text-[var(--active-neon)]' : 'text-zinc-600 group-hover:text-zinc-400'} transition-colors`}>
        {icon}
      </span>
      <span className="tracking-[0.2em] uppercase">{label}</span>
      {active && (
        <motion.div 
          layoutId="sidebar-active-v3"
          className="ml-auto w-2 h-2 rounded-full bg-[var(--active-neon)] shadow-[0_0_20px_var(--active-neon)]" 
        />
      )}
    </button>
  );
}

function NavStatV3({ label, value, progress, color }: { label: string, value: string, progress: number, color: 'neon' | 'blue' | 'red' }) {
  const colors = {
    neon: 'bg-[var(--active-neon)] text-[var(--active-neon)]',
    blue: 'bg-blue-500 text-blue-500',
    red: 'bg-red-500 text-red-500',
  };

  return (
    <div className="flex items-center gap-6">
      <div className="text-left">
        <div className="text-[10px] text-zinc-600 font-black uppercase tracking-[0.25em] leading-none mb-2">{label}</div>
        <div className={`text-base font-black ${colors[color].split(' ')[1]} leading-none tracking-tight`}>{value}</div>
      </div>
      <div className="w-24 h-2 bg-black/40 rounded-full overflow-hidden p-[1px] border border-white/5">
        <motion.div 
          className={`h-full rounded-full ${colors[color].split(' ')[0]}`}
          animate={{ width: `${Math.min(100, progress)}%` }}
          transition={{ duration: 1.5, ease: "circOut" }}
        />
      </div>
    </div>
  );
}

function IntelMetric({ label, value, sub, icon, color }: { label: string, value: string | number, sub: string, icon: React.ReactNode, color: string }) {
  const colorMap: any = {
    blue: 'text-blue-400 border-blue-500/20 bg-blue-500/5',
    red: 'text-red-400 border-red-500/20 bg-red-500/5',
    green: 'text-green-400 border-green-500/20 bg-green-500/5',
    yellow: 'text-yellow-400 border-yellow-500/20 bg-yellow-500/5',
    zinc: 'text-zinc-400 border-zinc-500/20 bg-zinc-500/5'
  };

  return (
    <div className={`p-8 rounded-[2.5rem] border ${colorMap[color] || colorMap.zinc} transition-all hover:bg-white/5 group relative overflow-hidden`}>
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        {icon}
      </div>
      <div className="flex items-center justify-between mb-5">
        <span className="text-[10px] uppercase font-black opacity-50 tracking-[0.3em]">{label}</span>
      </div>
      <div className="font-black text-3xl text-white mb-2">{value}</div>
      <div className="text-[10px] uppercase font-bold opacity-30 tracking-widest">{sub}</div>
    </div>
  );
}

function ComplexStatusCard({ title, icon, status, color, progress, value }: { title: string, icon: React.ReactNode, status: string, color: 'green' | 'blue' | 'red', progress: number, value: string }) {
  const colorClasses = {
    green: 'text-green-400 bg-green-500/10 border-green-500/20',
    blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    red: 'text-red-400 bg-red-500/10 border-red-500/20',
  };

  const barColors = {
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    red: 'bg-red-500',
  };

  return (
    <div className="bg-[#080808] border border-white/5 rounded-[3rem] p-12 space-y-10 shadow-2xl group hover:border-white/10 transition-all relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-white/[0.01] pointer-events-none" />
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-7">
          <div className={`w-20 h-20 rounded-2xl border flex items-center justify-center ${colorClasses[color]}`}>
            {icon}
          </div>
          <div>
            <h4 className="font-black text-white text-xl uppercase tracking-[0.2em] leading-none mb-3">{title}</h4>
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full animate-pulse ${barColors[color]} shadow-[0_0_10px_currentColor]`} />
              <p className="text-[11px] text-zinc-500 font-black uppercase tracking-widest">{status}</p>
            </div>
          </div>
        </div>
        <div className="text-right">
           <div className="text-3xl font-black text-white">{value}</div>
           <div className="text-[11px] text-zinc-600 font-black uppercase tracking-[0.2em]">Active Load</div>
        </div>
      </div>
      <div className="space-y-4 relative z-10">
        <div className="flex justify-between text-[11px] font-black uppercase tracking-[0.3em]">
          <span className="text-zinc-600">Integrity Health Index</span>
          <span className={colorClasses[color].split(' ')[0]}>{progress}%</span>
        </div>
        <div className="w-full h-3 bg-black rounded-full overflow-hidden p-[1px] border border-white/5">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 2.5, ease: "circOut" }}
            className={`h-full rounded-full ${barColors[color]} shadow-[0_0_20px_rgba(255,255,255,0.05)]`}
          />
        </div>
      </div>
    </div>
  );
}

function GlitchText({ text }: { text: string }) {
  return (
    <span className="relative inline-block group">
      <span className="relative z-10">{text}</span>
      <span className="absolute inset-0 text-red-500 opacity-0 group-hover:opacity-50 group-hover:animate-glitch-1 pointer-events-none">- {text} -</span>
      <span className="absolute inset-0 text-blue-500 opacity-0 group-hover:opacity-50 group-hover:animate-glitch-2 pointer-events-none">- {text} -</span>
    </span>
  );
}

function DataStream() {
  const [data, setData] = useState<string[]>([]);
  
  useEffect(() => {
    const interval = setInterval(() => {
      const line = Array.from({ length: 20 }, () => 
        Math.random() > 0.5 ? Math.floor(Math.random() * 16).toString(16).toUpperCase() : (Math.random() > 0.5 ? '1' : '0')
      ).join(' ');
      setData(prev => [line, ...prev].slice(0, 10));
    }, 200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4 font-mono text-[8px] text-[var(--active-neon)]/40 space-y-1">
      {data.map((line, i) => (
        <motion.div 
          key={i} 
          initial={{ opacity: 0, x: -10 }} 
          animate={{ opacity: 1 - (i * 0.1), x: 0 }}
          className="whitespace-nowrap overflow-hidden"
        >
          {line}
        </motion.div>
      ))}
    </div>
  );
}

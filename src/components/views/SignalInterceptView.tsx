"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Radio,
  Wifi,
  Bluetooth,
  Smartphone,
  Satellite,
  Activity,
  AlertTriangle,
  CheckCircle,
  Zap,
  Signal,
  Antenna,
  MonitorSpeaker,
  Volume2
} from "lucide-react";
import { toast } from "sonner";

interface SignalInterceptViewProps {
  consoleLogs: string[];
  setConsoleLogs: (logs: string[]) => void;
}

interface InterceptedSignal {
  id: string;
  type: 'wifi' | 'bluetooth' | 'cellular' | 'satellite' | 'radio' | 'unknown';
  frequency: string;
  strength: number;
  source: string;
  data: string;
  timestamp: Date;
  location?: string;
  encryption?: string;
}

const signalTypes = {
  wifi: { icon: Wifi, color: 'text-blue-400', bg: 'bg-blue-500/20' },
  bluetooth: { icon: Bluetooth, color: 'text-purple-400', bg: 'bg-purple-500/20' },
  cellular: { icon: Smartphone, color: 'text-green-400', bg: 'bg-green-500/20' },
  satellite: { icon: Satellite, color: 'text-orange-400', bg: 'bg-orange-500/20' },
  radio: { icon: Radio, color: 'text-red-400', bg: 'bg-red-500/20' },
  unknown: { icon: Signal, color: 'text-gray-400', bg: 'bg-gray-500/20' }
};

export default function SignalInterceptView({
  consoleLogs,
  setConsoleLogs,
}: SignalInterceptViewProps) {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [interceptedSignals, setInterceptedSignals] = useState<InterceptedSignal[]>([]);
  const [activeFilters, setActiveFilters] = useState<string[]>(['wifi', 'bluetooth', 'cellular']);
  const [selectedSignal, setSelectedSignal] = useState<InterceptedSignal | null>(null);
  // Get geolocation info
  const getGeolocationInfo = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const realLocationSignal: InterceptedSignal = {
            id: 'real-gps-' + Date.now(),
            type: 'satellite',
            frequency: 'GPS L1',
            strength: 85,
            source: 'GPS_Satellite',
            data: `GPS Coordinates: ${latitude.toFixed(4)}°N ${longitude.toFixed(4)}°W [REAL LOCATION]`,
            timestamp: new Date(),
            location: 'Current GPS Location',
            encryption: 'GPS Signal'
          };
          setInterceptedSignals(prev => [realLocationSignal, ...prev.slice(0, 49)]);
        },
        (error) => {
          console.log('Geolocation not available:', error);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  };

  // Get real network information
  const getRealNetworkInfo = async () => {
    try {
      const connection = (navigator as any).connection || {};
      const realSignals: InterceptedSignal[] = [];

      // Add current WiFi/network info
      if (navigator.onLine) {
        realSignals.push({
          id: 'real-wifi-' + Date.now(),
          type: 'wifi',
          frequency: connection.effectiveType ? `${connection.effectiveType.toUpperCase()}` : 'Unknown',
          strength: connection.downlink ? Math.min(100, connection.downlink * 20) : 75,
          source: 'Current_Network',
          data: `Connected via ${connection.effectiveType || 'unknown'} - ${connection.downlink || 'N/A'} Mbps`,
          timestamp: new Date(),
          location: 'Current Location',
          encryption: 'Active'
        });
      }

      // Add cellular info if available
      if (connection.effectiveType && ['slow-2g', '2g', '3g', '4g'].includes(connection.effectiveType)) {
        realSignals.push({
          id: 'real-cellular-' + Date.now(),
          type: 'cellular',
          frequency: connection.effectiveType.toUpperCase(),
          strength: connection.downlink ? Math.min(100, connection.downlink * 25) : 60,
          source: 'Mobile_Network',
          data: `Cellular connection - ${connection.effectiveType} - ${connection.downlink || 'N/A'} Mbps`,
          timestamp: new Date(),
          location: 'Mobile Network',
          encryption: 'LTE/5G Security'
        });
      }

      return realSignals;
    } catch (error) {
      console.log('Could not access real network info:', error);
      return [];
    }
  };

  // Generate simulated intercepted signals (for demo purposes)
  const generateSimulatedSignal = (): InterceptedSignal => {
    const types: InterceptedSignal['type'][] = ['wifi', 'bluetooth', 'cellular', 'satellite', 'radio'];
    const type = types[Math.floor(Math.random() * types.length)];

    const frequencies = {
      wifi: ['2.4GHz', '5GHz', '6GHz'][Math.floor(Math.random() * 3)],
      bluetooth: ['2.4GHz', '5GHz'][Math.floor(Math.random() * 2)],
      cellular: ['700MHz', '850MHz', '1900MHz', '2100MHz'][Math.floor(Math.random() * 4)],
      satellite: ['12GHz', '14GHz', '18GHz'][Math.floor(Math.random() * 3)],
      radio: ['88-108MHz', '540-1600kHz'][Math.floor(Math.random() * 2)]
    };

    const sources = [
      'Device_' + Math.random().toString(36).substr(2, 8).toUpperCase(),
      'AP_' + Math.random().toString(36).substr(2, 6).toUpperCase(),
      'Tower_' + Math.floor(Math.random() * 1000),
      'Satellite_' + Math.floor(Math.random() * 100),
      'Radio_Station_' + Math.floor(Math.random() * 1000)
    ];

    const dataSamples = [
      'HTTP GET /api/data [SIMULATED]',
      'WiFi Probe Request [SIMULATED]',
      'Bluetooth Inquiry [SIMULATED]',
      'Cellular Handshake [SIMULATED]',
      'GPS Coordinates: 40.7128°N 74.0060°W [SIMULATED]',
      'Audio Stream: 128kbps [SIMULATED]',
      'Video Feed: 720p [SIMULATED]',
      'Encrypted Payload: AES-256 [SIMULATED]',
      'SMS: Hello World [SIMULATED]',
      'Email Header: From user@domain.com [SIMULATED]'
    ];

    return {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      type,
      frequency: frequencies[type],
      strength: Math.floor(Math.random() * 100),
      source: sources[Math.floor(Math.random() * sources.length)],
      data: dataSamples[Math.floor(Math.random() * dataSamples.length)],
      timestamp: new Date(),
      location: ['New York, NY', 'Los Angeles, CA', 'Chicago, IL', 'Houston, TX', 'Phoenix, AZ'][Math.floor(Math.random() * 5)],
      encryption: Math.random() > 0.7 ? ['WPA2', 'WPA3', 'AES-128', 'None'][Math.floor(Math.random() * 4)] : undefined
    };
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isMonitoring) {
      setConsoleLogs((prev) => [
        ...prev.slice(-15),
        `[${new Date().toLocaleTimeString()}] SIGNAL_INTERCEPT: Monitoring initiated. Scanning all frequencies.`
      ]);

      if (window.speechSynthesis) {
        const utterance = new SpeechSynthesisUtterance(
          "Signal interception active. Monitoring all communication channels."
        );
        utterance.rate = 0.8;
        utterance.volume = 0.7;
        window.speechSynthesis.speak(utterance);
      }

      // Add real network info first
      getRealNetworkInfo().then(realSignals => {
        setInterceptedSignals(prev => [...realSignals, ...prev.slice(0, 49)]);
      });

      // Try to get geolocation
      getGeolocationInfo();

      // Check for WebRTC connections
      if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        navigator.mediaDevices.enumerateDevices().then(devices => {
          devices.forEach((device, index) => {
            if (device.kind === 'audioinput' || device.kind === 'audiooutput') {
              const audioSignal: InterceptedSignal = {
                id: 'real-audio-' + index + '-' + Date.now(),
                type: 'radio',
                frequency: 'Audio Device',
                strength: 90,
                source: device.label || `Audio_Device_${index}`,
                data: `${device.kind} connected: ${device.label || 'Unnamed Device'} [REAL HARDWARE]`,
                timestamp: new Date(),
                location: 'Local Device',
                encryption: 'None'
              };
              setInterceptedSignals(prev => [audioSignal, ...prev.slice(0, 49)]);
            }
          });
        }).catch(err => console.log('Could not enumerate devices:', err));
      }

      interval = setInterval(async () => {
        // Add real network info periodically
        const realSignals = await getRealNetworkInfo();

        // Generate simulated signals
        const simulatedSignal = generateSimulatedSignal();

        // Only add if signal type is in active filters
        if (activeFilters.includes(simulatedSignal.type)) {
          setInterceptedSignals((prev) => [simulatedSignal, ...prev.slice(0, 49)]); // Keep last 50 signals

          setConsoleLogs((prev) => [
            ...prev.slice(-15),
            `[${new Date().toLocaleTimeString()}] INTERCEPTED: ${simulatedSignal.type.toUpperCase()} signal from ${simulatedSignal.source} (${simulatedSignal.strength}% strength) [SIMULATED]`
          ]);
        }
      }, 3000 + Math.random() * 4000); // Random interval between 3-7 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isMonitoring, activeFilters, setConsoleLogs]);

  const toggleMonitoring = () => {
    setIsMonitoring(!isMonitoring);
    if (!isMonitoring) {
      toast.success("Signal interception activated");
    } else {
      toast.info("Signal interception deactivated");
      setConsoleLogs((prev) => [
        ...prev.slice(-15),
        `[${new Date().toLocaleTimeString()}] SIGNAL_INTERCEPT: Monitoring terminated.`
      ]);
    }
  };

  const toggleFilter = (type: string) => {
    setActiveFilters(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const getSignalStrengthColor = (strength: number) => {
    if (strength >= 80) return 'text-green-400';
    if (strength >= 60) return 'text-yellow-400';
    if (strength >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className="h-full w-full p-6 bg-gradient-to-br from-black via-gray-900 to-black text-white overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-[var(--active-neon)] mb-2 tracking-wider">
            SIGNAL INTERCEPT
          </h1>
          <p className="text-zinc-400 text-sm">
            Real-time signal monitoring and interception system
          </p>
          <div className="mt-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="text-yellow-400 text-xs">
              ⚠️ <strong>Web Limitations:</strong> Only current network info is real. Other signals are simulated for demonstration.
              True signal interception requires specialized hardware and cannot be performed in web browsers.
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="mb-6 flex flex-wrap items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleMonitoring}
            className={`px-6 py-3 rounded-lg font-bold transition-all flex items-center gap-3 ${
              isMonitoring
                ? 'bg-red-500/20 border border-red-500 text-red-400 hover:bg-red-500/30'
                : 'bg-[var(--active-neon)]/20 border border-[var(--active-neon)] text-[var(--active-neon)] hover:bg-[var(--active-neon)]/30'
            }`}
          >
            <Antenna className="w-5 h-5" />
            {isMonitoring ? 'STOP MONITORING' : 'START MONITORING'}
          </motion.button>

          {/* Filter Buttons */}
          <div className="flex gap-2">
            {Object.entries(signalTypes).map(([type, config]) => {
              const Icon = config.icon;
              const isActive = activeFilters.includes(type);
              return (
                <motion.button
                  key={type}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleFilter(type)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                    isActive
                      ? `${config.bg} border border-current ${config.color}`
                      : 'bg-zinc-800/50 border border-zinc-600 text-zinc-400 hover:border-zinc-500'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Status Indicator */}
        <div className="mb-6">
          <div className="flex items-center gap-4 p-4 bg-black/30 rounded-lg border border-zinc-700">
            <div className={`w-3 h-3 rounded-full ${isMonitoring ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
            <span className="text-sm font-medium">
              Status: {isMonitoring ? 'ACTIVE - Monitoring all frequencies' : 'INACTIVE'}
            </span>
            {isMonitoring && (
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <Activity className="w-4 h-4" />
                Signals intercepted: {interceptedSignals.length}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Signal List */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-[var(--active-neon)] mb-4 flex items-center gap-2">
              <MonitorSpeaker className="w-5 h-5" />
              INTERCEPTED SIGNALS
            </h2>

            <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-[var(--active-neon)] scrollbar-track-black/50">
              <AnimatePresence>
                {interceptedSignals.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-8 text-zinc-500"
                  >
                    {isMonitoring ? 'Monitoring for signals...' : 'Start monitoring to intercept signals'}
                  </motion.div>
                ) : (
                  interceptedSignals.map((signal) => {
                    const config = signalTypes[signal.type];
                    const Icon = config.icon;
                    return (
                      <motion.div
                        key={signal.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        whileHover={{ scale: 1.02 }}
                        onClick={() => setSelectedSignal(signal)}
                        className={`p-4 rounded-lg border cursor-pointer transition-all ${
                          selectedSignal?.id === signal.id
                            ? 'border-[var(--active-neon)] bg-[var(--active-neon)]/10'
                            : 'border-zinc-700 bg-black/30 hover:border-zinc-600'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <Icon className={`w-5 h-5 ${config.color}`} />
                            <span className="font-medium text-white">{signal.source}</span>
                            {signal.id.startsWith('real-') && (
                              <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full border border-green-500/30">
                                REAL
                              </span>
                            )}
                            {signal.data.includes('[SIMULATED]') && (
                              <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full border border-blue-500/30">
                                SIM
                              </span>
                            )}
                            <span className="text-xs text-zinc-400">{signal.type.toUpperCase()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-bold ${getSignalStrengthColor(signal.strength)}`}>
                              {signal.strength}%
                            </span>
                            <div className="w-16 h-2 bg-zinc-700 rounded-full overflow-hidden">
                              <motion.div
                                className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
                                initial={{ width: 0 }}
                                animate={{ width: `${signal.strength}%` }}
                                transition={{ duration: 0.5 }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="text-sm text-zinc-300 mb-1">{signal.data}</div>
                        <div className="flex items-center justify-between text-xs text-zinc-500">
                          <span>{signal.frequency}</span>
                          <span>{signal.timestamp.toLocaleTimeString()}</span>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Signal Details */}
          <div>
            <h2 className="text-xl font-bold text-[var(--active-neon)] mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              SIGNAL ANALYSIS
            </h2>

            <AnimatePresence mode="wait">
              {selectedSignal ? (
                <motion.div
                  key={selectedSignal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-black/30 p-6 rounded-lg border border-zinc-700"
                >
                  <div className="flex items-center gap-3 mb-4">
                    {React.createElement(signalTypes[selectedSignal.type].icon, {
                      className: `w-6 h-6 ${signalTypes[selectedSignal.type].color}`
                    })}
                    <h3 className="text-lg font-bold text-white">{selectedSignal.source}</h3>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Type:</span>
                      <span className="text-white font-medium">{selectedSignal.type.toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Frequency:</span>
                      <span className="text-white font-medium">{selectedSignal.frequency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Strength:</span>
                      <span className={`font-bold ${getSignalStrengthColor(selectedSignal.strength)}`}>
                        {selectedSignal.strength}%
                      </span>
                    </div>
                    {selectedSignal.location && (
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Location:</span>
                        <span className="text-white font-medium">{selectedSignal.location}</span>
                      </div>
                    )}
                    {selectedSignal.encryption && (
                      <div className="flex justify-between">
                        <span className="text-zinc-400">Encryption:</span>
                        <span className="text-white font-medium">{selectedSignal.encryption}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Timestamp:</span>
                      <span className="text-white font-medium text-sm">
                        {selectedSignal.timestamp.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 p-3 bg-black/50 rounded border border-zinc-600">
                    <h4 className="text-sm font-bold text-[var(--active-neon)] mb-2">INTERCEPTED DATA</h4>
                    <p className="text-sm text-zinc-300 font-mono">{selectedSignal.data}</p>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full mt-4 py-2 bg-[var(--active-neon)]/20 border border-[var(--active-neon)] text-[var(--active-neon)] rounded-lg hover:bg-[var(--active-neon)]/30 transition-all"
                  >
                    ANALYZE SIGNAL
                  </motion.button>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-black/30 p-6 rounded-lg border border-zinc-700 text-center"
                >
                  <Signal className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                  <p className="text-zinc-500">Select a signal to view details</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
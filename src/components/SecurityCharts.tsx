"use client";

import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, BarChart, Bar
} from "recharts";

const threatData = [
  { time: "00:00", threats: 12, blocks: 45 },
  { time: "04:00", threats: 18, blocks: 52 },
  { time: "08:00", threats: 45, blocks: 89 },
  { time: "12:00", threats: 32, blocks: 67 },
  { time: "16:00", threats: 64, blocks: 112 },
  { time: "20:00", threats: 28, blocks: 58 },
  { time: "23:59", threats: 15, blocks: 42 },
];

const distributionData = [
  { name: "DDoS", value: 400 },
  { name: "SQLi", value: 300 },
  { name: "Phishing", value: 200 },
  { name: "Malware", value: 278 },
];

export default function SecurityCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full mt-12">
      {/* Real-time Threat Analysis */}
      <div className="glass-card p-6 border border-[var(--active-neon)]/10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--active-neon)]">Threat Vector Analysis</h3>
          <span className="text-[10px] font-mono text-zinc-500 animate-pulse">LIVE FEED</span>
        </div>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={threatData}>
              <defs>
                <linearGradient id="colorThreats" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--active-neon)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--active-neon)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis 
                dataKey="time" 
                stroke="rgba(255,255,255,0.3)" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
              />
              <YAxis 
                stroke="rgba(255,255,255,0.3)" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "rgba(10, 20, 20, 0.9)", 
                  border: "1px solid rgba(0, 255, 255, 0.2)",
                  borderRadius: "8px",
                  fontSize: "12px"
                }} 
              />
              <Area 
                type="monotone" 
                dataKey="threats" 
                stroke="var(--active-neon)" 
                fillOpacity={1} 
                fill="url(#colorThreats)" 
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Attack Distribution */}
      <div className="glass-card p-6 border border-[var(--active-neon)]/10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--active-neon)]">Attack Origin distribution</h3>
          <span className="text-[10px] font-mono text-zinc-500">GLOBAL SENSORS</span>
        </div>
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={distributionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis 
                dataKey="name" 
                stroke="rgba(255,255,255,0.3)" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
              />
              <YAxis 
                stroke="rgba(255,255,255,0.3)" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: "rgba(10, 20, 20, 0.9)", 
                  border: "1px solid rgba(0, 255, 255, 0.2)",
                  borderRadius: "8px",
                  fontSize: "12px"
                }} 
              />
              <Bar 
                dataKey="value" 
                fill="var(--active-neon)" 
                opacity={0.7}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

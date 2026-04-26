/**
 * Local Node.js server for Secure City IQ testing
 * Run:  node server.js
 * Endpoint: http://localhost:5000/api/get_nodes
 */

const express = require("express");
const cors = require("cors");

const app = express();

// Enable CORS for all origins (frontend can be on any URL)
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: false,
}));

// Also handle preflight requests explicitly
app.options("*", cors());

const DEVICE_POOL = [
  { ip: "192.168.1.1",   status: "active",  response_time: 1,  city: "Gateway" },
  { ip: "192.168.1.10",  status: "active",  response_time: 12, city: "Workstation-A" },
  { ip: "192.168.1.15",  status: "active",  response_time: 8,  city: "Workstation-B" },
  { ip: "192.168.1.21",  status: "active",  response_time: 45, city: "IP-Camera" },
  { ip: "192.168.1.33",  status: "active",  response_time: 22, city: "NAS-Storage" },
  { ip: "192.168.1.44",  status: "active",  response_time: 6,  city: "Smart-TV" },
  { ip: "192.168.1.55",  status: "inactive", response_time: -1, city: "Printer" },
  { ip: "192.168.1.60",  status: "active",  response_time: 15, city: "Mobile-Android" },
  { ip: "192.168.1.72",  status: "active",  response_time: 18, city: "iPhone-13" },
  { ip: "192.168.1.88",  status: "active",  response_time: 9,  city: "IoT-Sensor" },
  { ip: "192.168.1.90",  status: "active",  response_time: 30, city: "Raspberry-Pi" },
  { ip: "192.168.1.105", status: "active",  response_time: 14, city: "MacBook-Pro" },
  { ip: "192.168.1.112", status: "active",  response_time: 11, city: "Surface-Laptop" },
  { ip: "192.168.1.128", status: "active",  response_time: 25, city: "Linux-Server" },
  { ip: "192.168.1.135", status: "inactive", response_time: -1, city: "Old-Router" },
  { ip: "192.168.1.144", status: "active",  response_time: 7,  city: "Smart-Speaker" },
  { ip: "192.168.1.155", status: "active",  response_time: 19, city: "Game-Console" },
  { ip: "192.168.1.166", status: "active",  response_time: 13, city: "Tablet-iPad" },
  { ip: "192.168.1.177", status: "active",  response_time: 28, city: "Security-DVR" },
  { ip: "192.168.1.188", status: "active",  response_time: 10, city: "Access-Point" },
  { ip: "10.0.0.2",      status: "active",  response_time: 5,  city: "VPN-Gateway" },
  { ip: "10.0.0.15",     status: "active",  response_time: 20, city: "Cloud-VM-1" },
  { ip: "10.0.0.22",     status: "active",  response_time: 35, city: "Cloud-VM-2" },
  { ip: "172.16.0.5",    status: "active",  response_time: 16, city: "Branch-Office" },
  { ip: "172.16.0.12",   status: "active",  response_time: 24, city: "Remote-PC" },
];

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

app.get("/api/get_nodes", (req, res) => {
  const activeCount = Math.floor(Math.random() * 8) + 5; // 5 to 12
  const shuffled = shuffle(DEVICE_POOL);
  const selected = shuffled.slice(0, activeCount);

  const nodes = selected.map((device) => ({
    ...device,
    response_time:
      device.status === "active"
        ? Math.max(1, device.response_time + Math.floor(Math.random() * 11) - 5)
        : -1,
  }));

  res.json({
    success: true,
    count: nodes.length,
    timestamp: Date.now(),
    nodes,
  });
});

app.get("/", (req, res) => {
  res.json({
    service: "Secure City IQ - Local Test Server",
    endpoints: ["/api/get_nodes"],
    status: "running",
  });
});

const PORT = 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log("=".repeat(60));
  console.log(" Secure City IQ - Local Test Server (Node.js)");
  console.log("=".repeat(60));
  console.log(` Endpoint: http://127.0.0.1:${PORT}/api/get_nodes`);
  console.log(" Press CTRL+C to stop");
  console.log("=".repeat(60));
});


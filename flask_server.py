"""
Local Flask server for Secure City IQ
-------------------------------------
Run:  python flask_server.py
Then open the Next.js app and navigate to Cyber Topology.
The frontend polls http://localhost:5000/api/get_nodes every 15 seconds.
"""

from flask import Flask, jsonify
from flask_cors import CORS
import random
import time

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests from the Next.js dev server

# Base pool of simulated network devices
DEVICE_POOL = [
    {"ip": "192.168.1.1",   "status": "active",  "response_time": 1,  "city": "Gateway"},
    {"ip": "192.168.1.10",  "status": "active",  "response_time": 12, "city": "Workstation-A"},
    {"ip": "192.168.1.15",  "status": "active",  "response_time": 8,  "city": "Workstation-B"},
    {"ip": "192.168.1.21",  "status": "active",  "response_time": 45, "city": "IP-Camera"},
    {"ip": "192.168.1.33",  "status": "active",  "response_time": 22, "city": "NAS-Storage"},
    {"ip": "192.168.1.44",  "status": "active",  "response_time": 6,  "city": "Smart-TV"},
    {"ip": "192.168.1.55",  "status": "inactive", "response_time": -1, "city": "Printer"},
    {"ip": "192.168.1.60",  "status": "active",  "response_time": 15, "city": "Mobile-Android"},
    {"ip": "192.168.1.72",  "status": "active",  "response_time": 18, "city": "iPhone-13"},
    {"ip": "192.168.1.88",  "status": "active",  "response_time": 9,  "city": "IoT-Sensor"},
    {"ip": "192.168.1.90",  "status": "active",  "response_time": 30, "city": "Raspberry-Pi"},
    {"ip": "192.168.1.105", "status": "active",  "response_time": 14, "city": "MacBook-Pro"},
    {"ip": "192.168.1.112", "status": "active",  "response_time": 11, "city": "Surface-Laptop"},
    {"ip": "192.168.1.128", "status": "active",  "response_time": 25, "city": "Linux-Server"},
    {"ip": "192.168.1.135", "status": "inactive", "response_time": -1, "city": "Old-Router"},
    {"ip": "192.168.1.144", "status": "active",  "response_time": 7,  "city": "Smart-Speaker"},
    {"ip": "192.168.1.155", "status": "active",  "response_time": 19, "city": "Game-Console"},
    {"ip": "192.168.1.166", "status": "active",  "response_time": 13, "city": "Tablet-iPad"},
    {"ip": "192.168.1.177", "status": "active",  "response_time": 28, "city": "Security-DVR"},
    {"ip": "192.168.1.188", "status": "active",  "response_time": 10, "city": "Access-Point"},
    {"ip": "10.0.0.2",      "status": "active",  "response_time": 5,  "city": "VPN-Gateway"},
    {"ip": "10.0.0.15",     "status": "active",  "response_time": 20, "city": "Cloud-VM-1"},
    {"ip": "10.0.0.22",     "status": "active",  "response_time": 35, "city": "Cloud-VM-2"},
    {"ip": "172.16.0.5",    "status": "active",  "response_time": 16, "city": "Branch-Office"},
    {"ip": "172.16.0.12",   "status": "active",  "response_time": 24, "city": "Remote-PC"},
]


@app.route("/api/get_nodes", methods=["GET"])
def get_nodes():
    """
    Returns a random subset of active nodes to simulate a live network scan.
    The frontend polls this every 15 seconds and will add/remove nodes dynamically.
    """
    # Randomly decide how many devices are "online" right now (5 to 12)
    active_count = random.randint(5, 12)

    # Shuffle and pick a subset
    shuffled = random.sample(DEVICE_POOL, min(active_count, len(DEVICE_POOL)))

    # Slightly randomize response times so the data feels alive
    nodes = []
    for device in shuffled:
        node = device.copy()
        if node["status"] == "active":
            node["response_time"] = max(1, node["response_time"] + random.randint(-5, 5))
        nodes.append(node)

    return jsonify({
        "success": True,
        "count": len(nodes),
        "timestamp": time.time(),
        "nodes": nodes,
    })


@app.route("/", methods=["GET"])
def index():
    return jsonify({
        "service": "Secure City IQ - Local Flask API",
        "endpoints": ["/api/get_nodes"],
        "status": "running",
    })


if __name__ == "__main__":
    print("=" * 60)
    print(" Secure City IQ - Local Flask Server")
    print("=" * 60)
    print(" Endpoint: http://127.0.0.1:5000/api/get_nodes")
    print(" Press CTRL+C to stop")
    print("=" * 60)
    app.run(host="0.0.0.0", port=5000, debug=True)


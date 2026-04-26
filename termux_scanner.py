#!/usr/bin/env python3
"""
================================================================================
  Secure City IQ - Mobile Agent (Termux Scanner)
================================================================================
  The 'Eye' of the system - scans your local network and pushes results
  to your live website on Render.

  Usage on Termux:
    1. Install dependencies:
       pkg update && pkg install python nmap -y
       pip install requests

    2. Run scanner:
       python termux_scanner.py

    3. It will auto-scan and push data to your website every 60 seconds.

================================================================================
"""

import subprocess
import re
import json
import time
import socket
import requests
from datetime import datetime

# ==============================================================================
# CONFIGURATION - Change this to your Render website URL
# ==============================================================================

RENDER_URL = "https://secure-city-iq-final.onrender.com"
UPDATE_ENDPOINT = f"{RENDER_URL}/api/update-nodes"

# Your network range (auto-detected if possible)
NETWORK_RANGE = "192.168.1.0/24"

# Scan interval in seconds
SCAN_INTERVAL = 60


# ==============================================================================
# HELPERS
# ==============================================================================

def get_device_name(ip: str, port: int = 0, service: str = "") -> str:
    """Guess device name from IP last octet or service."""
    last_octet = int(ip.split(".")[-1])

    known = {
        1: "Gateway/Router",
        2: "DNS Server",
        10: "Workstation-A",
        50: "Printer",
        55: "IP-Camera",
        60: "Mobile-Android",
        72: "iPhone-13",
        88: "Smart-Speaker",
        90: "Raspberry-Pi",
        100: "Desktop-PC",
        105: "MacBook-Pro",
        112: "Surface-Laptop",
        128: "Linux-Server",
        135: "Old-Router",
        144: "Smart-TV",
        155: "Game-Console",
        166: "Tablet-iPad",
        177: "Security-DVR",
        188: "Access-Point",
        200: "NAS-Storage",
        254: "Access-Point",
    }

    if last_octet in known:
        return known[last_octet]

    if service:
        service_lower = service.lower()
        if "http" in service_lower:
            return "Web-Server"
        elif "ssh" in service_lower:
            return "SSH-Server"
        elif "ftp" in service_lower:
            return "FTP-Server"
        elif "printer" in service_lower or "ipp" in service_lower:
            return "Network-Printer"
        elif "mysql" in service_lower or "postgresql" in service_lower:
            return "Database-Server"

    return f"Device-{last_octet}"


def get_device_type(name: str, port: int = 0) -> str:
    """Categorize device by name or port."""
    name_lower = name.lower()
    if "router" in name_lower or "gateway" in name_lower or "access point" in name_lower:
        return "Router"
    elif "server" in name_lower or port in [22, 80, 443, 3306, 5432, 8080]:
        return "Server"
    elif "printer" in name_lower or port == 631:
        return "Printer"
    elif "camera" in name_lower or "dvr" in name_lower:
        return "Camera"
    elif "tv" in name_lower or "speaker" in name_lower:
        return "Speaker"
    elif "iphone" in name_lower or "android" in name_lower or "mobile" in name_lower or "pixel" in name_lower:
        return "Smartphone"
    elif "macbook" in name_lower or "ipad" in name_lower or "surface" in name_lower or "tablet" in name_lower:
        return "Monitor"
    elif "desktop" in name_lower or "workstation" in name_lower or "linux" in name_lower:
        return "Monitor"
    elif "raspberry" in name_lower or "pi" in name_lower:
        return "Server"
    return "Unknown"


def get_local_ip() -> str:
    """Get the local IP address."""
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "192.168.1.1"


def nmap_scan(network: str) -> list:
    """
    Run nmap -sT -F --top-ports 20 (Non-Root TCP Connect Scan)
    This works WITHOUT root privileges on Termux.
    """
    print(f"\n[SCAN] Starting nmap scan on {network}...")
    print("[SCAN] Using: nmap -sT -F --top-ports 20 (Non-Root mode)")

    try:
        # -sT = TCP Connect scan (no root needed)
        # -F = Fast mode (scan fewer ports)
        # --top-ports 20 = Only top 20 ports
        # -T4 = Aggressive timing
        result = subprocess.run(
            ["nmap", "-sT", "-F", "--top-ports", "20", "-T4", "-oG", "-", network],
            capture_output=True,
            text=True,
            timeout=300,
        )

        hosts = []
        for line in result.stdout.splitlines():
            # Parse grepable output: Host: 192.168.1.1 ()	Status: Up
            match = re.match(r"Host:\s+(\d+\.\d+\.\d+\.\d+)\s+.*Status:\s+(\w+)", line)
            if match:
                ip, status = match.groups()
                if status == "Up":
                    hosts.append(ip)

        print(f"[SCAN] Found {len(hosts)} active hosts")
        return hosts

    except subprocess.TimeoutExpired:
        print("[ERROR] Scan timed out after 5 minutes")
        return []
    except FileNotFoundError:
        print("[ERROR] nmap not found. Install with: pkg install nmap")
        return []
    except Exception as e:
        print(f"[ERROR] Scan failed: {e}")
        return []


def send_to_render(nodes: list) -> bool:
    """Push scanned nodes to the Render website."""
    payload = {
        "nodes": nodes,
        "source": "Termux-nmap",
        "scanMethod": "nmap-sT-F-top20",
        "publicIP": get_local_ip(),
    }

    try:
        print(f"\n[PUSH] Sending {len(nodes)} nodes to {UPDATE_ENDPOINT}")
        response = requests.post(
            UPDATE_ENDPOINT,
            json=payload,
            headers={"Content-Type": "application/json"},
            timeout=15,
        )

        if response.status_code == 200:
            data = response.json()
            print(f"[PUSH] Success: {data.get('message', 'Data received')}")
            return True
        else:
            print(f"[PUSH] Failed: HTTP {response.status_code}")
            print(f"[PUSH] Response: {response.text[:200]}")
            return False

    except requests.exceptions.ConnectionError:
        print(f"[PUSH] Connection failed. Check internet or URL: {UPDATE_ENDPOINT}")
        return False
    except requests.exceptions.Timeout:
        print("[PUSH] Request timed out. Render server may be sleeping (free tier).")
        return False
    except Exception as e:
        print(f"[PUSH] Error: {e}")
        return False


# ==============================================================================
# MAIN LOOP
# ==============================================================================

def main():
    print("=" * 60)
    print("  Secure City IQ - Mobile Agent (Termux)")
    print("=" * 60)
    print(f"  Target: {RENDER_URL}")
    print(f"  Network: {NETWORK_RANGE}")
    print(f"  Interval: {SCAN_INTERVAL}s")
    print("=" * 60)

    local_ip = get_local_ip()
    network = ".".join(local_ip.split(".")[:3]) + ".0/24"
    print(f"\n[LOCAL] Detected IP: {local_ip}")
    print(f"[LOCAL] Scanning network: {network}")

    while True:
        print(f"\n{'='*60}")
        print(f"  Scan started at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print(f"{'='*60}")

        # 1. Scan network
        active_ips = nmap_scan(network)

        # 2. Build node list
        nodes = []
        for ip in active_ips:
            last_octet = int(ip.split(".")[-1])
            name = get_device_name(ip)
            dev_type = get_device_type(name)

            nodes.append({
                "ip": ip,
                "mac": f"aa:bb:cc:dd:ee:{last_octet:02x}",  # Simulated MAC
                "name": name,
                "type": dev_type,
                "status": "Online",
                "response_time": 0,
                "city": "Wasit-Local",
            })

        # 3. Push to Render
        if nodes:
            success = send_to_render(nodes)
            if success:
                print(f"\n[OK] Website updated with {len(nodes)} nodes!")
                print(f"[OK] View live: {RENDER_URL}")
            else:
                print("\n[WARN] Failed to update website. Will retry next cycle.")
        else:
            print("\n[WARN] No devices found. Check network or try again.")

        # 4. Wait for next scan
        print(f"\n[SLEEP] Next scan in {SCAN_INTERVAL} seconds...")
        print("        Press CTRL+C to stop")
        time.sleep(SCAN_INTERVAL)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n[STOP] Mobile Agent stopped by user.")
        print("[STOP] Goodbye!")
    except Exception as e:
        print(f"\n[FATAL] Unexpected error: {e}")

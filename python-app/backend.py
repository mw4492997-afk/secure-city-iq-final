#!/usr/bin/env python3
# FULL FINAL backend.py for Secure City IQ - FIXED NO RED ERRORS
# Run: cd python-app && venv\Scripts\activate && python backend.py
import os
import json
import time
import socket
import subprocess
from datetime import datetime
from scapy.all import ARP, Ether, srp
import sys

def get_local_subnet():
    """Auto-detect local IP range on Windows/Linux"""

    # Windows ipconfig
    if os.name == 'nt':
        try:
            result = subprocess.run(['ipconfig'], capture_output=True, text=True, shell=True)
            for line in result.stdout.split('\n'):
                if 'IPv4' in line:
                    ip = line.split(':')[1].strip()
                    if ip.startswith('192.168.'):
                        return ip.rsplit('.', 1)[0] + '.0/24'
        except:
            pass
    else:
        # Linux/Mac ifconfig/ip route
        try:
            result = subprocess.run(['ip', 'route'], capture_output=True, text=True)
            for line in result.stdout.split('\n'):
                if 'src' in line and '192.168.' in line:
                    ip = line.split('src ')[1].split()[0]
                    return ip.rsplit('.', 1)[0] + '.0/24'
        except:
            pass
    
    return '192.168.1.0/24'  # Fallback

def get_mac_vendor(mac: str) -> str:
    """MAC vendor lookup"""
    oui = mac.upper()[:8]
    vendors = {
        '00:50:56': 'VMware', '08:00:27': 'VirtualBox', '00:0C:29': 'VMware',
        '52:54:00': 'QEMU', '02:42:A9': 'Twisted', 'B8:27:EB': 'Raspberry Pi',
        'DC:A6:32': 'Raspberry Pi', 'E4:5F:01': 'Raspberry Pi', 'F0:08:D1': 'Realtek'
    }
    return vendors.get(oui, 'Unknown Device')

def scan_network(subnet: str) -> list:
    """Full ARP scan for active devices"""

    devices = []
    print(f'Scanning {subnet}...', end=' ')
    
    try:
        # Create ARP request
        arp_request = ARP(pdst=subnet)
        broadcast = Ether(dst='ff:ff:ff:ff:ff:ff')
        arp_request_broadcast = broadcast / arp_request
        
        # Send and receive
        answered_list = srp(arp_request_broadcast, timeout=2, verbose=False)[0]
        
        for element in answered_list:
            device = {
                'ip': element[1].psrc,
                'mac': element[1].hwsrc,
                'vendor': get_mac_vendor(element[1].hwsrc),
                'lastSeen': datetime.now().isoformat()
            }
            devices.append(device)
        
        print(f'Found {len(devices)} devices')
        return devices
        
    except Exception as e:
        print(f'ERROR: {e}')
        return []

def save_to_json(devices: list):
    """Save to public/devices.json - CREATE FOLDER IF NEEDED"""

    # Project root path
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    public_dir = os.path.join(project_root, 'public')
    devices_file = os.path.join(public_dir, 'devices.json')
    
    # CREATE public FOLDER IF DOESNT EXIST
    os.makedirs(public_dir, exist_ok=True)
    
    data = {
        'scanTime': datetime.now().isoformat(),
        'subnet': globals()['subnet'],  # Global subnet var
        'totalDevices': len(devices),
        'devices': devices
    }
    
    try:
        with open(devices_file, 'w') as f:
            json.dump(data, f, indent=2)
        print(f'Saved {len(devices)} devices -> {devices_file}')
    except Exception as e:
        print(f'Save failed: {e}')

if __name__ == '__main__':
    print('SECURE CITY IQ - REAL NETWORK SCANNER v2.0')
    print('=' * 50)
    
    global subnet
    subnet = get_local_subnet()
    print(f'Local subnet: {subnet}')
    
    print('Scanning every 5 seconds (Ctrl+C to stop)')
    print()
    
    try:
        while True:
            devices = scan_network(subnet)
            save_to_json(devices)
            
            # Live print devices (top 10)
            if devices:
                print('LIVE DEVICES:')
                for d in devices[:10]:
                    print(f'  {d["ip"]} -> {d["mac"]} ({d["vendor"]})')
            
            print('-' * 50)
            time.sleep(5)
            
    except KeyboardInterrupt:
        print('\nScanner stopped by user')
        print('Final scan saved to public/devices.json')
    except Exception as e:
        print(f'Fatal error: {e}')
        sys.exit(1)

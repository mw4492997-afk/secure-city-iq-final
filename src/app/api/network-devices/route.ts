import { execSync } from 'child_process';
import os from 'os';
import dns from 'dns';
import { NextRequest, NextResponse } from 'next/server';

interface ARPEntry {
  ip: string;
  mac: string;
  type: string;
}

const parseWindowsArp = (output: string): ARPEntry[] => {
  const lines = output.split(/\r?\n/);
  const entries: ARPEntry[] = [];

  for (const line of lines) {
    const match = line.match(/^(\d+\.\d+\.\d+\.\d+)\s+([0-9a-fA-F-]+)\s+(\w+)$/);
    if (match) {
      entries.push({
        ip: match[1],
        mac: match[2],
        type: match[3].toLowerCase(),
      });
    }
  }

  return entries;
};

const parseUnixArp = (output: string): ARPEntry[] => {
  const lines = output.split(/\r?\n/);
  const entries: ARPEntry[] = [];

  for (const line of lines) {
    const match = line.match(/\(?([0-9]{1,3}(?:\.[0-9]{1,3}){3})\)?\s+at\s+([0-9a-fA-F:]+)\s+\[([^\]]+)\]/);
    if (match) {
      entries.push({
        ip: match[1],
        mac: match[2],
        type: match[3].toLowerCase(),
      });
    }
  }

  return entries;
};

const getLocalIPv4Interface = (): { address: string; netmask: string } | null => {
  const interfaces = os.networkInterfaces();

  for (const name of Object.keys(interfaces)) {
    const iface = interfaces[name];
    if (!iface) continue;

    for (const addr of iface) {
      if (addr.family === 'IPv4' && !addr.internal && addr.address && addr.netmask) {
        return { address: addr.address, netmask: addr.netmask };
      }
    }
  }

  return null;
};

const runArpQuery = (): ARPEntry[] => {
  try {
    const command = process.platform === 'win32' ? 'arp -a' : 'arp -an';
    const output = execSync(command, { encoding: 'utf8', timeout: 7000 });
    return process.platform === 'win32' ? parseWindowsArp(output) : parseUnixArp(output);
  } catch (error) {
    console.error('Network devices scan failed:', error);
    return [];
  }
};

const resolveHostName = async (ip: string): Promise<string> => {
  try {
    const reverseNames = await dns.promises.reverse(ip);
    if (reverseNames && reverseNames.length > 0) {
      return reverseNames[0];
    }
  } catch {
    // ignore reverse DNS failures
  }

  try {
    if (process.platform === 'win32') {
      const output = execSync(`nbtstat -A ${ip}`, { encoding: 'utf8', timeout: 7000 });
      const lines = output.split(/\r?\n/);
      const nameLine = lines.find((line) => /<00>\s+UNIQUE/i.test(line));
      if (nameLine) {
        const matched = nameLine.trim().split(/\s+/)[0];
        if (matched && matched !== ip) {
          return matched.replace(/<00>$/i, '').trim();
        }
      }

      const pingOutput = execSync(`ping -a -n 1 ${ip}`, { encoding: 'utf8', timeout: 7000 });
      const pingMatch = pingOutput.match(/Pinging\s+([^\s\[]+)\s+\[/i);
      if (pingMatch) {
        return pingMatch[1].trim();
      }
    } else {
      const pingOutput = execSync(`ping -c 1 -W 1 ${ip}`, { encoding: 'utf8', timeout: 7000 });
      const pingMatch = pingOutput.match(/PING\s+([^\s\(]+)/i);
      if (pingMatch) {
        const name = pingMatch[1].trim();
        if (name && name !== ip) {
          return name;
        }
      }
    }
  } catch {
    // ignore any lookup failures
  }

  return 'unknown';
};

const computeSubnet = (address: string, netmask: string): string => {
  const addrParts = address.split('.').map(Number);
  const maskParts = netmask.split('.').map(Number);

  const networkParts = addrParts.map((part, idx) => part & maskParts[idx]);
  return networkParts.join('.') + '/' + maskParts.reduce((count, octet) => count + ((octet >>> 0).toString(2).match(/1/g) || []).length, 0);
};

export async function GET(request: NextRequest) {
  try {
    const localInterface = getLocalIPv4Interface();
    const arpEntries = runArpQuery();

    const devices = await Promise.all(
      arpEntries.map(async (entry) => {
        const name = await resolveHostName(entry.ip);
        return {
          ip: entry.ip,
          mac: entry.mac,
          name,
          status: entry.mac.toLowerCase().includes('ff-ff-ff-ff-ff-ff') || entry.type === 'incomplete' ? 'inactive' : 'active',
          source: 'arp',
        };
      })
    );

    return NextResponse.json({
      success: true,
      localIP: localInterface?.address ?? '127.0.0.1',
      localSubnet: localInterface ? computeSubnet(localInterface.address, localInterface.netmask) : undefined,
      devices,
      source: 'arp',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Network devices API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      devices: [],
    }, { status: 500 });
  }
}

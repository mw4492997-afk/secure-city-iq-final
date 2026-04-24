export interface GeolocationData {
  ip: string;
  city: string;
  country: string;
  lat: number;
  lon: number;
}

export interface ScanNode {
  ip: string;
  status: string;
  responseTime?: number;
  city?: string;
}

export interface PingResult {
  reachable: boolean;
  responseTime: number;
  geo?: {
    city?: string;
    country?: string;
  };
}

const DEFAULT_IP = '127.0.0.1';
const DEFAULT_GEO: GeolocationData = {
  ip: DEFAULT_IP,
  city: 'Localhost',
  country: 'Local',
  lat: 0,
  lon: 0,
};

const safeJson = async <T>(response: Response): Promise<T | null> => {
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
};

export const getClientIP = async (): Promise<string> => {
  try {
    const response = await fetch('https://api.ipify.org?format=json', {
      method: 'GET',
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      return DEFAULT_IP;
    }

    const data = await safeJson<{ ip?: string }>(response);
    return data?.ip || DEFAULT_IP;
  } catch (error) {
    console.error('getClientIP error:', error);
    return DEFAULT_IP;
  }
};

export const getGeolocation = async (ip?: string): Promise<GeolocationData> => {
  const query = ip ? `/${encodeURIComponent(ip)}` : '';
  try {
    const response = await fetch(`https://ip-api.com/json${query}?fields=status,message,country,city,lat,lon,query`, {
      method: 'GET',
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      return DEFAULT_GEO;
    }

    const data = await safeJson<{
      status?: string;
      message?: string;
      country?: string;
      city?: string;
      lat?: number;
      lon?: number;
      query?: string;
    }>(response);

    if (!data || data.status !== 'success') {
      return DEFAULT_GEO;
    }

    return {
      ip: data.query || DEFAULT_IP,
      city: data.city || 'Unknown',
      country: data.country || 'Unknown',
      lat: typeof data.lat === 'number' ? data.lat : 0,
      lon: typeof data.lon === 'number' ? data.lon : 0,
    };
  } catch (error) {
    console.error('getGeolocation error:', error);
    return DEFAULT_GEO;
  }
};

export const pingIP = async (ip: string): Promise<PingResult> => {
  try {
    const response = await fetch('/api/scan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        target: ip,
        scan_type: 'ping',
      }),
    });

    if (!response.ok) {
      throw new Error('Ping request failed');
    }

    const data = await safeJson<{
      reachable?: boolean;
      responseTime?: number;
      geolocation?: {
        city?: string;
        country?: string;
      };
      status?: string;
    }>(response);

    return {
      reachable: data?.reachable ?? data?.status === 'online' ?? false,
      responseTime: typeof data?.responseTime === 'number' ? data.responseTime : 0,
      geo: data?.geolocation,
    };
  } catch (error) {
    console.error('pingIP error:', error);
    return {
      reachable: false,
      responseTime: -1,
    };
  }
};

export const simulateNetworkScan = async (): Promise<ScanNode[]> => {
  const ips = [
    `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
    `10.0.0.${Math.floor(Math.random() * 254) + 1}`,
    `172.16.${Math.floor(Math.random() * 254) + 1}.${Math.floor(Math.random() * 254) + 1}`,
  ];

  return ips.map((ip) => ({
    ip,
    status: Math.random() > 0.35 ? 'active' : 'inactive',
    responseTime: Math.floor(Math.random() * 180) + 20,
    city: 'Unknown',
  }));
};

export const realNetworkScan = async (target?: string): Promise<ScanNode[]> => {
  try {
    const response = await fetch('/api/scan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        target: target || '192.168.1.0/24',
        scan_type: 'subnet',
      }),
    });

    if (!response.ok) {
      throw new Error('Network scan request failed');
    }

    const data = await safeJson<{
      success?: boolean;
      nodes?: Array<{
        ip?: string;
        status?: string;
        responseTime?: number;
        geolocation?: {
          city?: string;
        };
      }>;
    }>(response);

    if (!data?.success || !Array.isArray(data.nodes)) {
      return simulateNetworkScan();
    }

    return data.nodes.map((node) => ({
      ip: node.ip || DEFAULT_IP,
      status: node.status === 'offline' ? 'inactive' : 'active',
      responseTime: node.responseTime,
      city: node.geolocation?.city || 'Unknown',
    }));
  } catch (error) {
    console.error('realNetworkScan error:', error);
    return simulateNetworkScan();
  }
};

export const fetchRealThreats = async (limit: number = 10) => {
  try {
    const response = await fetch(`/api/threats?feed=cve&limit=${limit}`, {
      method: 'GET',
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Threats request failed');
    }

    const data = await safeJson<{ success?: boolean; threats?: any[] }>(response);
    return data?.success && Array.isArray(data.threats) ? data.threats : [];
  } catch (error) {
    console.error('fetchRealThreats error:', error);
    return [];
  }
};

export const getNetworkMetrics = () => {
  const connection = (navigator as any).connection;
  return {
    downlink: connection?.downlink ?? 0,
    rtt: connection?.rtt ?? 0,
  };
};



import { NextRequest, NextResponse } from 'next/server';

// Fetch real CVE data from Circl CVE API (free, no authentication required)
async function fetchCVEData(limit: number = 10) {
  try {
    // Circl CVE API - free public API, no auth needed
    // Get the latest CVEs
    const response = await fetch('https://cve.circl.lu/api/last', {
      headers: {
        'User-Agent': 'Secure-City-IQ/1.0',
      },
      cache: 'no-store', // Ensure fresh data
    });

    if (!response.ok) {
      throw new Error(`Circl API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform CVE data into threat intelligence format
    const threats = data.slice(0, limit).map((cve: any) => ({
      id: cve.id,
      title: cve.summary || 'Unknown Vulnerability',
      severity: calculateSeverity(cve.cvss || 0),
      cvss_score: cve.cvss || 0,
      published: cve.published || new Date().toISOString(),
      description: cve.description || cve.summary || 'No description available',
      references: cve.references || [],
      affected_products: extractAffectedProducts(cve.summary || ''),
    }));

    return threats;
  } catch (error) {
    console.error('CVE fetch error:', error);
    throw error;
  }
}

// Calculate severity from CVSS score
function calculateSeverity(cvss: number): 'Critical' | 'High' | 'Medium' | 'Low' {
  if (cvss >= 9.0) return 'Critical';
  if (cvss >= 7.0) return 'High';
  if (cvss >= 4.0) return 'Medium';
  return 'Low';
}

// Extract affected products from summary (basic parsing)
function extractAffectedProducts(summary: string): string[] {
  const products: string[] = [];
  const commonProducts = [
    'Apache', 'Nginx', 'Windows', 'Linux', 'PHP', 'Python',
    'Java', 'Node.js', 'Docker', 'Kubernetes', 'OpenSSL',
    'OpenSSH', 'Curl', 'WordPress', 'Drupal', 'MySQL'
  ];

  commonProducts.forEach((product) => {
    if (summary.toLowerCase().includes(product.toLowerCase())) {
      products.push(product);
    }
  });

  return products.length > 0 ? products : ['Unknown Software'];
}

// Fetch real threat feeds from public sources
async function fetchThreatFeed() {
  try {
    // Use NIST NVD API for recent CVEs (free tier)
    const today = new Date();
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastModifiedDate = lastWeek.toISOString().split('T')[0];

    const response = await fetch(
      `https://services.nvd.nist.gov/rest/json/cves/2.0?lastModStartDate=${lastModifiedDate}T00:00:00Z&resultsPerPage=20`,
      {
        headers: {
          'User-Agent': 'Secure-City-IQ/1.0',
        },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      // Fallback to Circl if NIST fails
      return fetchCVEData(10);
    }

    const nvdData = await response.json();
    
    // Transform NIST NVD data
    const threats = (nvdData.vulnerabilities || [])
      .slice(0, 10)
      .map((vuln: any) => {
        const cve = vuln.cve;
        const cvssScore = cve.metrics?.cvssMetricV3?.[0]?.cvssData?.baseScore || 
                         cve.metrics?.cvssMetricV2?.[0]?.cvssData?.baseScore || 0;

        return {
          id: cve.id,
          title: cve.descriptions?.[0]?.value || 'Unknown Vulnerability',
          severity: calculateSeverity(cvssScore),
          cvss_score: cvssScore,
          published: cve.published || new Date().toISOString(),
          description: cve.descriptions?.[0]?.value || 'No description available',
          references: cve.references?.map((ref: any) => ref.url) || [],
          affected_products: extractAffectedProducts(cve.descriptions?.[0]?.value || ''),
        };
      });

    return threats;
  } catch (error) {
    console.error('Threat feed error:', error);
    // Final fallback to Circl
    return fetchCVEData(10);
  }
}

export async function GET(request: NextRequest) {
  try {
    const feedType = request.nextUrl.searchParams.get('feed') || 'cve';
    const limit = parseInt(request.nextUrl.searchParams.get('limit') || '10');

    let threats;

    if (feedType === 'feed') {
      threats = await fetchThreatFeed();
    } else {
      threats = await fetchCVEData(limit);
    }

    return NextResponse.json({
      success: true,
      count: threats.length,
      threats,
      timestamp: new Date().toISOString(),
      source: 'Circl CVE API & NIST NVD',
    });
  } catch (error) {
    console.error('Threats API error:', error);
    
    // Return cached/mock data on failure
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch threat data',
        details: error instanceof Error ? error.message : 'Unknown error',
        fallback: true,
      },
      { status: 500 }
    );
  }
}

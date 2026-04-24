import { NextRequest, NextResponse } from 'next/server'

// In-memory mock storage for security reports (resets on server restart, for demo/build fix)
let securityReports: any[] = [];

function saveSecurityReport(report: any) {
  const newReport = { ...report, created_at: new Date().toISOString() };
  securityReports.push(newReport);
  // Keep only last 100 for memory
  if (securityReports.length > 100) {
    securityReports = securityReports.slice(-100);
  }
  return newReport;
}

function getSecurityReports() {
  return securityReports
    .slice()
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 50); // Last 50
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const report = saveSecurityReport(body)
    return NextResponse.json({ success: true, data: report })
  } catch (error) {
    console.error('Error saving security report:', error)
    return NextResponse.json(
      { error: 'Failed to save security report' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const reports = getSecurityReports()
    return NextResponse.json({ success: true, data: reports })
  } catch (error) {
    console.error('Error fetching security reports:', error)
    return NextResponse.json(
      { error: 'Failed to fetch security reports' },
      { status: 500 }
    )
  }
}

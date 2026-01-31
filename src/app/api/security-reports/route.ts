import { NextRequest, NextResponse } from 'next/server'
import { saveSecurityReport, getSecurityReports } from '../../../lib/supabase'

export const dynamic = 'force-dynamic';
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const report = await saveSecurityReport(body)
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
    const reports = await getSecurityReports()
    return NextResponse.json({ success: true, data: reports })
  } catch (error) {
    console.error('Error fetching security reports:', error)
    return NextResponse.json(
      { error: 'Failed to fetch security reports' },
      { status: 500 }
    )
  }
}

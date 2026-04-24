import { NextRequest, NextResponse } from "next/server";

interface AuditEntry {
  id: string;
  time: string;
  event: string;
  source: string;
  level: "Info" | "Warning" | "Critical" | "Alert";
}

let auditLogs: AuditEntry[] = [
  {
    id: "log-1",
    time: new Date().toISOString(),
    event: "System integrity check passed",
    source: "Core Monitor",
    level: "Info",
  },
  {
    id: "log-2",
    time: new Date(Date.now() - 120000).toISOString(),
    event: "Firewall rules updated successfully",
    source: "Firewall Engine",
    level: "Info",
  },
  {
    id: "log-3",
    time: new Date(Date.now() - 300000).toISOString(),
    event: "Suspicious login attempt blocked",
    source: "Access Control",
    level: "Alert",
  },
];

const auditEventTemplates = [
  { event: "Unauthorized access attempt detected", source: "Access Control", level: "Alert" },
  { event: "New device connected to the mesh", source: "Network Monitor", level: "Info" },
  { event: "Encrypted tunnel established", source: "Crypto Service", level: "Info" },
  { event: "Malware signature update applied", source: "Threat Engine", level: "Info" },
  { event: "High latency anomaly observed", source: "Traffic Analyzer", level: "Warning" },
  { event: "Critical patch deployed", source: "Patch Manager", level: "Critical" },
  { event: "Intrusion prevention rule triggered", source: "Firewall Engine", level: "Alert" },
  { event: "Biometric verification completed", source: "Identity Gateway", level: "Info" },
];

function sortLogs() {
  auditLogs = auditLogs
    .slice()
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
}

function addAuditEvent(entry: AuditEntry) {
  auditLogs.unshift(entry);
  if (auditLogs.length > 100) {
    auditLogs = auditLogs.slice(0, 100);
  }
}

function startAuditEventGenerator() {
  const globalAny = globalThis as any;
  if (globalAny.__auditLogsGeneratorStarted) return;
  globalAny.__auditLogsGeneratorStarted = true;

  setInterval(() => {
    const template = auditEventTemplates[Math.floor(Math.random() * auditEventTemplates.length)];
    addAuditEvent({
      id: `log-${Date.now()}`,
      time: new Date().toISOString(),
      event: template.event,
      source: template.source,
      level: template.level,
    });
  }, 7000);
}

startAuditEventGenerator();

export async function GET() {
  sortLogs();
  return NextResponse.json({ success: true, data: auditLogs.slice(0, 50) });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newEntry: AuditEntry = {
      id: `log-${Date.now()}`,
      time: new Date().toISOString(),
      event: body.event || "Audit event recorded",
      source: body.source || "System",
      level: body.level || "Info",
    };

    auditLogs.unshift(newEntry);
    if (auditLogs.length > 100) {
      auditLogs = auditLogs.slice(0, 100);
    }

    return NextResponse.json({ success: true, data: newEntry });
  } catch (error) {
    console.error("Audit log error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to record audit log" },
      { status: 500 }
    );
  }
}

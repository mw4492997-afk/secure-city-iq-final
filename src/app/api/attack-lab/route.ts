import { NextRequest, NextResponse } from "next/server";

interface AttackScenario {
  id: string;
  title: string;
  vector: string;
  description: string;
  risk: "High" | "Medium" | "Low";
  status: "Available" | "Executed";
}

const scenarios: AttackScenario[] = [
  {
    id: "scenario-1",
    title: "Credential Harvesting",
    vector: "Phishing Email",
    description: "Simulate a targeted phishing campaign to test employee response.",
    risk: "High",
    status: "Available",
  },
  {
    id: "scenario-2",
    title: "Lateral Movement",
    vector: "Internal Network Worm",
    description: "Execute a simulated lateral movement attack across network segments.",
    risk: "Medium",
    status: "Available",
  },
  {
    id: "scenario-3",
    title: "Data Exfiltration",
    vector: "Encrypted Tunnel",
    description: "Attempt a controlled exfiltration of sample data to external host.",
    risk: "High",
    status: "Available",
  },
  {
    id: "scenario-4",
    title: "Denial of Service",
    vector: "UDP Flood",
    description: "Simulate a volumetric service denial attack on public-facing services.",
    risk: "Low",
    status: "Available",
  },
];

const history: any[] = [];

export async function GET() {
  return NextResponse.json({ success: true, data: scenarios, history });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const scenarioId = body.scenarioId as string;
    const scenario = scenarios.find((item) => item.id === scenarioId);

    if (!scenario) {
      return NextResponse.json(
        { success: false, error: "Scenario not found" },
        { status: 404 }
      );
    }

    const result = {
      id: `attack-${Date.now()}`,
      scenarioId,
      title: scenario.title,
      vector: scenario.vector,
      executedAt: new Date().toISOString(),
      status: Math.random() > 0.3 ? "SUCCESS" : "CONTAINED",
      detail:
        Math.random() > 0.3
          ? "Simulated attack completed and detected by defenses."
          : "Attack contained by WAF and endpoint controls.",
    };

    history.unshift(result);
    if (history.length > 20) history.splice(20);

    return NextResponse.json({ success: true, result, history });
  } catch (error) {
    console.error("Attack lab error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to execute attack scenario" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";

const biometricLogs = [
  {
    id: "bio-1",
    timestamp: new Date(Date.now() - 1000 * 35).toISOString(),
    user: "admin",
    device: "Fingerprint Scanner A3",
    location: "Main Entrance",
    status: "Success",
  },
  {
    id: "bio-2",
    timestamp: new Date(Date.now() - 1000 * 120).toISOString(),
    user: "operator_4",
    device: "Iris Terminal B1",
    location: "Control Room",
    status: "Failed",
  },
  {
    id: "bio-3",
    timestamp: new Date(Date.now() - 1000 * 300).toISOString(),
    user: "sys_monitor",
    device: "FaceID Module C2",
    location: "Server Vault",
    status: "Success",
  },
  {
    id: "bio-4",
    timestamp: new Date(Date.now() - 1000 * 900).toISOString(),
    user: "guest_access",
    device: "Fingerprint Scanner A3",
    location: "West Gate",
    status: "Failed",
  },
];

export async function GET() {
  return NextResponse.json({ success: true, data: biometricLogs });
}

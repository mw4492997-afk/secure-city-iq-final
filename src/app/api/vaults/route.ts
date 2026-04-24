import { NextResponse } from "next/server";

const vaultEntries = [
  {
    id: "vault-01",
    name: "Database Master Key",
    type: "AES-256",
    status: "Active",
    owner: "Core Services",
    expires: "2030-08-14",
    lastUsed: "2026-04-24T13:12:00Z",
    access_policy: "Admin+2FA",
  },
  {
    id: "vault-02",
    name: "SSH Deployment Key",
    type: "RSA-4096",
    status: "Active",
    owner: "DevOps",
    expires: "2028-12-01",
    lastUsed: "2026-04-24T12:48:00Z",
    access_policy: "Admin Only",
  },
  {
    id: "vault-03",
    name: "SSL Certificate Private Key",
    type: "ECDSA-P384",
    status: "Locked",
    owner: "Security",
    expires: "2027-05-10",
    lastUsed: "2026-04-23T22:10:00Z",
    access_policy: "Admin+Biometric",
  },
  {
    id: "vault-04",
    name: "API Gateway Token",
    type: "HMAC-SHA256",
    status: "Revoked",
    owner: "Gateway",
    expires: "2026-04-20",
    lastUsed: "2026-04-20T18:44:00Z",
    access_policy: "Admin Only",
  },
];

export async function GET() {
  return NextResponse.json({ success: true, data: vaultEntries });
}

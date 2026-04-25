import { NextRequest, NextResponse } from "next/server";
import { promisify } from "util";
import { exec } from "child_process";

const execAsync = promisify(exec);

const TARGET_REGEX = /^[a-zA-Z0-9._:\/\-]+$/;

function sanitizeTarget(target: string) {
  return target.trim().replace(/[^a-zA-Z0-9._:\/\-]/g, "");
}

function isValidTarget(target: string) {
  return TARGET_REGEX.test(target);
}

async function runNmap(target: string) {
  const sanitized = sanitizeTarget(target);
  try {
    const command = `nmap -Pn -p 1-1024 --open ${sanitized}`;
    const { stdout, stderr } = await execAsync(command, {
      timeout: 120000,
      maxBuffer: 20 * 1024 * 1024,
    });

    const lines = stdout.split("\n").map((line) => line.trim()).filter(Boolean);
    const openPorts = lines
      .filter((line) => /^\d+\/(tcp|udp)\s+open/.test(line))
      .map((line) => {
        const parts = line.split(/\s+/);
        return {
          port: parts[0],
          state: parts[1],
          service: parts.slice(2).join(" "),
        };
      });

    return {
      tool: "nmap",
      target: sanitized,
      raw: stdout,
      command,
      ports: openPorts,
      warning: stderr ? stderr.trim() : undefined,
    };
  } catch (error) {
    return {
      tool: "nmap",
      target: sanitized,
      error: error instanceof Error ? error.message : "Nmap execution failed",
    };
  }
}

async function runMasscan(target: string) {
  const sanitized = sanitizeTarget(target);
  try {
    const command = `masscan ${sanitized} -p1-1000 --rate 300`;
    const { stdout, stderr } = await execAsync(command, {
      timeout: 120000,
      maxBuffer: 20 * 1024 * 1024,
    });

    const lines = stdout.split("\n").map((line) => line.trim()).filter(Boolean);
    const openPorts = lines
      .filter((line) => line.includes("Discovered open port"))
      .map((line) => {
        const match = line.match(/Discovered open port (\d+\/tcp|\d+\/udp) on ([^\s]+)/i);
        return {
          description: line,
          port: match ? match[1] : undefined,
          host: match ? match[2] : undefined,
        };
      });

    return {
      tool: "masscan",
      target: sanitized,
      raw: stdout,
      command,
      ports: openPorts,
      warning: stderr ? stderr.trim() : undefined,
    };
  } catch (error) {
    return {
      tool: "masscan",
      target: sanitized,
      error: error instanceof Error ? error.message : "Masscan execution failed",
    };
  }
}

async function proxySecurityService(serviceName: string, target: string) {
  const host = process.env[`${serviceName.toUpperCase()}_HOST`];
  const apiKey = process.env[`${serviceName.toUpperCase()}_API_KEY`];

  if (!host) {
    return {
      tool: serviceName,
      target,
      error: `${serviceName.toUpperCase()} service is not configured. Set ${serviceName.toUpperCase()}_HOST in environment variables.`,
    };
  }

  try {
    const url = host.endsWith("/") ? `${host}api/scan` : `${host}/api/scan`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify({ target }),
    });

    const data = await response.json();
    return {
      tool: serviceName,
      target,
      proxyResponse: data,
      status: response.status,
      ok: response.ok,
    };
  } catch (error) {
    return {
      tool: serviceName,
      target,
      error: error instanceof Error ? error.message : "Failed to connect to security service",
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const target = body.target?.toString().trim();
    const tool = body.tool?.toString().toLowerCase() || "nmap";

    if (!target) {
      return NextResponse.json({ error: "Target is required" }, { status: 400 });
    }

    if (!isValidTarget(target)) {
      return NextResponse.json({ error: "Invalid target format" }, { status: 400 });
    }

    if (tool === "nmap") {
      return NextResponse.json(await runNmap(target));
    }

    if (tool === "masscan") {
      return NextResponse.json(await runMasscan(target));
    }

    if (tool === "openvas" || tool === "nessus") {
      return NextResponse.json(await proxySecurityService(tool, target));
    }

    return NextResponse.json({ error: "Unknown scan tool" }, { status: 400 });
  } catch (error) {
    console.error("Scan tools error:", error);
    return NextResponse.json(
      {
        error: "Scan tools request failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

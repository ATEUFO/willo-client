import net from "node:net";
import os from "node:os";
import pLimit from "p-limit";
import axios from "axios";
import { ServerInfo } from "./find-server";

// Interfaces to ignore when detecting local IPv4 subnets (docker bridges, virtual interfaces, VPNs, tap/tun)
const VIRTUAL_IFACE_REGEX = /^(docker|br-|veth|virbr|tun|tap|vnet|wg|tailscale|zero)/i;

/**
 * Returns candidate local IP addresses to check directly before scanning full subnets.
 * Includes loopback, localhost, and active non-virtual host interface IPs.
 */
export function getLocalCandidateIPs(): string[] {
  const candidates: string[] = ["127.0.0.1", "localhost"];
  const nets = os.networkInterfaces();

  for (const [ifaceName, ifaces] of Object.entries(nets)) {
    if (VIRTUAL_IFACE_REGEX.test(ifaceName)) continue;
    for (const iface of ifaces || []) {
      if (iface && (iface.family === "IPv4" || (iface.family as any) === 4) && !iface.internal) {
        if (!candidates.includes(iface.address)) {
          candidates.push(iface.address);
        }
      }
    }
  }
  return candidates;
}

/**
 * Returns active local IPv4 subnet prefixes (e.g., ["10.5.49"])
 * ignoring virtual docker bridges and loopback interfaces.
 */
export function getLocalSubnetPrefixes(): string[] {
  const prefixes = new Set<string>();
  const nets = os.networkInterfaces();

  for (const [ifaceName, ifaces] of Object.entries(nets)) {
    if (VIRTUAL_IFACE_REGEX.test(ifaceName)) continue;
    for (const iface of ifaces || []) {
      if (iface && (iface.family === "IPv4" || (iface.family as any) === 4) && !iface.internal) {
        const parts = iface.address.split(".");
        if (parts.length === 4) {
          prefixes.add(parts.slice(0, 3).join("."));
        }
      }
    }
  }

  // Fallback: If no non-virtual interface found, grab any active non-internal interface
  if (prefixes.size === 0) {
    for (const ifaces of Object.values(nets)) {
      for (const iface of ifaces || []) {
        if (iface && (iface.family === "IPv4" || (iface.family as any) === 4) && !iface.internal) {
          const parts = iface.address.split(".");
          if (parts.length === 4) {
            prefixes.add(parts.slice(0, 3).join("."));
          }
        }
      }
    }
  }

  return Array.from(prefixes);
}

async function verifyWilloServer(host: string, port = 5030): Promise<ServerInfo | null> {
  try {
    const response = await axios.get(`http://${host}:${port}/discovery`, { timeout: 1200 });
    if (response.data && (response.data.service === "willo-server" || response.data.siteName)) {
      return {
        name: response.data.siteName || "Centre de Santé Willo",
        host,
        port: response.data.ports?.proxy || port,
        caFingerprint: response.data.caFingerprint || "",
      };
    }
  } catch {
    // Not a Willo server or timed out
  }
  return null;
}

function tryConnect(host: string, port = 5030, timeout = 300): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host, port });
    socket.setTimeout(timeout);
    socket.once("connect", () => { socket.destroy(); resolve(true); });
    socket.once("timeout", () => { socket.destroy(); resolve(false); });
    socket.once("error", () => resolve(false));
  });
}

export async function scanSubnetForServer(): Promise<ServerInfo[]> {
  const foundMap = new Map<string, ServerInfo>();

  // Step 1: Immediately test local candidates (127.0.0.1, localhost, host LAN IP 10.5.49.37)
  const candidateIps = getLocalCandidateIPs();
  for (const host of candidateIps) {
    const server = await verifyWilloServer(host);
    if (server) {
      foundMap.set(`${server.host}:${server.port}`, server);
    }
  }

  // Step 2: Scan LAN subnets ignoring virtual interfaces
  const prefixes = getLocalSubnetPrefixes();
  const limit = pLimit(30);

  for (const prefix of prefixes) {
    await Promise.all(
      Array.from({ length: 254 }, (_, i) => i + 1).map((n) =>
        limit(async () => {
          const host = `${prefix}.${n}`;
          if (foundMap.has(`${host}:5030`)) return;

          if (await tryConnect(host)) {
            const server = await verifyWilloServer(host);
            if (server) {
              foundMap.set(`${server.host}:${server.port}`, server);
            }
          }
        })
      )
    );
  }

  return Array.from(foundMap.values());
}
import net from "node:net";
import os from "node:os";
import pLimit from "p-limit";
import axios from "axios";
import { ServerInfo } from "./find-server";

function getLocalSubnetPrefix(): string {
  const nets = os.networkInterfaces();
  for (const iface of Object.values(nets).flat()) {
    if (iface && (iface.family === "IPv4" || (iface.family as any) === 4) && !iface.internal) {
      return iface.address.split(".").slice(0, 3).join(".");
    }
  }
  throw new Error("Aucune interface réseau active trouvée");
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
  let prefix: string;
  try {
    prefix = getLocalSubnetPrefix();
  } catch (err) {
    console.error("Local subnet prefix lookup failed:", err);
    return [];
  }
  
  const limit = pLimit(30);
  const found: ServerInfo[] = [];

  await Promise.all(
    Array.from({ length: 254 }, (_, i) => i + 1).map((n) =>
      limit(async () => {
        const host = `${prefix}.${n}`;
        if (await tryConnect(host)) {
          try {
            const response = await axios.get(`http://${host}:5030/discovery`, { timeout: 1000 });
            if (response.data && response.data.service === "willo-server") {
              found.push({
                name: response.data.siteName || "Centre de Santé Willo",
                host,
                port: response.data.ports?.proxy || 5030,
                caFingerprint: response.data.caFingerprint || "",
              });
            }
          } catch {
            // Not a Willo server or request failed
          }
        }
      })
    )
  );
  return found;
}
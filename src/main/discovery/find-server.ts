import { Bonjour } from "bonjour-service";
import net from "node:net";
import { scanSubnetForServer } from "./subnet-scan";

export interface ServerInfo {
  name: string
  host: string
  port: number
  caFingerprint: string
}

export function discoverServers(timeoutMs = 4000): Promise<ServerInfo[]> {
  const bonjour = new Bonjour();
  const foundMap = new Map<string, ServerInfo>();

  return new Promise((resolve) => {
    const handleService = (service: any) => {
      const addresses: string[] = service.addresses || [];
      const ipv4 = addresses.find((addr) => net.isIPv4(addr)) || service.referer?.address || "127.0.0.1";
      const key = `${ipv4}:${service.port || 5030}`;

      if (!foundMap.has(key)) {
        foundMap.set(key, {
          name: service.txt?.siteName || service.name || "Centre de Santé Willo",
          host: ipv4,
          port: service.port || 5030,
          caFingerprint: service.txt?.caFingerprint || "",
        });
      }
    };

    // Listen for both 'willo' (standard) and 'willo-server'
    const browserWillo = bonjour.find({ type: "willo" }, handleService);
    const browserWilloServer = bonjour.find({ type: "willo-server" }, handleService);

    setTimeout(async () => {
      try {
        browserWillo.stop();
        browserWilloServer.stop();
        bonjour.destroy();
      } catch {
        // Ignore cleanup errors
      }

      // Fallback: If mDNS returned no servers (e.g. Docker bridge or multicast blocked), scan local subnet
      if (foundMap.size === 0) {
        try {
          console.log("🔍 mDNS ZeroConf n'a rien trouvé, démarrage du scan réseau automatique...");
          const scanned = await scanSubnetForServer();
          scanned.forEach((s) => foundMap.set(`${s.host}:${s.port}`, s));
        } catch (err) {
          console.warn("⚠️ Échec du scan réseau automatique de secours:", err);
        }
      }

      resolve(Array.from(foundMap.values()));
    }, timeoutMs);
  });
}
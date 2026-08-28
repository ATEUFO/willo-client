import { Bonjour } from "bonjour-service";

export interface ServerInfo {
  name: string
  host: string
  port: number
  caFingerprint: string
}

export function discoverServers(timeoutMs = 6000): Promise<ServerInfo[]> {
  const bonjour = new Bonjour();
  const found: ServerInfo[] = [];

  return new Promise((resolve) => {
    const browser = bonjour.find({ type: "willo-server" }, (service) => {
      found.push({
        name: service.txt?.siteName || "willo",
        host: service.referer?.address || service.addresses?.[0] || "127.0.0.1",
        port: service.port,
        caFingerprint: service.txt?.caFingerprint || "",
      });
    });

    setTimeout(() => {
      browser.stop();
      bonjour.destroy();
      resolve(found);
    }, timeoutMs);
  });
}
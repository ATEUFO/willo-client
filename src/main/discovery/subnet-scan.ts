import net from "node:net";
import os from "node:os";
import pLimit from "p-limit";

function getLocalSubnetPrefix(): string {
  const nets = os.networkInterfaces();
  for (const iface of Object.values(nets).flat()) {
    if (iface && iface.family === "IPv4" && !iface.internal) {
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

export async function scanSubnetForServer(): Promise<string[]> {
  const prefix = getLocalSubnetPrefix();
  const limit = pLimit(30)
  const found: string[] = [];

  await Promise.all(
    Array.from({ length: 254 }, (_, i) => i + 1).map((n) =>
      limit(async () => {
        const host = `${prefix}.${n}`;
        if (await tryConnect(host)) found.push(host);
      })
    )
  );
  return found; // en pratique : 0 ou 1 résultat sur un LAN de centre de santé
}
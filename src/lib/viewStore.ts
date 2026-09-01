import "server-only";
import { createHash } from "crypto";
import { dataFile, readJson, writeJson } from "@/lib/storage";

const FILE = dataFile("views.json");

/**
 * Guarda um hash do IP, não o IP. Continua valendo 1 visitante por IP,
 * mas o arquivo não vira uma lista de quem entrou no site.
 */
function fingerprint(ip: string) {
  const salt = process.env.VIEW_SALT ?? "site-friends";
  return createHash("sha256").update(`${salt}:${ip}`).digest("base64url").slice(0, 22);
}

async function read(): Promise<string[]> {
  const parsed = await readJson<unknown>(FILE);
  if (!Array.isArray(parsed)) return [];
  return parsed.filter((item): item is string => typeof item === "string");
}

// Ler-alterar-gravar em paralelo perderia visitas; as escritas vão em fila.
let queue: Promise<unknown> = Promise.resolve();

function serialize<T>(task: () => Promise<T>): Promise<T> {
  const run = queue.then(task, task);
  queue = run.catch(() => {});
  return run;
}

/** Registra o visitante e devolve o total de IPs distintos. */
export function recordView(ip: string): Promise<number> {
  return serialize(async () => {
    const hashes = await read();
    const hash = fingerprint(ip);

    if (hashes.includes(hash)) return hashes.length;

    hashes.push(hash);
    await writeJson(FILE, hashes, false);
    return hashes.length;
  });
}

export async function getViewCount(): Promise<number> {
  return (await read()).length;
}

import "server-only";
import { promises as fs } from "fs";
import { tmpdir } from "os";
import path from "path";

/**
 * Pasta dos JSONs de estado (lista de membros e contagem de visitas).
 *
 * Num servidor comum é o `data/` do projeto. Em serverless (Vercel) a pasta
 * do deploy é somente leitura e a temporária é a única gravável — o que for
 * escrito lá vive enquanto a instância viver. `DATA_DIR` força um caminho.
 */
export const DATA_DIR =
  process.env.DATA_DIR ??
  (process.env.VERCEL
    ? path.join(tmpdir(), "site-friends")
    : path.join(process.cwd(), "data"));

export function dataFile(name: string) {
  return path.join(DATA_DIR, name);
}

/** Lê um JSON do disco. Arquivo inexistente vira `null`, não erro. */
export async function readJson<T>(file: string): Promise<T | null> {
  try {
    return JSON.parse(await fs.readFile(file, "utf-8")) as T;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw err;
  }
}

export async function writeJson(file: string, value: unknown, pretty = true) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  const json = pretty ? JSON.stringify(value, null, 2) : JSON.stringify(value);
  await fs.writeFile(file, `${json}\n`, "utf-8");
}

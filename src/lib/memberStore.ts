import "server-only";
import { dataFile, readJson, writeJson } from "@/lib/storage";

const FILE = dataFile("allowed-members.json");

export type AllowedMember = {
  id: string;
  boost?: string;
  nitro?: string;
  badges?: string[];
};

function normalizeEntry(entry: unknown): AllowedMember | null {
  if (typeof entry === "string") return { id: entry };
  if (!entry || typeof entry !== "object" || !("id" in entry)) return null;

  const { id, boost, nitro, badges, badge } = entry as AllowedMember & {
    badge?: string;
  };
  if (typeof id !== "string") return null;

  const result: AllowedMember = { id };
  // `badge` é do formato antigo, quando só existia o selo de impulso.
  const boostId = boost ?? (badge?.startsWith("boost-") ? badge : undefined);
  if (boostId) result.boost = boostId;
  if (nitro) result.nitro = nitro;

  if (Array.isArray(badges)) {
    const list = badges.filter((b): b is string => typeof b === "string");
    if (list.length) result.badges = list;
  }

  return result;
}

function normalize(parsed: unknown): AllowedMember[] {
  if (!Array.isArray(parsed)) return [];
  return parsed
    .map(normalizeEntry)
    .filter((entry): entry is AllowedMember => entry !== null);
}

/**
 * Lista inicial vinda de `ALLOWED_MEMBERS` (o mesmo JSON do arquivo, em uma
 * linha só). É como o site é abastecido onde não dá pra versionar o arquivo
 * nem contar com disco — em serverless, por exemplo.
 */
function readEnvMembers(): AllowedMember[] {
  const raw = process.env.ALLOWED_MEMBERS?.trim();
  if (!raw) return [];

  try {
    return normalize(JSON.parse(raw));
  } catch {
    console.error("ALLOWED_MEMBERS não é um JSON válido; foi ignorado.");
    return [];
  }
}

/** O arquivo manda; sem arquivo, vale a variável de ambiente. */
async function readMembers(): Promise<AllowedMember[]> {
  const parsed = await readJson<unknown>(FILE);
  return parsed === null ? readEnvMembers() : normalize(parsed);
}

export async function getAllowedMembers(): Promise<AllowedMember[]> {
  return readMembers();
}

export type MemberBadgeInput = {
  boost?: string;
  nitro?: string;
  badges?: string[];
};

function applyBadges(target: AllowedMember, input: MemberBadgeInput) {
  if (input.boost) target.boost = input.boost;
  if (input.nitro) target.nitro = input.nitro;
  if (input.badges?.length) target.badges = input.badges;
}

export async function upsertAllowedMember(
  id: string,
  input: MemberBadgeInput,
): Promise<{ added: boolean }> {
  const members = await readMembers();
  const existing = members.find((member) => member.id === id);

  if (existing) {
    applyBadges(existing, input);
    await writeJson(FILE, members);
    return { added: false };
  }

  const entry: AllowedMember = { id };
  applyBadges(entry, input);

  members.push(entry);
  await writeJson(FILE, members);
  return { added: true };
}

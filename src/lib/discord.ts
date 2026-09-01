import "server-only";
import type {
  DiscordApiGuildMember,
  DiscordMemberCard,
} from "@/types/discord";
import { getAllowedMembers, type AllowedMember } from "@/lib/memberStore";
import {
  getBoostBadge,
  getNitroBadge,
  getProfileBadge,
  sortBadges,
  type Badge,
} from "@/lib/badges";

const DISCORD_API = "https://discord.com/api/v10";

function getAvatarUrl(member: DiscordApiGuildMember, guildId: string) {
  const size = 256;

  if (member.avatar) {
    const ext = member.avatar.startsWith("a_") ? "gif" : "png";
    return `https://cdn.discordapp.com/guilds/${guildId}/users/${member.user.id}/avatars/${member.avatar}.${ext}?size=${size}`;
  }

  if (member.user.avatar) {
    const ext = member.user.avatar.startsWith("a_") ? "gif" : "png";
    return `https://cdn.discordapp.com/avatars/${member.user.id}/${member.user.avatar}.${ext}?size=${size}`;
  }

  const isLegacyUser = member.user.discriminator !== "0";
  const fallbackIndex = isLegacyUser
    ? Number(member.user.discriminator) % 5
    : Number((BigInt(member.user.id) >> BigInt(22)) % BigInt(6));

  return `https://cdn.discordapp.com/embed/avatars/${fallbackIndex}.png`;
}

function toCard(
  member: DiscordApiGuildMember,
  guildId: string,
  entry: AllowedMember,
): DiscordMemberCard {
  // A ordem final vem do ranking em badges.ts, não da ordem de entrada.
  const badges = sortBadges(
    [
      ...(entry.badges ?? []).map(getProfileBadge),
      getNitroBadge(entry.nitro),
      getBoostBadge(entry.boost),
    ].filter((badge): badge is Badge => badge !== null),
  );

  return {
    id: member.user.id,
    username: member.user.username,
    displayName: member.nick ?? member.user.global_name ?? member.user.username,
    avatarUrl: getAvatarUrl(member, guildId),
    badges,
  };
}

async function fetchMember(
  guildId: string,
  botToken: string,
  userId: string,
): Promise<DiscordApiGuildMember | null> {
  const res = await fetch(`${DISCORD_API}/guilds/${guildId}/members/${userId}`, {
    headers: { Authorization: `Bot ${botToken}` },
    next: { revalidate: 60 },
  });

  if (res.status === 404) return null;

  if (!res.ok) {
    const body = await res.text();
    throw new Error(
      `Falha ao buscar membro ${userId} do Discord (${res.status}): ${body}`,
    );
  }

  return (await res.json()) as DiscordApiGuildMember;
}

export async function getMemberCards(): Promise<DiscordMemberCard[]> {
  const guildId = process.env.DISCORD_GUILD_ID;
  const botToken = process.env.DISCORD_BOT_TOKEN;

  if (!guildId || !botToken) {
    throw new Error(
      "DISCORD_GUILD_ID e DISCORD_BOT_TOKEN precisam estar nas variáveis de ambiente",
    );
  }

  const allowed = await getAllowedMembers();
  const results = await Promise.all(
    allowed.map(async (entry): Promise<[AllowedMember, DiscordApiGuildMember | null]> => [
      entry,
      await fetchMember(guildId, botToken, entry.id),
    ]),
  );

  return results
    .filter((result): result is [AllowedMember, DiscordApiGuildMember] => result[1] !== null)
    .map(([entry, member]) => toCard(member, guildId, entry));
}

import { NextResponse } from "next/server";
import { verifyKey } from "discord-interactions";
import { upsertAllowedMember } from "@/lib/memberStore";
import {
  getBoostBadge,
  getNitroBadge,
  getProfileBadge,
  sortBadges,
} from "@/lib/badges";
import type { Badge } from "@/lib/badges";
import type { DiscordInteraction } from "@/types/discord";

const PUBLIC_KEY = process.env.DISCORD_PUBLIC_KEY ?? "";

const InteractionType = { PING: 1, APPLICATION_COMMAND: 2 } as const;
const InteractionResponseType = {
  PONG: 1,
  CHANNEL_MESSAGE_WITH_SOURCE: 4,
} as const;
const EPHEMERAL = 64;

export async function POST(request: Request) {
  const signature = request.headers.get("x-signature-ed25519");
  const timestamp = request.headers.get("x-signature-timestamp");
  const rawBody = await request.text();

  if (!signature || !timestamp || !PUBLIC_KEY) {
    return new NextResponse("Assinatura invalida", { status: 401 });
  }

  const isValid = await verifyKey(rawBody, signature, timestamp, PUBLIC_KEY);
  if (!isValid) {
    return new NextResponse("Assinatura invalida", { status: 401 });
  }

  const interaction = JSON.parse(rawBody) as DiscordInteraction;

  if (interaction.type === InteractionType.PING) {
    return NextResponse.json({ type: InteractionResponseType.PONG });
  }

  if (
    interaction.type === InteractionType.APPLICATION_COMMAND &&
    interaction.data?.name === "addpessoa"
  ) {
    return handleAddPessoa(interaction);
  }

  return NextResponse.json({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: { content: "Comando desconhecido.", flags: EPHEMERAL },
  });
}

async function handleAddPessoa(interaction: DiscordInteraction) {
  const userId = interaction.data?.options?.find((opt) => opt.name === "pessoa")
    ?.value;

  if (!userId) {
    return NextResponse.json({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: { content: "Selecione uma pessoa.", flags: EPHEMERAL },
    });
  }

  const user = interaction.data?.resolved?.users?.[userId];
  const member = interaction.data?.resolved?.members?.[userId];
  const displayName = member?.nick ?? user?.global_name ?? user?.username ?? userId;
  const username = user?.username ?? userId;

  const options = interaction.data?.options ?? [];
  const boost = getBoostBadge(
    options.find((opt) => opt.name === "nivel")?.value,
  );
  const nitro = getNitroBadge(
    options.find((opt) => opt.name === "nitro")?.value,
  );

  const profile = sortBadges(
    ["badge", "badge2", "badge3"]
      .map((name) =>
        getProfileBadge(options.find((opt) => opt.name === name)?.value),
      )
      .filter((badge): badge is Badge => badge !== null),
  );

  const { added } = await upsertAllowedMember(userId, {
    boost: boost?.id,
    nitro: nitro?.id,
    badges: profile.map((badge) => badge.id),
  });

  const labels = sortBadges(
    [...profile, nitro, boost].filter((b): b is Badge => b != null),
  ).map((badge) => badge.label);
  const badgeText = labels.length ? ` com ${labels.join(" e ")}` : "";
  const content = added
    ? `Adicionado: ${displayName} (@${username})${badgeText}`
    : `${displayName} (@${username}) atualizado${badgeText}.`;

  return NextResponse.json({
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: { content, flags: EPHEMERAL },
  });
}

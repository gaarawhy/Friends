export type Badge = {
  id: string;
  label: string;
  image: string;
  /** Posição do selo na fileira. Menor = mais à esquerda. */
  order: number;
};

/**
 * Ordem de exibição dos selos no perfil:
 * staff > parceiro > moderador > HypeSquad > caçador de bugs > devs >
 * Nitro > apoiador inicial > impulso do servidor > missões e cosméticos.
 *
 * Os selos são sempre reordenados por esse ranking, independente da ordem
 * em que foram informados no comando.
 */
const ORDER = {
  STAFF: 10,
  PARTNER: 20,
  PARTNER_OLD: 21,
  MOD: 30,
  MOD_OLD: 31,
  HYPESQUAD: 40,
  BRAVERY: 41,
  BRILLIANCE: 42,
  BALANCE: 43,
  BALANCE_GOLD: 44,
  BUG_HUNTER: 50,
  BUG_HUNTER_GOLD: 51,
  AUTOMOD: 55,
  ACTIVE_DEV: 60,
  BOT_DEV: 61,
  NITRO: 80,
  // O apoiador inicial (porquinho) fica entre o Nitro e o impulso.
  EARLY_SUPPORTER: 85,
  BOOST: 90,
  COSMETIC: 100,
} as const;

/** Impulso (boost) do servidor: 9 níveis, cada um com um ícone próprio. */
const BOOST_LEVELS = 9;

export const BOOST_BADGES: Badge[] = Array.from(
  { length: BOOST_LEVELS },
  (_, i) => {
    const level = i + 1;
    return {
      id: `boost-${level}`,
      label: `Impulso Nível ${level}`,
      image: `/assets/boosts/discord-boost-${level}.svg`,
      order: ORDER.BOOST,
    };
  },
);

/** Nitro: selo por tempo de assinatura (não é nível, é o selo em si). */
const NITRO_TIERS = [
  { key: "bronze", label: "Bronze", file: "bronze" },
  { key: "prata", label: "Prata", file: "silver" },
  { key: "ouro", label: "Ouro", file: "gold" },
  { key: "platina", label: "Platina", file: "platinum" },
  { key: "diamante", label: "Diamante", file: "diamond" },
  { key: "esmeralda", label: "Esmeralda", file: "emerald" },
  { key: "rubi", label: "Rubi", file: "ruby" },
  { key: "opala", label: "Opala", file: "opal" },
];

export const NITRO_BADGES: Badge[] = NITRO_TIERS.map((tier) => ({
  id: `nitro-${tier.key}`,
  label: `Nitro ${tier.label}`,
  image: `/assets/subscriptions/badges/${tier.file}.png`,
  order: ORDER.NITRO,
}));

/**
 * Demais selos de perfil do Discord.
 * O Discord limita a 25 opções por campo de comando, então a lista é enxuta.
 */
const PROFILE_BADGE_SOURCE: [
  id: string,
  label: string,
  file: string,
  order: number,
][] = [
  ["staff", "Equipe do Discord", "discord-staff.svg", ORDER.STAFF],
  ["parceiro", "Parceiro do Discord", "discord-partner.svg", ORDER.PARTNER],
  ["parceiro-antigo", "Parceiro (antigo)", "old-discord-partner.png", ORDER.PARTNER_OLD],
  ["mod", "Moderador Certificado", "discord-mod.svg", ORDER.MOD],
  ["mod-antigo", "Moderador (antigo)", "old-discord-mod.svg", ORDER.MOD_OLD],
  ["hypesquad", "HypeSquad Events", "hype-squad-events.svg", ORDER.HYPESQUAD],
  ["bravery", "HypeSquad Bravery", "hype-squad-bravery.svg", ORDER.BRAVERY],
  ["brilliance", "HypeSquad Brilliance", "hype-squad-brilliance.svg", ORDER.BRILLIANCE],
  ["balance", "HypeSquad Balance", "hype-squad-balance.svg", ORDER.BALANCE],
  ["balance-dourado", "HypeSquad Balance Dourado", "golden-hype-squad-balance.svg", ORDER.BALANCE_GOLD],
  ["bug-hunter", "Caçador de Bugs", "discord-bug-hunter-green.svg", ORDER.BUG_HUNTER],
  ["bug-hunter-ouro", "Caçador de Bugs Dourado", "discord-bug-hunter-gold.svg", ORDER.BUG_HUNTER_GOLD],
  ["automod", "AutoMod", "automod.svg", ORDER.AUTOMOD],
  ["dev-ativo", "Desenvolvedor Ativo", "active-developer.svg", ORDER.ACTIVE_DEV],
  ["dev-bot", "Desenvolvedor de Bot Verificado", "discord-bot-dev.svg", ORDER.BOT_DEV],
  ["apoiador", "Apoiador Inicial", "discord-early-supporter.svg", ORDER.EARLY_SUPPORTER],
  ["nitro-classico", "Nitro", "discord-nitro.svg", ORDER.NITRO],
  ["quest", "Missão Concluída", "quest.png", ORDER.COSMETIC],
  ["orb", "Orb", "orb.svg", ORDER.COSMETIC + 1],
  ["username", "Nome de Usuário", "username.png", ORDER.COSMETIC + 2],
  ["last-meadow", "Last Meadow", "last-meadow.png", ORDER.COSMETIC + 3],
  ["wumpus", "Wumpus", "fame/wumpus.png", ORDER.COSMETIC + 4],
];

export const PROFILE_BADGES: Badge[] = PROFILE_BADGE_SOURCE.map(
  ([id, label, file, order]) => ({
    id,
    label,
    image: `/assets/${file}`,
    order,
  }),
);

const BOOST_BY_ID = new Map(BOOST_BADGES.map((badge) => [badge.id, badge]));
const NITRO_BY_ID = new Map(NITRO_BADGES.map((badge) => [badge.id, badge]));
const PROFILE_BY_ID = new Map(PROFILE_BADGES.map((badge) => [badge.id, badge]));

export function getBoostBadge(id: string | undefined | null): Badge | null {
  if (!id) return null;
  return BOOST_BY_ID.get(id) ?? null;
}

export function getNitroBadge(id: string | undefined | null): Badge | null {
  if (!id) return null;
  return NITRO_BY_ID.get(id) ?? null;
}

export function getProfileBadge(id: string | undefined | null): Badge | null {
  if (!id) return null;
  return PROFILE_BY_ID.get(id) ?? null;
}

/** Ordena os selos pela ordem canônica do Discord. */
export function sortBadges(badges: Badge[]): Badge[] {
  return [...badges].sort((a, b) => a.order - b.order);
}

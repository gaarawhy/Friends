import { config } from "dotenv";

config({ path: ".env" });
config({ path: ".env.local", override: true });

const appId = process.env.DISCORD_APPLICATION_ID;
const guildId = process.env.DISCORD_GUILD_ID;
const token = process.env.DISCORD_BOT_TOKEN;

if (!appId || !guildId || !token) {
  console.error(
    "Defina DISCORD_APPLICATION_ID, DISCORD_GUILD_ID e DISCORD_BOT_TOKEN no .env",
  );
  process.exit(1);
}

const ADMINISTRATOR_PERMISSION = "8";
const USER_OPTION_TYPE = 6;
const STRING_OPTION_TYPE = 3;

// Mantido em sincronia manualmente com src/lib/badges.ts.
const BOOST_LEVELS = 9;

const boostChoices = Array.from({ length: BOOST_LEVELS }, (_, i) => {
  const level = i + 1;
  return { name: `Impulso Nível ${level}`, value: `boost-${level}` };
});

const nitroChoices = [
  ["bronze", "Bronze"],
  ["prata", "Prata"],
  ["ouro", "Ouro"],
  ["platina", "Platina"],
  ["diamante", "Diamante"],
  ["esmeralda", "Esmeralda"],
  ["rubi", "Rubi"],
  ["opala", "Opala"],
].map(([key, label]) => ({ name: `Nitro ${label}`, value: `nitro-${key}` }));

const profileChoices = [
  ["staff", "Equipe do Discord"],
  ["parceiro", "Parceiro do Discord"],
  ["parceiro-antigo", "Parceiro (antigo)"],
  ["mod", "Moderador Certificado"],
  ["mod-antigo", "Moderador (antigo)"],
  ["dev-ativo", "Desenvolvedor Ativo"],
  ["dev-bot", "Desenvolvedor de Bot Verificado"],
  ["bug-hunter", "Caçador de Bugs"],
  ["bug-hunter-ouro", "Caçador de Bugs Dourado"],
  ["apoiador", "Apoiador Inicial"],
  ["nitro-classico", "Nitro"],
  ["hypesquad", "HypeSquad Events"],
  ["bravery", "HypeSquad Bravery"],
  ["brilliance", "HypeSquad Brilliance"],
  ["balance", "HypeSquad Balance"],
  ["balance-dourado", "HypeSquad Balance Dourado"],
  ["automod", "AutoMod"],
  ["quest", "Missão Concluída"],
  ["orb", "Orb"],
  ["username", "Nome de Usuário"],
  ["last-meadow", "Last Meadow"],
  ["wumpus", "Wumpus"],
].map(([value, name]) => ({ name, value }));

const command = {
  name: "addpessoa",
  description: "Admin",
  default_member_permissions: ADMINISTRATOR_PERMISSION,
  options: [
    {
      name: "pessoa",
      description: "Pessoa a adicionar ao site",
      type: USER_OPTION_TYPE,
      required: true,
    },
    {
      name: "nivel",
      description: "Nível do impulso do servidor (opcional)",
      type: STRING_OPTION_TYPE,
      required: false,
      choices: boostChoices,
    },
    {
      name: "nitro",
      description: "Selo do Nitro (opcional)",
      type: STRING_OPTION_TYPE,
      required: false,
      choices: nitroChoices,
    },
    {
      name: "badge",
      description: "Selo de perfil: staff, dev, HypeSquad, etc (opcional)",
      type: STRING_OPTION_TYPE,
      required: false,
      choices: profileChoices,
    },
    {
      name: "badge2",
      description: "Segundo selo de perfil (opcional)",
      type: STRING_OPTION_TYPE,
      required: false,
      choices: profileChoices,
    },
    {
      name: "badge3",
      description: "Terceiro selo de perfil (opcional)",
      type: STRING_OPTION_TYPE,
      required: false,
      choices: profileChoices,
    },
  ],
};

const res = await fetch(
  `https://discord.com/api/v10/applications/${appId}/guilds/${guildId}/commands`,
  {
    method: "PUT",
    headers: {
      Authorization: `Bot ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([command]),
  },
);

if (!res.ok) {
  console.error(`Falha ao registrar comando (${res.status}):`, await res.text());
  process.exit(1);
}

console.log("Comando /addpessoa registrado no servidor.");

import type { Badge } from "@/lib/badges";

export type DiscordMemberCard = {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string;
  badges: Badge[];
};

export type DiscordApiUser = {
  id: string;
  username: string;
  global_name: string | null;
  avatar: string | null;
  discriminator: string;
  bot?: boolean;
};

export type DiscordApiGuildMember = {
  user: DiscordApiUser;
  nick: string | null;
  avatar: string | null;
  roles: string[];
};

export type DiscordInteractionOption = {
  name: string;
  type: number;
  value: string;
};

export type DiscordInteractionUser = {
  id: string;
  username: string;
  global_name: string | null;
  avatar: string | null;
};

export type DiscordInteractionMember = {
  nick: string | null;
};

export type DiscordInteraction = {
  type: number;
  data?: {
    name: string;
    options?: DiscordInteractionOption[];
    resolved?: {
      users?: Record<string, DiscordInteractionUser>;
      members?: Record<string, DiscordInteractionMember>;
    };
  };
};

import Image from "next/image";
import type { DiscordMemberCard } from "@/types/discord";

type Props = {
  member: DiscordMemberCard;
};

export default function MemberCard({ member }: Props) {
  return (
    <article className="mx-auto flex w-full max-w-[420px] flex-col items-center px-6 py-10 text-center">
      <div className="mb-5 h-32 w-32 overflow-hidden rounded-full ring-1 ring-white/15 sm:h-36 sm:w-36">
        <Image
          src={member.avatarUrl}
          alt={member.displayName}
          width={144}
          height={144}
          className="h-full w-full object-cover"
          unoptimized
        />
      </div>

      <h2 className="font-sora text-3xl font-extrabold leading-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
        {member.displayName}
      </h2>
      <p className="select-text font-sora text-lg font-normal text-white/50 drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]">
        @{member.username}
      </p>

      {member.badges.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-1">
          {member.badges.map((badge) => (
            <div
              key={badge.id}
              className="group/badge relative inline-block cursor-pointer"
            >
              <Image
                src={badge.image}
                alt={badge.label}
                width={32}
                height={32}
                className="block h-8 w-auto object-contain transition duration-200 group-hover/badge:brightness-125"
              />

              <span className="pointer-events-none absolute left-1/2 top-[calc(100%+10px)] z-50 -translate-x-1/2 -translate-y-2 scale-90 whitespace-nowrap rounded-lg bg-[#0f0f0f]/[0.98] px-3.5 py-2 font-sora text-[12.5px] font-medium tracking-[0.02em] text-white opacity-0 shadow-[0_8px_24px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.1)] blur-[4px] backdrop-blur-md transition-all duration-[250ms] ease-[cubic-bezier(.34,1.56,.64,1)] group-hover/badge:translate-y-0 group-hover/badge:scale-100 group-hover/badge:opacity-100 group-hover/badge:blur-0">
                <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 border-[6px] border-transparent border-b-[#0f0f0f]" />
                {badge.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}

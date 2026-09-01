import type { DiscordMemberCard } from "@/types/discord";
import MemberCard from "./MemberCard";
import Reveal from "./Reveal";

export default function MemberGrid({ members }: { members: DiscordMemberCard[] }) {
  if (members.length === 0) {
    return null;
  }

  return (
    <div className="mx-auto grid w-full max-w-[1320px] grid-cols-1 items-start gap-6 min-[900px]:grid-cols-2 min-[1340px]:grid-cols-3">
      {members.map((member, index) => (
        <Reveal key={member.id} delay={(index % 3) * 170}>
          <MemberCard member={member} />
        </Reveal>
      ))}
    </div>
  );
}

import BackgroundVideo from "@/components/BackgroundVideo";
import Hero from "@/components/Hero";
import MemberGrid from "@/components/MemberGrid";
import ScrollProgress from "@/components/ScrollProgress";
import ViewCounter from "@/components/ViewCounter";
import { VideoProvider } from "@/components/VideoContext";
import VolumeControl from "@/components/VolumeControl";
import { getMemberCards } from "@/lib/discord";
import type { DiscordMemberCard } from "@/types/discord";

/**
 * A página é regerada a cada minuto. Sem isso ela seria fixada no build e
 * quem entrasse depois continuaria vendo a lista de membros daquele momento.
 */
export const revalidate = 60;

export default async function Home() {
  let members: DiscordMemberCard[] = [];
  let failed = false;

  try {
    members = await getMemberCards();
  } catch (error) {
    // O motivo fica no log do servidor; o visitante não precisa vê-lo.
    console.error(error);
    failed = true;
  }

  return (
    <VideoProvider>
      <BackgroundVideo />
      <ScrollProgress />

      <VolumeControl />
      <ViewCounter />

      <Hero />

      <main className="relative mx-auto flex w-full max-w-[1400px] flex-col items-center px-4 pb-32 sm:px-5">
        {failed ? (
          <p className="font-sora max-w-md text-center text-white/60">
            Não foi possível carregar os membros agora.
          </p>
        ) : (
          <MemberGrid members={members} />
        )}
      </main>
    </VideoProvider>
  );
}

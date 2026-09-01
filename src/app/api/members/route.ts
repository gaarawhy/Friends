import { NextResponse } from "next/server";
import { getMemberCards } from "@/lib/discord";

export const revalidate = 60;

export async function GET() {
  try {
    return NextResponse.json(await getMemberCards());
  } catch (error) {
    // A resposta do Discord pode trazer detalhes do bot; fica só no log.
    console.error(error);
    return NextResponse.json(
      { error: "Não foi possível carregar os membros." },
      { status: 500 },
    );
  }
}

import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { getViewCount, recordView } from "@/lib/viewStore";

export const dynamic = "force-dynamic";

/** Atrás do túnel/proxy o IP real vem por header, não pela conexão. */
async function visitorIp() {
  const list = await headers();
  return (
    list.get("cf-connecting-ip") ??
    list.get("x-real-ip") ??
    list.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "desconhecido"
  );
}

export async function GET() {
  try {
    return NextResponse.json({ count: await getViewCount() });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao ler visitas" }, { status: 500 });
  }
}

export async function POST() {
  try {
    const count = await recordView(await visitorIp());
    return NextResponse.json({ count });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erro ao contar visita" }, { status: 500 });
  }
}

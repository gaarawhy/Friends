import type { Metadata, Viewport } from "next";
import { Sora } from "next/font/google";
import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const description = "Os membros do servidor, com os selos que cada um carrega.";

export const metadata: Metadata = {
  title: "Friends",
  description,
  openGraph: { title: "Friends", description, type: "website" },
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className={`${sora.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-black text-white font-sora">
        {/* Sem JS não há observer de scroll: mostra os cards direto. */}
        <noscript>
          <style>{`.reveal{opacity:1;transform:none;filter:none}`}</style>
        </noscript>
        {children}
      </body>
    </html>
  );
}

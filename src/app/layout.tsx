import type { Metadata, Viewport } from "next";
import "@fontsource-variable/unbounded";
import "@fontsource/ibm-plex-sans/400.css";
import "@fontsource/ibm-plex-sans/500.css";
import "@fontsource/ibm-plex-sans/600.css";
import "./globals.css";
import { getPortfolio } from "@/lib/api";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export async function generateMetadata(): Promise<Metadata> {
  const { profile } = await getPortfolio();
  const title = profile ? `${profile.name} · ${profile.headline}` : "Portfolio";
  const description = profile?.bio.slice(0, 160) ?? "Frontend developer portfolio";
  return {
    metadataBase: new URL(siteUrl),
    title: { default: title, template: `%s · ${profile?.name ?? "Portfolio"}` },
    description,
    icons: { icon: "/favicon.svg" },
    openGraph: { title, description, type: "website", url: siteUrl, images: profile?.avatarUrl ? [profile.avatarUrl] : [] },
    twitter: { card: "summary_large_image", title, description },
  };
}

export const viewport: Viewport = { themeColor: "#0a0d24" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

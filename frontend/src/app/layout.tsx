import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sileo";
import { GetRequestNormal } from "@/api-hooks/api-hooks";
import { SiteContactLauncher } from "@/components/site/site-contact-launcher";
import { buildSiteAppearanceSettings } from "@/lib/site-appearance";
import "sileo/styles.css";
import "./globals.css";
import QueryClint from "@/hooks/QueryClint";

type SiteSettingsPayload = {
  siteTitle?: string | null;
  metaDescription?: string | null;
  logoUrl?: string | null;
  faviconUrl?: string | null;
  ogImageUrl?: string | null;
  whatsappLink?: string | null;
  tawkToLink?: string | null;
  siteTheme?: string | null;
  productCardVariant?: string | null;
  productDetailsVariant?: string | null;
};

const DEFAULT_METADATA = {
  title: "Dynamic E-Commerce",
  description:
    "Discover and shop curated products with a seamless storefront experience.",
};

function normalizeText(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : null;
}

async function getSiteSettingsMetadata(key: string) {
  try {
    return await GetRequestNormal<SiteSettingsPayload>(
      `/web-settings/site?key=${encodeURIComponent(key)}`,
      0,
      "web-settings-site-metadata",
    );
  } catch {
    return null;
  }
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettingsMetadata("default");

  const title = normalizeText(settings?.siteTitle) ?? DEFAULT_METADATA.title;
  const description =
    normalizeText(settings?.metaDescription) ?? DEFAULT_METADATA.description;
  const faviconUrl = normalizeText(settings?.faviconUrl);
  const ogImageUrl =
    normalizeText(settings?.ogImageUrl) ?? normalizeText(settings?.logoUrl);

  return {
    title,
    description,
    icons: faviconUrl
      ? {
          icon: faviconUrl,
          shortcut: faviconUrl,
          apple: faviconUrl,
        }
      : undefined,
    openGraph: {
      title,
      description,
      images: ogImageUrl ? [ogImageUrl] : undefined,
    },
    twitter: {
      card: ogImageUrl ? "summary_large_image" : "summary",
      title,
      description,
      images: ogImageUrl ? [ogImageUrl] : undefined,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSiteSettingsMetadata("default");
  const appearance = buildSiteAppearanceSettings(settings ?? undefined);

  return (
    <html
      lang="en"
      className={appearance.siteTheme}
      suppressHydrationWarning
    >
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryClint appearance={appearance}>
          {children}
          <Toaster position="top-center" />
        </QueryClint>
        <SiteContactLauncher
          whatsappLink={normalizeText(settings?.whatsappLink)}
          tawkToLink={normalizeText(settings?.tawkToLink)}
        />
      </body>
    </html>
  );
}


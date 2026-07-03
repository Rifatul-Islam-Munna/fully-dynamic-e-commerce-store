import type { Metadata } from "next";
import { headers } from "next/headers";
import { Geist, Geist_Mono, Cormorant_Garamond, Manrope } from "next/font/google";
import { Toaster } from "sileo";
import { GetRequestNormal } from "@/api-hooks/api-hooks";
import { DynamicGtm } from "@/components/seo/dynamic-gtm";
import { DynamicJsonLd } from "@/components/seo/dynamic-json-ld";
import { SiteContactLauncher } from "@/components/site/site-contact-launcher";
import {
  getPageSeoSetting,
  normalizeSeoPath,
  normalizeSeoText,
  resolveGtmContainerId,
} from "@/lib/page-seo";
import { buildSiteAppearanceSettings } from "@/lib/site-appearance";
import "sileo/styles.css";
import "./globals.css";
import "./professional-commerce.css";
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

async function getRequestPath() {
  const requestHeaders = await headers();
  return normalizeSeoPath(
    requestHeaders.get("x-storefront-path") ??
      requestHeaders.get("x-invoke-path") ??
      requestHeaders.get("next-url") ??
      requestHeaders.get("x-next-url") ??
      "/",
  );
}

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
const cormorant = Cormorant_Garamond({
  variable: "--font-headline",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});
const manrope = Manrope({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export async function generateMetadata(): Promise<Metadata> {
  const path = await getRequestPath();
  const [settings, pageSeo] = await Promise.all([
    getSiteSettingsMetadata("default"),
    getPageSeoSetting(path),
  ]);
  const title =
    normalizeSeoText(pageSeo?.title) ??
    normalizeSeoText(settings?.siteTitle) ??
    DEFAULT_METADATA.title;
  const description =
    normalizeSeoText(pageSeo?.description) ??
    normalizeSeoText(settings?.metaDescription) ??
    DEFAULT_METADATA.description;
  const faviconUrl = normalizeSeoText(settings?.faviconUrl);
  const imageUrl =
    normalizeSeoText(pageSeo?.imageUrl) ??
    normalizeSeoText(settings?.ogImageUrl) ??
    normalizeSeoText(settings?.logoUrl);
  const canonicalUrl = normalizeSeoText(pageSeo?.canonicalUrl);

  return {
    title,
    description,
    keywords: pageSeo?.keywords?.length ? pageSeo.keywords : undefined,
    alternates: canonicalUrl ? { canonical: canonicalUrl } : undefined,
    robots: {
      index: pageSeo?.robotsIndex ?? true,
      follow: pageSeo?.robotsFollow ?? true,
    },
    icons: faviconUrl
      ? { icon: faviconUrl, shortcut: faviconUrl, apple: faviconUrl }
      : undefined,
    openGraph: {
      type: "website",
      title,
      description,
      url: canonicalUrl ?? undefined,
      images: imageUrl ? [imageUrl] : undefined,
    },
    twitter: {
      card: imageUrl ? "summary_large_image" : "summary",
      title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const path = await getRequestPath();
  const [settings, pageSeo] = await Promise.all([
    getSiteSettingsMetadata("default"),
    getPageSeoSetting(path),
  ]);
  const appearance = buildSiteAppearanceSettings(settings ?? undefined);
  const gtmContainerId = path.startsWith("/admin")
    ? null
    : resolveGtmContainerId(pageSeo);

  return (
    <html lang="en" className={appearance.siteTheme} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${cormorant.variable} ${manrope.variable} commerce-root antialiased`}
      >
        <DynamicJsonLd data={pageSeo?.structuredData} />
        <QueryClint appearance={appearance}>
          {children}
          <Toaster position="top-center" />
        </QueryClint>
        <DynamicGtm containerId={gtmContainerId} />
        <SiteContactLauncher
          whatsappLink={normalizeSeoText(settings?.whatsappLink)}
          tawkToLink={normalizeSeoText(settings?.tawkToLink)}
        />
      </body>
    </html>
  );
}

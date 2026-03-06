import Link from "next/link";
import { GetRequestNormal } from "@/api-hooks/api-hooks";
import { normalizeFooter } from "./footer-normalize";
import type { FooterApiResponse } from "./footer.types";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaXTwitter, FaYoutube } from "react-icons/fa6";
import type { IconType } from "react-icons";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";
import { normalizeNavbar } from "@/components/navbar/navbar-normalize";
import type { NavbarApiResponse } from "@/components/navbar/navbar.types";

const FOOTER_TAG = "web-settings-footer";
const NAVBAR_TAG = "web-settings-navbar";

const SOCIAL_ICONS: Record<string, IconType> = {
  facebook: FaFacebookF,
  instagram: FaInstagram,
  linkedin: FaLinkedinIn,
  twitter: FaXTwitter,
  x: FaXTwitter,
  youtube: FaYoutube,
};

async function getFooterData(key: string) {
  try {
    return await GetRequestNormal<FooterApiResponse>(`/web-settings/footer?key=${encodeURIComponent(key)}`, 60, FOOTER_TAG);
  } catch {
    return null;
  }
}

async function getNavbarData(key: string) {
  try {
    return await GetRequestNormal<NavbarApiResponse>(`/web-settings/navbar?key=${encodeURIComponent(key)}`, 60, NAVBAR_TAG);
  } catch {
    return null;
  }
}

function buildSections(
  footerSections: Array<{ title: string; links: Array<{ label: string; url: string }> }>,
  navbarItems: ReturnType<typeof normalizeNavbar>
) {
  const map = new Map<string, Map<string, string>>();

  for (const section of footerSections) {
    if (!map.has(section.title)) {
      map.set(section.title, new Map());
    }

    const linkMap = map.get(section.title)!;
    for (const link of section.links) {
      linkMap.set(link.url, link.label);
    }
  }

  for (const item of navbarItems) {
    if (!map.has(item.title)) {
      map.set(item.title, new Map());
    }

    const linkMap = map.get(item.title)!;
    linkMap.set(item.url, item.title);
    for (const sub of item.subNav) {
      linkMap.set(sub.url, sub.title);
    }
  }

  return [...map.entries()].map(([title, links]) => ({
    title,
    links: [...links.entries()].map(([url, label]) => ({ url, label })),
  }));
}

export async function Footer({ settingKey = "default" }: { settingKey?: string }) {
  const [footerPayload, navbarPayload] = await Promise.all([
    getFooterData(settingKey),
    getNavbarData(settingKey),
  ]);
  const footer = normalizeFooter(footerPayload);
  const navbarItems = normalizeNavbar(navbarPayload);
  const sections = buildSections(footer.sections, navbarItems);

  return (
    <footer className="w-full border-t [border-color:var(--footer-border)] [background-color:var(--footer-bg)] [color:var(--footer-foreground)]">
      <div className="h-1 w-full bg-gradient-to-r from-primary via-chart-2 to-chart-4" />
      <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="space-y-3 md:col-span-4">
            <h2 className="text-lg font-semibold tracking-tight">{footer.title}</h2>
            <p className="max-w-md text-sm [color:var(--footer-muted)]">{footer.description}</p>
            <ThemeSwitcher />

            {footer.socialLinks.length > 0 && (
              <div className="flex items-center gap-2 pt-1">
                {footer.socialLinks.map((social) => {
                  const Icon = SOCIAL_ICONS[social.platform];
                  return (
                    <a
                      key={`${social.platform}-${social.url}`}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex size-9 items-center justify-center rounded-md border [border-color:var(--footer-border)] [background-color:var(--footer-chip)] transition-colors duration-300 ease-out hover:bg-primary/20"
                      aria-label={social.platform}
                    >
                      {Icon ? <Icon className="size-4" /> : <span className="text-xs uppercase">{social.platform.slice(0, 2)}</span>}
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          <div className="grid gap-8 sm:grid-cols-2 md:col-span-8 md:grid-cols-3 xl:grid-cols-4">
            {sections.map((section) => (
              <section key={section.title} className="space-y-3">
                <h3 className="text-sm font-semibold">{section.title}</h3>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={`${section.title}-${link.url}`}>
                      <Link href={link.url} className="text-sm [color:var(--footer-muted)] transition-colors duration-300 ease-out hover:[color:var(--footer-foreground)]">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>

        <div className="mt-8 border-t pt-4 [border-color:var(--footer-border)]">
          <p className="text-xs [color:var(--footer-muted)]">{footer.copyrightText}</p>
        </div>
      </div>
    </footer>
  );
}

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { GetRequestNormal } from "@/api-hooks/api-hooks";
import { normalizeFooter } from "./footer-normalize";
import type { FooterApiResponse } from "./footer.types";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";
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
    return await GetRequestNormal<FooterApiResponse>(
      `/web-settings/footer?key=${encodeURIComponent(key)}`,
      60,
      FOOTER_TAG,
    );
  } catch {
    return null;
  }
}

async function getNavbarData(key: string) {
  try {
    return await GetRequestNormal<NavbarApiResponse>(
      `/web-settings/navbar?key=${encodeURIComponent(key)}`,
      60,
      NAVBAR_TAG,
    );
  } catch {
    return null;
  }
}

function buildSections(
  footerSections: Array<{
    title: string;
    links: Array<{ label: string; url: string }>;
  }>,
  navbarItems: ReturnType<typeof normalizeNavbar>,
) {
  const map = new Map<string, Map<string, string>>();

  for (const section of footerSections) {
    if (!map.has(section.title)) map.set(section.title, new Map());
    const linkMap = map.get(section.title)!;
    for (const link of section.links) linkMap.set(link.url, link.label);
  }

  for (const item of navbarItems) {
    if (!map.has(item.title)) map.set(item.title, new Map());
    const linkMap = map.get(item.title)!;
    linkMap.set(item.url, item.title);
    for (const sub of item.subNav) linkMap.set(sub.url, sub.title);
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
    <footer className="mt-16 border-t border-white/10 bg-[#101114] text-white sm:mt-24">
      <div className="commerce-container">
        <div className="grid gap-12 border-b border-white/10 py-14 lg:grid-cols-[minmax(260px,1.15fr)_minmax(0,2fr)] lg:gap-16 lg:py-20">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">
              About the store
            </p>
            <h2 className="mt-4 font-headline text-3xl font-semibold tracking-[0.04em] uppercase sm:text-4xl">
              {footer.title}
            </h2>
            <p className="mt-5 max-w-md font-body text-sm leading-7 text-white/60">
              {footer.description}
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <ThemeSwitcher />
              {footer.socialLinks.map((social) => {
                const Icon = SOCIAL_ICONS[social.platform];
                return (
                  <a
                    key={`${social.platform}-${social.url}`}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="commerce-interactive flex size-10 items-center justify-center border border-white/20 text-white/65 hover:border-white/50 hover:text-white"
                    aria-label={social.platform}
                  >
                    {Icon ? (
                      <Icon className="size-4" />
                    ) : (
                      <span className="text-[10px] font-bold uppercase">
                        {social.platform.slice(0, 2)}
                      </span>
                    )}
                  </a>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-7 gap-y-10 sm:grid-cols-3 xl:grid-cols-4">
            {sections.map((section) => (
              <section key={section.title}>
                <h3 className="border-b border-white/15 pb-3 font-body text-[10px] font-bold uppercase tracking-[0.18em] text-white/85">
                  {section.title}
                </h3>
                <ul className="mt-4 space-y-3">
                  {section.links.map((link) => (
                    <li key={`${section.title}-${link.url}`}>
                      <Link
                        href={link.url}
                        className="group inline-flex items-center gap-1.5 font-body text-sm text-white/55 transition-colors duration-200 hover:text-white"
                      >
                        <span>{link.label}</span>
                        <ArrowUpRight className="size-3 opacity-0 transition-opacity group-hover:opacity-100" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 py-6 text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>{footer.copyrightText}</p>
          <p>Secure shopping · Responsive support · Transparent service</p>
        </div>
      </div>
    </footer>
  );
}

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
    <footer className="w-full bg-[#001819] text-[#f9f9f9]">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-12 px-8 py-20 md:grid-cols-4 lg:px-12">
        {/* Brand column */}
        <div className="col-span-1 space-y-6">
          <h2 className="font-headline text-xl font-bold text-white">
            {footer.title}
          </h2>
          <p className="font-label text-xs uppercase leading-loose tracking-widest text-white/60">
            {footer.description}
          </p>
          <ThemeSwitcher />

          {footer.socialLinks.length > 0 && (
            <div className="flex items-center gap-4 pt-2">
              {footer.socialLinks.map((social) => {
                const Icon = SOCIAL_ICONS[social.platform];
                return (
                  <a
                    key={`${social.platform}-${social.url}`}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/60 transition-colors duration-300 hover:text-white"
                    aria-label={social.platform}
                  >
                    {Icon ? <Icon className="size-4" /> : <span className="text-xs uppercase">{social.platform.slice(0, 2)}</span>}
                  </a>
                );
              })}
            </div>
          )}
        </div>

        {/* Navigation sections */}
        {sections.map((section) => (
          <div key={section.title} className="space-y-4">
            <h5 className="font-label text-xs font-bold uppercase tracking-widest text-white mb-8">
              {section.title}
            </h5>
            <ul className="space-y-3">
              {section.links.map((link) => (
                <li key={`${section.title}-${link.url}`}>
                  <Link
                    href={link.url}
                    className="font-body text-xs uppercase tracking-widest text-white/60 transition-opacity hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom bar */}
      <div className="mx-auto w-full max-w-7xl border-t border-white/5 px-8 py-8 lg:px-12">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="font-body text-xs uppercase tracking-widest text-[#eeeeee]/60">
            {footer.copyrightText}
          </p>
        </div>
      </div>
    </footer>
  );
}

import type { FooterApiResponse, FooterItem, FooterLink, FooterSection, FooterSocialLink } from "./footer.types";

const FALLBACK_FOOTER: FooterItem = {
  title: "Storefront",
  description: "Simple shopping experience with clear categories and fast access.",
  copyrightText: `Copyright ${new Date().getFullYear()} Storefront`,
  socialLinks: [],
  sections: [
    {
      title: "Quick Links",
      links: [{ label: "Home", url: "/" }],
    },
  ],
};

function textOrNull(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : null;
}

function normalizeSocialLinks(links?: FooterSocialLink[]) {
  if (!Array.isArray(links)) {
    return [];
  }

  return links
    .map((item) => {
      const platform = textOrNull(item?.platform)?.toLowerCase();
      const url = textOrNull(item?.url);

      if (!platform || !url) {
        return null;
      }

      return { platform, url };
    })
    .filter((item): item is { platform: string; url: string } => item !== null);
}

function normalizeLinks(links?: FooterLink[]) {
  if (!Array.isArray(links)) {
    return [];
  }

  return links
    .map((link) => {
      const label = textOrNull(link?.label);
      const url = textOrNull(link?.url);
      if (!label || !url) {
        return null;
      }
      return { label, url };
    })
    .filter((item): item is { label: string; url: string } => item !== null);
}

function normalizeSections(sections?: FooterSection[]) {
  if (!Array.isArray(sections)) {
    return [];
  }

  return sections
    .map((section) => {
      const title = textOrNull(section?.title);
      const links = normalizeLinks(section?.links);
      if (!title || links.length === 0) {
        return null;
      }
      return { title, links };
    })
    .filter((item): item is { title: string; links: Array<{ label: string; url: string }> } => item !== null);
}

export function normalizeFooter(payload: FooterApiResponse | null | undefined): FooterItem {
  if (!payload) {
    return FALLBACK_FOOTER;
  }

  const title = textOrNull(payload.title) ?? FALLBACK_FOOTER.title;
  const description = textOrNull(payload.description) ?? FALLBACK_FOOTER.description;
  const copyrightText = textOrNull(payload.copyrightText) ?? FALLBACK_FOOTER.copyrightText;
  const socialLinks = normalizeSocialLinks(payload.socialLinks);
  const sections = normalizeSections(payload.sections);

  return {
    title,
    description,
    copyrightText,
    socialLinks,
    sections: sections.length > 0 ? sections : FALLBACK_FOOTER.sections,
  };
}

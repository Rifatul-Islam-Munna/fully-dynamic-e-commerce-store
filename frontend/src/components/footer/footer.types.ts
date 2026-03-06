export type FooterSocialLink = {
  platform?: string;
  url?: string;
  imageUrl?: string;
};

export type FooterLink = {
  label?: string;
  url?: string;
  imageUrl?: string;
};

export type FooterSection = {
  title?: string;
  links?: FooterLink[];
};

export type FooterApiResponse = {
  id?: string;
  key?: string;
  title?: string;
  description?: string | null;
  logoImageUrl?: string | null;
  brandImageUrl?: string | null;
  copyrightText?: string | null;
  socialLinks?: FooterSocialLink[];
  sections?: FooterSection[];
  isActive?: boolean;
};

export type FooterItem = {
  title: string;
  description: string;
  copyrightText: string;
  socialLinks: Array<{
    platform: string;
    url: string;
  }>;
  sections: Array<{
    title: string;
    links: Array<{
      label: string;
      url: string;
    }>;
  }>;
};

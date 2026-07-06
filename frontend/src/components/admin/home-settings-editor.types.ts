import type {
  HomeSectionType,
  ProductFlag,
} from "@/actions/admin-actions";

export type NavSubItem = {
  title: string;
  url: string;
};

export type NavMainItem = {
  title: string;
  url: string;
  subNav: NavSubItem[];
};

export type SlideForm = {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  linkUrl: string;
  buttonLabel: string;
  isActive: boolean;
};

export type SectionForm = {
  id: string;
  type: HomeSectionType;
  variant: string;
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  backgroundImageUrl: string;
  buttonLabel: string;
  buttonUrl: string;
  productFlag: ProductFlag;
  productLimit: string;
  theme: string;
  isActive: boolean;
  slides: SlideForm[];
};

export type HomeSettingsForm = {
  theme: string;
  sections: SectionForm[];
};

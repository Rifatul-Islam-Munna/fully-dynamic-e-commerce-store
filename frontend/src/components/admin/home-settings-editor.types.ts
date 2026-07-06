import type {
  HomeSectionType,
  ProductFlag,
} from "@/actions/admin-actions";
import { getDefaultHomeSectionVariant } from "@/lib/home-section-variants";

export type NavSubItem = { title: string; url: string };
export type NavMainItem = { title: string; url: string; subNav: NavSubItem[] };

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

export type HomeSettingsForm = { theme: string; sections: SectionForm[] };
export const EMPTY_HOME_FORM: HomeSettingsForm = { theme: "", sections: [] };

let idCounter = 0;
const makeId = () => `section-${Date.now()}-${idCounter++}`;

export const createEmptySlide = (): SlideForm => ({
  id: makeId(), title: "", subtitle: "", imageUrl: "", linkUrl: "", buttonLabel: "", isActive: true,
});

export const createEmptySection = (type: HomeSectionType): SectionForm => ({
  id: makeId(),
  type,
  variant: getDefaultHomeSectionVariant(type),
  title: "",
  subtitle: "",
  description: "",
  imageUrl: "",
  backgroundImageUrl: "",
  buttonLabel: "",
  buttonUrl: "",
  productFlag: "isHotSells",
  productLimit: "8",
  theme: "",
  isActive: true,
  slides: type === "hero_slider" ? [createEmptySlide()] : [],
});

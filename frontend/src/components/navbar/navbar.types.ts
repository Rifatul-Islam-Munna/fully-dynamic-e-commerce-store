export type NavbarSubNavItem = {
  title?: string;
  url?: string;
  imageUrl?: string;
  sortOrder?: number;
  isActive?: boolean;
};

export type NavbarMainNavItem = {
  title?: string;
  url?: string;
  imageUrl?: string;
  sortOrder?: number;
  isActive?: boolean;
  subNav?: NavbarSubNavItem[];
};

export type NavbarApiResponse = {
  id?: string;
  key?: string;
  isActive?: boolean;
  mainNav?: NavbarMainNavItem[];
};

export type NavbarItem = {
  title: string;
  url: string;
  subNav: Array<{
    title: string;
    url: string;
  }>;
};

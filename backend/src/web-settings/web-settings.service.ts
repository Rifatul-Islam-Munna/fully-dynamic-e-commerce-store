import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { CreateFooterSettingDto } from './dto/create-footer-setting.dto';
import { CreateHomeSettingDto } from './dto/create-home-setting.dto';
import { CreateNavbarSettingDto } from './dto/create-navbar-setting.dto';
import { CreateSiteSettingDto } from './dto/create-site-setting.dto';
import { UpdateFooterSettingDto } from './dto/update-footer-setting.dto';
import { UpdateHomeSettingDto } from './dto/update-home-setting.dto';
import { UpdateNavbarSettingDto } from './dto/update-navbar-setting.dto';
import { UpdateSiteSettingDto } from './dto/update-site-setting.dto';
import { WebSettingQueryDto } from './dto/web-setting-query.dto';
import { FooterSetting } from './entities/footer-setting.entity';
import { HomeSection, HomeSetting } from './entities/home-setting.entity';
import { NavbarSetting } from './entities/navbar-setting.entity';
import { SiteSetting } from './entities/site-setting.entity';

@Injectable()
export class WebSettingsService {
  constructor(
    @InjectRepository(NavbarSetting)
    private readonly navbarRepository: Repository<NavbarSetting>,
    @InjectRepository(FooterSetting)
    private readonly footerRepository: Repository<FooterSetting>,
    @InjectRepository(SiteSetting)
    private readonly siteRepository: Repository<SiteSetting>,
    @InjectRepository(HomeSetting)
    private readonly homeRepository: Repository<HomeSetting>,
  ) {}

  // ─── Navbar ───────────────────────────────────────────────

  async createNavbar(createDto: CreateNavbarSettingDto) {
    const key = this.resolveKey(createDto.key);

    const exists = await this.navbarRepository.exist({
      where: { key },
    });
    if (exists) {
      throw new ConflictException(
        `Navbar settings with key "${key}" already exists.`,
      );
    }

    const navbar = this.navbarRepository.create({
      key,
      mainNav: this.normalizeNavbarItems(createDto.mainNav),
      isActive: createDto.isActive ?? true,
    });

    return this.navbarRepository.save(navbar);
  }

  async getNavbar(query: WebSettingQueryDto) {
    const key = this.resolveKey(query.key);

    const navbar = await this.navbarRepository.findOne({
      where: { key, isActive: true },
      order: { updatedAt: 'DESC' },
    });

    if (!navbar) {
      throw new NotFoundException(`Active navbar settings with key "${key}" not found`);
    }

    return navbar;
  }

  async updateNavbar(query: WebSettingQueryDto, updateDto: UpdateNavbarSettingDto) {
    const lookupKey = this.resolveKey(query.key ?? updateDto.key);

    const navbar = updateDto.navbarId
      ? await this.navbarRepository.findOne({
          where: { id: updateDto.navbarId },
        })
      : await this.navbarRepository.findOne({
          where: { key: lookupKey },
        });

    if (!navbar) {
      throw new NotFoundException(
        `Navbar settings not found for key "${lookupKey}" or provided navbarId`,
      );
    }

    if (updateDto.key) {
      const nextKey = this.resolveKey(updateDto.key);
      if (nextKey !== navbar.key) {
        const keyExists = await this.navbarRepository.exist({
          where: { key: nextKey, id: Not(navbar.id) },
        });
        if (keyExists) {
          throw new ConflictException(`Navbar settings key "${nextKey}" already exists`);
        }
        navbar.key = nextKey;
      }
    }

    if (updateDto.mainNav !== undefined) {
      navbar.mainNav = this.normalizeNavbarItems(updateDto.mainNav);
    }

    if (updateDto.isActive !== undefined) {
      navbar.isActive = updateDto.isActive;
    }

    return this.navbarRepository.save(navbar);
  }

  // ─── Footer ───────────────────────────────────────────────

  async createFooter(createDto: CreateFooterSettingDto) {
    const key = this.resolveKey(createDto.key);

    const exists = await this.footerRepository.exist({
      where: { key },
    });
    if (exists) {
      throw new ConflictException(
        `Footer settings with key "${key}" already exists.`,
      );
    }

    const footer = this.footerRepository.create({
      key,
      title: createDto.title,
      description: createDto.description ?? null,
      logoImageUrl: createDto.logoImageUrl ?? null,
      brandImageUrl: createDto.brandImageUrl ?? null,
      copyrightText: createDto.copyrightText ?? null,
      socialLinks: createDto.socialLinks ?? [],
      sections: createDto.sections ?? [],
      isActive: createDto.isActive ?? true,
    });

    return this.footerRepository.save(footer);
  }

  async getFooter(query: WebSettingQueryDto) {
    const key = this.resolveKey(query.key);

    const footer = await this.footerRepository.findOne({
      where: { key, isActive: true },
      order: { updatedAt: 'DESC' },
    });

    if (!footer) {
      throw new NotFoundException(`Active footer settings with key "${key}" not found`);
    }

    return footer;
  }

  async updateFooter(query: WebSettingQueryDto, updateDto: UpdateFooterSettingDto) {
    const lookupKey = this.resolveKey(query.key ?? updateDto.key);

    const footer = updateDto.footerId
      ? await this.footerRepository.findOne({
          where: { id: updateDto.footerId },
        })
      : await this.footerRepository.findOne({
          where: { key: lookupKey },
        });

    if (!footer) {
      throw new NotFoundException(
        `Footer settings not found for key "${lookupKey}" or provided footerId`,
      );
    }

    if (updateDto.key) {
      const nextKey = this.resolveKey(updateDto.key);
      if (nextKey !== footer.key) {
        const keyExists = await this.footerRepository.exist({
          where: { key: nextKey, id: Not(footer.id) },
        });
        if (keyExists) {
          throw new ConflictException(`Footer settings key "${nextKey}" already exists`);
        }
        footer.key = nextKey;
      }
    }

    if (updateDto.title !== undefined) {
      footer.title = updateDto.title;
    }
    if (updateDto.description !== undefined) {
      footer.description = updateDto.description ?? null;
    }
    if (updateDto.logoImageUrl !== undefined) {
      footer.logoImageUrl = updateDto.logoImageUrl ?? null;
    }
    if (updateDto.brandImageUrl !== undefined) {
      footer.brandImageUrl = updateDto.brandImageUrl ?? null;
    }
    if (updateDto.copyrightText !== undefined) {
      footer.copyrightText = updateDto.copyrightText ?? null;
    }
    if (updateDto.socialLinks !== undefined) {
      footer.socialLinks = updateDto.socialLinks;
    }
    if (updateDto.sections !== undefined) {
      footer.sections = updateDto.sections;
    }
    if (updateDto.isActive !== undefined) {
      footer.isActive = updateDto.isActive;
    }

    return this.footerRepository.save(footer);
  }

  // ─── Site Settings ────────────────────────────────────────

  async createSiteSetting(createDto: CreateSiteSettingDto) {
    const key = this.resolveKey(createDto.key);

    const exists = await this.siteRepository.exist({
      where: { key },
    });
    if (exists) {
      throw new ConflictException(
        `Site settings with key "${key}" already exists.`,
      );
    }

    const site = this.siteRepository.create({
      key,
      siteTitle: createDto.siteTitle,
      metaDescription: createDto.metaDescription ?? null,
      logoUrl: createDto.logoUrl ?? null,
      faviconUrl: createDto.faviconUrl ?? null,
      ogImageUrl: createDto.ogImageUrl ?? null,
      noticeEnabled: createDto.noticeEnabled ?? false,
      noticeText: createDto.noticeText ?? null,
      siteTheme: createDto.siteTheme?.trim() || 'light',
      productCardVariant: createDto.productCardVariant?.trim() || 'classic',
      productDetailsVariant:
        createDto.productDetailsVariant?.trim() || 'classic',
      isActive: createDto.isActive ?? true,
    });

    return this.siteRepository.save(site);
  }

  async getSiteSetting(query: WebSettingQueryDto) {
    const key = this.resolveKey(query.key);

    const site = await this.siteRepository.findOne({
      where: { key, isActive: true },
      order: { updatedAt: 'DESC' },
    });

    if (!site) {
      throw new NotFoundException(`Active site settings with key "${key}" not found`);
    }

    return site;
  }

  async updateSiteSetting(query: WebSettingQueryDto, updateDto: UpdateSiteSettingDto) {
    const lookupKey = this.resolveKey(query.key ?? updateDto.key);

    const site = updateDto.siteSettingId
      ? await this.siteRepository.findOne({
          where: { id: updateDto.siteSettingId },
        })
      : await this.siteRepository.findOne({
          where: { key: lookupKey },
        });

    if (!site) {
      throw new NotFoundException(
        `Site settings not found for key "${lookupKey}" or provided siteSettingId`,
      );
    }

    if (updateDto.key) {
      const nextKey = this.resolveKey(updateDto.key);
      if (nextKey !== site.key) {
        const keyExists = await this.siteRepository.exist({
          where: { key: nextKey, id: Not(site.id) },
        });
        if (keyExists) {
          throw new ConflictException(`Site settings key "${nextKey}" already exists`);
        }
        site.key = nextKey;
      }
    }

    if (updateDto.siteTitle !== undefined) {
      site.siteTitle = updateDto.siteTitle;
    }
    if (updateDto.metaDescription !== undefined) {
      site.metaDescription = updateDto.metaDescription ?? null;
    }
    if (updateDto.logoUrl !== undefined) {
      site.logoUrl = updateDto.logoUrl ?? null;
    }
    if (updateDto.faviconUrl !== undefined) {
      site.faviconUrl = updateDto.faviconUrl ?? null;
    }
    if (updateDto.ogImageUrl !== undefined) {
      site.ogImageUrl = updateDto.ogImageUrl ?? null;
    }
    if (updateDto.noticeEnabled !== undefined) {
      site.noticeEnabled = updateDto.noticeEnabled;
    }
    if (updateDto.noticeText !== undefined) {
      site.noticeText = updateDto.noticeText ?? null;
    }
    if (updateDto.siteTheme !== undefined) {
      site.siteTheme = updateDto.siteTheme?.trim() || 'light';
    }
    if (updateDto.productCardVariant !== undefined) {
      site.productCardVariant =
        updateDto.productCardVariant?.trim() || 'classic';
    }
    if (updateDto.productDetailsVariant !== undefined) {
      site.productDetailsVariant =
        updateDto.productDetailsVariant?.trim() || 'classic';
    }
    if (updateDto.isActive !== undefined) {
      site.isActive = updateDto.isActive;
    }

    return this.siteRepository.save(site);
  }

  // ─── Helpers ──────────────────────────────────────────────

  async createHomeSetting(createDto: CreateHomeSettingDto) {
    const normalizedMainNav = this.normalizeNavUrl(createDto.mainNavUrl);
    const subNavUrl = this.normalizeNavUrl(createDto.subNavUrl);
    const mainNavFromSub = this.extractMainNavFromSubNav(subNavUrl);
    const mainNavUrl = mainNavFromSub ?? normalizedMainNav;
    const key = this.buildHomeKey(mainNavUrl, subNavUrl);

    const exists = await this.homeRepository.exist({
      where: {
        mainNavUrl: mainNavUrl ?? IsNull(),
        subNavUrl: subNavUrl ?? IsNull(),
      },
    });
    if (exists) {
      throw new ConflictException(
        `Home settings already exists for mainNav="${mainNavUrl ?? 'root'}" and subNav="${subNavUrl ?? 'none'}".`,
      );
    }

    const home = this.homeRepository.create({
      key,
      mainNavUrl,
      subNavUrl,
      theme: createDto.theme?.trim() || null,
      sections: this.normalizeHomeSections(createDto.sections ?? []),
      isActive: createDto.isActive ?? true,
    });

    return this.homeRepository.save(home);
  }

  async getHomeSetting(query: WebSettingQueryDto) {
    const requestedMainNav = this.normalizeNavUrl(query.mainNavUrl);
    const requestedSubNav = this.normalizeNavUrl(query.subNavUrl);
    const lookupMainNav =
      requestedMainNav ?? this.extractMainNavFromSubNav(requestedSubNav);

    let home: HomeSetting | null = null;

    if (lookupMainNav && requestedSubNav) {
      home = await this.homeRepository.findOne({
        where: {
          mainNavUrl: lookupMainNav,
          subNavUrl: requestedSubNav,
          isActive: true,
        },
        order: { updatedAt: 'DESC' },
      });
    }

    if (!home && lookupMainNav) {
      home = await this.homeRepository.findOne({
        where: {
          mainNavUrl: lookupMainNav,
          subNavUrl: IsNull(),
          isActive: true,
        },
        order: { updatedAt: 'DESC' },
      });
    }

    if (!home) {
      home = await this.homeRepository.findOne({
        where: { mainNavUrl: IsNull(), subNavUrl: IsNull(), isActive: true },
        order: { updatedAt: 'DESC' },
      });
    }

    if (!home) {
      throw new NotFoundException(
        `Active home settings not found for requested page target`,
      );
    }

    return home;
  }

  async updateHomeSetting(query: WebSettingQueryDto, updateDto: UpdateHomeSettingDto) {
    const queryMainNav = this.normalizeNavUrl(query.mainNavUrl);
    const querySubNav = this.normalizeNavUrl(query.subNavUrl);
    const dtoMainNav = this.normalizeUpdateNavUrl(updateDto.mainNavUrl);
    const dtoSubNav = this.normalizeUpdateNavUrl(updateDto.subNavUrl);

    const lookupSubNav = querySubNav ?? dtoSubNav ?? null;
    const lookupMainFromSub = this.extractMainNavFromSubNav(lookupSubNav);
    const lookupMainNav =
      lookupMainFromSub ??
      queryMainNav ??
      (dtoMainNav !== undefined ? dtoMainNav : undefined) ??
      null;

    const home = updateDto.homeSettingId
      ? await this.homeRepository.findOne({
          where: { id: updateDto.homeSettingId },
        })
      : await this.homeRepository.findOne({
          where: {
            mainNavUrl: lookupMainNav ?? IsNull(),
            subNavUrl: lookupSubNav ?? IsNull(),
          },
        });

    if (!home) {
      throw new NotFoundException(
        `Home settings not found for mainNav="${lookupMainNav ?? 'root'}" and subNav="${lookupSubNav ?? 'none'}" or provided homeSettingId`,
      );
    }

    const nextSubNav =
      dtoSubNav !== undefined ? dtoSubNav : home.subNavUrl;
    const requestedNextMainNav =
      dtoMainNav !== undefined ? dtoMainNav : home.mainNavUrl;
    const nextMainFromSub = this.extractMainNavFromSubNav(nextSubNav);
    const nextMainNav =
      nextMainFromSub ?? requestedNextMainNav;

    const navTargetExists = await this.homeRepository.exist({
      where: {
        id: Not(home.id),
        mainNavUrl: nextMainNav ?? IsNull(),
        subNavUrl: nextSubNav ?? IsNull(),
      },
    });
    if (navTargetExists) {
      throw new ConflictException(
        `Another home settings already exists for mainNav="${nextMainNav ?? 'root'}" and subNav="${nextSubNav ?? 'none'}".`,
      );
    }

    home.mainNavUrl = nextMainNav ?? null;
    home.subNavUrl = nextSubNav ?? null;
    home.key = this.buildHomeKey(home.mainNavUrl, home.subNavUrl);

    if (updateDto.theme !== undefined) {
      home.theme = updateDto.theme?.trim() || null;
    }
    if (updateDto.sections !== undefined) {
      home.sections = this.normalizeHomeSections(updateDto.sections);
    }
    if (updateDto.isActive !== undefined) {
      home.isActive = updateDto.isActive;
    }

    return this.homeRepository.save(home);
  }

  private normalizeHomeSections(
    sections: CreateHomeSettingDto['sections'] = [],
  ): HomeSection[] {
    return sections.map((section, index) => {
      const sectionMainNav = this.normalizeNavUrl(section.mainNavUrl);
      const sectionSubNav = this.normalizeNavUrl(section.subNavUrl);
      const sectionMainFromSub = this.extractMainNavFromSubNav(sectionSubNav);
      const resolvedSectionMainNav =
        sectionMainFromSub ?? sectionMainNav;

      const slides = Array.isArray(section.slides)
        ? section.slides.map((slide, slideIndex) => ({
            title: slide.title?.trim() || `Slide ${slideIndex + 1}`,
            subtitle: slide.subtitle?.trim() || undefined,
            imageUrl: slide.imageUrl.trim(),
            linkUrl: slide.linkUrl?.trim() || undefined,
            buttonLabel: slide.buttonLabel?.trim() || undefined,
            sortOrder: slide.sortOrder ?? slideIndex + 1,
            isActive: slide.isActive ?? true,
          }))
        : [];

      return {
        id: section.id?.trim() || randomUUID(),
        type: section.type,
        variant: section.variant?.trim() || undefined,
        title: section.title?.trim() || undefined,
        subtitle: section.subtitle?.trim() || undefined,
        description: section.description?.trim() || undefined,
        imageUrl: section.imageUrl?.trim() || undefined,
        backgroundImageUrl: section.backgroundImageUrl?.trim() || undefined,
        buttonLabel: section.buttonLabel?.trim() || undefined,
        buttonUrl: section.buttonUrl?.trim() || undefined,
        productFlag: section.productFlag,
        mainNavUrl: resolvedSectionMainNav ?? undefined,
        subNavUrl: sectionSubNav ?? undefined,
        productLimit: section.productLimit ?? 8,
        theme: section.theme?.trim() || undefined,
        sortOrder: section.sortOrder ?? index + 1,
        isActive: section.isActive ?? true,
        slides: slides.length > 0 ? slides : undefined,
      };
    });
  }

  private normalizeNavbarItems(
    mainNav: CreateNavbarSettingDto['mainNav'] = [],
  ) {
    const usedMainSlugs = new Set<string>();

    return mainNav.map((mainItem, mainIndex) => {
      const mainTitle = mainItem.title?.trim() || `Item ${mainIndex + 1}`;
      const mainSlug = this.makeUniqueSlug(
        this.slugifySegment(mainTitle),
        usedMainSlugs,
      );
      const mainUrl = `/${mainSlug}`;

      const usedSubSlugs = new Set<string>();
      const subNav = Array.isArray(mainItem.subNav)
        ? mainItem.subNav.map((subItem, subIndex) => {
            const subTitle =
              subItem.title?.trim() || `Sub Item ${subIndex + 1}`;
            const subSlug = this.makeUniqueSlug(
              this.slugifySegment(subTitle),
              usedSubSlugs,
            );

            return {
              title: subTitle,
              url: `/${mainSlug}/${subSlug}`,
              imageUrl: subItem.imageUrl?.trim() || undefined,
              sortOrder: subIndex + 1,
              isActive: subItem.isActive ?? true,
            };
          })
        : [];

      return {
        title: mainTitle,
        url: mainUrl,
        imageUrl: mainItem.imageUrl?.trim() || undefined,
        sortOrder: mainIndex + 1,
        isActive: mainItem.isActive ?? true,
        subNav,
      };
    });
  }

  private slugifySegment(value: string) {
    const normalized = value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');

    return normalized || 'item';
  }

  private makeUniqueSlug(baseSlug: string, used: Set<string>) {
    let candidate = baseSlug || 'item';
    let suffix = 2;

    while (used.has(candidate)) {
      candidate = `${baseSlug}-${suffix}`;
      suffix += 1;
    }

    used.add(candidate);
    return candidate;
  }

  private normalizeNavUrl(value?: string) {
    const trimmed = value?.trim();
    if (!trimmed) {
      return null;
    }
    if (trimmed.startsWith('/')) {
      return trimmed;
    }
    return `/${trimmed}`;
  }

  private normalizeUpdateNavUrl(value?: string) {
    if (value === undefined) {
      return undefined;
    }
    return this.normalizeNavUrl(value);
  }

  private extractMainNavFromSubNav(subNavUrl: string | null) {
    if (!subNavUrl) {
      return null;
    }
    const cleaned = subNavUrl.replace(/^\/+/, '');
    const mainSegment = cleaned.split('/')[0]?.trim();
    return mainSegment ? `/${mainSegment}` : null;
  }

  private buildHomeKey(
    mainNavUrl: string | null,
    subNavUrl: string | null,
  ) {
    if (!mainNavUrl) {
      return 'home-root';
    }

    const toKeyPart = (value: string) =>
      value
        .replace(/^\/+|\/+$/g, '')
        .replace(/\//g, '-')
        .toLowerCase();

    const mainPart = toKeyPart(mainNavUrl) || 'root';
    if (!subNavUrl) {
      return `page-${mainPart}`;
    }

    const subPart = toKeyPart(subNavUrl) || 'sub';
    return `page-${mainPart}-${subPart}`;
  }

  private resolveKey(key?: string) {
    return (key ?? 'default').trim().toLowerCase();
  }
}

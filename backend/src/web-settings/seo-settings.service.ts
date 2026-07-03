import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpsertSeoSettingDto } from './dto/upsert-seo-setting.dto';
import { SeoSetting } from './entities/seo-setting.entity';

@Injectable()
export class SeoSettingsService {
  constructor(
    @InjectRepository(SeoSetting)
    private readonly seoRepository: Repository<SeoSetting>,
  ) {}

  async getPublic(pathValue?: string) {
    const path = this.normalizePath(pathValue);
    const [globalSetting, pageSetting] = await Promise.all([
      this.seoRepository.findOne({ where: { path: '*', isActive: true } }),
      path === '*'
        ? Promise.resolve(null)
        : this.seoRepository.findOne({ where: { path, isActive: true } }),
    ]);

    if (!globalSetting && !pageSetting) {
      return null;
    }

    const page = pageSetting ?? null;
    const global = globalSetting ?? null;

    return {
      id: page?.id ?? global?.id,
      path,
      title: page?.title ?? global?.title ?? null,
      description: page?.description ?? global?.description ?? null,
      imageUrl: page?.imageUrl ?? global?.imageUrl ?? null,
      canonicalUrl: page?.canonicalUrl ?? global?.canonicalUrl ?? null,
      keywords:
        page?.keywords?.length ? page.keywords : global?.keywords ?? [],
      robotsIndex: page?.robotsIndex ?? global?.robotsIndex ?? true,
      robotsFollow: page?.robotsFollow ?? global?.robotsFollow ?? true,
      structuredData:
        page?.structuredData ?? global?.structuredData ?? null,
      gtmEnabled: page?.gtmEnabled ?? global?.gtmEnabled ?? false,
      gtmContainerId:
        page?.gtmContainerId ?? global?.gtmContainerId ?? null,
      isActive: true,
      updatedAt: page?.updatedAt ?? global?.updatedAt,
    };
  }

  async listAdmin() {
    return this.seoRepository.find({
      order: { path: 'ASC', updatedAt: 'DESC' },
    });
  }

  async upsert(dto: UpsertSeoSettingDto) {
    const path = this.normalizePath(dto.path);
    const existing = await this.seoRepository.findOne({ where: { path } });

    const setting = existing ?? this.seoRepository.create({ path });
    setting.path = path;

    if (dto.title !== undefined) {
      setting.title = this.normalizeOptionalText(dto.title);
    }
    if (dto.description !== undefined) {
      setting.description = this.normalizeOptionalText(dto.description);
    }
    if (dto.imageUrl !== undefined) {
      setting.imageUrl = this.normalizeOptionalText(dto.imageUrl);
    }
    if (dto.canonicalUrl !== undefined) {
      setting.canonicalUrl = this.normalizeOptionalText(dto.canonicalUrl);
    }
    if (dto.keywords !== undefined) {
      setting.keywords = Array.from(
        new Set(dto.keywords.map((value) => value.trim()).filter(Boolean)),
      );
    }
    if (dto.robotsIndex !== undefined) {
      setting.robotsIndex = dto.robotsIndex;
    }
    if (dto.robotsFollow !== undefined) {
      setting.robotsFollow = dto.robotsFollow;
    }
    if (dto.structuredData !== undefined) {
      setting.structuredData = dto.structuredData;
    }
    if (dto.gtmEnabled !== undefined) {
      setting.gtmEnabled = dto.gtmEnabled;
    }
    if (dto.gtmContainerId !== undefined) {
      setting.gtmContainerId =
        this.normalizeOptionalText(dto.gtmContainerId)?.toUpperCase() ?? null;
    }
    if (dto.isActive !== undefined) {
      setting.isActive = dto.isActive;
    }

    if (!existing) {
      setting.title ??= null;
      setting.description ??= null;
      setting.imageUrl ??= null;
      setting.canonicalUrl ??= null;
      setting.keywords ??= [];
      setting.robotsIndex ??= true;
      setting.robotsFollow ??= true;
      setting.structuredData ??= null;
      setting.gtmEnabled ??= false;
      setting.gtmContainerId ??= null;
      setting.isActive ??= true;
    }

    if (setting.gtmEnabled && !setting.gtmContainerId) {
      setting.gtmEnabled = false;
    }

    return this.seoRepository.save(setting);
  }

  private normalizePath(value?: string) {
    const trimmed = value?.trim() || '*';
    if (trimmed === '*') {
      return '*';
    }

    const withoutQuery = trimmed.split(/[?#]/, 1)[0] || '/';
    const withLeadingSlash = withoutQuery.startsWith('/')
      ? withoutQuery
      : `/${withoutQuery}`;
    const normalized = withLeadingSlash.replace(/\/{2,}/g, '/');

    return normalized.length > 1
      ? normalized.replace(/\/+$/, '')
      : normalized;
  }

  private normalizeOptionalText(value?: string | null) {
    const trimmed = value?.trim();
    return trimmed ? trimmed : null;
  }
}

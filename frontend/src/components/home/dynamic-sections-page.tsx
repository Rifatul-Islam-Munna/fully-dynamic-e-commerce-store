import { HeroSlider } from "@/components/home/hero-slider";
import { renderCustomBannerSection } from "@/components/home/custom-banner-section";
import {
  type DynamicSectionsPageProps,
  getHomeSettings,
  getProductsForSection,
  isSectionVisibleForTarget,
  mapHeroSlides,
  normalizeSections,
  resolveNavTargetFromSlug,
} from "@/components/home/dynamic-sections-data";
import { renderDiscountBannerSection } from "@/components/home/discount-banner-section";
import { renderProductCollectionSection } from "@/components/home/product-collection-section";
import { type ProductListResponse } from "@/components/home/section-primitives";
import { normalizeHomeSectionVariant } from "@/lib/home-section-variants";

export { resolveNavTargetFromSlug };

export async function DynamicSectionsPage({
  mainNavUrl,
  subNavUrl,
  emptyTitle = "Page Not Configured",
  emptyDescription = "Create layout sections from Admin -> Home Settings for this page target.",
}: DynamicSectionsPageProps) {
  const home = await getHomeSettings({
    mainNavUrl,
    subNavUrl,
  });

  const sections = normalizeSections(home?.sections).filter((section) =>
    isSectionVisibleForTarget(section, mainNavUrl, subNavUrl),
  );

  const productSections = sections
    .map((section, index) => ({
      section,
      key: section.id || `section-${index}`,
    }))
    .filter(({ section }) => section.type === "product_collection");

  const productsBySection = new Map<string, ProductListResponse["data"]>();
  if (productSections.length > 0) {
    const results = await Promise.all(
      productSections.map(({ section, key }) =>
        getProductsForSection(section, key),
      ),
    );
    productSections.forEach(({ key }, index) => {
      productsBySection.set(key, results[index]);
    });
  }

  if (sections.length === 0) {
    return (
      <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-[32px] bg-muted/35 px-6 py-14 text-center">
          <h1 className="text-2xl font-bold tracking-tight">{emptyTitle}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {emptyDescription}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-7xl space-y-5 px-4 py-6 sm:px-6 lg:px-8">
      {sections.map((section, index) => {
        const sectionKey = section.id || `section-${index}`;

        if (section.type === "hero_slider") {
          return (
            <HeroSlider
              key={sectionKey}
              slides={mapHeroSlides(section)}
              variant={normalizeHomeSectionVariant(
                "hero_slider",
                section.variant,
              )}
            />
          );
        }

        if (section.type === "product_collection") {
          return renderProductCollectionSection(
            section,
            productsBySection.get(sectionKey) || [],
            sectionKey,
          );
        }

        if (section.type === "discount_banner") {
          return renderDiscountBannerSection(section, sectionKey);
        }

        if (section.type === "custom_banner") {
          return renderCustomBannerSection(section, sectionKey);
        }

        return null;
      })}
    </main>
  );
}

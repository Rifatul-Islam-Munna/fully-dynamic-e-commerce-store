"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Check,
  ChevronDown,
  ChevronRight,
  Loader2,
  Save,
} from "lucide-react";
import {
  createSiteSettings,
  getSiteSettings,
  updateSiteSettings,
} from "@/actions/admin-actions";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { ProductCardPreview } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  buildSiteAppearanceSettings,
  DEFAULT_PRODUCT_CARD_VARIANT,
  DEFAULT_PRODUCT_DETAILS_VARIANT,
  DEFAULT_SITE_THEME,
  PRODUCT_CARD_VARIANT_OPTIONS,
  PRODUCT_DETAILS_VARIANT_OPTIONS,
  SITE_THEME_OPTIONS,
  type ProductCardVariant,
  type ProductDetailsVariant,
  type SiteThemeName,
} from "@/lib/site-appearance";
import { cn } from "@/lib/utils";

type SiteSettingsForm = {
  siteTitle: string;
  metaDescription: string;
  logoUrl: string;
  faviconUrl: string;
  ogImageUrl: string;
  whatsappLink: string;
  tawkToLink: string;
  showPlaceOrderButton: boolean;
  showBkashCheckoutButton: boolean;
  noticeEnabled: boolean;
  noticeText: string;
  siteTheme: SiteThemeName;
  productCardVariant: ProductCardVariant;
  productDetailsVariant: ProductDetailsVariant;
  bkashAppKey: string;
  bkashAppSecret: string;
  bkashUsername: string;
  bkashPassword: string;
};

const INITIAL: SiteSettingsForm = {
  siteTitle: "",
  metaDescription: "",
  logoUrl: "",
  faviconUrl: "",
  ogImageUrl: "",
  whatsappLink: "",
  tawkToLink: "",
  showPlaceOrderButton: true,
  showBkashCheckoutButton: false,
  noticeEnabled: false,
  noticeText: "",
  siteTheme: DEFAULT_SITE_THEME,
  productCardVariant: DEFAULT_PRODUCT_CARD_VARIANT,
  productDetailsVariant: DEFAULT_PRODUCT_DETAILS_VARIANT,
  bkashAppKey: "",
  bkashAppSecret: "",
  bkashUsername: "",
  bkashPassword: "",
};

function buildSiteSettingsPayload(form: SiteSettingsForm) {
  const payload: Record<string, unknown> = {
    siteTitle: form.siteTitle,
    metaDescription: form.metaDescription,
    logoUrl: form.logoUrl,
    faviconUrl: form.faviconUrl,
    ogImageUrl: form.ogImageUrl,
    whatsappLink: form.whatsappLink.trim(),
    tawkToLink: form.tawkToLink.trim(),
    showPlaceOrderButton: form.showPlaceOrderButton,
    showBkashCheckoutButton: form.showBkashCheckoutButton,
    noticeEnabled: form.noticeEnabled,
    noticeText: form.noticeText,
    siteTheme: form.siteTheme,
    productCardVariant: form.productCardVariant,
    productDetailsVariant: form.productDetailsVariant,
  };

  const secretFields = {
    bkashAppKey: form.bkashAppKey.trim(),
    bkashAppSecret: form.bkashAppSecret.trim(),
    bkashUsername: form.bkashUsername.trim(),
    bkashPassword: form.bkashPassword.trim(),
  };

  for (const [key, value] of Object.entries(secretFields)) {
    if (value) {
      payload[key] = value;
    }
  }

  return payload;
}

const FLAT_FIELD_STYLE = { boxShadow: "none" } as const;

const COLLAPSIBLE_SECTION_IDS = [
  "brand-seo",
  "checkout-controls",
  "contact-launcher",
  "bkash-gateway",
  "appearance",
  "appearance-theme",
  "appearance-card",
  "appearance-details",
] as const;

type CollapsibleSectionId = (typeof COLLAPSIBLE_SECTION_IDS)[number];

const EXPANDED_SECTIONS = Object.fromEntries(
  COLLAPSIBLE_SECTION_IDS.map((id) => [id, false]),
) as Record<CollapsibleSectionId, boolean>;

const COLLAPSED_SECTIONS = Object.fromEntries(
  COLLAPSIBLE_SECTION_IDS.map((id) => [id, true]),
) as Record<CollapsibleSectionId, boolean>;

export default function SiteSettingsPage() {
  const router = useRouter();
  const [form, setForm] = useState<SiteSettingsForm>(INITIAL);
  const [loading, setLoading] = useState(true);
  const [exists, setExists] = useState(false);
  const [collapsedSections, setCollapsedSections] =
    useState<Record<CollapsibleSectionId, boolean>>(EXPANDED_SECTIONS);

  useEffect(() => {
    (async () => {
      try {
        const data = await getSiteSettings();
        if (data) {
          const appearance = buildSiteAppearanceSettings(data);
          setForm({
            siteTitle: data.siteTitle || "",
            metaDescription: data.metaDescription || "",
            logoUrl: data.logoUrl || "",
            faviconUrl: data.faviconUrl || "",
            ogImageUrl: data.ogImageUrl || "",
            whatsappLink: data.whatsappLink || "",
            tawkToLink: data.tawkToLink || "",
            showPlaceOrderButton: data.showPlaceOrderButton ?? true,
            showBkashCheckoutButton: data.showBkashCheckoutButton ?? false,
            noticeEnabled: data.noticeEnabled ?? false,
            noticeText: data.noticeText || "",
            siteTheme: appearance.siteTheme,
            productCardVariant: appearance.productCardVariant,
            productDetailsVariant: appearance.productDetailsVariant,
            bkashAppKey: "",
            bkashAppSecret: "",
            bkashUsername: "",
            bkashPassword: "",
          });
          setExists(true);
        }
      } catch {
        // no-op
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = buildSiteSettingsPayload(form);
      if (exists) {
        return updateSiteSettings(payload);
      }
      return createSiteSettings(payload);
    },
    onSuccess: (result) => {
      const [data, error] = result as [unknown, unknown];
      if (data) {
        toast.success("Site settings saved");
        setExists(true);
        setForm((prev) => ({
          ...prev,
          bkashAppKey: "",
          bkashAppSecret: "",
          bkashUsername: "",
          bkashPassword: "",
        }));
        router.refresh();
      } else {
        toast.error(
          (error as { message?: string })?.message || "Failed to save",
        );
      }
    },
    onError: () => toast.error("Failed to save site settings"),
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (form.whatsappLink.trim() && form.tawkToLink.trim()) {
      toast.error("Use either a WhatsApp link or a Tawk.to link, not both.");
      return;
    }

    saveMutation.mutate();
  };

  const updateField = <K extends keyof SiteSettingsForm>(
    field: K,
    value: SiteSettingsForm[K],
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleSection = (sectionId: CollapsibleSectionId) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Site Settings</h1>
          <p className="text-sm text-muted-foreground">
            Control the global storefront identity, theme, product card style,
            and product page layout from one place.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setCollapsedSections(EXPANDED_SECTIONS)}
          >
            Expand All
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setCollapsedSections(COLLAPSED_SECTIONS)}
          >
            Collapse All
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <CollapsibleBlock
          title="Brand and SEO"
          description="These settings control the browser metadata and the shared brand assets used across the storefront."
          collapsed={collapsedSections["brand-seo"]}
          onToggle={() => toggleSection("brand-seo")}
        >
          <div className="space-y-2">
            <Label htmlFor="siteTitle">Site Title</Label>
            <Input
              id="siteTitle"
              placeholder="e.g. My Online Store"
              value={form.siteTitle}
              onChange={(event) => updateField("siteTitle", event.target.value)}
              className="h-11 rounded-2xl border-0 bg-background"
              style={FLAT_FIELD_STYLE}
            />
            <p className="text-xs text-muted-foreground">
              Displayed in browser tabs, metadata, and social previews.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="metaDescription">Meta Description</Label>
            <Input
              id="metaDescription"
              placeholder="Brief description for search engines"
              value={form.metaDescription}
              onChange={(event) =>
                updateField("metaDescription", event.target.value)
              }
              className="h-11 rounded-2xl border-0 bg-background"
              style={FLAT_FIELD_STYLE}
            />
            <p className="text-xs text-muted-foreground">
              Used in SEO and social cards when page-specific copy is missing.
            </p>
          </div>

          <div className="rounded-2xl bg-background px-4 py-4">
            <div className="flex items-center gap-3">
              <Checkbox
                id="noticeEnabled"
                checked={form.noticeEnabled}
                onCheckedChange={(checked) =>
                  updateField("noticeEnabled", checked === true)
                }
              />
              <div className="space-y-1">
                <Label htmlFor="noticeEnabled">Enable top notice bar</Label>
                <p className="text-xs text-muted-foreground">
                  Shown above the public navbar on storefront pages.
                </p>
              </div>
            </div>

            <Input
              id="noticeText"
              placeholder="e.g. Free shipping on orders over $99 this week"
              value={form.noticeText}
              onChange={(event) => updateField("noticeText", event.target.value)}
              disabled={!form.noticeEnabled}
              className="mt-4 h-11 rounded-2xl border-0 bg-muted/40"
              style={FLAT_FIELD_STYLE}
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <ImageUploadField
              id="logoUrl"
              label="Logo URL"
              value={form.logoUrl}
              onChange={(value) => updateField("logoUrl", value)}
              hint="Recommended: around 4:1 ratio (e.g. 800x200) for header/footer logos."
              previewClassName="h-12 w-auto object-contain"
            />

            <ImageUploadField
              id="faviconUrl"
              label="Favicon URL"
              value={form.faviconUrl}
              onChange={(value) => updateField("faviconUrl", value)}
              hint="Recommended: 1:1 ratio (e.g. 512x512) for browser favicon usage."
              previewClassName="h-10 w-10 object-contain"
            />
          </div>

          <ImageUploadField
            id="ogImageUrl"
            label="OG Image URL"
            value={form.ogImageUrl}
            onChange={(value) => updateField("ogImageUrl", value)}
            placeholder="https://... (for social sharing)"
            hint="Recommended: 1200x630 (1.91:1) for social sharing previews."
            previewClassName="h-36 w-full rounded-md object-cover"
          />
        </CollapsibleBlock>

        <CollapsibleBlock
          title="Checkout Controls"
          description="Control which checkout actions customers see and whether bKash is offered beside the regular place-order flow."
          collapsed={collapsedSections["checkout-controls"]}
          onToggle={() => toggleSection("checkout-controls")}
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl bg-background px-4 py-4">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="showPlaceOrderButton"
                  checked={form.showPlaceOrderButton}
                  onCheckedChange={(checked) =>
                    updateField("showPlaceOrderButton", checked === true)
                  }
                />
                <div className="space-y-1">
                  <Label htmlFor="showPlaceOrderButton">
                    Show place-order button
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Keeps the standard pending-order flow visible in checkout.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-background px-4 py-4">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="showBkashCheckoutButton"
                  checked={form.showBkashCheckoutButton}
                  onCheckedChange={(checked) =>
                    updateField("showBkashCheckoutButton", checked === true)
                  }
                />
                <div className="space-y-1">
                  <Label htmlFor="showBkashCheckoutButton">
                    Show bKash checkout button
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Lets customers pay the configured bKash amount now and keep
                    the remaining balance due later.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[24px] border border-dashed border-primary/30 bg-primary/5 px-4 py-4">
            <p className="text-sm font-semibold text-foreground">
              Checkout button preview
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Customers will only see the buttons enabled here. bKash still
              requires saved credentials below before the payment session can be
              created.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {form.showPlaceOrderButton ? (
                <div className="rounded-full bg-foreground px-4 py-2 text-xs font-semibold text-background">
                  Place order
                </div>
              ) : null}
              {form.showBkashCheckoutButton ? (
                <div className="rounded-full border border-[#E2136E]/25 bg-[#E2136E]/10 px-4 py-2 text-xs font-semibold text-[#B10F57]">
                  Checkout with bKash
                </div>
              ) : null}
              {!form.showPlaceOrderButton && !form.showBkashCheckoutButton ? (
                <div className="rounded-full bg-muted px-4 py-2 text-xs font-medium text-muted-foreground">
                  No checkout button visible
                </div>
              ) : null}
            </div>
          </div>
        </CollapsibleBlock>

        <CollapsibleBlock
          title="Support Contact Launcher"
          description="Pick one floating support shortcut for the storefront. WhatsApp and Tawk.to are mutually exclusive."
          collapsed={collapsedSections["contact-launcher"]}
          onToggle={() => toggleSection("contact-launcher")}
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="whatsappLink">WhatsApp Link</Label>
              <Input
                id="whatsappLink"
                placeholder="https://wa.me/8801900000000"
                value={form.whatsappLink}
                onChange={(event) =>
                  updateField("whatsappLink", event.target.value)
                }
                disabled={
                  Boolean(form.tawkToLink.trim()) && !form.whatsappLink.trim()
                }
                className="h-11 rounded-2xl border-0 bg-background"
                style={FLAT_FIELD_STYLE}
              />
              <p className="text-xs text-muted-foreground">
                Best for direct mobile chat. Clear the Tawk.to field first if
                you want to use this option.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tawkToLink">Tawk.to Link</Label>
              <Input
                id="tawkToLink"
                placeholder="https://tawk.to/chat/..."
                value={form.tawkToLink}
                onChange={(event) => updateField("tawkToLink", event.target.value)}
                disabled={
                  Boolean(form.whatsappLink.trim()) && !form.tawkToLink.trim()
                }
                className="h-11 rounded-2xl border-0 bg-background"
                style={FLAT_FIELD_STYLE}
              />
              <p className="text-xs text-muted-foreground">
                Use this when you want a general live-chat entry point instead
                of WhatsApp.
              </p>
            </div>
          </div>

          <div className="rounded-[24px] border border-dashed border-foreground/10 bg-background px-4 py-4">
            <p className="text-sm font-semibold text-foreground">
              Floating button preview
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              A single launcher appears fixed at the bottom-right of storefront
              pages.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {form.whatsappLink.trim() ? (
                <div className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-xs font-semibold text-emerald-700">
                  WhatsApp chat button
                </div>
              ) : null}
              {form.tawkToLink.trim() ? (
                <div className="rounded-full border border-sky-500/20 bg-sky-500/10 px-4 py-2 text-xs font-semibold text-sky-700">
                  Tawk.to chat button
                </div>
              ) : null}
              {!form.whatsappLink.trim() && !form.tawkToLink.trim() ? (
                <div className="rounded-full bg-muted px-4 py-2 text-xs font-medium text-muted-foreground">
                  No support launcher visible
                </div>
              ) : null}
            </div>
          </div>
        </CollapsibleBlock>

        <CollapsibleBlock
          title="bKash Gateway"
          description="Store the internal bKash credentials used by the backend. These values are write-only and are never returned to the frontend after save."
          collapsed={collapsedSections["bkash-gateway"]}
          onToggle={() => toggleSection("bkash-gateway")}
        >
          <div className="rounded-[24px] border border-dashed border-[#E2136E]/30 bg-[linear-gradient(135deg,rgba(226,19,110,0.08),rgba(255,255,255,0.92))] px-4 py-4">
            <p className="text-sm font-semibold text-foreground">
              Write-only credential storage
            </p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Saved values stay hidden. Enter new values only for the fields you
              want to set or replace. Leaving a field empty keeps the currently
              stored secret unchanged.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="bkashAppKey">bKash App Key</Label>
              <Input
                id="bkashAppKey"
                placeholder="Enter app key"
                value={form.bkashAppKey}
                onChange={(event) => updateField("bkashAppKey", event.target.value)}
                className="h-11 rounded-2xl border-0 bg-background"
                style={FLAT_FIELD_STYLE}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bkashAppSecret">bKash App Secret</Label>
              <Input
                id="bkashAppSecret"
                type="password"
                placeholder="Enter app secret"
                value={form.bkashAppSecret}
                onChange={(event) =>
                  updateField("bkashAppSecret", event.target.value)
                }
                className="h-11 rounded-2xl border-0 bg-background"
                style={FLAT_FIELD_STYLE}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bkashUsername">bKash Username</Label>
              <Input
                id="bkashUsername"
                placeholder="Enter username"
                value={form.bkashUsername}
                onChange={(event) =>
                  updateField("bkashUsername", event.target.value)
                }
                className="h-11 rounded-2xl border-0 bg-background"
                style={FLAT_FIELD_STYLE}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bkashPassword">bKash Password</Label>
              <Input
                id="bkashPassword"
                type="password"
                placeholder="Enter password"
                value={form.bkashPassword}
                onChange={(event) =>
                  updateField("bkashPassword", event.target.value)
                }
                className="h-11 rounded-2xl border-0 bg-background"
                style={FLAT_FIELD_STYLE}
              />
            </div>
          </div>
        </CollapsibleBlock>

        <CollapsibleBlock
          title="Storefront Appearance"
          description="Choose the global theme and presentation presets your client wants to ship for every visitor."
          collapsed={collapsedSections.appearance}
          onToggle={() => toggleSection("appearance")}
        >
          <CollapsibleSubsection
            title="Global Theme"
            description="This theme is applied site-wide for every visitor."
            collapsed={collapsedSections["appearance-theme"]}
            onToggle={() => toggleSection("appearance-theme")}
          >
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5">
              {SITE_THEME_OPTIONS.map((option) => {
                const active = form.siteTheme === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => updateField("siteTheme", option.value)}
                    className={cn(
                      "rounded-2xl border-0 bg-background p-4 text-left transition-colors",
                      active ? "ring-2 ring-primary/45" : "hover:bg-background/80",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {option.label}
                        </p>
                        <p className="mt-1 text-xs leading-5 text-muted-foreground">
                          {option.description}
                        </p>
                      </div>
                      <div
                        className={cn(
                          "flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground",
                          active ? "opacity-100" : "opacity-0",
                        )}
                      >
                        <Check className="size-3.5" />
                      </div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      {option.swatches.map((swatch) => (
                        <span
                          key={swatch}
                          className="h-3 w-10 rounded-full"
                          style={{ backgroundColor: swatch }}
                        />
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </CollapsibleSubsection>

          <CollapsibleSubsection
            title="Product Card Layout"
            description="Used across search, home collections, related products, and every storefront grid."
            collapsed={collapsedSections["appearance-card"]}
            onToggle={() => toggleSection("appearance-card")}
          >
            <VariantPicker
              title="Product Card Layout"
              description="Used across search, home collections, related products, and every storefront grid."
              options={PRODUCT_CARD_VARIANT_OPTIONS}
              value={form.productCardVariant}
              onChange={(value) => updateField("productCardVariant", value)}
              previewKind="product-card"
              compactHeader
            />
          </CollapsibleSubsection>

          <CollapsibleSubsection
            title="Product Details Layout"
            description="Used on the product details page. If nothing is selected, the current layout remains the fallback."
            collapsed={collapsedSections["appearance-details"]}
            onToggle={() => toggleSection("appearance-details")}
          >
            <VariantPicker
              title="Product Details Layout"
              description="Used on the product details page. If nothing is selected, the current layout remains the fallback."
              options={PRODUCT_DETAILS_VARIANT_OPTIONS}
              value={form.productDetailsVariant}
              onChange={(value) => updateField("productDetailsVariant", value)}
              previewKind="product-details"
              compactHeader
            />
          </CollapsibleSubsection>
        </CollapsibleBlock>

        <div className="flex justify-end">
          <Button type="submit" disabled={saveMutation.isPending}>
            {saveMutation.isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 size-4" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

function VariantPicker<T extends string>({
  title,
  description,
  options,
  value,
  onChange,
  previewKind,
  compactHeader = false,
}: {
  title: string;
  description: string;
  options: ReadonlyArray<{
    value: T;
    label: string;
    description: string;
  }>;
  value: T;
  onChange: (value: T) => void;
  previewKind: "product-card" | "product-details";
  compactHeader?: boolean;
}) {
  return (
    <div className="space-y-3">
      {!compactHeader ? (
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      ) : null}

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {options.map((option) => {
          const active = value === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={cn(
                "rounded-2xl border-0 bg-background p-4 text-left transition-colors",
                active ? "ring-2 ring-primary/45" : "hover:bg-background/80",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {option.label}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    {option.description}
                  </p>
                </div>
                <div
                  className={cn(
                    "flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground",
                    active ? "opacity-100" : "opacity-0",
                  )}
                >
                  <Check className="size-3.5" />
                </div>
              </div>

              <div className="mt-4">
                {previewKind === "product-card" ? (
                  <ProductCardPreview
                    title="Everyday Cotton Set"
                    price="$89"
                    variant={option.value as ProductCardVariant}
                  />
                ) : (
                  <ProductDetailsLayoutPreview variant={option.value} />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ProductDetailsLayoutPreview({
  variant,
}: {
  variant: string;
}) {
  if (
    variant === "showcase" ||
    variant === "storyline" ||
    variant === "overview_split"
  ) {
    return (
      <div className="rounded-2xl bg-background p-3">
        <div className="grid gap-3 sm:grid-cols-[1.1fr_0.9fr]">
          <div className="h-24 rounded-[18px] bg-muted/45" />
          <div className="space-y-2 rounded-[18px] bg-muted/28 p-3">
            <div className="h-3 w-16 rounded-full bg-muted/55" />
            <div className="h-4 w-3/4 rounded-full bg-muted/55" />
            <div className="h-3 w-1/2 rounded-full bg-muted/35" />
            <div className="h-9 rounded-[14px] bg-primary/14" />
          </div>
        </div>
      </div>
    );
  }

  if (
    variant === "streamlined" ||
    variant === "buy_panel" ||
    variant === "catalog" ||
    variant === "spec_sheet" ||
    variant === "media_rail" ||
    variant === "retail_suite"
  ) {
    return (
      <div className="rounded-2xl bg-background p-3">
        <div className="grid gap-3 sm:grid-cols-[0.92fr_1.08fr]">
          <div className="space-y-2 rounded-[18px] bg-muted/28 p-3">
            <div className="h-4 w-3/4 rounded-full bg-muted/55" />
            <div className="h-3 w-1/2 rounded-full bg-muted/35" />
            <div className="h-9 rounded-[14px] bg-primary/14" />
          </div>
          <div className="space-y-2">
            <div className="h-20 rounded-[18px] bg-muted/45" />
            <div className="h-12 rounded-[18px] bg-muted/28" />
          </div>
        </div>
      </div>
    );
  }

  if (
    variant === "immersive" ||
    variant === "gallery_first" ||
    variant === "showroom" ||
    variant === "gallery_stack"
  ) {
    return (
      <div className="rounded-2xl bg-background p-3">
        <div className="grid gap-3 sm:grid-cols-[1.08fr_0.92fr]">
          <div className="space-y-2">
            <div className="h-24 rounded-[18px] bg-muted/45" />
            <div className="grid gap-2 sm:grid-cols-3">
              <div className="h-10 rounded-[14px] bg-muted/30" />
              <div className="h-10 rounded-[14px] bg-muted/30" />
              <div className="h-10 rounded-[14px] bg-muted/30" />
            </div>
          </div>
          <div className="space-y-2 rounded-[18px] bg-muted/28 p-3">
            <div className="h-4 w-3/4 rounded-full bg-muted/55" />
            <div className="h-3 w-1/2 rounded-full bg-muted/35" />
            <div className="h-9 rounded-[14px] bg-primary/14" />
          </div>
        </div>
      </div>
    );
  }

  if (
    variant === "original" ||
    variant === "briefing" ||
    variant === "merchant_brief" ||
    variant === "commerce_stack"
  ) {
    return (
      <div className="rounded-2xl bg-background p-3">
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-[0.98fr_1.02fr]">
            <div className="space-y-2 rounded-[18px] bg-muted/28 p-3">
              <div className="h-3 w-16 rounded-full bg-muted/55" />
              <div className="h-4 w-3/4 rounded-full bg-muted/55" />
              <div className="h-3 w-2/3 rounded-full bg-muted/35" />
              <div className="h-9 rounded-[14px] bg-primary/14" />
            </div>
            <div className="h-24 rounded-[18px] bg-muted/45" />
          </div>
          <div className="h-14 rounded-[18px] bg-muted/25" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-background p-3">
      <div className="space-y-3">
        <div className="h-20 rounded-[18px] bg-muted/45" />
        <div className="grid gap-3 sm:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-2">
            <div className="h-4 w-3/4 rounded-full bg-muted/55" />
            <div className="h-3 w-1/2 rounded-full bg-muted/35" />
            <div className="h-9 rounded-[14px] bg-primary/14" />
          </div>
          <div className="h-14 rounded-[18px] bg-muted/28" />
        </div>
      </div>
    </div>
  );
}

function CollapsibleBlock({
  title,
  description,
  collapsed,
  onToggle,
  children,
}: {
  title: string;
  description: string;
  collapsed: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[28px] bg-muted/35 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={onToggle}>
          {collapsed ? (
            <>
              <ChevronRight className="mr-1 size-4" />
              Expand
            </>
          ) : (
            <>
              <ChevronDown className="mr-1 size-4" />
              Collapse
            </>
          )}
        </Button>
      </div>

      {!collapsed ? <div className="mt-5 space-y-5">{children}</div> : null}
    </section>
  );
}

function CollapsibleSubsection({
  title,
  description,
  collapsed,
  onToggle,
  children,
}: {
  title: string;
  description: string;
  collapsed: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[24px] bg-background/80 p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={onToggle}>
          {collapsed ? (
            <>
              <ChevronRight className="mr-1 size-4" />
              Expand
            </>
          ) : (
            <>
              <ChevronDown className="mr-1 size-4" />
              Collapse
            </>
          )}
        </Button>
      </div>

      {!collapsed ? <div className="mt-4">{children}</div> : null}
    </section>
  );
}

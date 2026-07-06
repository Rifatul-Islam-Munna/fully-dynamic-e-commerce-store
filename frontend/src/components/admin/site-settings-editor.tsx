"use client";

import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { sileo } from "sileo";
import {
  Check,
  ChevronDown,
  ChevronRight,
  Eye,
  Loader2,
  Save,
} from "lucide-react";
import {
  createSiteSettings,
  getSiteSettings,
  updateSiteSettings,
} from "@/actions/admin-actions";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import {
  BkashGatewayPreview,
  BrandSeoPreview,
  CheckoutControlsPreview,
  ContactLauncherPreview,
  ProductCardLayoutPreview,
  ProductDetailsLayoutPreview,
  SiteSettingsPreviewModal,
  StorefrontAppearancePreview,
  ThemeMiniPreview,
  ThemeStorefrontPreview,
} from "@/components/admin/site-settings-previews";
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

type ThemeOption = (typeof SITE_THEME_OPTIONS)[number];
type ProductCardOption = (typeof PRODUCT_CARD_VARIANT_OPTIONS)[number];
type ProductDetailsOption = (typeof PRODUCT_DETAILS_VARIANT_OPTIONS)[number];

type PreviewTarget =
  | { kind: "brand-seo" }
  | { kind: "checkout-controls" }
  | { kind: "contact-launcher" }
  | { kind: "bkash-gateway" }
  | { kind: "appearance" }
  | { kind: "theme"; option: ThemeOption }
  | { kind: "product-card"; option: ProductCardOption }
  | { kind: "product-details"; option: ProductDetailsOption };

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

  const protectedFields = {
    bkashAppKey: form.bkashAppKey.trim(),
    bkashAppSecret: form.bkashAppSecret.trim(),
    bkashUsername: form.bkashUsername.trim(),
    bkashPassword: form.bkashPassword.trim(),
  };

  for (const [key, value] of Object.entries(protectedFields)) {
    if (value) payload[key] = value;
  }

  return payload;
}

export function SiteSettingsEditor() {
  const router = useRouter();
  const [form, setForm] = useState<SiteSettingsForm>(INITIAL);
  const [loading, setLoading] = useState(true);
  const [exists, setExists] = useState(false);
  const [previewTarget, setPreviewTarget] = useState<PreviewTarget | null>(null);
  const [collapsedSections, setCollapsedSections] =
    useState<Record<CollapsibleSectionId, boolean>>(EXPANDED_SECTIONS);

  useEffect(() => {
    void (async () => {
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
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const currentTheme = useMemo(
    () => SITE_THEME_OPTIONS.find((option) => option.value === form.siteTheme) ?? SITE_THEME_OPTIONS[0],
    [form.siteTheme],
  );

  const currentProductCard = useMemo(
    () => PRODUCT_CARD_VARIANT_OPTIONS.find((option) => option.value === form.productCardVariant) ?? PRODUCT_CARD_VARIANT_OPTIONS[0],
    [form.productCardVariant],
  );

  const currentProductDetails = useMemo(
    () => PRODUCT_DETAILS_VARIANT_OPTIONS.find((option) => option.value === form.productDetailsVariant) ?? PRODUCT_DETAILS_VARIANT_OPTIONS[0],
    [form.productDetailsVariant],
  );

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = buildSiteSettingsPayload(form);
      return exists ? updateSiteSettings(payload) : createSiteSettings(payload);
    },
    onSuccess: (result) => {
      const [data, error] = result as [unknown, { message?: string } | null];
      if (!data) {
        sileo.error({
          title: "Could not save",
          description: error?.message || "Site settings were not saved.",
        });
        return;
      }
      setExists(true);
      setForm((current) => ({
        ...current,
        bkashAppKey: "",
        bkashAppSecret: "",
        bkashUsername: "",
        bkashPassword: "",
      }));
      router.refresh();
      sileo.success({ title: "Saved", description: "Site settings updated successfully." });
    },
    onError: () => sileo.error({
      title: "Could not save",
      description: "Site settings were not saved.",
    }),
  });

  const updateField = <K extends keyof SiteSettingsForm>(
    field: K,
    value: SiteSettingsForm[K],
  ) => setForm((current) => ({ ...current, [field]: value }));

  const toggleSection = (sectionId: CollapsibleSectionId) => {
    setCollapsedSections((current) => ({
      ...current,
      [sectionId]: !current[sectionId],
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (form.whatsappLink.trim() && form.tawkToLink.trim()) {
      sileo.error({
        title: "Choose one support launcher",
        description: "Use either WhatsApp or Tawk.to, not both.",
      });
      return;
    }
    saveMutation.mutate();
  };

  const configuredGatewayFields = [
    form.bkashAppKey,
    form.bkashAppSecret,
    form.bkashUsername,
    form.bkashPassword,
  ].filter((value) => value.trim()).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-6 animate-spin text-on-surface-variant" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Site Settings</h1>
          <p className="text-sm text-on-surface-variant">
            Control global storefront identity, checkout, support, payments, and appearance with a preview-first workflow.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={() => setCollapsedSections(EXPANDED_SECTIONS)}>
            Expand all
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={() => setCollapsedSections(COLLAPSED_SECTIONS)}>
            Collapse all
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border bg-primary/5 p-4 text-sm text-on-surface-variant">
        <div className="flex items-start gap-3">
          <Eye className="mt-0.5 size-4 shrink-0 text-primary" />
          <p>
            Every settings component has a full preview. Theme, product-card, and product-details options are applied only after you review and confirm them.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <SettingsBlock
          title="Brand and SEO"
          description="Browser metadata, notice bar, logo, favicon, and social-sharing identity."
          collapsed={collapsedSections["brand-seo"]}
          onToggle={() => toggleSection("brand-seo")}
          onPreview={() => setPreviewTarget({ kind: "brand-seo" })}
        >
          <FieldGroup label="Site title" hint="Displayed in browser tabs, metadata, and storefront brand areas.">
            <Input value={form.siteTitle} onChange={(event) => updateField("siteTitle", event.target.value)} placeholder="e.g. My Online Store" className="h-11 rounded-2xl border-0 bg-surface" style={FLAT_FIELD_STYLE} />
          </FieldGroup>

          <FieldGroup label="Meta description" hint="Used by search engines and social cards when page-specific copy is missing.">
            <Input value={form.metaDescription} onChange={(event) => updateField("metaDescription", event.target.value)} placeholder="Brief description for search engines" className="h-11 rounded-2xl border-0 bg-surface" style={FLAT_FIELD_STYLE} />
          </FieldGroup>

          <div className="rounded-2xl bg-surface p-4">
            <div className="flex items-center gap-3">
              <Checkbox checked={form.noticeEnabled} onCheckedChange={(checked) => updateField("noticeEnabled", checked === true)} />
              <div><Label>Enable top notice bar</Label><p className="text-xs text-on-surface-variant">Shown above the public navbar.</p></div>
            </div>
            <Input value={form.noticeText} onChange={(event) => updateField("noticeText", event.target.value)} disabled={!form.noticeEnabled} placeholder="Free shipping on selected orders" className="mt-4 h-11 rounded-2xl border-0 bg-surface-container/40" style={FLAT_FIELD_STYLE} />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <ImageUploadField id="logoUrl" label="Logo URL" value={form.logoUrl} onChange={(value) => updateField("logoUrl", value)} hint="Recommended: around 4:1 ratio for header and footer usage." previewClassName="h-12 w-auto object-contain" />
            <ImageUploadField id="faviconUrl" label="Favicon URL" value={form.faviconUrl} onChange={(value) => updateField("faviconUrl", value)} hint="Recommended: a square 512×512 image." previewClassName="h-10 w-10 object-contain" />
          </div>
          <ImageUploadField id="ogImageUrl" label="Social sharing image" value={form.ogImageUrl} onChange={(value) => updateField("ogImageUrl", value)} placeholder="https://..." hint="Recommended: 1200×630 for social sharing." previewClassName="h-36 w-full rounded-md object-cover" />
        </SettingsBlock>

        <SettingsBlock
          title="Checkout Controls"
          description="Choose which checkout actions customers can see."
          collapsed={collapsedSections["checkout-controls"]}
          onToggle={() => toggleSection("checkout-controls")}
          onPreview={() => setPreviewTarget({ kind: "checkout-controls" })}
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <ToggleCard title="Show place-order button" description="Keeps the standard pending-order flow visible." checked={form.showPlaceOrderButton} onChange={(value) => updateField("showPlaceOrderButton", value)} />
            <ToggleCard title="Show bKash checkout button" description="Shows the configured immediate bKash payment action." checked={form.showBkashCheckoutButton} onChange={(value) => updateField("showBkashCheckoutButton", value)} />
          </div>
          <InlinePreviewButton label="Preview the complete checkout experience" onClick={() => setPreviewTarget({ kind: "checkout-controls" })} />
        </SettingsBlock>

        <SettingsBlock
          title="Support Contact Launcher"
          description="Choose one floating customer-support shortcut."
          collapsed={collapsedSections["contact-launcher"]}
          onToggle={() => toggleSection("contact-launcher")}
          onPreview={() => setPreviewTarget({ kind: "contact-launcher" })}
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <FieldGroup label="WhatsApp link" hint="Best for direct mobile chat. Clear Tawk.to first to use this option.">
              <Input value={form.whatsappLink} onChange={(event) => updateField("whatsappLink", event.target.value)} disabled={Boolean(form.tawkToLink.trim()) && !form.whatsappLink.trim()} placeholder="https://wa.me/8801900000000" className="h-11 rounded-2xl border-0 bg-surface" style={FLAT_FIELD_STYLE} />
            </FieldGroup>
            <FieldGroup label="Tawk.to link" hint="Use this for a general live-chat entry point instead of WhatsApp.">
              <Input value={form.tawkToLink} onChange={(event) => updateField("tawkToLink", event.target.value)} disabled={Boolean(form.whatsappLink.trim()) && !form.tawkToLink.trim()} placeholder="https://tawk.to/chat/..." className="h-11 rounded-2xl border-0 bg-surface" style={FLAT_FIELD_STYLE} />
            </FieldGroup>
          </div>
          <InlinePreviewButton label="Preview the floating support button" onClick={() => setPreviewTarget({ kind: "contact-launcher" })} />
        </SettingsBlock>

        <SettingsBlock
          title="bKash Gateway"
          description="Manage protected server-side payment credentials."
          collapsed={collapsedSections["bkash-gateway"]}
          onToggle={() => toggleSection("bkash-gateway")}
          onPreview={() => setPreviewTarget({ kind: "bkash-gateway" })}
        >
          <div className="rounded-2xl border border-dashed border-[#E2136E]/30 bg-[#E2136E]/5 p-4">
            <p className="text-sm font-semibold">Protected configuration</p>
            <p className="mt-1 text-xs leading-5 text-on-surface-variant">
              Existing saved values remain hidden. Empty fields keep the currently stored value unchanged.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <FieldGroup label="bKash app key"><Input value={form.bkashAppKey} onChange={(event) => updateField("bkashAppKey", event.target.value)} placeholder="Enter app key" className="h-11 rounded-2xl border-0 bg-surface" style={FLAT_FIELD_STYLE} /></FieldGroup>
            <FieldGroup label="bKash app secret"><Input type="password" value={form.bkashAppSecret} onChange={(event) => updateField("bkashAppSecret", event.target.value)} placeholder="Enter app secret" className="h-11 rounded-2xl border-0 bg-surface" style={FLAT_FIELD_STYLE} /></FieldGroup>
            <FieldGroup label="bKash username"><Input value={form.bkashUsername} onChange={(event) => updateField("bkashUsername", event.target.value)} placeholder="Enter username" className="h-11 rounded-2xl border-0 bg-surface" style={FLAT_FIELD_STYLE} /></FieldGroup>
            <FieldGroup label="bKash password"><Input type="password" value={form.bkashPassword} onChange={(event) => updateField("bkashPassword", event.target.value)} placeholder="Enter password" className="h-11 rounded-2xl border-0 bg-surface" style={FLAT_FIELD_STYLE} /></FieldGroup>
          </div>
          <InlinePreviewButton label="Preview gateway configuration status" onClick={() => setPreviewTarget({ kind: "bkash-gateway" })} />
        </SettingsBlock>

        <SettingsBlock
          title="Storefront Appearance"
          description="Global theme, product-card design, and product-details layout."
          collapsed={collapsedSections.appearance}
          onToggle={() => toggleSection("appearance")}
          onPreview={() => setPreviewTarget({ kind: "appearance" })}
        >
          <SettingsSubsection
            title="Global Theme"
            description="Applied site-wide to every storefront page."
            collapsed={collapsedSections["appearance-theme"]}
            onToggle={() => toggleSection("appearance-theme")}
            onPreview={() => setPreviewTarget({ kind: "theme", option: currentTheme })}
          >
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5">
              {SITE_THEME_OPTIONS.map((option) => {
                const active = form.siteTheme === option.value;
                return (
                  <button key={option.value} type="button" onClick={() => setPreviewTarget({ kind: "theme", option })} className={cn("rounded-2xl border bg-surface p-4 text-left transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md", active && "border-primary ring-2 ring-primary/15")}>
                    <OptionHeader label={option.label} description={option.description} active={active} />
                    <ThemeMiniPreview swatches={option.swatches} />
                    <p className="mt-3 text-[11px] font-medium text-primary">Click to preview before applying</p>
                  </button>
                );
              })}
            </div>
          </SettingsSubsection>

          <SettingsSubsection
            title="Product Card Layout"
            description="Used in collections, search, related products, and storefront grids."
            collapsed={collapsedSections["appearance-card"]}
            onToggle={() => toggleSection("appearance-card")}
            onPreview={() => setPreviewTarget({ kind: "product-card", option: currentProductCard })}
          >
            <ProductCardPicker value={form.productCardVariant} onPreview={(option) => setPreviewTarget({ kind: "product-card", option })} />
          </SettingsSubsection>

          <SettingsSubsection
            title="Product Details Layout"
            description="Used on every product details page."
            collapsed={collapsedSections["appearance-details"]}
            onToggle={() => toggleSection("appearance-details")}
            onPreview={() => setPreviewTarget({ kind: "product-details", option: currentProductDetails })}
          >
            <ProductDetailsPicker value={form.productDetailsVariant} onPreview={(option) => setPreviewTarget({ kind: "product-details", option })} />
          </SettingsSubsection>
        </SettingsBlock>

        <div className="sticky bottom-3 z-20 flex justify-end rounded-2xl border bg-background/90 p-3 shadow-lg backdrop-blur-xl">
          <Button type="submit" disabled={saveMutation.isPending} className="min-w-40">
            {saveMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            {saveMutation.isPending ? "Saving..." : "Save settings"}
          </Button>
        </div>
      </form>

      {previewTarget ? (
        <PreviewRenderer
          target={previewTarget}
          form={form}
          configuredGatewayFields={configuredGatewayFields}
          close={() => setPreviewTarget(null)}
          applyTheme={(value) => { updateField("siteTheme", value); setPreviewTarget(null); }}
          applyProductCard={(value) => { updateField("productCardVariant", value); setPreviewTarget(null); }}
          applyProductDetails={(value) => { updateField("productDetailsVariant", value); setPreviewTarget(null); }}
        />
      ) : null}
    </div>
  );
}

function PreviewRenderer({
  target,
  form,
  configuredGatewayFields,
  close,
  applyTheme,
  applyProductCard,
  applyProductDetails,
}: {
  target: PreviewTarget;
  form: SiteSettingsForm;
  configuredGatewayFields: number;
  close: () => void;
  applyTheme: (value: SiteThemeName) => void;
  applyProductCard: (value: ProductCardVariant) => void;
  applyProductDetails: (value: ProductDetailsVariant) => void;
}) {
  if (target.kind === "brand-seo") {
    return <SiteSettingsPreviewModal title="Brand and SEO preview" description="See how your notice bar, navigation identity, search result, and social card work together." onClose={close}><BrandSeoPreview siteTitle={form.siteTitle} metaDescription={form.metaDescription} logoUrl={form.logoUrl} ogImageUrl={form.ogImageUrl} noticeEnabled={form.noticeEnabled} noticeText={form.noticeText} /></SiteSettingsPreviewModal>;
  }
  if (target.kind === "checkout-controls") {
    return <SiteSettingsPreviewModal title="Checkout controls preview" description="See the complete checkout summary with only the actions currently enabled." onClose={close}><CheckoutControlsPreview showPlaceOrderButton={form.showPlaceOrderButton} showBkashCheckoutButton={form.showBkashCheckoutButton} /></SiteSettingsPreviewModal>;
  }
  if (target.kind === "contact-launcher") {
    return <SiteSettingsPreviewModal title="Support launcher preview" description="See where the selected support shortcut appears on a storefront page." onClose={close}><ContactLauncherPreview whatsappEnabled={Boolean(form.whatsappLink.trim())} tawkEnabled={Boolean(form.tawkToLink.trim())} /></SiteSettingsPreviewModal>;
  }
  if (target.kind === "bkash-gateway") {
    return <SiteSettingsPreviewModal title="bKash gateway preview" description="Review configuration status without revealing or returning protected values." onClose={close}><BkashGatewayPreview configuredFields={configuredGatewayFields} /></SiteSettingsPreviewModal>;
  }
  if (target.kind === "appearance") {
    const theme = SITE_THEME_OPTIONS.find((option) => option.value === form.siteTheme) ?? SITE_THEME_OPTIONS[0];
    return <SiteSettingsPreviewModal title="Complete storefront appearance" description="Review the current global theme, product-card design, and product-details layout together." onClose={close}><StorefrontAppearancePreview themeLabel={theme.label} themeDescription={theme.description} swatches={theme.swatches} productCardVariant={form.productCardVariant} productDetailsVariant={form.productDetailsVariant} /></SiteSettingsPreviewModal>;
  }
  if (target.kind === "theme") {
    return <SiteSettingsPreviewModal title={`${target.option.label} theme preview`} description={target.option.description} onClose={close} onApply={() => applyTheme(target.option.value)} applyLabel="Use this theme"><ThemeStorefrontPreview label={target.option.label} description={target.option.description} swatches={target.option.swatches} /></SiteSettingsPreviewModal>;
  }
  if (target.kind === "product-card") {
    return <SiteSettingsPreviewModal title={`${target.option.label} product-card preview`} description={target.option.description} onClose={close} onApply={() => applyProductCard(target.option.value)} applyLabel="Use this card design"><ProductCardLayoutPreview variant={target.option.value} /></SiteSettingsPreviewModal>;
  }
  return <SiteSettingsPreviewModal title={`${target.option.label} product-details preview`} description={target.option.description} onClose={close} onApply={() => applyProductDetails(target.option.value)} applyLabel="Use this product layout"><ProductDetailsLayoutPreview variant={target.option.value} /></SiteSettingsPreviewModal>;
}

function SettingsBlock({ title, description, collapsed, onToggle, onPreview, children }: { title: string; description: string; collapsed: boolean; onToggle: () => void; onPreview: () => void; children: ReactNode }) {
  return (
    <section className="rounded-[28px] bg-surface-container-low/35 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1"><h2 className="text-base font-semibold">{title}</h2><p className="text-sm text-on-surface-variant">{description}</p></div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onPreview}><Eye className="size-4" />Preview</Button>
          <Button type="button" variant="ghost" size="sm" onClick={onToggle}>{collapsed ? <ChevronRight className="size-4" /> : <ChevronDown className="size-4" />}{collapsed ? "Expand" : "Collapse"}</Button>
        </div>
      </div>
      {!collapsed ? <div className="mt-5 space-y-5">{children}</div> : null}
    </section>
  );
}

function SettingsSubsection({ title, description, collapsed, onToggle, onPreview, children }: { title: string; description: string; collapsed: boolean; onToggle: () => void; onPreview: () => void; children: ReactNode }) {
  return (
    <section className="rounded-[24px] bg-surface/80 p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1"><h3 className="text-sm font-semibold">{title}</h3><p className="text-xs text-on-surface-variant">{description}</p></div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onPreview}><Eye className="size-4" />Preview</Button>
          <Button type="button" variant="ghost" size="sm" onClick={onToggle}>{collapsed ? <ChevronRight className="size-4" /> : <ChevronDown className="size-4" />}{collapsed ? "Expand" : "Collapse"}</Button>
        </div>
      </div>
      {!collapsed ? <div className="mt-4">{children}</div> : null}
    </section>
  );
}

function FieldGroup({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return <div className="space-y-2"><Label>{label}</Label>{children}{hint ? <p className="text-xs text-on-surface-variant">{hint}</p> : null}</div>;
}

function ToggleCard({ title, description, checked, onChange }: { title: string; description: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-surface p-4"><Checkbox checked={checked} onCheckedChange={(value) => onChange(value === true)} /><span><span className="block text-sm font-semibold">{title}</span><span className="mt-1 block text-xs leading-5 text-on-surface-variant">{description}</span></span></label>;
}

function InlinePreviewButton({ label, onClick }: { label: string; onClick: () => void }) {
  return <button type="button" onClick={onClick} className="flex w-full items-center justify-between rounded-2xl border border-dashed border-primary/30 bg-primary/5 px-4 py-4 text-left transition hover:border-primary hover:bg-primary/10"><span><span className="block text-sm font-semibold">{label}</span><span className="mt-1 block text-xs text-on-surface-variant">Open a full-size example using the current settings.</span></span><Eye className="size-5 text-primary" /></button>;
}

function OptionHeader({ label, description, active }: { label: string; description: string; active: boolean }) {
  return <div className="flex items-start justify-between gap-3"><div><p className="text-sm font-semibold">{label}</p><p className="mt-1 text-xs leading-5 text-on-surface-variant">{description}</p></div><span className={cn("flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground", active ? "opacity-100" : "opacity-0")}><Check className="size-3.5" /></span></div>;
}

function ProductCardPicker({ value, onPreview }: { value: ProductCardVariant; onPreview: (option: ProductCardOption) => void }) {
  return <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">{PRODUCT_CARD_VARIANT_OPTIONS.map((option) => { const active = value === option.value; return <button key={option.value} type="button" onClick={() => onPreview(option)} className={cn("rounded-2xl border bg-surface p-4 text-left transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md", active && "border-primary ring-2 ring-primary/15")}><OptionHeader label={option.label} description={option.description} active={active} /><div className="mt-4"><ProductCardPreview title="Everyday Cotton Set" price="$89" variant={option.value} /></div><p className="mt-3 text-[11px] font-medium text-primary">Click to preview before applying</p></button>; })}</div>;
}

function ProductDetailsPicker({ value, onPreview }: { value: ProductDetailsVariant; onPreview: (option: ProductDetailsOption) => void }) {
  return <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{PRODUCT_DETAILS_VARIANT_OPTIONS.map((option) => { const active = value === option.value; return <button key={option.value} type="button" onClick={() => onPreview(option)} className={cn("overflow-hidden rounded-2xl border bg-surface p-4 text-left transition hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md", active && "border-primary ring-2 ring-primary/15")}><OptionHeader label={option.label} description={option.description} active={active} /><div className="mt-4 max-h-56 overflow-hidden rounded-xl"><div className="origin-top-left scale-[0.62] w-[161%]"><ProductDetailsLayoutPreview variant={option.value} /></div></div><p className="mt-3 text-[11px] font-medium text-primary">Click to preview before applying</p></button>; })}</div>;
}

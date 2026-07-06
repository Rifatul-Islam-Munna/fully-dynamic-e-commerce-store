"use client";

import {
  Check,
  CreditCard,
  Eye,
  Globe2,
  Headphones,
  LockKeyhole,
  MessageCircle,
  Search,
  ShieldCheck,
  ShoppingBag,
  X,
} from "lucide-react";
import { ProductCardPreview } from "@/components/product/product-card";
import { Button } from "@/components/ui/button";
import type {
  ProductCardVariant,
  ProductDetailsVariant,
} from "@/lib/site-appearance";
import { cn } from "@/lib/utils";

export function SiteSettingsPreviewModal({
  title,
  description,
  onClose,
  onApply,
  applyLabel = "Use this option",
  children,
}: {
  title: string;
  description: string;
  onClose: () => void;
  onApply?: () => void;
  applyLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <button
        type="button"
        className="absolute inset-0"
        aria-label="Close preview"
        onClick={onClose}
      />
      <div className="relative z-10 max-h-[92vh] w-full max-w-6xl overflow-auto rounded-2xl border bg-background shadow-2xl">
        <div className="sticky top-0 z-20 flex items-start justify-between gap-4 border-b bg-background/95 px-5 py-4 backdrop-blur-xl">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Eye className="size-4 text-primary" />
              <h2 className="text-lg font-semibold">{title}</h2>
              <span className="rounded-full bg-primary/10 px-2 py-1 text-[11px] font-semibold text-primary">
                Live preview
              </span>
            </div>
            <p className="mt-1 max-w-3xl text-sm text-on-surface-variant">
              {description}
            </p>
          </div>
          <Button type="button" size="icon" variant="ghost" onClick={onClose}>
            <X className="size-5" />
          </Button>
        </div>

        <div className="bg-surface-container-low/45 p-4 sm:p-8">
          <div className="mx-auto max-w-5xl rounded-2xl bg-background p-3 shadow-xl sm:p-5">
            {children}
          </div>
        </div>

        <div className="sticky bottom-0 z-20 flex flex-col-reverse gap-3 border-t bg-background/95 px-5 py-4 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-on-surface-variant">
            Preview content is illustrative. Saved storefront data and customer information are not exposed here.
          </p>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Close
            </Button>
            {onApply ? (
              <Button type="button" onClick={onApply}>
                <Check className="size-4" />
                {applyLabel}
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

export function BrandSeoPreview({
  siteTitle,
  metaDescription,
  logoUrl,
  ogImageUrl,
  noticeEnabled,
  noticeText,
}: {
  siteTitle: string;
  metaDescription: string;
  logoUrl: string;
  ogImageUrl: string;
  noticeEnabled: boolean;
  noticeText: string;
}) {
  const title = siteTitle.trim() || "Modern Store";
  const description =
    metaDescription.trim()
    || "Discover curated products, fast checkout, and a polished shopping experience.";

  return (
    <div className="overflow-hidden rounded-2xl border bg-white text-slate-950">
      <div className="flex items-center gap-2 border-b bg-slate-100 px-4 py-3">
        <div className="size-2.5 rounded-full bg-red-400" />
        <div className="size-2.5 rounded-full bg-amber-400" />
        <div className="size-2.5 rounded-full bg-emerald-400" />
        <div className="ml-3 flex-1 rounded-full bg-white px-4 py-2 text-[11px] text-slate-500">
          https://your-store.com
        </div>
      </div>

      {noticeEnabled ? (
        <div className="bg-slate-950 px-4 py-2 text-center text-xs font-medium text-white">
          {noticeText.trim() || "Free delivery on selected orders this week"}
        </div>
      ) : null}

      <div className="flex items-center justify-between border-b px-5 py-4">
        <div className="flex items-center gap-3">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="Store logo preview" className="h-8 max-w-36 object-contain" />
          ) : (
            <div className="text-lg font-black tracking-tight">{title}</div>
          )}
          <div className="hidden items-center gap-5 text-xs text-slate-500 sm:flex">
            <span>New</span><span>Collections</span><span>Best sellers</span>
          </div>
        </div>
        <div className="flex items-center gap-3 text-slate-500">
          <Search className="size-4" />
          <ShoppingBag className="size-4" />
        </div>
      </div>

      <div className="grid gap-5 p-5 lg:grid-cols-[1fr_0.9fr]">
        <div className="rounded-2xl border p-5">
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Globe2 className="size-4" /> Search result preview
          </div>
          <p className="text-lg text-blue-700">{title} — Official Store</p>
          <p className="mt-1 text-xs text-emerald-700">your-store.com</p>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">{description}</p>
        </div>

        <div className="overflow-hidden rounded-2xl border">
          <div className="relative h-32 bg-gradient-to-br from-slate-100 to-slate-300">
            {ogImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={ogImageUrl} alt="Social sharing preview" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-sm font-semibold text-slate-500">
                Social share image
              </div>
            )}
          </div>
          <div className="p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">your-store.com</p>
            <p className="mt-1 font-semibold">{title}</p>
            <p className="mt-1 line-clamp-2 text-xs text-slate-500">{description}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CheckoutControlsPreview({
  showPlaceOrderButton,
  showBkashCheckoutButton,
}: {
  showPlaceOrderButton: boolean;
  showBkashCheckoutButton: boolean;
}) {
  return (
    <div className="grid gap-6 rounded-2xl border bg-slate-50 p-5 text-slate-950 lg:grid-cols-[1fr_360px]">
      <div className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Checkout</p>
          <h3 className="mt-1 text-2xl font-bold">Delivery information</h3>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {['Full name', 'Phone number', 'Delivery area', 'Address'].map((item) => (
            <div key={item} className="rounded-xl border bg-white px-4 py-3 text-xs text-slate-400">{item}</div>
          ))}
        </div>
        <div className="rounded-xl border bg-white p-4">
          <div className="flex items-center gap-3">
            <CreditCard className="size-5 text-slate-500" />
            <div><p className="text-sm font-semibold">Payment method</p><p className="text-xs text-slate-500">Choose the available checkout action</p></div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        <h4 className="font-semibold">Order summary</h4>
        <div className="mt-4 space-y-3 text-sm text-slate-500">
          <div className="flex justify-between"><span>Subtotal</span><span>$128.00</span></div>
          <div className="flex justify-between"><span>Delivery</span><span>$4.00</span></div>
          <div className="flex justify-between border-t pt-3 font-semibold text-slate-950"><span>Total</span><span>$132.00</span></div>
        </div>
        <div className="mt-5 space-y-2">
          {showPlaceOrderButton ? (
            <div className="flex h-11 items-center justify-center rounded-lg bg-slate-950 text-xs font-bold uppercase tracking-wide text-white">Place order</div>
          ) : null}
          {showBkashCheckoutButton ? (
            <div className="flex h-11 items-center justify-center rounded-lg bg-[#E2136E] text-xs font-bold uppercase tracking-wide text-white">Checkout with bKash</div>
          ) : null}
          {!showPlaceOrderButton && !showBkashCheckoutButton ? (
            <div className="rounded-lg border border-dashed p-4 text-center text-xs text-slate-400">No checkout action is currently visible</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function ContactLauncherPreview({
  whatsappEnabled,
  tawkEnabled,
}: {
  whatsappEnabled: boolean;
  tawkEnabled: boolean;
}) {
  return (
    <div className="relative min-h-[430px] overflow-hidden rounded-2xl border bg-white text-slate-950">
      <div className="flex items-center justify-between border-b px-5 py-4">
        <div className="text-lg font-black">MODERN STORE</div>
        <div className="flex gap-5 text-xs text-slate-500"><span>Shop</span><span>New</span><span>Offers</span></div>
      </div>
      <div className="grid gap-5 p-5 sm:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div key={item} className="space-y-3">
            <div className="aspect-[4/5] rounded-xl bg-gradient-to-br from-slate-100 to-slate-300" />
            <div className="h-3 w-3/4 rounded bg-slate-200" />
            <div className="h-3 w-1/3 rounded bg-slate-300" />
          </div>
        ))}
      </div>

      {whatsappEnabled ? (
        <div className="absolute bottom-5 right-5 flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-3 text-xs font-semibold text-white shadow-xl">
          <MessageCircle className="size-5" /> Chat on WhatsApp
        </div>
      ) : null}
      {tawkEnabled ? (
        <div className="absolute bottom-5 right-5 flex items-center gap-2 rounded-full bg-sky-600 px-4 py-3 text-xs font-semibold text-white shadow-xl">
          <Headphones className="size-5" /> Live support
        </div>
      ) : null}
      {!whatsappEnabled && !tawkEnabled ? (
        <div className="absolute bottom-5 right-5 rounded-full border border-dashed bg-white px-4 py-3 text-xs text-slate-400 shadow-lg">
          Support launcher disabled
        </div>
      ) : null}
    </div>
  );
}

export function BkashGatewayPreview({ configuredFields }: { configuredFields: number }) {
  return (
    <div className="grid gap-5 rounded-2xl border bg-white p-5 text-slate-950 lg:grid-cols-[1fr_0.9fr]">
      <div className="rounded-2xl bg-gradient-to-br from-[#E2136E] to-[#9F0E4C] p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex size-11 items-center justify-center rounded-xl bg-white/15"><LockKeyhole className="size-5" /></div>
          <span className="rounded-full bg-white/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-wide">Server protected</span>
        </div>
        <h3 className="mt-8 text-2xl font-bold">bKash payment gateway</h3>
        <p className="mt-2 max-w-md text-sm leading-6 text-white/75">Credentials are stored securely and are never shown back inside the storefront or preview.</p>
        <div className="mt-6 flex items-center gap-2 text-xs font-semibold"><ShieldCheck className="size-4" /> Write-only configuration</div>
      </div>

      <div className="rounded-2xl border p-5">
        <div className="flex items-center justify-between">
          <div><p className="text-sm font-semibold">Configuration status</p><p className="text-xs text-slate-500">Current unsaved input status</p></div>
          <div className={cn("size-3 rounded-full", configuredFields === 4 ? "bg-emerald-500" : configuredFields > 0 ? "bg-amber-500" : "bg-slate-300")} />
        </div>
        <div className="mt-5 space-y-3">
          {['Application key', 'Application secret', 'Gateway username', 'Gateway password'].map((item, index) => (
            <div key={item} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
              <span className="text-xs text-slate-600">{item}</span>
              <span className={cn("rounded-full px-2 py-1 text-[10px] font-semibold", index < configuredFields ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-500")}>
                {index < configuredFields ? "Entered" : "Hidden / unchanged"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ThemeStorefrontPreview({
  label,
  description,
  swatches,
}: {
  label: string;
  description: string;
  swatches: readonly string[];
}) {
  const background = swatches[0] || "#ffffff";
  const primary = swatches[1] || "#111827";
  const surface = swatches[2] || "#f3f4f6";

  return (
    <div className="overflow-hidden rounded-2xl border text-slate-950" style={{ backgroundColor: background }}>
      <div className="flex items-center justify-between border-b border-black/10 px-5 py-4">
        <div className="text-lg font-black">{label.toUpperCase()} STORE</div>
        <div className="hidden items-center gap-5 text-xs sm:flex"><span>Collections</span><span>New arrivals</span><span>Sale</span></div>
        <ShoppingBag className="size-5" />
      </div>
      <div className="grid gap-5 p-5 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="flex min-h-72 flex-col justify-center rounded-2xl p-7" style={{ backgroundColor: surface }}>
          <span className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: primary }}>Global storefront theme</span>
          <h3 className="mt-3 max-w-xl text-4xl font-black leading-tight">A modern commerce experience in {label}</h3>
          <p className="mt-3 max-w-lg text-sm text-black/60">{description}</p>
          <div className="mt-6 w-fit rounded-full px-5 py-3 text-xs font-bold text-white" style={{ backgroundColor: primary }}>Shop collection</div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="rounded-xl border border-black/10 p-3">
              <div className="aspect-square rounded-lg" style={{ background: `linear-gradient(135deg, ${surface}, ${primary}35)` }} />
              <div className="mt-3 h-2.5 w-3/4 rounded bg-black/15" />
              <div className="mt-2 h-2.5 w-1/3 rounded" style={{ backgroundColor: `${primary}55` }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ThemeMiniPreview({ swatches }: { swatches: readonly string[] }) {
  const background = swatches[0] || "#ffffff";
  const primary = swatches[1] || "#111827";
  const surface = swatches[2] || "#f3f4f6";
  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-black/10" style={{ backgroundColor: background }}>
      <div className="flex items-center justify-between border-b border-black/10 px-3 py-2"><div className="h-2 w-12 rounded bg-black/20" /><div className="flex gap-1"><i className="size-2 rounded-full bg-black/15" /><i className="size-2 rounded-full bg-black/15" /></div></div>
      <div className="grid grid-cols-[1.2fr_0.8fr] gap-2 p-2">
        <div className="rounded-md p-2" style={{ backgroundColor: surface }}><div className="h-2 w-3/4 rounded bg-black/20" /><div className="mt-2 h-3 w-10 rounded" style={{ backgroundColor: primary }} /></div>
        <div className="grid grid-cols-2 gap-1">{[0, 1, 2, 3].map((item) => <i key={item} className="rounded-sm" style={{ backgroundColor: item % 2 ? surface : `${primary}30` }} />)}</div>
      </div>
    </div>
  );
}

export function ProductCardLayoutPreview({ variant }: { variant: ProductCardVariant }) {
  return (
    <div className="rounded-2xl border bg-surface-container-low/30 p-4 sm:p-6">
      <div className="mb-5 flex items-end justify-between gap-3">
        <div><p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Collection preview</p><h3 className="mt-1 text-2xl font-bold">Popular products</h3></div>
        <div className="rounded-full border px-4 py-2 text-xs">View all</div>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {['Everyday Cotton Set', 'Modern Carry Bag', 'Minimal Desk Lamp', 'Classic Runner'].map((title, index) => (
          <ProductCardPreview key={title} title={title} price={`$${[89, 64, 118, 72][index]}`} variant={variant} />
        ))}
      </div>
    </div>
  );
}

export function ProductDetailsLayoutPreview({ variant }: { variant: ProductDetailsVariant | string }) {
  const showcase = ["showcase", "storyline", "overview_split", "editorial"].includes(variant);
  const commerceFirst = ["streamlined", "buy_panel", "catalog", "spec_sheet", "media_rail", "retail_suite", "tech_focus"].includes(variant);
  const galleryFirst = ["immersive", "gallery_first", "showroom", "gallery_stack", "luxury"].includes(variant);
  const strong = ["brutalist", "nordic_verve"].includes(variant);

  if (showcase) {
    return <ProductDetailsFrame strong={strong}><div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]"><GalleryBlock large /><PurchaseBlock /></div><ContentRows /></ProductDetailsFrame>;
  }
  if (commerceFirst) {
    return <ProductDetailsFrame strong={strong}><div className="grid gap-5 lg:grid-cols-[0.82fr_1.18fr]"><PurchaseBlock /><div className="space-y-4"><GalleryBlock /><ContentRows compact /></div></div></ProductDetailsFrame>;
  }
  if (galleryFirst) {
    return <ProductDetailsFrame strong={strong}><div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]"><div className="space-y-3"><GalleryBlock large /><ThumbnailRow /></div><PurchaseBlock /></div><ContentRows /></ProductDetailsFrame>;
  }
  return <ProductDetailsFrame strong={strong}><div className="grid gap-5 lg:grid-cols-2"><GalleryBlock /><PurchaseBlock /></div><ContentRows /></ProductDetailsFrame>;
}

export function StorefrontAppearancePreview({
  themeLabel,
  themeDescription,
  swatches,
  productCardVariant,
  productDetailsVariant,
}: {
  themeLabel: string;
  themeDescription: string;
  swatches: readonly string[];
  productCardVariant: ProductCardVariant;
  productDetailsVariant: ProductDetailsVariant;
}) {
  return (
    <div className="space-y-6">
      <ThemeStorefrontPreview label={themeLabel} description={themeDescription} swatches={swatches} />
      <div className="grid gap-6 xl:grid-cols-2">
        <div><div className="mb-3 flex items-center gap-2"><ShoppingBag className="size-4 text-primary" /><h3 className="font-semibold">Product cards</h3></div><ProductCardLayoutPreview variant={productCardVariant} /></div>
        <div><div className="mb-3 flex items-center gap-2"><Globe2 className="size-4 text-primary" /><h3 className="font-semibold">Product details</h3></div><ProductDetailsLayoutPreview variant={productDetailsVariant} /></div>
      </div>
    </div>
  );
}

function ProductDetailsFrame({ children, strong = false }: { children: React.ReactNode; strong?: boolean }) {
  return <div className={cn("space-y-5 rounded-2xl border bg-background p-4 sm:p-6", strong && "border-2 border-foreground")}>{children}</div>;
}

function GalleryBlock({ large = false }: { large?: boolean }) {
  return <div className={cn("rounded-xl bg-gradient-to-br from-primary/10 via-surface-container to-primary/25", large ? "min-h-80" : "min-h-64")} />;
}

function ThumbnailRow() {
  return <div className="grid grid-cols-4 gap-2">{[0, 1, 2, 3].map((item) => <div key={item} className="aspect-square rounded-lg bg-surface-container" />)}</div>;
}

function PurchaseBlock() {
  return (
    <div className="rounded-xl border bg-card p-5">
      <div className="h-2.5 w-20 rounded bg-primary/25" />
      <div className="mt-4 h-7 w-4/5 rounded bg-foreground/20" />
      <div className="mt-3 h-5 w-24 rounded bg-primary/35" />
      <div className="mt-5 space-y-2"><div className="h-10 rounded-lg bg-surface-container" /><div className="h-10 rounded-lg bg-surface-container" /></div>
      <div className="mt-5 h-12 rounded-lg bg-primary" />
      <div className="mt-3 grid grid-cols-3 gap-2">{[0, 1, 2].map((item) => <div key={item} className="h-16 rounded-lg border" />)}</div>
    </div>
  );
}

function ContentRows({ compact = false }: { compact?: boolean }) {
  return <div className={cn("grid gap-3", compact ? "grid-cols-1" : "md:grid-cols-3")}>{[0, 1, 2].map((item) => <div key={item} className="rounded-xl bg-surface-container-low p-4"><div className="h-3 w-1/2 rounded bg-foreground/20" /><div className="mt-3 h-2 w-full rounded bg-foreground/10" /><div className="mt-2 h-2 w-3/4 rounded bg-foreground/10" /></div>)}</div>;
}

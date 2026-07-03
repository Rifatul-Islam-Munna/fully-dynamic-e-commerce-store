"use client";

import { useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Check, Globe2, Loader2, Plus, Save } from "lucide-react";
import { sileo } from "sileo";
import { getAdminSeoSettings, saveSeoSetting } from "@/actions/seo-actions";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { PageSeoSetting } from "@/lib/page-seo";
import { cn } from "@/lib/utils";

type SeoForm = {
  path: string;
  title: string;
  description: string;
  imageUrl: string;
  canonicalUrl: string;
  keywords: string;
  robotsIndex: boolean;
  robotsFollow: boolean;
  structuredData: string;
  gtmEnabled: boolean;
  gtmContainerId: string;
  isActive: boolean;
};

const EMPTY_FORM: SeoForm = {
  path: "*",
  title: "",
  description: "",
  imageUrl: "",
  canonicalUrl: "",
  keywords: "",
  robotsIndex: true,
  robotsFollow: true,
  structuredData: "",
  gtmEnabled: false,
  gtmContainerId: "",
  isActive: true,
};

function toForm(setting: PageSeoSetting): SeoForm {
  return {
    path: setting.path || "*",
    title: setting.title || "",
    description: setting.description || "",
    imageUrl: setting.imageUrl || "",
    canonicalUrl: setting.canonicalUrl || "",
    keywords: setting.keywords?.join(", ") || "",
    robotsIndex: setting.robotsIndex ?? true,
    robotsFollow: setting.robotsFollow ?? true,
    structuredData: setting.structuredData
      ? JSON.stringify(setting.structuredData, null, 2)
      : "",
    gtmEnabled: setting.gtmEnabled ?? false,
    gtmContainerId: setting.gtmContainerId || "",
    isActive: setting.isActive ?? true,
  };
}

export default function SeoSettingsPage() {
  const [items, setItems] = useState<PageSeoSetting[]>([]);
  const [form, setForm] = useState<SeoForm>(EMPTY_FORM);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    setLoading(true);
    const data = await getAdminSeoSettings();
    setItems(Array.isArray(data) ? data : []);
    setLoading(false);
  };

  useEffect(() => {
    void refresh();
  }, []);

  const saveMutation = useMutation({
    mutationFn: async () => {
      let structuredData: Record<string, unknown> | undefined;
      if (form.structuredData.trim()) {
        const parsed = JSON.parse(form.structuredData);
        if (!parsed || Array.isArray(parsed) || typeof parsed !== "object") {
          throw new Error("Structured data must be a JSON object.");
        }
        structuredData = parsed as Record<string, unknown>;
      }

      return saveSeoSetting({
        path: form.path.trim() || "*",
        title: form.title.trim(),
        description: form.description.trim(),
        imageUrl: form.imageUrl.trim(),
        canonicalUrl: form.canonicalUrl.trim(),
        keywords: form.keywords
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean),
        robotsIndex: form.robotsIndex,
        robotsFollow: form.robotsFollow,
        structuredData,
        gtmEnabled: form.gtmEnabled,
        gtmContainerId: form.gtmContainerId.trim() || undefined,
        isActive: form.isActive,
      });
    },
    onSuccess: async (result) => {
      const [data, error] = result as [unknown, { message?: string } | null];
      if (!data) {
        sileo.error({
          title: "Could not save",
          description: error?.message || "SEO settings were not saved.",
        });
        return;
      }
      sileo.success({
        title: "SEO settings saved",
        description: "Metadata and tracking rules are now available to the storefront.",
      });
      await refresh();
    },
    onError: (error) => {
      sileo.error({
        title: "Could not save",
        description: error instanceof Error ? error.message : "Please check the form.",
      });
    },
  });

  const update = <K extends keyof SeoForm>(key: K, value: SeoForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="commerce-eyebrow">Storefront discovery</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">SEO & tracking</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Configure server-rendered page metadata, social images, canonical URLs,
            robots rules, JSON-LD, and optional Google Tag Manager containers.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="rounded-sm"
          onClick={() => setForm({ ...EMPTY_FORM, path: "/" })}
        >
          <Plus className="size-4" /> New page
        </Button>
      </header>

      <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="commerce-panel h-fit">
          <div className="border-b border-border p-4">
            <p className="text-sm font-semibold">Configured paths</p>
            <p className="mt-1 text-xs text-muted-foreground">Use * for global fallback values.</p>
          </div>
          <div className="max-h-[620px] overflow-y-auto p-2">
            {loading ? (
              <div className="flex items-center justify-center py-12"><Loader2 className="size-5 animate-spin" /></div>
            ) : items.length === 0 ? (
              <p className="px-3 py-8 text-center text-sm text-muted-foreground">No SEO records yet.</p>
            ) : (
              items.map((item) => (
                <button
                  type="button"
                  key={item.id ?? item.path}
                  onClick={() => setForm(toForm(item))}
                  className={cn(
                    "commerce-interactive flex w-full items-center gap-3 border-l-2 px-3 py-3 text-left",
                    form.path === item.path
                      ? "border-primary bg-muted"
                      : "border-transparent hover:bg-muted/60",
                  )}
                >
                  <Globe2 className="size-4 shrink-0 text-muted-foreground" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{item.path === "*" ? "Global defaults" : item.path}</span>
                    <span className="block truncate text-xs text-muted-foreground">{item.title || "No custom title"}</span>
                  </span>
                  {item.isActive ? <Check className="size-4 text-primary" /> : null}
                </button>
              ))
            )}
          </div>
        </aside>

        <form
          className="commerce-panel space-y-8 p-5 sm:p-7"
          onSubmit={(event) => {
            event.preventDefault();
            saveMutation.mutate();
          }}
        >
          <section className="space-y-5">
            <div>
              <h2 className="text-lg font-semibold">Page identity</h2>
              <p className="text-sm text-muted-foreground">The exact storefront route this configuration controls.</p>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Page path" htmlFor="path" hint="Examples: /, /search, /shop/men, or * for defaults.">
                <Input id="path" value={form.path} onChange={(event) => update("path", event.target.value)} className="rounded-sm" />
              </Field>
              <Field label="Canonical URL" htmlFor="canonicalUrl" hint="Optional absolute preferred URL.">
                <Input id="canonicalUrl" value={form.canonicalUrl} onChange={(event) => update("canonicalUrl", event.target.value)} className="rounded-sm" />
              </Field>
            </div>
          </section>

          <section className="space-y-5 border-t border-border pt-7">
            <div>
              <h2 className="text-lg font-semibold">Search and social preview</h2>
              <p className="text-sm text-muted-foreground">Custom metadata overrides the global site values for this route.</p>
            </div>
            <Field label="SEO title" htmlFor="title" hint={`${form.title.length}/200 characters`}>
              <Input id="title" maxLength={200} value={form.title} onChange={(event) => update("title", event.target.value)} className="rounded-sm" />
            </Field>
            <Field label="Meta description" htmlFor="description" hint={`${form.description.length}/500 characters`}>
              <textarea
                id="description"
                maxLength={500}
                value={form.description}
                onChange={(event) => update("description", event.target.value)}
                className="min-h-28 w-full rounded-sm border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </Field>
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Social image URL" htmlFor="imageUrl" hint="Recommended 1200 × 630 pixels.">
                <Input id="imageUrl" value={form.imageUrl} onChange={(event) => update("imageUrl", event.target.value)} className="rounded-sm" />
              </Field>
              <Field label="Keywords" htmlFor="keywords" hint="Comma-separated; kept for compatible search engines.">
                <Input id="keywords" value={form.keywords} onChange={(event) => update("keywords", event.target.value)} className="rounded-sm" />
              </Field>
            </div>
          </section>

          <section className="space-y-5 border-t border-border pt-7">
            <div>
              <h2 className="text-lg font-semibold">Indexing and structured data</h2>
              <p className="text-sm text-muted-foreground">Control crawler access and add optional JSON-LD.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <Toggle label="Allow indexing" checked={form.robotsIndex} onChange={(value) => update("robotsIndex", value)} />
              <Toggle label="Allow link following" checked={form.robotsFollow} onChange={(value) => update("robotsFollow", value)} />
              <Toggle label="Configuration active" checked={form.isActive} onChange={(value) => update("isActive", value)} />
            </div>
            <Field label="JSON-LD structured data" htmlFor="structuredData" hint="Optional JSON object. Product pages keep their existing product schema.">
              <textarea
                id="structuredData"
                value={form.structuredData}
                onChange={(event) => update("structuredData", event.target.value)}
                spellCheck={false}
                className="min-h-40 w-full rounded-sm border border-input bg-muted/20 px-3 py-2 font-mono text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </Field>
          </section>

          <section className="space-y-5 border-t border-border pt-7">
            <div>
              <h2 className="text-lg font-semibold">Google Tag Manager</h2>
              <p className="text-sm text-muted-foreground">Optional and inactive until enabled. Page records can override the global container.</p>
            </div>
            <Toggle label="Enable GTM for this path" checked={form.gtmEnabled} onChange={(value) => update("gtmEnabled", value)} />
            <Field label="Container ID" htmlFor="gtmContainerId" hint="Format: GTM-XXXXXXX">
              <Input
                id="gtmContainerId"
                value={form.gtmContainerId}
                onChange={(event) => update("gtmContainerId", event.target.value.toUpperCase())}
                disabled={!form.gtmEnabled}
                className="rounded-sm font-mono"
              />
            </Field>
          </section>

          <div className="flex justify-end border-t border-border pt-6">
            <Button type="submit" className="h-11 rounded-sm px-6" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              Save SEO settings
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor={htmlFor}>{label}</Label>
        {hint ? <span className="text-[11px] text-muted-foreground">{hint}</span> : null}
      </div>
      {children}
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  const id = `toggle-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  return (
    <label htmlFor={id} className="commerce-interactive flex cursor-pointer items-center gap-3 border border-border bg-muted/20 p-3 text-sm font-medium hover:bg-muted/50">
      <Checkbox id={id} checked={checked} onCheckedChange={(value) => onChange(value === true)} />
      <span>{label}</span>
    </label>
  );
}

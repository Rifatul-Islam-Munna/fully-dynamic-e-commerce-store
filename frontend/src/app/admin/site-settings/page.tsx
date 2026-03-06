"use client";

import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import {
  getSiteSettings,
  updateSiteSettings,
  createSiteSettings,
} from "@/actions/admin-actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { Checkbox } from "@/components/ui/checkbox";

type SiteSettingsForm = {
  siteTitle: string;
  metaDescription: string;
  logoUrl: string;
  faviconUrl: string;
  ogImageUrl: string;
  noticeEnabled: boolean;
  noticeText: string;
};

const INITIAL: SiteSettingsForm = {
  siteTitle: "",
  metaDescription: "",
  logoUrl: "",
  faviconUrl: "",
  ogImageUrl: "",
  noticeEnabled: false,
  noticeText: "",
};

export default function SiteSettingsPage() {
  const [form, setForm] = useState<SiteSettingsForm>(INITIAL);
  const [loading, setLoading] = useState(true);
  const [exists, setExists] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await getSiteSettings();
        if (data) {
          setForm({
            siteTitle: data.siteTitle || "",
            metaDescription: data.metaDescription || "",
            logoUrl: data.logoUrl || "",
            faviconUrl: data.faviconUrl || "",
            ogImageUrl: data.ogImageUrl || "",
            noticeEnabled: data.noticeEnabled ?? false,
            noticeText: data.noticeText || "",
          });
          setExists(true);
        }
      } catch {
        // Settings don't exist yet
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (exists) {
        return updateSiteSettings(form);
      }
      return createSiteSettings(form);
    },
    onSuccess: (result) => {
      const [data, error] = result as [unknown, unknown];
      if (data) {
        toast.success("Site settings saved");
        setExists(true);
      } else {
        toast.error(
          (error as { message?: string })?.message || "Failed to save",
        );
      }
    },
    onError: () => toast.error("Failed to save site settings"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate();
  };

  const updateField = <K extends keyof SiteSettingsForm>(
    field: K,
    value: SiteSettingsForm[K],
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
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
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Site Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your website logo, favicon, title and SEO metadata
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-xl border border-border bg-card p-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="siteTitle">Site Title</Label>
            <Input
              id="siteTitle"
              placeholder="e.g. My Online Store"
              value={form.siteTitle}
              onChange={(e) => updateField("siteTitle", e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Displayed in browser tabs and SEO
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="metaDescription">Meta Description</Label>
            <Input
              id="metaDescription"
              placeholder="Brief description for search engines"
              value={form.metaDescription}
              onChange={(e) => updateField("metaDescription", e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Shows up in Google search results
            </p>
          </div>

          <div className="rounded-lg border border-border/70 bg-muted/20 p-3 space-y-3">
            <div className="flex items-center gap-2">
              <Checkbox
                id="noticeEnabled"
                checked={form.noticeEnabled}
                onCheckedChange={(checked) =>
                  updateField("noticeEnabled", checked === true)
                }
              />
              <Label htmlFor="noticeEnabled">Enable Top Notice</Label>
            </div>
            <Input
              id="noticeText"
              placeholder="e.g. Free shipping on orders over $99 this week"
              value={form.noticeText}
              onChange={(e) => updateField("noticeText", e.target.value)}
              disabled={!form.noticeEnabled}
            />
            <p className="text-xs text-muted-foreground">
              When enabled, this notice appears above the navbar on public pages
            </p>
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
            previewClassName="h-36 w-full object-cover rounded-md"
          />
        </div>

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

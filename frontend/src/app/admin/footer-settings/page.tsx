"use client";

import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { sileo } from "sileo";
import { Loader2, Save, Plus, Trash2 } from "lucide-react";
import {
  getFooterSettings,
  updateFooterSettings,
  createFooterSettings,
} from "@/actions/admin-actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ImageUploadField } from "@/components/admin/image-upload-field";

type SocialLink = { platform: string; url: string; imageUrl: string };
type FooterLink = { label: string; url: string; imageUrl: string };
type FooterSection = { title: string; links: FooterLink[] };

type FooterForm = {
  title: string;
  description: string;
  copyrightText: string;
  logoImageUrl: string;
  brandImageUrl: string;
  socialLinks: SocialLink[];
  sections: FooterSection[];
};

const INITIAL: FooterForm = {
  title: "",
  description: "",
  copyrightText: "",
  logoImageUrl: "",
  brandImageUrl: "",
  socialLinks: [],
  sections: [],
};

export default function FooterSettingsPage() {
  const [form, setForm] = useState<FooterForm>(INITIAL);
  const [loading, setLoading] = useState(true);
  const [exists, setExists] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await getFooterSettings();
        if (data) {
          setForm({
            title: data.title || "",
            description: data.description || "",
            copyrightText: data.copyrightText || "",
            logoImageUrl: data.logoImageUrl || "",
            brandImageUrl: data.brandImageUrl || "",
            socialLinks: (data.socialLinks || []).map((s) => ({
              platform: s.platform,
              url: s.url,
              imageUrl: s.imageUrl || "",
            })),
            sections: (data.sections || []).map((s) => ({
              title: s.title,
              links: s.links.map((l) => ({
                label: l.label,
                url: l.url,
                imageUrl: l.imageUrl || "",
              })),
            })),
          });
          setExists(true);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (exists) {
        return updateFooterSettings(form);
      }
      return createFooterSettings({ key: "default", ...form });
    },
    onSuccess: (result) => {
      const [data, error] = result as [unknown, unknown];
      if (data) {
        sileo.success({ title: "Success", description: "Footer settings saved" });
        setExists(true);
      } else {
        sileo.error({
          title: "Something went wrong",
          description: (error as { message?: string })?.message || "Failed to save",
        });
      }
    },
    onError: () => sileo.error({ title: "Something went wrong", description: "Failed to save" }),
  });

  const updateField = (field: keyof FooterForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // Social links
  const addSocialLink = () =>
    setForm((prev) => ({
      ...prev,
      socialLinks: [...prev.socialLinks, { platform: "", url: "", imageUrl: "" }],
    }));
  const removeSocialLink = (i: number) =>
    setForm((prev) => ({
      ...prev,
      socialLinks: prev.socialLinks.filter((_, j) => j !== i),
    }));
  const updateSocialLink = (
    i: number,
    field: keyof SocialLink,
    value: string,
  ) =>
    setForm((prev) => ({
      ...prev,
      socialLinks: prev.socialLinks.map((s, j) =>
        j === i ? { ...s, [field]: value } : s,
      ),
    }));

  // Sections
  const addSection = () =>
    setForm((prev) => ({
      ...prev,
      sections: [...prev.sections, { title: "", links: [] }],
    }));
  const removeSection = (i: number) =>
    setForm((prev) => ({
      ...prev,
      sections: prev.sections.filter((_, j) => j !== i),
    }));
  const updateSectionTitle = (i: number, title: string) =>
    setForm((prev) => ({
      ...prev,
      sections: prev.sections.map((s, j) => (j === i ? { ...s, title } : s)),
    }));
  const addLink = (sIdx: number) =>
    setForm((prev) => ({
      ...prev,
      sections: prev.sections.map((s, j) =>
        j === sIdx
          ? { ...s, links: [...s.links, { label: "", url: "", imageUrl: "" }] }
          : s,
      ),
    }));
  const removeLink = (sIdx: number, lIdx: number) =>
    setForm((prev) => ({
      ...prev,
      sections: prev.sections.map((s, j) =>
        j === sIdx ? { ...s, links: s.links.filter((_, k) => k !== lIdx) } : s,
      ),
    }));
  const updateLink = (
    sIdx: number,
    lIdx: number,
    field: keyof FooterLink,
    value: string,
  ) =>
    setForm((prev) => ({
      ...prev,
      sections: prev.sections.map((s, j) =>
        j === sIdx
          ? {
              ...s,
              links: s.links.map((l, k) =>
                k === lIdx ? { ...l, [field]: value } : l,
              ),
            }
          : s,
      ),
    }));

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
        <h1 className="text-2xl font-bold tracking-tight">Footer Settings</h1>
        <p className="text-sm text-muted-foreground">
          Configure footer content, social links, and sections
        </p>
      </div>

      {/* Basic Info */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-5">
        <h2 className="text-base font-semibold">General</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <Label className="text-xs">Footer Title</Label>
            <Input
              placeholder="e.g. My Store"
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Copyright Text</Label>
            <Input
              placeholder="© 2026 My Store"
              value={form.copyrightText}
              onChange={(e) => updateField("copyrightText", e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Description</Label>
          <Input
            placeholder="Short footer description"
            value={form.description}
            onChange={(e) => updateField("description", e.target.value)}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <ImageUploadField
            id="footer-logo-image"
            label="Logo Image URL"
            value={form.logoImageUrl}
            onChange={(value) => updateField("logoImageUrl", value)}
            hint="Recommended: around 4:1 ratio (e.g. 800x200) for footer logo usage."
            previewClassName="h-16 w-auto object-contain"
          />
          <ImageUploadField
            id="footer-brand-image"
            label="Brand Image URL"
            value={form.brandImageUrl}
            onChange={(value) => updateField("brandImageUrl", value)}
            hint="Recommended: 16:5 ratio (e.g. 1600x500) for wide footer brand artwork."
            previewClassName="h-16 w-full object-cover rounded-md"
          />
        </div>
      </div>

      {/* Social Links */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Social Links</h2>
          <Button variant="outline" size="sm" onClick={addSocialLink}>
            <Plus className="mr-1 size-3" /> Add
          </Button>
        </div>
        {form.socialLinks.map((social, i) => (
          <div key={i} className="rounded-lg border border-border/50 p-3 space-y-3">
            <Input
              placeholder="Platform (e.g. facebook)"
              value={social.platform}
              onChange={(e) => updateSocialLink(i, "platform", e.target.value)}
              className="max-w-[200px]"
            />
            <Input
              placeholder="URL"
              value={social.url}
              onChange={(e) => updateSocialLink(i, "url", e.target.value)}
            />
            <ImageUploadField
              id={`social-image-${i}`}
              label="Icon/Image URL"
              value={social.imageUrl}
              onChange={(value) => updateSocialLink(i, "imageUrl", value)}
              hint="Recommended: 1:1 ratio (e.g. 256x256) for social icons."
              previewClassName="h-16 w-16 object-contain"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeSocialLink(i)}
              className="text-destructive"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
        {form.socialLinks.length === 0 && (
          <p className="text-sm text-muted-foreground">No social links added</p>
        )}
      </div>

      {/* Footer Sections */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Footer Sections</h2>
          <Button variant="outline" size="sm" onClick={addSection}>
            <Plus className="mr-1 size-3" /> Add Section
          </Button>
        </div>
        {form.sections.map((section, sIdx) => (
          <div
            key={sIdx}
            className="rounded-lg border border-border/50 p-4 space-y-3"
          >
            <div className="flex items-center gap-3">
              <Input
                placeholder="Section title"
                value={section.title}
                onChange={(e) => updateSectionTitle(sIdx, e.target.value)}
                className="max-w-[250px]"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeSection(sIdx)}
                className="text-destructive ml-auto"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
            {section.links.map((link, lIdx) => (
              <div key={lIdx} className="ml-4 space-y-3 rounded-md border border-border/50 p-3">
                <Input
                  placeholder="Label"
                  value={link.label}
                  onChange={(e) =>
                    updateLink(sIdx, lIdx, "label", e.target.value)
                  }
                  className="max-w-[180px]"
                />
                <Input
                  placeholder="URL"
                  value={link.url}
                  onChange={(e) =>
                    updateLink(sIdx, lIdx, "url", e.target.value)
                  }
                />
                <ImageUploadField
                  id={`footer-link-image-${sIdx}-${lIdx}`}
                  label="Link Image URL"
                  value={link.imageUrl}
                  onChange={(value) =>
                    updateLink(sIdx, lIdx, "imageUrl", value)
                  }
                  hint="Recommended: 1:1 ratio (e.g. 256x256) for footer link icons."
                  previewClassName="h-16 w-16 object-contain"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeLink(sIdx, lIdx)}
                  className="text-destructive"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            ))}
            <div className="ml-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => addLink(sIdx)}
                className="text-xs text-muted-foreground"
              >
                <Plus className="mr-1 size-3" /> Add Link
              </Button>
            </div>
          </div>
        ))}
        {form.sections.length === 0 && (
          <p className="text-sm text-muted-foreground">No sections added</p>
        )}
      </div>

      <div className="flex justify-end">
        <Button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
        >
          {saveMutation.isPending ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 size-4" />
              Save Footer
            </>
          )}
        </Button>
      </div>
    </div>
  );
}





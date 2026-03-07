"use client";

import { useRef, useState } from "react";
import { Loader2, UploadCloud } from "lucide-react";
import { sileo } from "sileo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ImageUploadFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  uploadPath?: string;
  placeholder?: string;
  hint?: string;
  previewClassName?: string;
  showPreview?: boolean;
  disabled?: boolean;
};

export function ImageUploadField({
  id,
  label,
  value,
  onChange,
  uploadPath = "/api/admin/upload-image",
  placeholder = "https://...",
  hint,
  previewClassName = "h-24 w-full object-contain",
  showPreview = true,
  disabled = false,
}: ImageUploadFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(uploadPath, {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json().catch(() => null)) as
        | { url?: string; message?: string }
        | null;

      if (!response.ok || !payload?.url) {
        throw new Error(payload?.message || "Upload failed");
      }

      onChange(payload.url);
      sileo.success({ title: "Success", description: "Image uploaded" });
    } catch (error) {
      sileo.error({ title: "Something went wrong", description: error instanceof Error ? error.message : "Upload failed" });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex gap-2">
        <Input
          id={id}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={disabled || isUploading}
        />
        <Button
          type="button"
          variant="secondary"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isUploading}
        >
          {isUploading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <UploadCloud className="size-4" />
          )}
        </Button>
      </div>
      {hint ? (
        <p className="rounded-md bg-muted/30 px-3 py-2 text-xs leading-5 text-muted-foreground">
          {hint}
        </p>
      ) : null}
      {showPreview && value ? (
        <div className="rounded-lg border border-border/50 bg-muted/30 p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt={`${label} preview`} className={previewClassName} />
        </div>
      ) : null}
    </div>
  );
}




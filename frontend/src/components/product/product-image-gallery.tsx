"use client";

import { useMemo, useState } from "react";
import { Expand } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

type ProductImageGalleryProps = {
  images: string[];
  title: string;
};

export function ProductImageGallery({ images, title }: ProductImageGalleryProps) {
  const gallery = useMemo(
    () => images.filter((item, index, arr) => item && arr.indexOf(item) === index),
    [images],
  );
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  if (gallery.length === 0) {
    return null;
  }

  const selectedImage = gallery[selectedIndex] ?? gallery[0];

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="group relative block w-full overflow-hidden rounded-3xl bg-gradient-to-br from-muted/50 via-card to-muted/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        aria-label="Open image preview"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={selectedImage}
          alt={title}
          className="h-[58vh] min-h-[360px] w-full object-contain transition-transform duration-300 group-hover:scale-[1.01]"
        />
        <span className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-1 text-xs font-medium text-white">
          <Expand className="size-3.5" />
          View
        </span>
      </button>

      {gallery.length > 1 ? (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
          {gallery.map((imageUrl, index) => (
            <button
              key={`${imageUrl}-${index}`}
              type="button"
              onClick={() => setSelectedIndex(index)}
              className={cn(
                "overflow-hidden rounded-xl bg-card transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                selectedIndex === index
                  ? "ring-2 ring-primary/70"
                  : "opacity-85 hover:opacity-100",
              )}
              aria-label={`Preview image ${index + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt={`${title} ${index + 1}`}
                className="h-20 w-full object-cover sm:h-24"
              />
            </button>
          ))}
        </div>
      ) : null}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent
          className="max-w-[95vw] border-0 bg-black/95 p-2 sm:max-w-6xl sm:p-3"
          showCloseButton
        >
          <DialogTitle className="sr-only">{title} Image Preview</DialogTitle>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={selectedImage}
            alt={title}
            className="mx-auto max-h-[85vh] w-auto max-w-full rounded-md object-contain"
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

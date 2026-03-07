"use client";

import { MessageCircle } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

function normalizeLink(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : null;
}

export function SiteContactLauncher({
  whatsappLink,
  tawkToLink,
}: {
  whatsappLink?: string | null;
  tawkToLink?: string | null;
}) {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) {
    return null;
  }

  const normalizedWhatsappLink = normalizeLink(whatsappLink);
  const normalizedTawkLink = normalizeLink(tawkToLink);

  if (!normalizedWhatsappLink && !normalizedTawkLink) {
    return null;
  }

  const launcher = normalizedWhatsappLink
    ? {
        href: normalizedWhatsappLink,
        label: "WhatsApp",
        description: "Chat now",
        className:
          "border-emerald-500/25 bg-emerald-500 text-white shadow-[0_20px_45px_rgba(16,185,129,0.28)] hover:bg-emerald-600",
        haloClassName: "bg-emerald-500/18",
      }
    : {
        href: normalizedTawkLink as string,
        label: "Live Chat",
        description: "Open support",
        className:
          "border-sky-500/25 bg-sky-500 text-white shadow-[0_20px_45px_rgba(14,165,233,0.26)] hover:bg-sky-600",
        haloClassName: "bg-sky-500/18",
      };

  return (
    <a
      href={launcher.href}
      target="_blank"
      rel="noreferrer"
      aria-label={launcher.label}
      className="group fixed bottom-5 right-5 z-40"
    >
      <span
        className={cn(
          "absolute inset-0 rounded-full blur-xl transition-transform duration-300 group-hover:scale-110",
          launcher.haloClassName,
        )}
      />
      <span
        className={cn(
          "group relative flex items-center gap-3 rounded-full border px-4 py-3 transition-transform duration-300 hover:-translate-y-1",
          launcher.className,
        )}
      >
        <span className="flex size-10 items-center justify-center rounded-full bg-white/16">
          <MessageCircle className="size-5" />
        </span>
        <span className="hidden min-w-0 sm:block">
          <span className="block text-sm font-semibold leading-none">
            {launcher.label}
          </span>
          <span className="mt-1 block text-[11px] uppercase tracking-[0.18em] text-white/72">
            {launcher.description}
          </span>
        </span>
      </span>
    </a>
  );
}

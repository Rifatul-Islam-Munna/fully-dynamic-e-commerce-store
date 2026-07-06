"use client";

import { Plus } from "lucide-react";
import type { HomeSectionType } from "@/actions/admin-actions";
import { SECTION_TYPES } from "@/components/admin/home-settings-editor.constants";
import { Button } from "@/components/ui/button";

export function PageBuilderHeader({ onAdd }: { onAdd: (type: HomeSectionType) => void }) {
  return (
    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Home Settings</h1>
        <p className="mt-1 text-sm text-on-surface-variant">
          Build compact storefront pages with visual design previews.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {SECTION_TYPES.map((item) => (
          <Button key={item.value} type="button" variant="outline" onClick={() => onAdd(item.value)}>
            <Plus className="size-4" />
            {item.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

"use client";

import { useHomeSettingsEditor } from "@/components/admin/use-home-settings-editor";

export function PageBuilder() {
  const editor = useHomeSettingsEditor();

  if (editor.loading) {
    return <div className="p-8 text-center">Loading page builder...</div>;
  }

  return <div className="space-y-6">Page builder ready</div>;
}

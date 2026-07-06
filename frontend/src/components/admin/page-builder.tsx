"use client";

import { useHomeSettingsEditor } from "@/components/admin/use-home-settings-editor";

export function PageBuilder() {
  const editor = useHomeSettingsEditor();
  return <div>{editor.loading ? "Loading page builder..." : "Page builder ready"}</div>;
}

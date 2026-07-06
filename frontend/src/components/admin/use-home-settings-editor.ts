"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { sileo } from "sileo";
import {
  createHomeSettings,
  getHomeSettings,
  getNavbarSettings,
  updateHomeSettings,
  type HomeSectionType,
} from "@/actions/admin-actions";
import {
  createEmptySection,
  createEmptySlide,
  EMPTY_HOME_FORM,
  type HomeSettingsForm,
  type NavMainItem,
  type SectionForm,
  type SlideForm,
} from "@/components/admin/home-settings-editor.types";
import {
  mapHomeSection,
  normalizeHomeSectionPayload,
} from "@/components/admin/home-settings-editor.payload";

export function useHomeSettingsEditor() {
  const [form, setForm] = useState<HomeSettingsForm>(EMPTY_HOME_FORM);
  const [navItems, setNavItems] = useState<NavMainItem[]>([]);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [targetMainNav, setTargetMainNav] = useState("");
  const [targetSubNav, setTargetSubNav] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingTarget, setLoadingTarget] = useState(false);
  const [exists, setExists] = useState(false);
  const hydratedTarget = useRef(false);

  const subNavItems = useMemo(
    () => navItems.find((item) => item.url === targetMainNav)?.subNav || [],
    [navItems, targetMainNav],
  );

  const loadTarget = useCallback(async (mainNavUrl: string, subNavUrl: string) => {
    setLoadingTarget(true);
    try {
      const home = await getHomeSettings({
        mainNavUrl: mainNavUrl || undefined,
        subNavUrl: subNavUrl || undefined,
      });
      if (!home) {
        setForm(EMPTY_HOME_FORM);
        setExists(false);
        return;
      }
      setForm({
        theme: home.theme || "",
        sections: (home.sections || []).map(mapHomeSection),
      });
      setExists(
        (home.mainNavUrl?.trim() || "") === mainNavUrl.trim()
          && (home.subNavUrl?.trim() || "") === subNavUrl.trim(),
      );
    } catch {
      setForm(EMPTY_HOME_FORM);
      setExists(false);
    } finally {
      setCollapsed({});
      setLoadingTarget(false);
    }
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        const navbar = await getNavbarSettings();
        if (navbar && Array.isArray(navbar.mainNav)) {
          setNavItems(navbar.mainNav.map((item) => ({
            title: item.title || "",
            url: item.url || "",
            subNav: (item.subNav || []).map((sub) => ({
              title: sub.title || "",
              url: sub.url || "",
            })),
          })));
        }
      } finally {
        setLoading(false);
      }
    })();
    void loadTarget("", "");
  }, [loadTarget]);

  useEffect(() => {
    if (!hydratedTarget.current) {
      hydratedTarget.current = true;
      return;
    }
    void loadTarget(targetMainNav, targetSubNav);
  }, [loadTarget, targetMainNav, targetSubNav]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        theme: form.theme || undefined,
        sections: form.sections.map((section, index) =>
          normalizeHomeSectionPayload(section, index + 1),
        ),
        mainNavUrl: targetMainNav || undefined,
        subNavUrl: targetSubNav || undefined,
      };
      return exists
        ? updateHomeSettings(payload, {
            mainNavUrl: targetMainNav || undefined,
            subNavUrl: targetSubNav || undefined,
          })
        : createHomeSettings(payload);
    },
    onSuccess: (result) => {
      const [data, error] = result as [unknown, { message?: string } | null];
      if (!data) {
        sileo.error({
          title: "Could not save",
          description: error?.message || "Homepage settings were not saved.",
        });
        return;
      }
      setExists(true);
      sileo.success({
        title: "Saved",
        description: "Homepage design updated successfully.",
      });
    },
    onError: () => sileo.error({
      title: "Could not save",
      description: "Homepage settings were not saved.",
    }),
  });

  const updateSection = <K extends keyof SectionForm>(
    index: number,
    field: K,
    value: SectionForm[K],
  ) => setForm((current) => ({
    ...current,
    sections: current.sections.map((section, sectionIndex) =>
      sectionIndex === index ? { ...section, [field]: value } : section,
    ),
  }));

  const updateSlide = <K extends keyof SlideForm>(
    sectionIndex: number,
    slideIndex: number,
    field: K,
    value: SlideForm[K],
  ) => setForm((current) => ({
    ...current,
    sections: current.sections.map((section, index) => index === sectionIndex
      ? {
          ...section,
          slides: section.slides.map((slide, innerIndex) =>
            innerIndex === slideIndex ? { ...slide, [field]: value } : slide,
          ),
        }
      : section),
  }));

  const addSection = (type: HomeSectionType) => {
    const section = createEmptySection(type);
    setForm((current) => ({
      ...current,
      sections: [...current.sections, section],
    }));
    setCollapsed((current) => ({ ...current, [section.id]: false }));
  };

  return {
    form,
    setForm,
    navItems,
    subNavItems,
    collapsed,
    setCollapsed,
    targetMainNav,
    setTargetMainNav,
    targetSubNav,
    setTargetSubNav,
    loading,
    loadingTarget,
    saveMutation,
    updateSection,
    updateSlide,
    addSection,
    createEmptySlide,
  };
}

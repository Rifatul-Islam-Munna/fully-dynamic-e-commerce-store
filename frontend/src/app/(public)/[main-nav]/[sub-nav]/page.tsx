import { DynamicSectionsPage, resolveNavTargetFromSlug } from "@/components/home/dynamic-sections-page";

export default async function SubNavPage({
  params,
}: {
  params: Promise<{ "main-nav": string; "sub-nav": string }>;
}) {
  const resolvedParams = await params;
  const mainNavSlug = decodeURIComponent(resolvedParams["main-nav"]);
  const subNavSlug = decodeURIComponent(resolvedParams["sub-nav"]);

  const target = await resolveNavTargetFromSlug(mainNavSlug, subNavSlug);

  return (
    <DynamicSectionsPage
      mainNavUrl={target.mainNavUrl}
      subNavUrl={target.subNavUrl}
      emptyTitle={`${target.pageTitle} Page Not Configured`}
      emptyDescription={`Add sections from Admin -> Home Settings and target main nav: ${target.mainNavUrl}, sub nav: ${target.subNavUrl}.`}
    />
  );
}

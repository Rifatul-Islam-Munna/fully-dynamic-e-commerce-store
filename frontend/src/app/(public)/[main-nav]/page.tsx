import { DynamicSectionsPage, resolveNavTargetFromSlug } from "@/components/home/dynamic-sections-page";

export default async function MainNavPage({
  params,
}: {
  params: Promise<{ "main-nav": string }>;
}) {
  const resolvedParams = await params;
  const mainNavSlug = decodeURIComponent(resolvedParams["main-nav"]);

  const target = await resolveNavTargetFromSlug(mainNavSlug);

  return (
    <DynamicSectionsPage
      mainNavUrl={target.mainNavUrl}
      emptyTitle={`${target.pageTitle} Page Not Configured`}
      emptyDescription={`Add sections from Admin -> Home Settings and target main nav: ${target.mainNavUrl}.`}
    />
  );
}

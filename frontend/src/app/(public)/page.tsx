import { DynamicSectionsPage } from "@/components/home/dynamic-sections-page";

export default async function Home() {
  return (
    <DynamicSectionsPage
      emptyTitle="Homepage Not Configured"
      emptyDescription="Add sections from Admin -> Home Settings for the homepage target."
    />
  );
}

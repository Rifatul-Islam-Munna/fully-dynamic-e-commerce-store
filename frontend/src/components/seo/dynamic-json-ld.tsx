export function DynamicJsonLd({
  data,
}: {
  data?: Record<string, unknown> | null;
}) {
  if (!data) return null;

  const serialized = JSON.stringify(data).replace(/</g, "\\u003c");

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serialized }}
    />
  );
}

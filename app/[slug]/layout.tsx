export default function CmsSlugLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Bypass the root layout's max-w-7xl container so the CMS page controls its own width
  return <>{children}</>;
}

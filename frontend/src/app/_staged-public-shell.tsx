import { Navbar } from "@/components/navbar/navbar";
import { Footer } from "@/components/footer/footer";
import { SiteNoticeBar } from "@/components/site/site-notice-bar";

export default function PublicGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="storefront-root flex min-h-screen flex-col">
      <SiteNoticeBar />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

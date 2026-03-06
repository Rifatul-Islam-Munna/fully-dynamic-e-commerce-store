import { Suspense } from "react";
import { Navbar } from "@/components/navbar/navbar";
import { NavbarSkeleton } from "@/components/navbar/navbar-skeleton";
import { Footer } from "@/components/footer/footer";
import { FooterSkeleton } from "@/components/footer/footer-skeleton";
import { SiteNoticeBar } from "@/components/site/site-notice-bar";

export default function PublicGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Suspense fallback={null}>
        <SiteNoticeBar />
      </Suspense>
      <Suspense fallback={<NavbarSkeleton />}>
        <Navbar />
      </Suspense>
      {children}
      <Suspense fallback={<FooterSkeleton />}>
        <Footer />
      </Suspense>
    </>
  );
}

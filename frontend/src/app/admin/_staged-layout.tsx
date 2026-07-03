import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export const metadata: Metadata = {
  title: "Store Administration",
  description: "Manage catalogue, orders, customers, content, and storefront settings.",
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user")?.value;

  if (!userCookie) redirect("/login");

  try {
    const user = JSON.parse(userCookie);
    if (user.role !== "admin") redirect("/");
  } catch {
    redirect("/login");
  }

  return (
    <div className="admin-root min-h-screen bg-muted/20">
      <AdminSidebar />
      <main className="min-h-screen transition-[padding] lg:pl-72">
        <div className="mx-auto w-full max-w-[1480px] px-4 py-8 pt-20 sm:px-6 lg:px-10 lg:py-10">
          {children}
        </div>
      </main>
    </div>
  );
}

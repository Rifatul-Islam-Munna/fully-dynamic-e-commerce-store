import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Manage your store from the admin panel",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side role check
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("user")?.value;

  if (!userCookie) {
    redirect("/login");
  }

  try {
    const user = JSON.parse(userCookie);
    if (user.role !== "admin") {
      redirect("/");
    }
  } catch {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-surface">
      <AdminSidebar />
      <main className="min-h-screen transition-all lg:pl-64">
        <div className="mx-auto max-w-7xl px-4 py-8 pt-16 sm:px-6 lg:px-8 lg:pt-8">
          {children}
        </div>
      </main>
    </div>
  );
}

import { Users, Package, Settings, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/admin/stat-card";
import { getAdminUsers } from "@/actions/admin-actions";
import { getAdminProducts } from "@/actions/admin-actions";

export default async function AdminDashboardPage() {
  let totalUsers = 0;
  let totalProducts = 0;

  try {
    const usersData = await getAdminUsers(1, 1);
    totalUsers = usersData?.pagination?.total ?? 0;
  } catch {
    // ignore
  }

  try {
    const productsData = await getAdminProducts(1, 1);
    totalProducts = productsData?.pagination?.total ?? 0;
  } catch {
    // ignore
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Welcome back. Here&apos;s an overview of your store.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={totalUsers}
          description="Registered accounts"
          icon={Users}
        />
        <StatCard
          title="Total Products"
          value={totalProducts}
          description="Active listings"
          icon={Package}
        />
        <StatCard
          title="Site Settings"
          value="Active"
          description="Logo, favicon, metadata"
          icon={Settings}
        />
        <StatCard
          title="Status"
          value="Online"
          description="All systems running"
          icon={TrendingUp}
        />
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <QuickAction
            title="Manage Products"
            description="Add, edit, or remove products"
            href="/admin/products"
          />
          <QuickAction
            title="Manage Users"
            description="View and manage user accounts"
            href="/admin/users"
          />
          <QuickAction
            title="Site Settings"
            description="Update logo, favicon, and metadata"
            href="/admin/site-settings"
          />
          <QuickAction
            title="Home Settings"
            description="Manage hero slider and homepage section order"
            href="/admin/home-settings"
          />
          <QuickAction
            title="Navbar Settings"
            description="Configure navigation menu items"
            href="/admin/navbar-settings"
          />
          <QuickAction
            title="Footer Settings"
            description="Update footer content and links"
            href="/admin/footer-settings"
          />
        </div>
      </div>
    </div>
  );
}

function QuickAction({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="group flex flex-col gap-1 rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-md"
    >
      <p className="text-sm font-semibold text-card-foreground group-hover:text-primary transition-colors">
        {title}
      </p>
      <p className="text-xs text-muted-foreground">{description}</p>
    </a>
  );
}

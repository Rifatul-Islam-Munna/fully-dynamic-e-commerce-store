import { OrderHistoryList } from "@/components/profile/order-history-list";
import { getAccountDashboard } from "@/lib/account";

export default async function OrderHistoryPage() {
  const dashboard = await getAccountDashboard();
  const allOrders = [...dashboard.activeOrders, ...dashboard.recentOrders];

  // Deduplicate by order ID in case an order appears in both lists
  const seen = new Set<string>();
  const uniqueOrders = allOrders.filter((order) => {
    if (seen.has(order.id)) return false;
    seen.add(order.id);
    return true;
  });

  return <OrderHistoryList orders={uniqueOrders} />;
}

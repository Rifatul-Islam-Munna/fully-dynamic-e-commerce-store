"use client";

import { useCallback, useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  CheckCheck,
  Clock3,
  Loader2,
  PackageSearch,
  RefreshCcw,
  Search,
  ShoppingBag,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import {
  getAdminOrders,
  type AdminOrder,
  type AdminOrderMode,
  type AdminOrderStatus,
  updateAdminOrderStatus,
} from "@/actions/admin-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type OrderSummary = {
  totalOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  cancelledOrders: number;
  guestOrders: number;
  memberOrders: number;
  confirmedRevenue: number;
  confirmedUnits: number;
};

const FLAT_FIELD_STYLE = { boxShadow: "none" } as const;

function formatOrderDate(value: string) {
  return new Intl.DateTimeFormat("en-BD", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function getStatusMeta(status: AdminOrderStatus) {
  switch (status) {
    case "confirmed":
      return {
        label: "Confirmed",
        className:
          "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
      };
    case "cancelled":
      return {
        label: "Cancelled",
        className:
          "bg-rose-500/10 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
      };
    default:
      return {
        label: "Pending",
        className:
          "bg-amber-500/10 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
      };
  }
}

function getModeMeta(mode: AdminOrderMode) {
  return mode === "member"
    ? {
        label: "Member",
        className:
          "bg-primary/10 text-primary dark:bg-primary/15 dark:text-primary-foreground",
      }
    : {
        label: "Guest",
        className: "bg-muted text-muted-foreground",
      };
}

function SummaryTile({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  description: string;
  icon: typeof ShoppingBag;
}) {
  return (
    <div className="rounded-2xl border border-border/50 bg-card/90 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
            {title}
          </p>
          <p className="text-xl font-semibold tracking-tight text-foreground">
            {value}
          </p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <div className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="size-5" />
        </div>
      </div>
    </div>
  );
}

function OrderActionButtons({
  order,
  disabled,
  onUpdate,
}: {
  order: AdminOrder;
  disabled: boolean;
  onUpdate: (orderId: string, status: AdminOrderStatus) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {order.status === "pending" ? (
        <Button
          type="button"
          size="sm"
          className="h-9 rounded-full px-4"
          disabled={disabled}
          onClick={() => onUpdate(order.id, "confirmed")}
        >
          Confirm
        </Button>
      ) : null}

      {order.status !== "cancelled" ? (
        <Button
          type="button"
          size="sm"
          variant="destructive"
          className="h-9 rounded-full px-4"
          disabled={disabled}
          onClick={() => onUpdate(order.id, "cancelled")}
        >
          Cancel
        </Button>
      ) : null}
    </div>
  );
}

function OrderItemsPreview({ order }: { order: AdminOrder }) {
  return (
    <div className="space-y-2">
      {order.items.slice(0, 3).map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between gap-3 rounded-2xl bg-muted/35 px-3 py-2"
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">
              {item.productTitle}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {item.variantTitle || "Base item"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-foreground">x{item.quantity}</p>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(item.lineTotal)}
            </p>
          </div>
        </div>
      ))}
      {order.items.length > 3 ? (
        <p className="text-xs text-muted-foreground">
          +{order.items.length - 3} more items
        </p>
      ) : null}
    </div>
  );
}

export function OrderManagementPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [summary, setSummary] = useState<OrderSummary | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | AdminOrderStatus>("all");
  const [modeFilter, setModeFilter] = useState<"all" | AdminOrderMode>("all");

  const loadOrders = useCallback(
    async (
      nextPage: number,
      nextSearch: string,
      nextStatus: "all" | AdminOrderStatus,
      nextMode: "all" | AdminOrderMode,
      showRefreshLoader = false,
    ) => {
      if (!showRefreshLoader) {
        setLoading(true);
      }

      try {
        const response = await getAdminOrders(nextPage, 12, nextSearch, {
          status: nextStatus === "all" ? undefined : nextStatus,
          checkoutMode: nextMode === "all" ? undefined : nextMode,
        });

        setOrders(Array.isArray(response?.data) ? response.data : []);
        setPagination((response?.pagination as Pagination | undefined) ?? null);
        setSummary((response?.summary as OrderSummary | undefined) ?? null);
      } catch {
        toast.error("Failed to load orders");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    void loadOrders(page, search, statusFilter, modeFilter);
  }, [loadOrders, modeFilter, page, search, statusFilter]);

  const updateStatusMutation = useMutation({
    mutationFn: async (payload: { orderId: string; status: AdminOrderStatus }) =>
      updateAdminOrderStatus(payload),
    onSuccess: async (result) => {
      const [data, error] = result as [unknown, { message?: string } | null];
      if (!data) {
        toast.error(error?.message || "Failed to update order");
        return;
      }

      toast.success("Order updated");
      await loadOrders(page, search, statusFilter, modeFilter, true);
    },
    onError: () => toast.error("Failed to update order"),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Order Management</h1>
        <p className="text-sm text-muted-foreground">
          Confirm or cancel checkout orders. Sales and revenue analytics move only
          after an order is confirmed.
        </p>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryTile
          title="Total orders"
          value={summary?.totalOrders ?? 0}
          description="All captured checkout submissions"
          icon={ShoppingBag}
        />
        <SummaryTile
          title="Pending"
          value={summary?.pendingOrders ?? 0}
          description="Waiting for admin confirmation"
          icon={Clock3}
        />
        <SummaryTile
          title="Confirmed"
          value={summary?.confirmedOrders ?? 0}
          description={`${summary?.confirmedUnits ?? 0} confirmed units sold`}
          icon={CheckCheck}
        />
        <SummaryTile
          title="Confirmed revenue"
          value={formatCurrency(summary?.confirmedRevenue ?? 0)}
          description={`${summary?.memberOrders ?? 0} member / ${summary?.guestOrders ?? 0} guest`}
          icon={UserCheck}
        />
      </section>

      <section className="rounded-[28px] bg-muted/35 p-4">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setPage(1);
            setSearch(searchInput.trim());
          }}
          className="grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_repeat(2,minmax(0,0.6fr))_auto]"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search by order, phone, email, district, or address"
              className="h-11 rounded-2xl border-0 bg-background pl-9"
              style={FLAT_FIELD_STYLE}
            />
          </div>

          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value as "all" | AdminOrderStatus);
              setPage(1);
            }}
          >
            <SelectTrigger className="h-11 w-full rounded-2xl border-0 bg-background">
              <SelectValue placeholder="Order status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={modeFilter}
            onValueChange={(value) => {
              setModeFilter(value as "all" | AdminOrderMode);
              setPage(1);
            }}
          >
            <SelectTrigger className="h-11 w-full rounded-2xl border-0 bg-background">
              <SelectValue placeholder="Checkout mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All modes</SelectItem>
              <SelectItem value="member">Member</SelectItem>
              <SelectItem value="guest">Guest</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Button type="submit" variant="secondary" className="h-11 rounded-full px-5">
              Search
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-full bg-background px-4"
              onClick={() =>
                void loadOrders(page, search, statusFilter, modeFilter, true)
              }
            >
              <RefreshCcw className="size-4" />
            </Button>
          </div>
        </form>
      </section>

      <div className="space-y-3 lg:hidden">
        {loading ? (
          <div className="rounded-[28px] bg-muted/35 p-12 text-center text-muted-foreground">
            <Loader2 className="mx-auto size-5 animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-[28px] bg-muted/35 p-12 text-center text-muted-foreground">
            No orders found
          </div>
        ) : (
          orders.map((order) => {
            const statusMeta = getStatusMeta(order.status);
            const modeMeta = getModeMeta(order.checkoutMode);

            return (
              <article key={order.id} className="rounded-[28px] bg-muted/35 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {order.orderNumber}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatOrderDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={cn("border-0", statusMeta.className)}>
                      {statusMeta.label}
                    </Badge>
                    <Badge className={cn("border-0", modeMeta.className)}>
                      {modeMeta.label}
                    </Badge>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-background px-4 py-3">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                      Customer
                    </p>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {order.customerPhoneNumber}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {order.customerEmail || "No email"} • {order.customerDistrict}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {order.customerAddress}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-background px-4 py-3">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                      Amount
                    </p>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {formatCurrency(order.total)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {order.itemCount} items • subtotal {formatCurrency(order.subtotal)}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Coupon: {order.couponCode || "None"}
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <OrderItemsPreview order={order} />
                </div>

                <div className="mt-4">
                  <OrderActionButtons
                    order={order}
                    disabled={updateStatusMutation.isPending}
                    onUpdate={(orderId, status) =>
                      updateStatusMutation.mutate({ orderId, status })
                    }
                  />
                </div>
              </article>
            );
          })
        )}
      </div>

      <div className="hidden overflow-hidden rounded-[28px] bg-muted/35 lg:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1120px] text-sm">
            <thead>
              <tr className="border-b border-border/60 bg-background/70">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Order
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Customer
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Items
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Amount
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Status
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    <Loader2 className="mx-auto size-5 animate-spin" />
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                    No orders found
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const statusMeta = getStatusMeta(order.status);
                  const modeMeta = getModeMeta(order.checkoutMode);

                  return (
                    <tr
                      key={order.id}
                      className="border-b border-border/40 align-top transition-colors hover:bg-background/50"
                    >
                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          <p className="font-medium text-foreground">{order.orderNumber}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatOrderDate(order.createdAt)}
                          </p>
                          <Badge className={cn("mt-1 border-0", modeMeta.className)}>
                            {modeMeta.label}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="space-y-1 text-xs text-muted-foreground">
                          <p className="text-sm font-medium text-foreground">
                            {order.customerPhoneNumber}
                          </p>
                          <p>{order.customerEmail || "No email"}</p>
                          <p>{order.customerDistrict}</p>
                          <p className="max-w-[240px]">{order.customerAddress}</p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          {order.items.slice(0, 2).map((item) => (
                            <div key={item.id} className="text-xs text-muted-foreground">
                              <span className="font-medium text-foreground">
                                {item.productTitle}
                              </span>{" "}
                              x{item.quantity}
                              {item.variantTitle ? ` • ${item.variantTitle}` : ""}
                            </div>
                          ))}
                          {order.items.length > 2 ? (
                            <p className="text-xs text-muted-foreground">
                              +{order.items.length - 2} more items
                            </p>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          <p className="font-medium text-foreground">
                            {formatCurrency(order.total)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {order.itemCount} items • subtotal {formatCurrency(order.subtotal)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Coupon: {order.couponCode || "None"}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <Badge className={cn("border-0", statusMeta.className)}>
                          {statusMeta.label}
                        </Badge>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex justify-end">
                          <OrderActionButtons
                            order={order}
                            disabled={updateStatusMutation.isPending}
                            onUpdate={(orderId, status) =>
                              updateStatusMutation.mutate({ orderId, status })
                            }
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {pagination && pagination.totalPages > 1 ? (
          <div className="flex items-center justify-between border-t border-border/50 px-4 py-4">
            <p className="text-sm text-muted-foreground">
              Page {pagination.page} of {pagination.totalPages} • {pagination.total} orders
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                className="rounded-full px-4"
                disabled={page <= 1}
                onClick={() => setPage((current) => current - 1)}
              >
                Previous
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="rounded-full px-4"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((current) => current + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      {!loading && orders.length === 0 ? (
        <div className="hidden rounded-[28px] bg-muted/35 p-12 text-center text-muted-foreground lg:block">
          <PackageSearch className="mx-auto mb-3 size-5" />
          No orders matched the current filters.
        </div>
      ) : null}

      {!loading && pagination && pagination.totalPages > 1 ? (
        <div className="flex items-center justify-between rounded-[28px] bg-muted/35 px-4 py-4 lg:hidden">
          <p className="text-sm text-muted-foreground">
            {pagination.page}/{pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              className="rounded-full px-4"
              disabled={page <= 1}
              onClick={() => setPage((current) => current - 1)}
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="rounded-full px-4"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((current) => current + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

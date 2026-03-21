"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Pencil, Search, TicketPercent } from "lucide-react";
import { sileo } from "sileo";
import {
  createCoupon,
  getAdminCoupons,
  updateCoupon,
} from "@/actions/admin-actions";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/currency";

type CouponType = "percentage" | "value";

type CouponRow = {
  id: string;
  code: string;
  type: CouponType;
  amount: number;
  minOrderTotal: number | null;
  usageLimit: number | null;
  usedCount: number;
  expiresAt: string | null;
  note: string | null;
  isActive: boolean;
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type CouponForm = {
  couponId: string | null;
  code: string;
  type: CouponType;
  amount: string;
  minOrderTotal: string;
  usageLimit: string;
  expiresAt: string;
  note: string;
  isActive: boolean;
};

const EMPTY_FORM: CouponForm = {
  couponId: null,
  code: "",
  type: "percentage",
  amount: "",
  minOrderTotal: "",
  usageLimit: "",
  expiresAt: "",
  note: "",
  isActive: true,
};

const FLAT_FIELD_STYLE = { boxShadow: "none" } as const;

const toStringValue = (value: unknown) =>
  typeof value === "string" ? value : value === null || value === undefined ? "" : String(value);

const toNumberValue = (value: unknown) =>
  typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;

const toNullableNumber = (value: unknown) => {
  const parsed = toNumberValue(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const toBooleanValue = (value: unknown, fallback = false) =>
  typeof value === "boolean" ? value : fallback;

function mapCouponRow(raw: Record<string, unknown>): CouponRow {
  return {
    id: toStringValue(raw.id),
    code: toStringValue(raw.code),
    type: toStringValue(raw.type) === "value" ? "value" : "percentage",
    amount: toNumberValue(raw.amount),
    minOrderTotal: toNullableNumber(raw.minOrderTotal),
    usageLimit: toNullableNumber(raw.usageLimit),
    usedCount: Number(toNumberValue(raw.usedCount) || 0),
    expiresAt: toStringValue(raw.expiresAt) || null,
    note: toStringValue(raw.note) || null,
    isActive: toBooleanValue(raw.isActive, true),
  };
}

function toDatetimeLocalValue(value: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const pad = (input: number) => String(input).padStart(2, "0");

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}

function formatCouponValue(coupon: CouponRow) {
  return coupon.type === "percentage"
    ? `${coupon.amount}%`
    : formatCurrency(coupon.amount);
}

function buildPayload(form: CouponForm) {
  const code = form.code.trim().toUpperCase();
  const amount = Number(form.amount);
  const minOrderTotal = form.minOrderTotal.trim()
    ? Number(form.minOrderTotal)
    : null;
  const usageLimit = form.usageLimit.trim() ? Number(form.usageLimit) : null;

  if (!code) {
    throw new Error("Coupon code is required");
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Coupon amount must be greater than zero");
  }

  if (form.type === "percentage" && amount > 100) {
    throw new Error("Percentage coupon cannot be greater than 100");
  }

  if (
    minOrderTotal !== null &&
    (!Number.isFinite(minOrderTotal) || minOrderTotal < 0)
  ) {
    throw new Error("Minimum order total must be zero or greater");
  }

  if (
    usageLimit !== null &&
    (!Number.isInteger(usageLimit) || usageLimit < 1)
  ) {
    throw new Error("Usage limit must be a whole number greater than zero");
  }

  return {
    ...(form.couponId ? { couponId: form.couponId } : {}),
    code,
    type: form.type,
    amount,
    minOrderTotal,
    usageLimit,
    expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
    note: form.note.trim() || null,
    isActive: form.isActive,
  };
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<CouponRow[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [form, setForm] = useState<CouponForm>(EMPTY_FORM);

  const loadCoupons = useCallback(async (nextPage: number, nextSearch: string) => {
    setLoading(true);
    try {
      const response = await getAdminCoupons(nextPage, 12, nextSearch);
      const rows = Array.isArray(response?.data) ? response.data : [];
      setCoupons(rows.map((item) => mapCouponRow(item as Record<string, unknown>)));
      setPagination((response?.pagination as Pagination | undefined) ?? null);
    } catch {
      sileo.error({ title: "Something went wrong", description: "Failed to load coupons" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCoupons(page, search);
  }, [loadCoupons, page, search]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = buildPayload(form);
      return form.couponId ? updateCoupon(payload) : createCoupon(payload);
    },
    onSuccess: async (result) => {
      const [data, error] = result as [unknown, { message?: string } | null];
      if (!data) {
        sileo.error({ title: "Something went wrong", description: error?.message || "Failed to save coupon" });
        return;
      }

      sileo.success({ title: "Success", description: form.couponId ? "Coupon updated" : "Coupon created" });
      setForm(EMPTY_FORM);
      await loadCoupons(page, search);
    },
    onError: (error) => {
      sileo.error({ title: "Something went wrong", description: error instanceof Error ? error.message : "Failed to save coupon" });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: (coupon: CouponRow) =>
      updateCoupon({
        couponId: coupon.id,
        isActive: !coupon.isActive,
      }),
    onSuccess: async (result) => {
      const [data, error] = result as [unknown, { message?: string } | null];
      if (!data) {
        sileo.error({ title: "Something went wrong", description: error?.message || "Failed to update coupon" });
        return;
      }

      sileo.success({ title: "Success", description: "Coupon status updated" });
      await loadCoupons(page, search);
    },
    onError: () => sileo.error({ title: "Something went wrong", description: "Failed to update coupon" }),
  });

  const editingLabel = useMemo(
    () => (form.couponId ? `Editing ${form.code || "coupon"}` : "Create coupon"),
    [form.code, form.couponId],
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Coupons</h1>
        <p className="text-sm text-on-surface-variant">
          Create percentage or value coupons and control whether checkout accepts them.
        </p>
      </div>

      <div className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
        <section className="rounded-[28px] bg-surface-container-low/35 p-5">
          <div className="flex items-center gap-2 text-sm font-medium text-on-surface">
            <TicketPercent className="size-4" />
            {editingLabel}
          </div>

          <div className="mt-5 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="coupon-code">Coupon code</Label>
              <Input
                id="coupon-code"
                value={form.code}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    code: event.target.value.toUpperCase(),
                  }))
                }
                placeholder="EID10"
                className="h-11 rounded-2xl border-0 bg-surface"
                style={FLAT_FIELD_STYLE}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
              <div className="space-y-2">
                <Label>Coupon type</Label>
                <Select
                  value={form.type}
                  onValueChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      type: value as CouponType,
                    }))
                  }
                >
                  <SelectTrigger className="h-11 w-full rounded-2xl border-0 bg-surface">
                    <SelectValue placeholder="Choose type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="value">Value</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="coupon-amount">Amount</Label>
                <Input
                  id="coupon-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.amount}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      amount: event.target.value,
                    }))
                  }
                  placeholder={form.type === "percentage" ? "10" : "500"}
                  className="h-11 rounded-2xl border-0 bg-surface"
                  style={FLAT_FIELD_STYLE}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
              <div className="space-y-2">
                <Label htmlFor="coupon-min-order">Minimum order</Label>
                <Input
                  id="coupon-min-order"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.minOrderTotal}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      minOrderTotal: event.target.value,
                    }))
                  }
                  placeholder="Optional"
                  className="h-11 rounded-2xl border-0 bg-surface"
                  style={FLAT_FIELD_STYLE}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="coupon-limit">Usage limit</Label>
                <Input
                  id="coupon-limit"
                  type="number"
                  min="1"
                  step="1"
                  value={form.usageLimit}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      usageLimit: event.target.value,
                    }))
                  }
                  placeholder="Optional"
                  className="h-11 rounded-2xl border-0 bg-surface"
                  style={FLAT_FIELD_STYLE}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="coupon-expires">Expires at</Label>
              <Input
                id="coupon-expires"
                type="datetime-local"
                value={form.expiresAt}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    expiresAt: event.target.value,
                  }))
                }
                className="h-11 rounded-2xl border-0 bg-surface"
                style={FLAT_FIELD_STYLE}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="coupon-note">Admin note</Label>
              <Input
                id="coupon-note"
                value={form.note}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    note: event.target.value,
                  }))
                }
                placeholder="Optional note"
                className="h-11 rounded-2xl border-0 bg-surface"
                style={FLAT_FIELD_STYLE}
              />
            </div>

            <label className="flex items-center gap-3 rounded-2xl bg-surface px-4 py-3">
              <Checkbox
                checked={form.isActive}
                onCheckedChange={(checked) =>
                  setForm((current) => ({
                    ...current,
                    isActive: checked === true,
                  }))
                }
              />
              <span className="text-sm text-on-surface">Coupon is active</span>
            </label>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                type="button"
                className="h-11 rounded-full px-5"
                disabled={saveMutation.isPending}
                onClick={() => saveMutation.mutate()}
              >
                {saveMutation.isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : null}
                {form.couponId ? "Update coupon" : "Create coupon"}
              </Button>
              {form.couponId ? (
                <Button
                  type="button"
                  variant="secondary"
                  className="h-11 rounded-full px-5"
                  onClick={() => setForm(EMPTY_FORM)}
                >
                  Cancel edit
                </Button>
              ) : null}
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="rounded-[28px] bg-surface-container-low/35 p-4">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                setPage(1);
                setSearch(searchInput.trim());
              }}
              className="flex flex-col gap-2 sm:flex-row"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
                <Input
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Search coupon code"
                  className="h-11 rounded-2xl border-0 bg-surface pl-9"
                  style={FLAT_FIELD_STYLE}
                />
              </div>
              <Button type="submit" variant="secondary" className="h-11 rounded-full px-5">
                Search
              </Button>
            </form>
          </div>

          <div className="overflow-hidden rounded-[28px] bg-surface-container-low/35">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/60 bg-surface/70">
                    <th className="px-4 py-3 text-left font-medium text-on-surface-variant">
                      Code
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-on-surface-variant">
                      Discount
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-on-surface-variant">
                      Rules
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-on-surface-variant">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right font-medium text-on-surface-variant">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center text-on-surface-variant">
                        <Loader2 className="mx-auto size-5 animate-spin" />
                      </td>
                    </tr>
                  ) : coupons.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center text-on-surface-variant">
                        No coupons found
                      </td>
                    </tr>
                  ) : (
                    coupons.map((coupon) => (
                      <tr
                        key={coupon.id}
                        className="border-b border-border/40 transition-colors hover:bg-surface/50"
                      >
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-on-surface">{coupon.code}</p>
                            {coupon.note ? (
                              <p className="text-xs text-on-surface-variant">{coupon.note}</p>
                            ) : null}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium text-on-surface">
                            {formatCouponValue(coupon)}
                          </p>
                          <p className="text-xs text-on-surface-variant">
                            {coupon.type === "percentage" ? "Percentage" : "Value"}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-xs text-on-surface-variant">
                          <p>
                            Min:{" "}
                            {coupon.minOrderTotal !== null
                              ? formatCurrency(coupon.minOrderTotal)
                              : "None"}
                          </p>
                          <p>
                            Uses: {coupon.usedCount}
                            {coupon.usageLimit !== null ? ` / ${coupon.usageLimit}` : ""}
                          </p>
                          <p>
                            Expires:{" "}
                            {coupon.expiresAt
                              ? new Date(coupon.expiresAt).toLocaleString()
                              : "No expiry"}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                              coupon.isActive
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            }`}
                          >
                            {coupon.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <Button
                              type="button"
                              variant="secondary"
                              size="sm"
                              className="rounded-full"
                              onClick={() =>
                                setForm({
                                  couponId: coupon.id,
                                  code: coupon.code,
                                  type: coupon.type,
                                  amount: String(coupon.amount),
                                  minOrderTotal:
                                    coupon.minOrderTotal !== null
                                      ? String(coupon.minOrderTotal)
                                      : "",
                                  usageLimit:
                                    coupon.usageLimit !== null
                                      ? String(coupon.usageLimit)
                                      : "",
                                  expiresAt: toDatetimeLocalValue(coupon.expiresAt),
                                  note: coupon.note ?? "",
                                  isActive: coupon.isActive,
                                })
                              }
                            >
                              <Pencil className="size-4" />
                              Edit
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="rounded-full bg-surface"
                              disabled={toggleMutation.isPending}
                              onClick={() => toggleMutation.mutate(coupon)}
                            >
                              {coupon.isActive ? "Disable" : "Enable"}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {pagination && pagination.totalPages > 1 ? (
              <div className="flex flex-col gap-3 border-t border-border/50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-on-surface-variant">
                  Page {pagination.page} of {pagination.totalPages}
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
        </section>
      </div>
    </div>
  );
}





"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { sileo } from "sileo";
import { Loader2, Pencil, Plus, Search, Trash2 } from "lucide-react";
import {
  deleteProduct,
  getAdminProducts,
  getNavbarSettings,
  updateProduct,
} from "@/actions/admin-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ProductRow = {
  id: string;
  title: string;
  slug: string;
  price: string;
  productKind: string;
  isActive: boolean;
  thumbnailUrl: string;
  mainNavUrl: string;
  subNavUrl: string;
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type NavMainItem = {
  title: string;
  url: string;
  subNav: Array<{ title: string; url: string }>;
};

const toStringValue = (value: unknown) =>
  typeof value === "string" ? value : value === null || value === undefined ? "" : String(value);

const toBool = (value: unknown, fallback = false) =>
  typeof value === "boolean" ? value : fallback;

const toNumberString = (value: unknown) =>
  typeof value === "number" ? String(value) : typeof value === "string" ? value : "";

const formatPrice = (value: string) => {
  const n = Number(value);
  return Number.isFinite(n) ? `BDT ${n.toLocaleString()}` : value || "-";
};

const mapProductRow = (raw: Record<string, unknown>): ProductRow => ({
  id: toStringValue(raw.id),
  title: toStringValue(raw.title),
  slug: toStringValue(raw.slug),
  price: toNumberString(raw.price),
  productKind: toStringValue(raw.productKind),
  isActive: toBool(raw.isActive, true),
  thumbnailUrl: toStringValue(raw.thumbnailUrl),
  mainNavUrl: toStringValue(raw.mainNavUrl),
  subNavUrl: toStringValue(raw.subNavUrl),
});

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [mainNavFilter, setMainNavFilter] = useState("");
  const [subNavFilter, setSubNavFilter] = useState("");

  const [navItems, setNavItems] = useState<NavMainItem[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const response = await getNavbarSettings();
        const nextItems =
          response && Array.isArray(response.mainNav)
            ? response.mainNav.map((main) => ({
                title: toStringValue(main.title),
                url: toStringValue(main.url),
                subNav: Array.isArray(main.subNav)
                  ? main.subNav.map((sub) => ({
                      title: toStringValue(sub.title),
                      url: toStringValue(sub.url),
                    }))
                  : [],
              }))
            : [];
        setNavItems(nextItems);
      } catch {
        sileo.error({ title: "Something went wrong", description: "Failed to load navbar filters" });
      }
    })();
  }, []);

  const selectedMainNav = useMemo(
    () => navItems.find((item) => item.url === mainNavFilter) ?? null,
    [mainNavFilter, navItems],
  );

  const loadProducts = useCallback(
    async (nextPage: number, nextSearch: string, nextMainNav: string, nextSubNav: string) => {
      setLoading(true);
      try {
        const response = await getAdminProducts(nextPage, 10, nextSearch, {
          mainNavUrl: nextMainNav || undefined,
          subNavUrl: nextSubNav || undefined,
        });
        const rows = Array.isArray(response?.data) ? response.data : [];
        setProducts(rows.map((item) => mapProductRow(item as Record<string, unknown>)));
        setPagination((response?.pagination as Pagination | undefined) ?? null);
      } catch {
        sileo.error({ title: "Something went wrong", description: "Failed to load products" });
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    void loadProducts(page, search, mainNavFilter, subNavFilter);
  }, [loadProducts, page, search, mainNavFilter, subNavFilter]);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: (result) => {
      const [data, error] = result as [unknown, { message?: string } | null];
      if (!data) {
        sileo.error({ title: "Something went wrong", description: error?.message || "Failed to delete product" });
        return;
      }
      sileo.success({ title: "Success", description: "Product deleted" });
      void loadProducts(page, search, mainNavFilter, subNavFilter);
    },
    onError: () => sileo.error({ title: "Something went wrong", description: "Failed to delete product" }),
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (payload: { productId: string; isActive: boolean }) =>
      updateProduct(payload),
    onSuccess: (result) => {
      const [data, error] = result as [unknown, { message?: string } | null];
      if (!data) {
        sileo.error({ title: "Something went wrong", description: error?.message || "Failed to update status" });
        return;
      }
      sileo.success({ title: "Success", description: "Product status updated" });
      void loadProducts(page, search, mainNavFilter, subNavFilter);
    },
    onError: () => sileo.error({ title: "Something went wrong", description: "Failed to update status" }),
  });

  const onSearch = (event: React.FormEvent) => {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Products</h1>
          <p className="text-sm text-on-surface-variant">
            Manage product list and jump to dedicated create/edit pages.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus className="mr-2 size-4" />
            Add Product
          </Link>
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-surface-container-lowest p-4 space-y-3">
        <form onSubmit={onSearch} className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant" />
            <Input
              placeholder="Search products..."
              className="pl-9"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
            />
          </div>
          <Button type="submit" variant="secondary">
            Search
          </Button>
        </form>

        <div className="grid gap-2 sm:grid-cols-2">
          <select
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
            value={mainNavFilter}
            onChange={(event) => {
              setMainNavFilter(event.target.value);
              setSubNavFilter("");
              setPage(1);
            }}
          >
            <option value="">All main navs</option>
            {navItems.map((item) => (
              <option key={item.url} value={item.url}>
                {item.title} ({item.url})
              </option>
            ))}
          </select>

          <select
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
            value={subNavFilter}
            onChange={(event) => {
              setSubNavFilter(event.target.value);
              setPage(1);
            }}
            disabled={!selectedMainNav || selectedMainNav.subNav.length === 0}
          >
            <option value="">All sub navs</option>
            {(selectedMainNav?.subNav ?? []).map((sub) => (
              <option key={sub.url} value={sub.url}>
                {sub.title} ({sub.url})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-surface-container-lowest">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-container/50">
                <th className="px-4 py-3 text-left font-medium text-on-surface-variant">
                  Product
                </th>
                <th className="px-4 py-3 text-left font-medium text-on-surface-variant">
                  Price
                </th>
                <th className="px-4 py-3 text-left font-medium text-on-surface-variant">
                  Nav
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
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-on-surface-variant">
                    No products found
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-border/50 transition-colors hover:bg-surface-container-low"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {product.thumbnailUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={product.thumbnailUrl}
                            alt={product.title}
                            className="size-10 rounded-md object-cover"
                          />
                        ) : (
                          <div className="size-10 rounded-md bg-surface-container" />
                        )}
                        <div>
                          <p className="font-medium">{product.title || "-"}</p>
                          <p className="text-xs text-on-surface-variant">{product.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">{formatPrice(product.price)}</td>
                    <td className="px-4 py-3">
                      <p className="text-xs text-on-surface-variant">
                        Main: {product.mainNavUrl || "-"}
                      </p>
                      <p className="text-xs text-on-surface-variant">
                        Sub: {product.subNavUrl || "-"}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col items-start gap-2">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            product.isActive
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                          }`}
                        >
                          {product.isActive ? "Active" : "Inactive"}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-7 px-2 text-[11px]"
                          disabled={toggleStatusMutation.isPending}
                          onClick={() =>
                            toggleStatusMutation.mutate({
                              productId: product.id,
                              isActive: !product.isActive,
                            })
                          }
                        >
                          {product.isActive ? "Deactivate" : "Activate"}
                        </Button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/admin/products/${product.id}/edit`}>
                            <Pencil className="size-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteMutation.mutate(product.id)}
                          disabled={deleteMutation.isPending}
                          className="text-error hover:text-error"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {pagination && pagination.totalPages > 1 ? (
        <div className="flex items-center justify-between">
          <p className="text-sm text-on-surface-variant">
            Page {pagination.page} of {pagination.totalPages} | {pagination.total} total
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}





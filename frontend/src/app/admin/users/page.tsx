"use client";

import { useCallback, useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { sileo } from "sileo";
import { Search, Trash2, Loader2, Shield, ShieldCheck } from "lucide-react";
import { getAdminUsers, updateUser, deleteUser } from "@/actions/admin-actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type User = Record<string, unknown>;
type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);

  const loadUsers = useCallback(async (p: number, s: string) => {
    setLoading(true);
    try {
      const data = await getAdminUsers(p, 10, s);
      setUsers(data?.data ?? []);
      setPagination(data?.pagination ?? null);
    } catch {
      sileo.error({ title: "Something went wrong", description: "Failed to load users" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers(page, search);
  }, [loadUsers, page, search]);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: (result) => {
      const [data, error] = result as [unknown, { message?: string } | null];
      if (!data) {
        sileo.error({ title: "Something went wrong", description: error?.message || "Failed to delete user" });
        return;
      }
      sileo.success({ title: "Success", description: "User deleted" });
      loadUsers(page, search);
    },
    onError: () => sileo.error({ title: "Something went wrong", description: "Failed to delete user" }),
  });

  const toggleRoleMutation = useMutation({
    mutationFn: (user: User) =>
      updateUser({
        userId: user.id,
        role: user.role === "admin" ? "customer" : "admin",
      }),
    onSuccess: (result) => {
      const [data, error] = result as [unknown, { message?: string } | null];
      if (!data) {
        sileo.error({ title: "Something went wrong", description: error?.message || "Failed to update role" });
        return;
      }
      sileo.success({ title: "Success", description: "User role updated" });
      loadUsers(page, search);
    },
    onError: () => sileo.error({ title: "Something went wrong", description: "Failed to update role" }),
  });

  const toggleStatusMutation = useMutation({
    mutationFn: (user: User) =>
      updateUser({
        userId: user.id,
        status: user.status === "active" ? "blocked" : "active",
      }),
    onSuccess: (result) => {
      const [data, error] = result as [unknown, { message?: string } | null];
      if (!data) {
        sileo.error({ title: "Something went wrong", description: error?.message || "Failed to update status" });
        return;
      }
      sileo.success({ title: "Success", description: "User status updated" });
      loadUsers(page, search);
    },
    onError: () => sileo.error({ title: "Something went wrong", description: "Failed to update status" }),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Users</h1>
          <p className="text-sm text-muted-foreground">
            Manage user accounts and roles
          </p>
        </div>
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              className="pl-9 w-64"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <Button type="submit" variant="secondary" size="sm">
            Search
          </Button>
        </form>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Name
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Email
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Phone
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Role
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
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-muted-foreground"
                  >
                    <Loader2 className="mx-auto size-5 animate-spin" />
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-muted-foreground"
                  >
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id as string}
                    className="border-b border-border/50 transition-colors hover:bg-muted/30"
                  >
                    <td className="px-4 py-3 font-medium">
                      {user.firstName as string} {user.lastName as string}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {user.email as string}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {(user.phoneNumber as string) || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleRoleMutation.mutate(user)}
                        disabled={toggleRoleMutation.isPending}
                        className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors hover:opacity-80"
                        style={{
                          backgroundColor:
                            user.role === "admin"
                              ? "oklch(0.47 0.12 195 / 0.15)"
                              : "oklch(0.5 0.02 220 / 0.15)",
                          color:
                            user.role === "admin"
                              ? "oklch(0.47 0.12 195)"
                              : "oklch(0.5 0.02 220)",
                        }}
                      >
                        {user.role === "admin" ? (
                          <ShieldCheck className="size-3" />
                        ) : (
                          <Shield className="size-3" />
                        )}
                        {user.role as string}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleStatusMutation.mutate(user)}
                        disabled={toggleStatusMutation.isPending}
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors hover:opacity-80 ${
                          user.status === "active"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                        }`}
                      >
                        {user.status as string}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteMutation.mutate(user.id as string)}
                        disabled={deleteMutation.isPending}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages} ·{" "}
            {pagination.total} total
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
      )}
    </div>
  );
}





"use client";

import { useQuery } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "../../../convex/_generated/api";
import { Link as LinkIcon, ShoppingBag, ShoppingCart } from "lucide-react";

export default function AdminDashboardPage() {
  const { user: clerkUser } = useUser();
  const convexUser = useQuery(
    api.users.getByClerkId,
    clerkUser?.id ? { clerkId: clerkUser.id } : "skip"
  );
  const links = useQuery(
    api.links.getByUserId,
    convexUser?._id ? { userId: convexUser._id } : "skip"
  );
  const products = useQuery(
    api.products.getByUserId,
    convexUser?._id ? { userId: convexUser._id } : "skip"
  );
  const orders = useQuery(
    api.orders.getByUserId,
    convexUser?._id ? { userId: convexUser._id } : "skip"
  );

  if (!convexUser || links === undefined || products === undefined || orders === undefined) {
    return (
      <div className="flex items-center justify-center py-24">
        <span className="text-sm text-muted-foreground">読み込み中...</span>
      </div>
    );
  }

  const stats = [
    {
      label: "リンク",
      value: links.length,
      icon: LinkIcon,
      href: "/admin/links",
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "商品",
      value: products.length,
      icon: ShoppingBag,
      href: "/admin/products",
      color: "bg-violet-50 text-violet-600",
    },
    {
      label: "注文",
      value: orders.length,
      icon: ShoppingCart,
      href: "/admin/analytics",
      color: "bg-emerald-50 text-emerald-600",
    },
  ];

  const displayName = convexUser.name || clerkUser?.emailAddresses[0]?.emailAddress || "ユーザー";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">ダッシュボード</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          おかえりなさい、{displayName} さん
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <a
              key={stat.label}
              href={stat.href}
              className="group rounded-xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </p>
                  <p className="mt-1 text-3xl font-bold tabular-nums">
                    {stat.value}
                  </p>
                </div>
                <div className={`rounded-lg p-2.5 ${stat.color}`}>
                  <Icon className="size-5" />
                </div>
              </div>
            </a>
          );
        })}
      </div>

      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-base font-semibold">クイックアクション</h2>
        <div className="flex flex-wrap gap-3">
          <a
            href="/admin/links"
            className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
          >
            <LinkIcon className="size-4" />
            リンクを管理
          </a>
          <a
            href="/admin/products"
            className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
          >
            <ShoppingBag className="size-4" />
            商品を管理
          </a>
          <a
            href="/admin/profile"
            className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
          >
            プロフィールを編集
          </a>
        </div>
      </div>
    </div>
  );
}

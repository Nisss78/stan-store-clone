import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  User,
  Link as LinkIcon,
  ShoppingBag,
  BarChart2,
  BotMessageSquare,
  Menu,
  Receipt,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/admin", label: "ダッシュボード", icon: LayoutDashboard },
  { href: "/admin/profile", label: "プロフィール", icon: User },
  { href: "/admin/links", label: "リンク", icon: LinkIcon },
  { href: "/admin/products", label: "商品", icon: ShoppingBag },
  { href: "/admin/orders", label: "注文履歴", icon: Receipt },
  { href: "/admin/analytics", label: "アナリティクス", icon: BarChart2 },
  { href: "/admin/ai", label: "AIアシスタント", icon: BotMessageSquare },
];

function SidebarNav() {
  return (
    <nav className="flex flex-col gap-1 p-4">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Icon className="size-4 shrink-0" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden w-56 shrink-0 border-r lg:flex lg:flex-col">
        <div className="flex h-14 items-center border-b px-4">
          <span className="text-base font-semibold tracking-tight">
            Stan Store
          </span>
        </div>
        <div className="flex-1 overflow-y-auto">
          <SidebarNav />
        </div>
        <div className="border-t p-4">
          <p className="truncate text-xs text-muted-foreground">
            {user.emailAddresses[0]?.emailAddress}
          </p>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="flex h-14 items-center gap-3 border-b px-4 lg:hidden">
          <Sheet>
            <SheetTrigger render={<Button variant="ghost" size="icon" />}>
              <Menu className="size-5" />
              <span className="sr-only">メニューを開く</span>
            </SheetTrigger>
            <SheetContent side="left" className="w-56 p-0">
              <SheetHeader className="border-b px-4 py-3.5">
                <SheetTitle className="text-base">Stan Store</SheetTitle>
              </SheetHeader>
              <SidebarNav />
            </SheetContent>
          </Sheet>
          <span className="text-base font-semibold">Stan Store</span>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}

"use client";

import Image from "next/image";
import { CheckoutModal } from "@/components/checkout-modal";
import { getTheme } from "@/lib/themes";
import { cn } from "@/lib/utils";
import {
  ExternalLink,
  Globe,
  Instagram,
  Twitter,
  Youtube,
} from "lucide-react";

type SerializedUser = {
  id: string;
  username: string;
  name: string | null;
  bio: string | null;
  avatarUrl: string | null;
  themeColor: string | null;
  themeName: string | null;
  productLayout: string | null;
  twitterUrl: string | null;
  instagramUrl: string | null;
  youtubeUrl: string | null;
  tiktokUrl: string | null;
  websiteUrl: string | null;
};

type SerializedLink = {
  id: string;
  title: string;
  url: string;
  order: number;
  icon: string | null;
  iconUrl: string | null;
  isActive: boolean;
};

type SerializedProduct = {
  id: string;
  title: string;
  description: string | null;
  price: number;
  currency: string;
  thumbnailUrl: string | null;
  fileUrl: string | null;
  isActive: boolean;
};

type Props = {
  user: SerializedUser;
  links: SerializedLink[];
  products: SerializedProduct[];
};

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" />
    </svg>
  );
}

function formatPrice(price: number, currency: string): string {
  try {
    return new Intl.NumberFormat("ja-JP", {
      style: "currency",
      currency: currency || "JPY",
      minimumFractionDigits: 0,
    }).format(price);
  } catch {
    return `¥${price.toLocaleString("ja-JP")}`;
  }
}

function getInitials(name: string | null, username: string): string {
  if (name) {
    return name
      .split(/\s+/)
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
  return username.slice(0, 2).toUpperCase();
}

async function trackLinkClick(linkId: string, userId: string) {
  try {
    await fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        eventType: "link_click",
        metadata: { linkId },
      }),
    });
  } catch {
    // Analytics should never block UX.
  }
}

// Standard Layout
function StandardProductCard({ product, isDark, username }: { product: SerializedProduct; isDark: boolean; username: string }) {
  return (
    <div
      className={cn(
        "group overflow-hidden rounded-xl border bg-card transition-all hover:shadow-lg",
        isDark ? "bg-slate-800 border-slate-700" : "bg-white"
      )}
    >
      {product.thumbnailUrl && (
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
          <Image
            src={product.thumbnailUrl}
            alt={product.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, 50vw"
          />
        </div>
      )}
      <div className="p-4">
        <h3 className="font-semibold line-clamp-2 text-base">{product.title}</h3>
        {product.description && (
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{product.description}</p>
        )}
        <div className="mt-3">
          <span className="text-lg font-bold text-primary">{formatPrice(product.price, product.currency)}</span>
        </div>
        <div className="mt-3">
          <CheckoutModal product={{ id: product.id, title: product.title, price: product.price, description: product.description ?? undefined, thumbnailUrl: product.thumbnailUrl ?? undefined }} username={username} />
        </div>
      </div>
    </div>
  );
}

// Compact Layout
function CompactProductCard({ product, isDark, username }: { product: SerializedProduct; isDark: boolean; username: string }) {
  return (
    <div
      className={cn(
        "flex gap-4 overflow-hidden rounded-xl border bg-card transition-all hover:shadow-md p-4",
        isDark ? "bg-slate-800 border-slate-700" : "bg-white"
      )}
    >
      {product.thumbnailUrl && (
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-muted">
          <Image src={product.thumbnailUrl} alt={product.title} fill className="object-cover" sizes="96px" />
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div>
          <h3 className="font-semibold line-clamp-1">{product.title}</h3>
          {product.description && <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{product.description}</p>}
        </div>
        <div className="flex items-center justify-between gap-2 mt-2">
          <span className="font-bold text-primary">{formatPrice(product.price, product.currency)}</span>
          <CheckoutModal product={{ id: product.id, title: product.title, price: product.price, description: product.description ?? undefined, thumbnailUrl: product.thumbnailUrl ?? undefined }} username={username} />
        </div>
      </div>
    </div>
  );
}

// Minimal Layout
function MinimalProductCard({ product, isDark, username }: { product: SerializedProduct; isDark: boolean; username: string }) {
  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-xl border bg-card transition-all hover:shadow-md p-4",
        isDark ? "bg-slate-800 border-slate-700" : "bg-white"
      )}
    >
      <h3 className="font-semibold line-clamp-1">{product.title}</h3>
      {product.description && <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{product.description}</p>}
      <div className="mt-3 flex items-center justify-between">
        <span className="text-lg font-bold text-primary">{formatPrice(product.price, product.currency)}</span>
        <CheckoutModal product={{ id: product.id, title: product.title, price: product.price, description: product.description ?? undefined, thumbnailUrl: product.thumbnailUrl ?? undefined }} username={username} />
      </div>
    </div>
  );
}

// Featured Layout
function FeaturedProductCard({ product, isDark, username }: { product: SerializedProduct; isDark: boolean; username: string }) {
  return (
    <div
      className={cn(
        "group overflow-hidden rounded-2xl border bg-card transition-all hover:shadow-xl col-span-full",
        isDark ? "bg-slate-800 border-slate-700" : "bg-white"
      )}
    >
      {product.thumbnailUrl && (
        <div className="relative aspect-video w-full overflow-hidden bg-muted">
          <Image src={product.thumbnailUrl} alt={product.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <h3 className="text-xl font-bold line-clamp-1">{product.title}</h3>
            {product.description && <p className="mt-1 text-sm text-white/80 line-clamp-2">{product.description}</p>}
          </div>
        </div>
      )}
      {!product.thumbnailUrl && (
        <div className="p-6">
          <h3 className="text-xl font-bold">{product.title}</h3>
          {product.description && <p className="mt-2 text-muted-foreground">{product.description}</p>}
        </div>
      )}
      <div className="flex items-center justify-between p-4 border-t border-inherit">
        <span className="text-xl font-bold text-primary">{formatPrice(product.price, product.currency)}</span>
        <CheckoutModal product={{ id: product.id, title: product.title, price: product.price, description: product.description ?? undefined, thumbnailUrl: product.thumbnailUrl ?? undefined }} username={username} />
      </div>
    </div>
  );
}

export default function StorefrontClient({ user, links, products }: Props) {
  const theme = getTheme(user.themeName);
  const isDark = user.themeName === "dark";
  const layout = user.productLayout || "standard";

  const socialLinks = [
    { key: "twitter", url: user.twitterUrl, Icon: Twitter, label: "Twitter / X" },
    { key: "instagram", url: user.instagramUrl, Icon: Instagram, label: "Instagram" },
    { key: "youtube", url: user.youtubeUrl, Icon: Youtube, label: "YouTube" },
    { key: "tiktok", url: user.tiktokUrl, Icon: TikTokIcon, label: "TikTok" },
    { key: "website", url: user.websiteUrl, Icon: Globe, label: "ウェブサイト" },
  ].filter((item) => item.url);

  return (
    <div className={cn("min-h-screen", theme.bgColor, theme.textColor)}>
      <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
        {/* プロフィール */}
        <section className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4">
            {user.avatarUrl ? (
              <div className="relative h-20 w-20 sm:h-24 sm:w-24 overflow-hidden rounded-full ring-2 ring-white/50">
                <Image src={user.avatarUrl} alt={user.name ?? user.username} fill className="object-cover" sizes="(max-width: 640px) 80px, 96px" />
              </div>
            ) : (
              <div className={cn("flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full bg-gradient-to-br text-xl sm:text-2xl font-bold text-white", theme.gradientFrom, theme.gradientTo)}>
                {getInitials(user.name, user.username)}
              </div>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-bold">{user.name ?? user.username}</h1>
          <p className="text-sm text-muted-foreground">@{user.username}</p>
          {user.bio && <p className="mt-3 max-w-md text-sm text-muted-foreground">{user.bio}</p>}
          {socialLinks.length > 0 && (
            <div className="mt-4 flex gap-2">
              {socialLinks.map(({ key, url, Icon, label }) => (
                <a key={key} href={url ?? undefined} target="_blank" rel="noopener noreferrer" aria-label={label} className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground hover:text-foreground transition-colors">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          )}
        </section>

        {/* 商品 */}
        {products.length > 0 && (
          <section className="mb-8">
            <div className={cn("grid gap-4", layout === "featured" ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2")}>
              {products.map((product) => {
                if (layout === "compact") return <CompactProductCard key={product.id} product={product} isDark={isDark} username={user.username} />;
                if (layout === "minimal") return <MinimalProductCard key={product.id} product={product} isDark={isDark} username={user.username} />;
                if (layout === "featured") return <FeaturedProductCard key={product.id} product={product} isDark={isDark} username={user.username} />;
                return <StandardProductCard key={product.id} product={product} isDark={isDark} username={user.username} />;
              })}
            </div>
          </section>
        )}

        {/* リンク */}
        {links.length > 0 && (
          <section className="mb-8">
            <div className="flex flex-col gap-2">
              {links.map((link) => (
                <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" onClick={() => trackLinkClick(link.id, user.id)} className={cn("flex items-center justify-between rounded-lg border bg-card px-4 py-3 transition-colors hover:bg-accent", isDark ? "bg-slate-800 border-slate-700 hover:bg-slate-700" : "bg-white")}>
                  <div className="flex items-center gap-3">
                    {link.iconUrl ? (
                      <div className="h-6 w-6 overflow-hidden rounded">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={link.iconUrl} alt="" className="h-full w-full object-cover" />
                      </div>
                    ) : link.icon ? (
                      <span className="text-lg">{link.icon}</span>
                    ) : null}
                    <span className="font-medium text-sm">{link.title}</span>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                </a>
              ))}
            </div>
          </section>
        )}

        {/* フッター */}
        <footer className="text-center text-xs text-muted-foreground">
          <p>Powered by Stan Store Clone</p>
        </footer>
      </div>
    </div>
  );
}

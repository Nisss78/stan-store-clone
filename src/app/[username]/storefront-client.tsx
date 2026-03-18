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
  Sparkles,
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
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.76a4.85 4.85 0 0 1-1.01-.07z" />
    </svg>
  );
}

function formatPrice(price: number, currency: string): string {
  try {
    return new Intl.NumberFormat("ja-JP", { style: "currency", currency: currency || "JPY", minimumFractionDigits: 0 }).format(price);
  } catch {
    return `¥${price.toLocaleString("ja-JP")}`;
  }
}

function getInitials(name: string | null, username: string): string {
  if (name) return name.split(/\s+/).map((part) => part[0]).join("").toUpperCase().slice(0, 2);
  return username.slice(0, 2).toUpperCase();
}

async function trackLinkClick(linkId: string, userId: string) {
  try {
    await fetch("/api/analytics", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId, eventType: "link_click", metadata: { linkId } }) });
  } catch {}
}

function getCardClasses(theme: ReturnType<typeof getTheme>) {
  const styleMap = {
    flat: "",
    elevated: "shadow-lg hover:shadow-xl transition-shadow",
    bordered: "",
    glass: "backdrop-blur-xl",
  };
  return cn("rounded-2xl overflow-hidden", theme.cardBg, theme.cardBorder, styleMap[theme.cardStyle]);
}

// Compact Layout
function CompactProductCard({ product, theme, username }: { product: SerializedProduct; theme: ReturnType<typeof getTheme>; username: string }) {
  return (
    <div className={cn(getCardClasses(theme), "flex gap-4 p-4")}>
      {product.thumbnailUrl && (
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl">
          <Image src={product.thumbnailUrl} alt={product.title} fill className="object-cover" sizes="96px" />
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div>
          <h3 className="font-semibold line-clamp-1">{product.title}</h3>
          {product.description && <p className="mt-0.5 text-sm opacity-70 line-clamp-1">{product.description}</p>}
        </div>
        <div className="flex items-center justify-between gap-2 mt-2">
          <span className="font-bold text-lg">{formatPrice(product.price, product.currency)}</span>
          <CheckoutModal product={{ id: product.id, title: product.title, price: product.price, description: product.description ?? undefined, thumbnailUrl: product.thumbnailUrl ?? undefined }} username={username} />
        </div>
      </div>
    </div>
  );
}

// Minimal Layout
function MinimalProductCard({ product, theme, username }: { product: SerializedProduct; theme: ReturnType<typeof getTheme>; username: string }) {
  return (
    <div className={cn(getCardClasses(theme), "flex flex-col p-4")}>
      <h3 className="font-semibold line-clamp-1">{product.title}</h3>
      {product.description && <p className="mt-1 text-sm opacity-70 line-clamp-2">{product.description}</p>}
      <div className="mt-3 flex items-center justify-between">
        <span className="text-lg font-bold">{formatPrice(product.price, product.currency)}</span>
        <CheckoutModal product={{ id: product.id, title: product.title, price: product.price, description: product.description ?? undefined, thumbnailUrl: product.thumbnailUrl ?? undefined }} username={username} />
      </div>
    </div>
  );
}

// Featured Layout
function FeaturedProductCard({ product, theme, username }: { product: SerializedProduct; theme: ReturnType<typeof getTheme>; username: string }) {
  return (
    <div className={cn(getCardClasses(theme), "col-span-full overflow-hidden")}>
      {product.thumbnailUrl && (
        <div className="relative aspect-video w-full overflow-hidden">
          <Image src={product.thumbnailUrl} alt={product.title} fill className="object-cover transition-transform duration-500 hover:scale-105" sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <h3 className="text-xl font-bold line-clamp-1">{product.title}</h3>
            {product.description && <p className="mt-1 text-sm text-white/80 line-clamp-2">{product.description}</p>}
          </div>
        </div>
      )}
      {!product.thumbnailUrl && (
        <div className="p-6">
          <h3 className="text-xl font-bold">{product.title}</h3>
          {product.description && <p className="mt-2 opacity-70">{product.description}</p>}
        </div>
      )}
      <div className="flex items-center justify-between p-4 border-t border-inherit">
        <span className="text-xl font-bold">{formatPrice(product.price, product.currency)}</span>
        <CheckoutModal product={{ id: product.id, title: product.title, price: product.price, description: product.description ?? undefined, thumbnailUrl: product.thumbnailUrl ?? undefined }} username={username} />
      </div>
    </div>
  );
}

export default function StorefrontClient({ user, links, products }: Props) {
  const theme = getTheme(user.themeName);
  const layout = user.productLayout || "compact";

  const socialLinks = [
    { key: "twitter", url: user.twitterUrl, Icon: Twitter, label: "Twitter / X" },
    { key: "instagram", url: user.instagramUrl, Icon: Instagram, label: "Instagram" },
    { key: "youtube", url: user.youtubeUrl, Icon: Youtube, label: "YouTube" },
    { key: "tiktok", url: user.tiktokUrl, Icon: TikTokIcon, label: "TikTok" },
    { key: "website", url: user.websiteUrl, Icon: Globe, label: "ウェブサイト" },
  ].filter((item) => item.url);

  return (
    <div className={cn("min-h-screen", theme.bgColor, theme.textColor, theme.fontFamily)}>
      {/* Decorative elements for creative themes */}
      {theme.category === "creative" && (
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        </div>
      )}

      <div className="relative mx-auto max-w-2xl px-4 py-8 sm:py-12">
        {/* Profile Section */}
        <section className="mb-10 flex flex-col items-center text-center">
          {/* Avatar */}
          <div className="mb-5 relative">
            {user.avatarUrl ? (
              <div className="relative h-24 w-24 sm:h-28 sm:w-28 overflow-hidden rounded-full ring-4 ring-white/30 shadow-xl">
                <Image src={user.avatarUrl} alt={user.name ?? user.username} fill className="object-cover" sizes="(max-width: 640px) 96px, 112px" />
              </div>
            ) : (
              <div className={cn("flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-full text-2xl sm:text-3xl font-bold text-white shadow-xl bg-gradient-to-br", theme.gradientFrom, theme.gradientTo)}>
                {getInitials(user.name, user.username)}
              </div>
            )}
            {theme.name === "luxury" && (
              <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full p-1.5">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
            )}
          </div>

          {/* Name & Username */}
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{user.name ?? user.username}</h1>
          <p className="text-sm opacity-60 mt-1">@{user.username}</p>

          {/* Bio */}
          {user.bio && (
            <p className="mt-4 max-w-md text-sm sm:text-base leading-relaxed opacity-80">
              {user.bio}
            </p>
          )}

          {/* Social Links */}
          {socialLinks.length > 0 && (
            <div className="mt-5 flex gap-2 flex-wrap justify-center">
              {socialLinks.map(({ key, url, Icon, label }) => (
                <a
                  key={key}
                  href={url ?? undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full transition-all hover:scale-110",
                    theme.cardStyle === "glass" ? "bg-white/20 backdrop-blur hover:bg-white/30" : "bg-black/5 hover:bg-black/10"
                  )}
                >
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          )}
        </section>

        {/* Products Section */}
        {products.length > 0 && (
          <section className="mb-10">
            <div className={cn("grid gap-4", layout === "featured" ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2")}>
              {products.map((product) => {
                if (layout === "minimal") return <MinimalProductCard key={product.id} product={product} theme={theme} username={user.username} />;
                if (layout === "featured") return <FeaturedProductCard key={product.id} product={product} theme={theme} username={user.username} />;
                return <CompactProductCard key={product.id} product={product} theme={theme} username={user.username} />;
              })}
            </div>
          </section>
        )}

        {/* Links Section */}
        {links.length > 0 && (
          <section className="mb-10">
            <div className="flex flex-col gap-3">
              {links.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackLinkClick(link.id, user.id)}
                  className={cn(
                    getCardClasses(theme),
                    "flex items-center justify-between px-5 py-4 transition-all hover:scale-[1.01] active:scale-[0.99]",
                  )}
                >
                  <div className="flex items-center gap-3">
                    {link.iconUrl ? (
                      <div className="h-6 w-6 overflow-hidden rounded-lg">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={link.iconUrl} alt="" className="h-full w-full object-cover" />
                      </div>
                    ) : link.icon ? (
                      <span className="text-xl">{link.icon}</span>
                    ) : null}
                    <span className="font-medium">{link.title}</span>
                  </div>
                  <ExternalLink className="h-4 w-4 opacity-50" />
                </a>
              ))}
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="text-center text-xs opacity-40 pt-8">
          <p>Powered by Stan Store Clone</p>
        </footer>
      </div>
    </div>
  );
}

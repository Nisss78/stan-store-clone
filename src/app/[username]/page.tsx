import { notFound } from "next/navigation";
import { getConvexClient } from "@/lib/convex";
import { api } from "../../../convex/_generated/api";
import StorefrontClient from "./storefront-client";

// Force dynamic rendering to avoid cache issues
export const dynamic = 'force-dynamic';
export const revalidate = 0;

type PageProps = {
  params: Promise<{ username: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { username } = await params;
  const convex = getConvexClient();
  const user = await convex.query(api.users.getByUsername, { username });

  if (!user) {
    return { title: "ユーザーが見つかりません" };
  }

  return {
    title: `${user.name ?? user.username} | Stan Store`,
    description: user.bio ?? `${user.name ?? user.username}のストアフロント`,
  };
}

export default async function StorefrontPage({ params }: PageProps) {
  const { username } = await params;
  const convex = getConvexClient();

  const user = await convex.query(api.users.getByUsername, { username });

  if (!user) {
    notFound();
  }

  const [links, products] = await Promise.all([
    convex.query(api.links.getActiveByUserId, { userId: user._id }),
    convex.query(api.products.getActiveByUserId, { userId: user._id }),
  ]);

  // Record page_view analytics event (fire-and-forget)
  convex
    .mutation(api.analyticsFns.track, {
      userId: user._id,
      eventType: "page_view",
      metadata: JSON.stringify({ username }),
    })
    .catch(() => {
      // Silently fail — analytics must never break the page
    });

  const serializedUser = {
    id: user._id,
    username: user.username,
    name: user.name ?? null,
    bio: user.bio ?? null,
    avatarUrl: user.avatarUrl ?? null,
    themeColor: user.themeColor ?? null,
    themeName: user.themeName ?? null,
    twitterUrl: user.twitterUrl ?? null,
    instagramUrl: user.instagramUrl ?? null,
    youtubeUrl: user.youtubeUrl ?? null,
    tiktokUrl: user.tiktokUrl ?? null,
    websiteUrl: user.websiteUrl ?? null,
  };

  const serializedLinks = links.map((link) => ({
    id: link._id,
    title: link.title,
    url: link.url,
    order: link.order,
    icon: link.icon ?? null,
    iconUrl: link.iconUrl ?? null,
    isActive: link.isActive,
  }));

  const serializedProducts = products.map((product) => ({
    id: product._id,
    title: product.title,
    description: product.description ?? null,
    price: product.price,
    currency: product.currency,
    thumbnailUrl: product.thumbnailUrl ?? null,
    fileUrl: product.fileUrl ?? null,
    isActive: product.isActive,
  }));

  return (
    <StorefrontClient
      user={serializedUser}
      links={serializedLinks}
      products={serializedProducts}
    />
  );
}

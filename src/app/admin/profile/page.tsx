"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const themeOptions = [
  { value: "default", label: "デフォルト" },
  { value: "ocean", label: "オーシャン" },
  { value: "sunset", label: "サンセット" },
  { value: "sakura", label: "さくら" },
  { value: "dark", label: "ダーク" },
];

export default function ProfilePage() {
  const { user: clerkUser } = useUser();
  const convexUser = useQuery(
    api.users.getByClerkId,
    clerkUser?.id ? { clerkId: clerkUser.id } : "skip"
  );
  const updateProfile = useMutation(api.users.updateProfile);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    avatarUrl: "",
    themeColor: "#6366f1",
    themeName: "default",
    twitterUrl: "",
    instagramUrl: "",
    youtubeUrl: "",
    tiktokUrl: "",
    websiteUrl: "",
  });

  useEffect(() => {
    if (convexUser) {
      setFormData({
        name: convexUser.name ?? "",
        bio: convexUser.bio ?? "",
        avatarUrl: convexUser.avatarUrl ?? "",
        themeColor: convexUser.themeColor,
        themeName: convexUser.themeName,
        twitterUrl: convexUser.twitterUrl ?? "",
        instagramUrl: convexUser.instagramUrl ?? "",
        youtubeUrl: convexUser.youtubeUrl ?? "",
        tiktokUrl: convexUser.tiktokUrl ?? "",
        websiteUrl: convexUser.websiteUrl ?? "",
      });
    }
  }, [convexUser]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!clerkUser?.id) return;
    setSaving(true);
    setMessage(null);

    try {
      await updateProfile({
        clerkId: clerkUser.id,
        name: formData.name || undefined,
        bio: formData.bio || undefined,
        avatarUrl: formData.avatarUrl || undefined,
        themeColor: formData.themeColor || undefined,
        themeName: formData.themeName || undefined,
        twitterUrl: formData.twitterUrl || undefined,
        instagramUrl: formData.instagramUrl || undefined,
        youtubeUrl: formData.youtubeUrl || undefined,
        tiktokUrl: formData.tiktokUrl || undefined,
        websiteUrl: formData.websiteUrl || undefined,
      });
      setMessage({ type: "success", text: "プロフィールを保存しました" });
    } catch (err) {
      console.error(err);
      setMessage({ type: "error", text: "保存に失敗しました" });
    } finally {
      setSaving(false);
    }
  }

  if (!convexUser) {
    return (
      <div className="flex items-center justify-center py-24">
        <span className="text-sm text-muted-foreground">読み込み中...</span>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">プロフィール編集</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          @{convexUser.username}
        </p>
      </div>

      {message && (
        <div
          className={`rounded-lg px-4 py-3 text-sm ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic info */}
        <section className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold">基本情報</h2>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">名前</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="表示名を入力"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bio">自己紹介</Label>
              <Textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="自己紹介を入力"
                rows={4}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="avatarUrl">アバターURL</Label>
              <Input
                id="avatarUrl"
                name="avatarUrl"
                type="url"
                value={formData.avatarUrl}
                onChange={handleChange}
                placeholder="https://example.com/avatar.jpg"
              />
            </div>
          </div>
        </section>

        {/* Theme */}
        <section className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold">テーマ</h2>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="themeColor">テーマカラー</Label>
              <div className="flex items-center gap-3">
                <input
                  id="themeColor"
                  name="themeColor"
                  type="color"
                  value={formData.themeColor}
                  onChange={handleChange}
                  className="h-8 w-12 cursor-pointer rounded border border-input bg-transparent p-0.5"
                />
                <Input
                  name="themeColor"
                  value={formData.themeColor}
                  onChange={handleChange}
                  placeholder="#6366f1"
                  className="w-32 font-mono text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>テーマ</Label>
              <select
                value={formData.themeName}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, themeName: e.target.value }))
                }
                className="flex h-9 w-48 rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {themeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Social links */}
        <section className="rounded-xl border bg-card p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold">SNSリンク</h2>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="twitterUrl">Twitter / X</Label>
              <Input
                id="twitterUrl"
                name="twitterUrl"
                type="url"
                value={formData.twitterUrl}
                onChange={handleChange}
                placeholder="https://twitter.com/username"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="instagramUrl">Instagram</Label>
              <Input
                id="instagramUrl"
                name="instagramUrl"
                type="url"
                value={formData.instagramUrl}
                onChange={handleChange}
                placeholder="https://instagram.com/username"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="youtubeUrl">YouTube</Label>
              <Input
                id="youtubeUrl"
                name="youtubeUrl"
                type="url"
                value={formData.youtubeUrl}
                onChange={handleChange}
                placeholder="https://youtube.com/@channel"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tiktokUrl">TikTok</Label>
              <Input
                id="tiktokUrl"
                name="tiktokUrl"
                type="url"
                value={formData.tiktokUrl}
                onChange={handleChange}
                placeholder="https://tiktok.com/@username"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="websiteUrl">ウェブサイト</Label>
              <Input
                id="websiteUrl"
                name="websiteUrl"
                type="url"
                value={formData.websiteUrl}
                onChange={handleChange}
                placeholder="https://yourwebsite.com"
              />
            </div>
          </div>
        </section>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving} size="lg">
            {saving ? "保存中..." : "保存する"}
          </Button>
        </div>
      </form>
    </div>
  );
}

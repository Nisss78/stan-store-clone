"use client";

import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { useEffect, useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ExternalLink, Eye, EyeOff, Copy, Check, Camera, X, Save } from "lucide-react";
import { toast } from "sonner";

export default function AdminProfilePage() {
  const { user: clerkUser, isLoaded } = useUser();
  const convexUser = useQuery(
    api.users.getByClerkId,
    clerkUser?.id ? { clerkId: clerkUser.id } : "skip"
  );
  const updateProfile = useMutation(api.users.updateProfile);

  const [showPreview, setShowPreview] = useState(true);
  const [copied, setCopied] = useState(false);
  const [previewKey, setPreviewKey] = useState(0);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [autoSave, setAutoSave] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    bio: "",
    avatarUrl: "",
    twitterUrl: "",
    instagramUrl: "",
    youtubeUrl: "",
    tiktokUrl: "",
    websiteUrl: "",
  });
  const [originalData, setOriginalData] = useState(formData);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Check if form has unsaved changes
  const isDirty = JSON.stringify(formData) !== JSON.stringify(originalData);

  useEffect(() => {
    if (convexUser) {
      const data = {
        username: convexUser.username || "",
        name: convexUser.name || "",
        bio: convexUser.bio || "",
        avatarUrl: convexUser.avatarUrl || "",
        twitterUrl: convexUser.twitterUrl || "",
        instagramUrl: convexUser.instagramUrl || "",
        youtubeUrl: convexUser.youtubeUrl || "",
        tiktokUrl: convexUser.tiktokUrl || "",
        websiteUrl: convexUser.websiteUrl || "",
      };
      setFormData(data);
      setOriginalData(data);
    }
  }, [convexUser]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // Auto-save when enabled and form is dirty
  useEffect(() => {
    if (autoSave && isDirty && !saving) {
      // Clear existing timer
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
      // Set new timer (3 seconds after last change)
      autoSaveTimerRef.current = setTimeout(() => {
        handleSave(true);
      }, 3000);
    }
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [formData, autoSave, isDirty]);

  // 画像をリサイズしてBase64に変換
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // ファイルサイズチェック（5MB以下）
    if (file.size > 5 * 1024 * 1024) {
      toast.error("画像は5MB以下にしてください");
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = document.createElement("img");
        img.onload = () => {
          // Canvasでリサイズ
          const canvas = document.createElement("canvas");
          const maxSize = 400; // 400x400pxにリサイズ
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxSize) {
              height *= maxSize / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width *= maxSize / height;
              height = maxSize;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);

          // JPEG品質80%で圧縮
          const base64 = canvas.toDataURL("image/jpeg", 0.8);
          setFormData({ ...formData, avatarUrl: base64 });
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("画像のアップロードに失敗しました", error);
      toast.error("画像のアップロードに失敗しました");
    }
  };

  const handleSave = useCallback(async (isAutoSave = false) => {
    if (!clerkUser?.id) return;
    
    setSaving(true);
    try {
      await updateProfile({
        clerkId: clerkUser.id,
        ...formData,
      });
      setOriginalData(formData);
      setPreviewKey((k) => k + 1);
      
      if (isAutoSave) {
        toast.success("自動保存しました");
      } else {
        setSaved(true);
        toast.success("保存しました");
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error(error);
      toast.error("保存に失敗しました");
    } finally {
      setSaving(false);
    }
  }, [clerkUser?.id, formData, updateProfile]);

  const storeUrl = convexUser
    ? `${window.location.origin}/${formData.username || convexUser.username}`
    : "";

  const copyUrl = async () => {
    if (storeUrl) {
      await navigator.clipboard.writeText(storeUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isLoaded || !convexUser) {
    return (
      <div className="flex items-center justify-center py-24">
        <span className="text-sm text-muted-foreground">読み込み中...</span>
      </div>
    );
  }

  return (
    <div className="flex gap-6">
      {/* Editor */}
      <div className="flex-1 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">プロフィール</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              ストアフロントの表示をカスタマイズ
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* Unsaved indicator */}
            {isDirty && !saving && (
              <div className="flex items-center gap-2 text-sm text-amber-600">
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                未保存の変更があります
              </div>
            )}
            {saving && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                保存中...
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
              className="lg:hidden"
            >
              {showPreview ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              {showPreview ? "プレビュー非表示" : "プレビュー"}
            </Button>
          </div>
        </div>

        {/* Auto-save toggle */}
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Switch
                  id="auto-save"
                  checked={autoSave}
                  onCheckedChange={setAutoSave}
                />
                <Label htmlFor="auto-save" className="cursor-pointer">
                  自動保存（3秒後に保存）
                </Label>
              </div>
              <Button
                onClick={() => handleSave(false)}
                disabled={saving || !isDirty}
                size="sm"
              >
                <Save className="h-4 w-4 mr-1" />
                {saving ? "保存中..." : saved ? "保存済み" : "保存する"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Store URL Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">ストアURL</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input value={storeUrl} readOnly className="text-sm" />
              <Button size="sm" variant="outline" onClick={copyUrl}>
                {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => window.open(storeUrl, '_blank')}
              >
                <ExternalLink className="size-4" />
              </Button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              このURLをSNSのバイオに貼って共有しましょう
            </p>
          </CardContent>
        </Card>

        {/* Profile Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">基本情報</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Avatar Upload */}
            <div className="space-y-2">
              <Label>アイコン画像</Label>
              <div className="flex items-center gap-4">
                <div className="relative">
                  {formData.avatarUrl ? (
                    <div className="relative h-20 w-20 overflow-hidden rounded-full">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={formData.avatarUrl}
                        alt="Avatar preview"
                        className="h-full w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, avatarUrl: "" })}
                        className="absolute -right-1 -top-1 rounded-full bg-destructive p-1 text-white hover:bg-destructive/90"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/30 hover:border-primary hover:bg-muted/50 transition-colors"
                    >
                      <Camera className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    画像をアップロード
                  </Button>
                  <p className="mt-1 text-xs text-muted-foreground">
                    JPG、PNG対応（最大5MB、自動的に400x400pxにリサイズ）
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">ユーザー名（@xxx）</Label>
              <div className="flex items-center">
                <span className="mr-2 text-muted-foreground">@</span>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                  placeholder="username"
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                英数字とアンダースコアのみ使用可能。ストアURLが変更されます。
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">表示名</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="あなたの名前"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">バイオ</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="自己紹介を入力..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* SNS Links */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">SNSリンク</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="twitter">X (Twitter)</Label>
              <Input
                id="twitter"
                value={formData.twitterUrl}
                onChange={(e) => setFormData({ ...formData, twitterUrl: e.target.value })}
                placeholder="https://twitter.com/username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="instagram">Instagram</Label>
              <Input
                id="instagram"
                value={formData.instagramUrl}
                onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
                placeholder="https://instagram.com/username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="youtube">YouTube</Label>
              <Input
                id="youtube"
                value={formData.youtubeUrl}
                onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                placeholder="https://youtube.com/@username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tiktok">TikTok</Label>
              <Input
                id="tiktok"
                value={formData.tiktokUrl}
                onChange={(e) => setFormData({ ...formData, tiktokUrl: e.target.value })}
                placeholder="https://tiktok.com/@username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">ウェブサイト</Label>
              <Input
                id="website"
                value={formData.websiteUrl}
                onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                placeholder="https://your-website.com"
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center gap-4">
          <Button onClick={() => handleSave(false)} disabled={saving || !isDirty}>
            {saving ? "保存中..." : "保存する"}
          </Button>
          {saved && !autoSave && (
            <span className="text-sm text-green-600">✓ 保存しました</span>
          )}
        </div>
      </div>

      {/* Preview (Desktop) */}
      {showPreview && (
        <div className="hidden lg:block w-96 shrink-0">
          <div className="sticky top-6">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                プレビュー
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPreviewKey((k) => k + 1)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  更新
                </button>
                <a
                  href={storeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline"
                >
                  新しいタブで開く
                </a>
              </div>
            </div>
            <div className="overflow-hidden rounded-xl border bg-white shadow-lg">
              <div className="h-[600px] overflow-y-auto">
                <iframe
                  key={previewKey}
                  src={storeUrl}
                  className="w-full h-full border-0"
                  title="プレビュー"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

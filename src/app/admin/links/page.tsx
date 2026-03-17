"use client";

import { useState, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ArrowDown,
  ArrowUp,
  ExternalLink,
  Pencil,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  RefreshCw,
  Camera,
  X,
} from "lucide-react";
import { toast } from "sonner";

interface LinkItem {
  _id: Id<"links">;
  title: string;
  url: string;
  order: number;
  icon?: string;
  iconUrl?: string;
  isActive: boolean;
}

interface LinkFormData {
  title: string;
  url: string;
  icon: string;
  iconUrl: string;
  isActive: boolean;
}

const emptyForm: LinkFormData = {
  title: "",
  url: "",
  icon: "",
  iconUrl: "",
  isActive: true,
};

// 文字数制限
const LIMITS = {
  title: 30,
  url: 500,
  icon: 10,
};

export default function LinksPage() {
  const { user: clerkUser } = useUser();
  const convexUser = useQuery(
    api.users.getByClerkId,
    clerkUser?.id ? { clerkId: clerkUser.id } : "skip"
  );
  const links = useQuery(
    api.links.getByUserId,
    convexUser?._id ? { userId: convexUser._id } : "skip"
  ) as LinkItem[] | undefined;

  const createLink = useMutation(api.links.create);
  const updateLink = useMutation(api.links.update);
  const removeLink = useMutation(api.links.remove);
  const reorderLinks = useMutation(api.links.reorder);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<LinkItem | null>(null);
  const [formData, setFormData] = useState<LinkFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<Id<"links"> | null>(null);
  const [showPreview, setShowPreview] = useState(true);
  const [previewKey, setPreviewKey] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loading = !convexUser || links === undefined;
  const storeUrl = convexUser
    ? `${window.location.origin}/${convexUser.username}`
    : "";

  function openAddDialog() {
    setEditingLink(null);
    setFormData(emptyForm);
    setDialogOpen(true);
  }

  function openEditDialog(link: LinkItem) {
    setEditingLink(link);
    setFormData({
      title: link.title,
      url: link.url,
      icon: link.icon ?? "",
      iconUrl: link.iconUrl ?? "",
      isActive: link.isActive,
    });
    setDialogOpen(true);
  }

  function handleFormChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    
    // 文字数制限
    if (name === "title" && value.length > LIMITS.title) return;
    if (name === "url" && value.length > LIMITS.url) return;
    if (name === "icon" && value.length > LIMITS.icon) return;
    
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  // 画像をリサイズしてBase64に変換
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("画像は5MB以下にしてください");
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = document.createElement("img");
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const maxSize = 64; // アイコンは小さく
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

          const base64 = canvas.toDataURL("image/jpeg", 0.8);
          setFormData((prev) => ({ ...prev, iconUrl: base64 }));
          toast.success("画像をアップロードしました");
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("画像のアップロードに失敗しました", error);
      toast.error("画像のアップロードに失敗しました");
    }
  };

  async function handleSave() {
    if (!formData.title.trim() || !formData.url.trim() || !convexUser) return;
    setSaving(true);

    try {
      if (editingLink) {
        await updateLink({
          id: editingLink._id,
          userId: convexUser._id,
          title: formData.title,
          url: formData.url,
          icon: formData.icon || undefined,
          iconUrl: formData.iconUrl || undefined,
          isActive: formData.isActive,
        });
        toast.success("更新しました");
      } else {
        await createLink({
          userId: convexUser._id,
          title: formData.title,
          url: formData.url,
          icon: formData.icon || undefined,
          iconUrl: formData.iconUrl || undefined,
          isActive: formData.isActive,
        });
        toast.success("追加しました");
      }

      setPreviewKey((k) => k + 1);
      setDialogOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("保存に失敗しました");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: Id<"links">) {
    if (!convexUser) return;
    setDeletingId(id);
    try {
      await removeLink({ id, userId: convexUser._id });
      toast.success("削除しました");
      setPreviewKey((k) => k + 1);
    } catch (err) {
      console.error(err);
      toast.error("削除に失敗しました");
    } finally {
      setDeletingId(null);
    }
  }

  async function handleToggleActive(link: LinkItem) {
    if (!convexUser) return;
    try {
      await updateLink({
        id: link._id,
        userId: convexUser._id,
        isActive: !link.isActive,
      });
    } catch (err) {
      console.error(err);
      toast.error("更新に失敗しました");
    }
  }

  async function moveLink(index: number, direction: "up" | "down") {
    if (!links || !convexUser) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= links.length) return;

    const nextLinks = [...links];
    const [item] = nextLinks.splice(index, 1);
    nextLinks.splice(targetIndex, 0, item);

    try {
      await reorderLinks({
        userId: convexUser._id,
        items: nextLinks.map((link, order) => ({ id: link._id, order })),
      });
    } catch (err) {
      console.error(err);
      toast.error("並び順の保存に失敗しました");
    }
  }

  if (loading) {
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
            <h1 className="text-2xl font-bold tracking-tight">リンク管理</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              上下ボタンで表示順を変更できます
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
              className="lg:hidden"
            >
              {showPreview ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              {showPreview ? "非表示" : "プレビュー"}
            </Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger render={<Button onClick={openAddDialog} size="sm" />}>
                <Plus className="size-4" />
                リンクを追加
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingLink ? "リンクを編集" : "リンクを追加"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  {/* アイコン画像アップロード */}
                  <div className="space-y-2">
                    <Label>アイコン画像</Label>
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        {formData.iconUrl ? (
                          <div className="relative h-12 w-12 overflow-hidden rounded-lg">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={formData.iconUrl}
                              alt="アイコンプレビュー"
                              className="h-full w-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => setFormData((prev) => ({ ...prev, iconUrl: "" }))}
                              className="absolute -right-1 -top-1 rounded-full bg-destructive p-1 text-white hover:bg-destructive/90"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ) : (
                          <div
                            onClick={() => fileInputRef.current?.click()}
                            className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 hover:border-primary hover:bg-muted/50 transition-colors"
                          >
                            <Camera className="h-4 w-4 text-muted-foreground" />
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
                          または絵文字を使用
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="link-title">タイトル</Label>
                      <span className="text-xs text-muted-foreground">
                        {formData.title.length}/{LIMITS.title}
                      </span>
                    </div>
                    <Input
                      id="link-title"
                      name="title"
                      value={formData.title}
                      onChange={handleFormChange}
                      placeholder="例：公式サイト"
                      autoFocus
                    />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="link-url">URL</Label>
                      <span className="text-xs text-muted-foreground">
                        {formData.url.length}/{LIMITS.url}
                      </span>
                    </div>
                    <Input
                      id="link-url"
                      name="url"
                      type="url"
                      value={formData.url}
                      onChange={handleFormChange}
                      placeholder="https://example.com"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="link-icon">絵文字アイコン（任意）</Label>
                      <span className="text-xs text-muted-foreground">
                        {formData.icon.length}/{LIMITS.icon}
                      </span>
                    </div>
                    <Input
                      id="link-icon"
                      name="icon"
                      value={formData.icon}
                      onChange={handleFormChange}
                      placeholder="例：🔗"
                    />
                    <p className="text-xs text-muted-foreground">
                      画像をアップロードした場合は画像が優先されます
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch
                      id="link-active"
                      checked={formData.isActive}
                      onCheckedChange={(checked) =>
                        setFormData((prev) => ({ ...prev, isActive: checked }))
                      }
                    />
                    <Label htmlFor="link-active">有効にする</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    onClick={handleSave}
                    disabled={saving || !formData.title.trim() || !formData.url.trim()}
                  >
                    {saving ? "保存中..." : "保存"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {links.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed bg-muted/30 py-16 text-center">
            <p className="text-sm text-muted-foreground">リンクがまだありません</p>
            <Button variant="outline" className="mt-4" onClick={openAddDialog}>
              <Plus className="size-4" />
              最初のリンクを追加
            </Button>
          </div>
        ) : (
          <ul className="space-y-2">
            {links.map((link, index) => (
              <li
                key={link._id}
                className={`flex items-center gap-3 rounded-xl border bg-card px-4 py-3 shadow-sm ${
                  link.isActive ? "" : "opacity-60"
                }`}
              >
                <div className="flex flex-col gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => void moveLink(index, "up")}
                    disabled={index === 0}
                    aria-label="上へ移動"
                  >
                    <ArrowUp className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => void moveLink(index, "down")}
                    disabled={index === links.length - 1}
                    aria-label="下へ移動"
                  >
                    <ArrowDown className="size-4" />
                  </Button>
                </div>

                {/* アイコン表示 */}
                {link.iconUrl ? (
                  <div className="h-6 w-6 overflow-hidden rounded">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={link.iconUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : link.icon ? (
                  <span className="text-lg leading-none">{link.icon}</span>
                ) : null}

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{link.title}</p>
                  <p className="truncate text-xs text-muted-foreground">{link.url}</p>
                </div>

                <Switch
                  checked={link.isActive}
                  onCheckedChange={() => void handleToggleActive(link)}
                  aria-label="有効/無効"
                />

                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                  aria-label="リンクを開く"
                >
                  <ExternalLink className="size-4" />
                </a>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openEditDialog(link)}
                  aria-label="編集"
                >
                  <Pencil className="size-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => void handleDelete(link._id)}
                  disabled={deletingId === link._id}
                  className="text-destructive hover:text-destructive"
                  aria-label="削除"
                >
                  <Trash2 className="size-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
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
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  <RefreshCw className="size-3" />
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

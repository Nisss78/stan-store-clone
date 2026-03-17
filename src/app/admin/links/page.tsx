"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
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
} from "lucide-react";

interface LinkItem {
  _id: Id<"links">;
  title: string;
  url: string;
  order: number;
  icon?: string;
  isActive: boolean;
}

interface LinkFormData {
  title: string;
  url: string;
  icon: string;
  isActive: boolean;
}

const emptyForm: LinkFormData = {
  title: "",
  url: "",
  icon: "",
  isActive: true,
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
  const [error, setError] = useState<string | null>(null);

  const loading = !convexUser || links === undefined;

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
      isActive: link.isActive,
    });
    setDialogOpen(true);
  }

  function handleFormChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

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
          isActive: formData.isActive,
        });
      } else {
        await createLink({
          userId: convexUser._id,
          title: formData.title,
          url: formData.url,
          icon: formData.icon || undefined,
          isActive: formData.isActive,
        });
      }

      setDialogOpen(false);
    } catch (err) {
      console.error(err);
      setError("保存に失敗しました");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: Id<"links">) {
    if (!convexUser) return;
    setDeletingId(id);
    try {
      await removeLink({ id, userId: convexUser._id });
    } catch (err) {
      console.error(err);
      setError("削除に失敗しました");
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
      setError("更新に失敗しました");
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
      setError("並び順の保存に失敗しました");
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
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">リンク管理</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            上下ボタンで表示順を変更できます
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger render={<Button onClick={openAddDialog} />}>
            <Plus className="size-4" />
            リンクを追加
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingLink ? "リンクを編集" : "リンクを追加"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="link-title">タイトル</Label>
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
                <Label htmlFor="link-url">URL</Label>
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
                <Label htmlFor="link-icon">アイコン (任意)</Label>
                <Input
                  id="link-icon"
                  name="icon"
                  value={formData.icon}
                  onChange={handleFormChange}
                  placeholder="例：🔗"
                />
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

      {error && (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-2 underline hover:no-underline"
          >
            閉じる
          </button>
        </div>
      )}

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

              {link.icon && <span className="text-lg leading-none">{link.icon}</span>}

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
  );
}

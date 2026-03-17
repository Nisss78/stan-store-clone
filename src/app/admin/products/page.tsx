"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  PlusIcon,
  PencilIcon,
  Trash2Icon,
  ShoppingBagIcon,
  Loader2,
  Eye,
  EyeOff,
  RefreshCw,
  Camera,
  X,
} from "lucide-react";
import { toast } from "sonner";

interface Product {
  _id: Id<"products">;
  title: string;
  description?: string;
  price: number;
  currency: string;
  thumbnailUrl?: string;
  fileUrl?: string;
  isActive: boolean;
  _creationTime: number;
}

interface ProductFormData {
  title: string;
  description: string;
  price: string;
  thumbnailUrl: string;
  fileUrl: string;
}

const emptyForm: ProductFormData = {
  title: "",
  description: "",
  price: "",
  thumbnailUrl: "",
  fileUrl: "",
};

// 文字数制限
const LIMITS = {
  title: 50,
  description: 200,
  fileUrl: 500,
};

function formatPrice(price: number) {
  return `¥${price.toLocaleString("ja-JP")}`;
}

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Product | null;
  userId: Id<"users">;
  onSaved: () => void;
}

function ProductFormDialog({
  open,
  onOpenChange,
  initialData,
  userId,
  onSaved,
}: ProductFormDialogProps) {
  const isEditing = Boolean(initialData);
  const [form, setForm] = useState<ProductFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createProduct = useMutation(api.products.create);
  const updateProduct = useMutation(api.products.update);

  useEffect(() => {
    if (open) {
      if (initialData) {
        setForm({
          title: initialData.title,
          description: initialData.description ?? "",
          price: String(initialData.price),
          thumbnailUrl: initialData.thumbnailUrl ?? "",
          fileUrl: initialData.fileUrl ?? "",
        });
      } else {
        setForm(emptyForm);
      }
      setError(null);
    }
  }, [open, initialData]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    
    // 文字数制限を適用
    if (name === "title" && value.length > LIMITS.title) return;
    if (name === "description" && value.length > LIMITS.description) return;
    if (name === "fileUrl" && value.length > LIMITS.fileUrl) return;
    
    setForm((prev) => ({ ...prev, [name]: value }));
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
          const maxSize = 800;
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
          setForm((prev) => ({ ...prev, thumbnailUrl: base64 }));
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

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const parsedPrice = parseInt(form.price, 10);
    if (!form.title.trim()) {
      setError("商品名を入力してください。");
      return;
    }
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      setError("価格は0以上の整数で入力してください。");
      return;
    }

    setSaving(true);

    try {
      if (isEditing && initialData) {
        await updateProduct({
          id: initialData._id,
          userId,
          title: form.title.trim(),
          description: form.description.trim() || undefined,
          price: parsedPrice,
          thumbnailUrl: form.thumbnailUrl.trim() || undefined,
          fileUrl: form.fileUrl.trim() || undefined,
        });
      } else {
        await createProduct({
          userId,
          title: form.title.trim(),
          description: form.description.trim() || undefined,
          price: parsedPrice,
          currency: "JPY",
          thumbnailUrl: form.thumbnailUrl.trim() || undefined,
          fileUrl: form.fileUrl.trim() || undefined,
        });
      }

      toast.success("保存しました");
      onSaved();
      onOpenChange(false);
    } catch {
      setError("エラーが発生しました。");
      toast.error("保存に失敗しました");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "商品を編集" : "商品を追加"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* サムネイル画像アップロード */}
          <div className="space-y-2">
            <Label>サムネイル画像</Label>
            <div className="flex items-start gap-4">
              <div className="relative">
                {form.thumbnailUrl ? (
                  <div className="relative h-24 w-32 overflow-hidden rounded-lg">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={form.thumbnailUrl}
                      alt="サムネイルプレビュー"
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, thumbnailUrl: "" }))}
                      className="absolute -right-1 -top-1 rounded-full bg-destructive p-1 text-white hover:bg-destructive/90"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex h-24 w-32 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 hover:border-primary hover:bg-muted/50 transition-colors"
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
                  JPG、PNG対応（最大5MB、自動リサイズ）
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="prod-title">商品名</Label>
              <span className="text-xs text-muted-foreground">
                {form.title.length}/{LIMITS.title}
              </span>
            </div>
            <Input
              id="prod-title"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="例：デジタル写真集"
              required
              disabled={saving}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="prod-description">説明</Label>
              <span className="text-xs text-muted-foreground">
                {form.description.length}/{LIMITS.description}
              </span>
            </div>
            <Textarea
              id="prod-description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="商品の詳細説明を入力してください"
              disabled={saving}
              rows={3}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="prod-price">価格（円）</Label>
            <Input
              id="prod-price"
              name="price"
              type="number"
              min={0}
              step={1}
              value={form.price}
              onChange={handleChange}
              placeholder="1000"
              required
              disabled={saving}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="prod-fileUrl">ファイルURL（任意）</Label>
              <span className="text-xs text-muted-foreground">
                {form.fileUrl.length}/{LIMITS.fileUrl}
              </span>
            </div>
            <Input
              id="prod-fileUrl"
              name="fileUrl"
              type="url"
              value={form.fileUrl}
              onChange={handleChange}
              placeholder="https://example.com/file.zip"
              disabled={saving}
            />
            <p className="text-xs text-muted-foreground">
              ダウンロードファイルのURLを入力（Google Drive、Dropboxなど）
            </p>
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <DialogFooter>
            <Button type="submit" disabled={saving} className="gap-2">
              {saving && <Loader2 className="size-4 animate-spin" />}
              保存
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product;
  userId: Id<"users">;
  onDeleted: () => void;
}

function DeleteConfirmDialog({
  open,
  onOpenChange,
  product,
  userId,
  onDeleted,
}: DeleteConfirmDialogProps) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const removeProduct = useMutation(api.products.remove);

  async function handleDelete() {
    setDeleting(true);
    setError(null);
    try {
      await removeProduct({ id: product._id, userId });
      toast.success("削除しました");
      onDeleted();
      onOpenChange(false);
    } catch {
      setError("削除中にエラーが発生しました。");
      toast.error("削除に失敗しました");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>商品を削除</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          「{product.title}」を削除してもよろしいですか？この操作は元に戻せません。
        </p>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleting}
          >
            キャンセル
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
            className="gap-2"
          >
            {deleting && <Loader2 className="size-4 animate-spin" />}
            削除
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminProductsPage() {
  const { user: clerkUser } = useUser();
  const convexUser = useQuery(
    api.users.getByClerkId,
    clerkUser?.id ? { clerkId: clerkUser.id } : "skip"
  );
  const products = useQuery(
    api.products.getByUserId,
    convexUser?._id ? { userId: convexUser._id } : "skip"
  ) as Product[] | undefined;

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [showPreview, setShowPreview] = useState(true);
  const [previewKey, setPreviewKey] = useState(0);

  const storeUrl = convexUser
    ? `${window.location.origin}/${convexUser.username}`
    : "";

  const loading = !convexUser || products === undefined;

  const handleSaved = useCallback(() => {
    setPreviewKey((k) => k + 1);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex gap-6">
      {/* Product List */}
      <div className="flex-1 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">商品</h1>
            <p className="text-sm text-muted-foreground">
              デジタル商品の追加・編集・削除
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
              className="lg:hidden"
            >
              {showPreview ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              {showPreview ? "プレビュー非表示" : "プレビュー"}
            </Button>
            <Button size="sm" onClick={() => setAddDialogOpen(true)} className="gap-2">
              <PlusIcon className="size-4" />
              追加
            </Button>
          </div>
        </div>

        {/* Empty state */}
        {products.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed py-16 text-center">
            <ShoppingBagIcon className="size-10 text-muted-foreground/50" />
            <div>
              <p className="text-sm font-medium">商品がまだありません</p>
              <p className="text-xs text-muted-foreground">
                「商品を追加」から最初の商品を登録しましょう
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => setAddDialogOpen(true)}
              className="gap-1.5"
            >
              <PlusIcon className="size-3.5" />
              商品を追加
            </Button>
          </div>
        )}

        {/* Product grid */}
        {products.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <div
                key={product._id}
                className="group relative flex flex-col overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-sm"
              >
                {/* Thumbnail - only show if exists */}
                {product.thumbnailUrl && (
                  <div className="relative aspect-video w-full overflow-hidden bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={product.thumbnailUrl}
                      alt={product.title}
                      className="h-full w-full object-cover"
                    />
                    {/* Active badge */}
                    <span
                      className={`absolute right-2 top-2 rounded-full px-2 py-0.5 text-xs font-medium ${
                        product.isActive
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {product.isActive ? "販売中" : "非公開"}
                    </span>
                  </div>
                )}
                
                {/* No thumbnail placeholder */}
                {!product.thumbnailUrl && (
                  <div className="relative aspect-video w-full bg-muted flex items-center justify-center">
                    <ShoppingBagIcon className="size-8 text-muted-foreground/40" />
                    <span
                      className={`absolute right-2 top-2 rounded-full px-2 py-0.5 text-xs font-medium ${
                        product.isActive
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {product.isActive ? "販売中" : "非公開"}
                    </span>
                  </div>
                )}

                {/* Info */}
                <div className="flex flex-1 flex-col gap-1 p-3">
                  <p className="line-clamp-1 text-sm font-medium">
                    {product.title}
                  </p>
                  {product.description && (
                    <p className="line-clamp-2 text-xs text-muted-foreground">
                      {product.description}
                    </p>
                  )}
                  <p className="mt-auto pt-2 text-base font-semibold">
                    {formatPrice(product.price)}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 border-t p-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-1.5"
                    onClick={() => setEditingProduct(product)}
                  >
                    <PencilIcon className="size-3.5" />
                    編集
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => setDeletingProduct(product)}
                  >
                    <Trash2Icon className="size-3.5" />
                    削除
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add dialog */}
        <ProductFormDialog
          open={addDialogOpen}
          onOpenChange={setAddDialogOpen}
          initialData={null}
          userId={convexUser._id}
          onSaved={handleSaved}
        />

        {/* Edit dialog */}
        {editingProduct && (
          <ProductFormDialog
            open={Boolean(editingProduct)}
            onOpenChange={(open) => {
              if (!open) setEditingProduct(null);
            }}
            initialData={editingProduct}
            userId={convexUser._id}
            onSaved={handleSaved}
          />
        )}

        {/* Delete confirm dialog */}
        {deletingProduct && (
          <DeleteConfirmDialog
            open={Boolean(deletingProduct)}
            onOpenChange={(open) => {
              if (!open) setDeletingProduct(null);
            }}
            product={deletingProduct}
            userId={convexUser._id}
            onDeleted={handleSaved}
          />
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
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  <RefreshCw className="inline size-3 mr-1" />
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

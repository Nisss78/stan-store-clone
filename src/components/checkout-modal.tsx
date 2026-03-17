"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShoppingBag, Loader2 } from "lucide-react";

interface Product {
  id: string;
  title: string;
  price: number;
  description?: string | null;
  thumbnailUrl?: string | null;
}

interface CheckoutModalProps {
  product: Product;
  username: string;
  onClose?: () => void;
}

export function CheckoutModal({ product, username: _username, onClose }: CheckoutModalProps) {
  const isControlled = onClose !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const open = isControlled ? true : internalOpen;

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formattedPrice = `¥${product.price.toLocaleString("ja-JP")}`;

  function handleOpenChange(next: boolean) {
    if (isControlled) {
      if (!next) onClose?.();
    } else {
      setInternalOpen(next);
    }
  }

  async function handleCheckout(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError("メールアドレスを入力してください。");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          buyerEmail: email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "エラーが発生しました。");
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setError("ネットワークエラーが発生しました。");
    } finally {
      setLoading(false);
    }
  }

  const dialogContent = (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>購入する</DialogTitle>
      </DialogHeader>

      <div className="space-y-4">
        {/* 商品情報 */}
        <div className="flex gap-3 rounded-lg border bg-muted/30 p-3">
          {product.thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.thumbnailUrl}
              alt={product.title}
              className="size-16 shrink-0 rounded-md object-cover"
            />
          ) : (
            <div className="flex size-16 shrink-0 items-center justify-center rounded-md bg-muted">
              <ShoppingBag className="size-6 text-muted-foreground" />
            </div>
          )}
          <div className="flex min-w-0 flex-col justify-center gap-0.5">
            <p className="truncate text-sm font-medium">{product.title}</p>
            <p className="font-bold">{formattedPrice}</p>
          </div>
        </div>

        {/* フォーム */}
        <form onSubmit={handleCheckout} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="buyer-email">メールアドレス</Label>
            <Input
              id="buyer-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              autoComplete="email"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="size-4 animate-spin mr-2" />
                処理中...
              </>
            ) : (
              "お支払いへ進む"
            )}
          </Button>
        </form>
      </div>
    </DialogContent>
  );

  if (isControlled) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        {dialogContent}
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button className="w-full" />} >
        購入する
      </DialogTrigger>
      {dialogContent}
    </Dialog>
  );
}

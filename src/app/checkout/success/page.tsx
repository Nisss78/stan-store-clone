import Link from "next/link";
import { getConvexClient } from "@/lib/convex";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { notFound } from "next/navigation";
import { CheckCircle, Download, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  searchParams: Promise<{ order_id?: string; session_id?: string }>;
};

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const { order_id } = await searchParams;

  if (!order_id) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <h1 className="text-xl font-bold">購入が完了しました</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            詳細はメールをご確認ください
          </p>
          <Link href="/landing" className="mt-6 inline-block">
            <Button>トップへ戻る</Button>
          </Link>
        </div>
      </div>
    );
  }

  const convex = getConvexClient();
  const order = await convex.query(api.orders.getById, {
    id: order_id as Id<"orders">,
  });

  if (!order) {
    notFound();
  }

  const formattedPrice = `¥${order.amount.toLocaleString("ja-JP")}`;

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <h1 className="text-xl font-bold">購入ありがとうございます</h1>
        </div>

        <div className="mt-8 space-y-4">
          {/* 商品情報 */}
          <div className="flex gap-4 rounded-lg border p-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded bg-muted">
              {order.product.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={order.product.thumbnailUrl}
                  alt={order.product.title}
                  className="h-full w-full rounded object-cover"
                />
              ) : (
                <Download className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium">{order.product.title}</p>
              <p className="font-bold">{formattedPrice}</p>
            </div>
          </div>

          {/* ダウンロードリンク */}
          {order.product.fileUrl && order.status === "completed" && (
            <a
              href={order.product.fileUrl}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-primary py-3 font-medium text-primary-foreground hover:bg-primary/90"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Download className="h-4 w-4" />
              商品をダウンロード
            </a>
          )}

          {/* メール通知 */}
          <div className="flex gap-3 rounded-lg border bg-muted/50 p-3">
            <Mail className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground" />
            <div className="text-sm">
              <p className="font-medium">確認メールを送信しました</p>
              <p className="text-muted-foreground">{order.buyerEmail}</p>
            </div>
          </div>

          {/* 注文情報 */}
          <div className="text-sm text-muted-foreground">
            <p>注文番号: {order._id}</p>
            <p>購入日: {new Date(order._creationTime).toLocaleString("ja-JP")}</p>
          </div>
        </div>

        <div className="mt-8">
          <Link href="/landing" className="block">
            <Button variant="outline" className="w-full">
              トップへ戻る
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

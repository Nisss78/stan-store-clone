import { NextRequest, NextResponse } from "next/server";
import { getConvexClient } from "@/lib/convex";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { getStripe, USE_MOCK_PAYMENT, createMockCheckoutSession } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, buyerEmail } = body;

    if (!productId || !buyerEmail) {
      return NextResponse.json(
        { error: "商品IDとメールアドレスは必須です。" },
        { status: 400 }
      );
    }

    const convex = getConvexClient();

    const product = await convex.query(api.products.getById, {
      id: productId as Id<"products">,
    });

    if (!product) {
      return NextResponse.json(
        { error: "商品が見つかりません。" },
        { status: 404 }
      );
    }

    if (!product.isActive) {
      return NextResponse.json(
        { error: "この商品は現在販売停止中です。" },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${request.nextUrl.protocol}//${request.nextUrl.host}`;

    // Create a pending Order record first
    const order = await convex.mutation(api.orders.create, {
      productId: product._id,
      userId: product.userId,
      buyerEmail,
      amount: product.price,
      currency: product.currency,
      status: "pending",
    });

    if (!order) {
      return NextResponse.json(
        { error: "注文の作成に失敗しました。" },
        { status: 500 }
      );
    }

    // モック決済モード
    if (USE_MOCK_PAYMENT) {
      const successUrl = `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&order_id=${order._id}`;
      const cancelUrl = `${baseUrl}/checkout/cancel?order_id=${order._id}`;

      const session = createMockCheckoutSession(
        order._id,
        product._id,
        buyerEmail,
        product.price,
        successUrl,
        cancelUrl
      );

      // 注文を即座に完了状態にする（モック用）
      await convex.mutation(api.orders.updateStatus, {
        id: order._id,
        status: "completed",
        stripePaymentId: session.id,
      });

      // 分析イベントを記録
      await convex.mutation(api.analyticsFns.track, {
        userId: product.userId,
        eventType: "purchase",
        metadata: JSON.stringify({
          orderId: order._id,
          productId: product._id,
          amount: product.price,
          buyerEmail,
        }),
      });

      return NextResponse.json({ url: session.url });
    }

    // 本番Stripe決済
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: buyerEmail,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: product.currency.toLowerCase(),
            unit_amount: product.price,
            product_data: {
              name: product.title,
              description: product.description || undefined,
              images: product.thumbnailUrl ? [product.thumbnailUrl] : undefined,
            },
          },
        },
      ],
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&order_id=${order._id}`,
      cancel_url: `${baseUrl}/checkout/cancel?order_id=${order._id}`,
      metadata: {
        orderId: order._id,
        productId: product._id,
        sellerId: product.userId,
      },
    });

    // Store the Stripe session ID on the order
    await convex.mutation(api.orders.updateStatus, {
      id: order._id,
      status: "pending",
      stripePaymentId: session.id,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json(
      { error: "決済セッションの作成中にエラーが発生しました。" },
      { status: 500 }
    );
  }
}

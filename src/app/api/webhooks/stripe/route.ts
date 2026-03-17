import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getConvexClient } from "@/lib/convex";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import Stripe from "stripe";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const stripe = getStripe();
  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "Stripe署名ヘッダーがありません。" },
      { status: 400 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not set");
    return NextResponse.json(
      { error: "Webhookシークレットが設定されていません。" },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return NextResponse.json(
      { error: "Webhook署名の検証に失敗しました。" },
      { status: 400 }
    );
  }

  const convex = getConvexClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.orderId;

        if (!orderId) {
          console.error("No orderId in session metadata:", session.id);
          break;
        }

        await convex.mutation(api.orders.updateStatus, {
          id: orderId as Id<"orders">,
          status: "completed",
          stripePaymentId: (session.payment_intent as string) ?? session.id,
        });

        console.log(`Order ${orderId} marked as completed.`);
        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.orderId;

        if (orderId) {
          await convex.mutation(api.orders.updateStatus, {
            id: orderId as Id<"orders">,
            status: "expired",
          });
        }
        break;
      }

      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return NextResponse.json(
      { error: "Webhookの処理中にエラーが発生しました。" },
      { status: 500 }
    );
  }
}

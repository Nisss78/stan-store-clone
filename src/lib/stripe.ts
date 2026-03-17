import Stripe from "stripe";

let stripeClient: Stripe | null = null;

// モック決済モード（Stripe APIキーなしでも動作）
export const USE_MOCK_PAYMENT = !process.env.STRIPE_SECRET_KEY || process.env.USE_MOCK_PAYMENT === "true";

export function getStripe() {
  if (USE_MOCK_PAYMENT) {
    throw new Error("モック決済モードではStripeクライアントを使用できません");
  }

  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!);
  }

  return stripeClient;
}

// モック決済セッション
export interface MockCheckoutSession {
  id: string;
  url: string;
  orderId: string;
  productId: string;
  buyerEmail: string;
  amount: number;
}

const mockSessions = new Map<string, MockCheckoutSession>();

export function createMockCheckoutSession(
  orderId: string,
  productId: string,
  buyerEmail: string,
  amount: number,
  successUrl: string,
  _cancelUrl: string
): MockCheckoutSession {
  const sessionId = `mock_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const session: MockCheckoutSession = {
    id: sessionId,
    url: successUrl.replace("{CHECKOUT_SESSION_ID}", sessionId),
    orderId,
    productId,
    buyerEmail,
    amount,
  };

  mockSessions.set(sessionId, session);
  
  return session;
}

export function getMockSession(sessionId: string): MockCheckoutSession | undefined {
  return mockSessions.get(sessionId);
}

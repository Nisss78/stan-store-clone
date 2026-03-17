import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

// TODO: To integrate a real LLM API, replace the getMockResponse function below
// with a call to your preferred provider. Example with OpenAI:
//
// import OpenAI from "openai";
// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
//
// const completion = await openai.chat.completions.create({
//   model: "gpt-4o",
//   messages: messages,
// });
// const reply = completion.choices[0].message.content;
//
// Or with Anthropic Claude:
// import Anthropic from "@anthropic-ai/sdk";
// const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
// const message = await client.messages.create({
//   model: "claude-opus-4-5",
//   max_tokens: 1024,
//   messages: messages,
// });

type Message = {
  role: "user" | "assistant";
  content: string;
};

function getMockResponse(messages: Message[]): string {
  const lastUserMessage = messages
    .filter((m) => m.role === "user")
    .at(-1)?.content ?? "";

  const lower = lastUserMessage.toLowerCase();

  if (lower.includes("おすすめ") || lower.includes("recommend")) {
    return (
      "商品のおすすめについてですね！以下のポイントを参考にしてください：\n\n" +
      "1. **ターゲット層を明確に** - お客様のニーズに合った商品を厳選しましょう。\n" +
      "2. **限定感を演出** - 期間限定や数量限定の商品は購買意欲を高めます。\n" +
      "3. **バンドル販売** - 関連商品をセットにすることで客単価が上がります。\n" +
      "4. **レビューを活用** - 購入者の声を掲載することで信頼性が増します。\n\n" +
      "どのカテゴリの商品についてもっと詳しく知りたいですか？"
    );
  }

  if (lower.includes("価格") || lower.includes("price")) {
    return (
      "価格戦略についてアドバイスします！\n\n" +
      "1. **市場調査を行う** - 競合他社の価格帯を把握しておきましょう。\n" +
      "2. **価値ベースの価格設定** - 価格だけでなく、提供する価値を前面に出しましょう。\n" +
      "3. **段階的な価格帯** - ライト・スタンダード・プレミアムの3段階が効果的です。\n" +
      "4. **初回割引** - 新規顧客には初回限定割引を提供してファンを増やしましょう。\n" +
      "5. **定期購入プラン** - サブスクリプション型で安定収益を確保できます。\n\n" +
      "現在の商品の価格帯はどのくらいですか？"
    );
  }

  if (lower.includes("売上") || lower.includes("sales")) {
    return (
      "売上改善のためのヒントをご紹介します！\n\n" +
      "1. **SNSを活用** - TwitterやInstagramで定期的に商品を紹介しましょう。\n" +
      "2. **メールマーケティング** - 購入者リストへのフォローアップメールが効果的です。\n" +
      "3. **コンテンツマーケティング** - ブログや動画で価値ある情報を発信しましょう。\n" +
      "4. **アフィリエイトプログラム** - 紹介者に報酬を提供することで口コミが広がります。\n" +
      "5. **季節キャンペーン** - 特定の時期に合わせたプロモーションを実施しましょう。\n\n" +
      "特に力を入れたい施策はありますか？"
    );
  }

  return (
    "ストア運営についてお手伝いします！\n\n" +
    "以下のようなことについてアドバイスできます：\n\n" +
    "• **商品のおすすめ** - ラインナップの最適化\n" +
    "• **価格戦略** - 収益を最大化する価格設定\n" +
    "• **売上改善** - マーケティングと集客のヒント\n" +
    "• **顧客対応** - リピーター獲得のコツ\n\n" +
    "何についてお知りになりたいですか？お気軽にご質問ください！"
  );
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { messages } = body as { messages: Message[] };

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "messages array is required" },
        { status: 400 }
      );
    }

    // Mock response — replace this section with a real LLM API call (see comment at top of file)
    const reply = getMockResponse(messages);

    return NextResponse.json({
      role: "assistant",
      content: reply,
    });
  } catch (error) {
    console.error("AI chat error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}

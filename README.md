# Stan Store Clone

日本のクリエイター向けストアフロントプラットフォーム。リンク集 + デジタル商品販売 + 決済を1ページで完結。

## デモ

- **ストアフロント**: `https://[your-domain]/[username]`
- **管理画面**: `https://[your-domain]/admin`

## 機能

### ストアフロント（`/[username]`）
- プロフィール表示（アバター、名前、バイオ）
- SNSリンク集
- デジタル商品カード
- 1-Tap Checkout（モーダル完結決済）
- レスポンシブデザイン

### 管理画面（`/admin`）
- プロフィール編集
- リンク管理
- 商品管理
- 注文履歴
- アナリティクス
- AIアシスタント

### 決済システム
- **モック決済**（デフォルト）: Stripe APIキーなしで動作
- **本番Stripe**: 環境変数設定で切り替え

## ワンクリックデプロイ

### Vercel + Postgres
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Nisss78/stan-store-clone)

1. 上のボタンをクリック
2. Vercelアカウントでログイン
3. Storage → Create Database → Postgres を作成
4. 環境変数を設定:
   ```
   NEXTAUTH_SECRET=<ランダムな文字列>
   NEXTAUTH_URL=https://<your-project>.vercel.app
   ```
5. 再デプロイ

### Railway（SQLite対応）
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/stan-store-clone)

```bash
railway login
railway init
railway run npm run build
railley up
```

### Render
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/Nisss78/stan-store-clone)

### Fly.io
```bash
fly launch
fly deploy
```

## ローカル開発

### 1. クローン

```bash
git clone https://github.com/Nisss78/stan-store-clone.git
cd stan-store-clone
npm install
```

### 2. 環境変数設定

`.env`を作成:

```env
# SQLite（ローカル開発用）
DATABASE_URL="file:./dev.db"

# NextAuth
NEXTAUTH_SECRET="dev-secret-change-in-production"
NEXTAUTH_URL="http://localhost:3000"

# Stripe（オプション - 未設定ならモック決済）
STRIPE_SECRET_KEY=""
STRIPE_PUBLISHABLE_KEY=""
STRIPE_WEBHOOK_SECRET=""

# モック決済
USE_MOCK_PAYMENT="true"

# AI（オプション）
OPENAI_API_KEY=""
```

### 3. データベース初期化

```bash
npx prisma generate
npx prisma db push
```

### 4. 起動

```bash
npm run dev
```

- http://localhost:3000/landing - ランディング
- http://localhost:3000/register - アカウント作成
- http://localhost:3000/[username] - ストアフロント

## 環境変数一覧

| 変数名 | 必須 | 説明 |
|--------|------|------|
| `DATABASE_URL` | ✅ | データベースURL |
| `NEXTAUTH_SECRET` | ✅ | NextAuth.js用シークレット |
| `NEXTAUTH_URL` | ✅ | アプリURL（本番） |
| `STRIPE_SECRET_KEY` | ❌ | Stripe APIキー |
| `USE_MOCK_PAYMENT` | ❌ | `true`でモック決済 |
| `OPENAI_API_KEY` | ❌ | AI機能用 |

## 本番デプロイ時の注意

### PostgreSQL推奨

Vercel、Railway、Render等ではPostgreSQLを使用:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_DATABASE_URL")
}
```

### Stripe設定（本番決済）

1. [Stripe Dashboard](https://dashboard.stripe.com/)でAPIキー取得
2. Webhookエンドポイント作成: `https://your-domain.com/api/webhooks/stripe`
3. イベント購読: `checkout.session.completed`

```env
USE_MOCK_PAYMENT="false"
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

## 技術スタック

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI**: shadcn/ui
- **Database**: Prisma + PostgreSQL/SQLite
- **Auth**: NextAuth.js
- **Payment**: Stripe
- **Hosting**: Vercel / Railway / Render / Fly.io

## ライセンス

MIT

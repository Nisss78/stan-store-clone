import Link from "next/link";
import { Home, Search, Sparkles } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Decorative elements */}
        <div className="relative mb-8">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full blur-3xl opacity-30" />
          </div>
          <div className="relative flex justify-center">
            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl">
              <Search className="h-10 w-10 text-white" />
            </div>
          </div>
        </div>

        {/* Content */}
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          ユーザーが見つかりません
        </h1>
        <p className="text-gray-600 mb-2">
          このユーザー名のストアは存在しないか、削除された可能性があります。
        </p>
        <p className="text-sm text-gray-500 mb-8">
          URLを確認してもう一度お試しください。
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-full hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl hover:scale-[1.02]"
          >
            <Home className="h-5 w-5" />
            ホームに戻る
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 font-medium rounded-full border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all"
          >
            <Sparkles className="h-5 w-5" />
            新規登録
          </Link>
        </div>
      </div>
    </div>
  );
}

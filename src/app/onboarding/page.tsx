"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { User, AtSign, Image as ImageIcon, ArrowRight, Loader2 } from "lucide-react";

export default function OnboardingPage() {
  const router = useRouter();
  const { user: clerkUser, isLoaded } = useUser();
  const convexUser = useQuery(
    api.users.getByClerkId,
    clerkUser?.id ? { clerkId: clerkUser.id } : "skip"
  );
  const updateProfile = useMutation(api.users.updateProfile);

  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Redirect if already onboarded
  useEffect(() => {
    if (convexUser?.username && !convexUser.username.startsWith("user_")) {
      router.push("/admin");
    }
  }, [convexUser, router]);

  // Initialize form with Clerk data
  useEffect(() => {
    if (clerkUser) {
      setDisplayName(
        [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || ""
      );
      setAvatarUrl(clerkUser.imageUrl || "");
      // Generate default username from email
      const email = clerkUser.emailAddresses[0]?.emailAddress || "";
      const defaultUsername = email
        .split("@")[0]
        ?.replace(/[^a-z0-9_]/g, "_")
        .slice(0, 20) || "";
      setUsername(defaultUsername);
    }
  }, [clerkUser]);

  const validateUsername = (value: string) => {
    if (!value) return "ユーザー名は必須です";
    if (value.length < 3) return "3文字以上で入力してください";
    if (value.length > 20) return "20文字以内で入力してください";
    if (!/^[a-z0-9_]+$/.test(value)) return "小文字の英数字と_のみ使用できます";
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const validationError = validateUsername(username);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (!clerkUser?.id) {
      setError("認証エラーが発生しました");
      return;
    }

    setLoading(true);
    try {
      await updateProfile({
        clerkId: clerkUser.id,
        username,
        name: displayName || undefined,
        avatarUrl: avatarUrl || undefined,
      });
      router.push("/admin");
    } catch (err) {
      setError("保存中にエラーが発生しました");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded || !clerkUser) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4 py-12">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600">
            <User className="size-8 text-white" />
          </div>
          <CardTitle className="text-2xl">プロフィールを設定</CardTitle>
          <CardDescription>
            あなたのストアを作成しましょう
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Avatar Preview */}
            {avatarUrl && (
              <div className="flex justify-center">
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="h-20 w-20 rounded-full ring-4 ring-white shadow-lg object-cover"
                />
              </div>
            )}

            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username" className="flex items-center gap-2">
                <AtSign className="size-4" />
                ユーザー名 <span className="text-destructive">*</span>
              </Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => {
                  const value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "");
                  setUsername(value);
                  setError("");
                }}
                placeholder="your_username"
                className="font-mono"
              />
              <p className="text-xs text-muted-foreground">
                小文字の英数字とアンダースコアのみ（3-20文字）
              </p>
              {username && (
                <p className="text-xs text-muted-foreground">
                  あなたのストア: {window.location.origin}/{username}
                </p>
              )}
            </div>

            {/* Display Name */}
            <div className="space-y-2">
              <Label htmlFor="displayName" className="flex items-center gap-2">
                <User className="size-4" />
                表示名
              </Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="表示される名前"
              />
            </div>

            {/* Avatar URL */}
            <div className="space-y-2">
              <Label htmlFor="avatarUrl" className="flex items-center gap-2">
                <ImageIcon className="size-4" />
                アバター画像URL
              </Label>
              <Input
                id="avatarUrl"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="https://example.com/avatar.jpg"
                type="url"
              />
              <p className="text-xs text-muted-foreground">
                画像URLを入力してください（省略可）
              </p>
            </div>

            {error && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={loading || !username}
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  設定中...
                </>
              ) : (
                <>
                  はじめる
                  <ArrowRight className="size-4 ml-2" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

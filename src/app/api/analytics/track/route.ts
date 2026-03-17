import { NextRequest, NextResponse } from "next/server";
import { getConvexClient } from "@/lib/convex";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, eventType, metadata } = body;

    if (!userId || !eventType) {
      return NextResponse.json(
        { error: "userId and eventType are required" },
        { status: 400 }
      );
    }

    const convex = getConvexClient();

    const result = await convex.mutation(api.analyticsFns.track, {
      userId: userId as Id<"users">,
      eventType,
      metadata: metadata ? JSON.stringify(metadata) : undefined,
    });

    return NextResponse.json({ success: true, id: result.id });
  } catch (error) {
    console.error("Analytics track error:", error);
    return NextResponse.json(
      { error: "Failed to track event" },
      { status: 500 }
    );
  }
}

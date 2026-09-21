import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// The board polls this and reloads itself when a new deploy is being served,
// so always-on screens (the shop TV) pick up releases without a hand touch.
export async function GET() {
  return NextResponse.json({ version: process.env.VERCEL_GIT_COMMIT_SHA ?? "dev" });
}

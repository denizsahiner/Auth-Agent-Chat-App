import { NextRequest, NextResponse } from "next/server";
import { saveMessage } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { userId, content, role } = await req.json();
    const messageId = await saveMessage(userId, content, role);
    return NextResponse.json({ id: messageId });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to save message" }, { status: 500 });
  }
}

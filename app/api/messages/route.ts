import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getMessages } from "@/lib/db";

export async function GET(_request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const {
      data: { session },
    } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's encrypted messages and decrypt them
    const messages = await getMessages(session.user.id);
    
    return NextResponse.json({
      messages,
      count: messages.length
    });

  } catch (error) {
    console.error("Messages API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}
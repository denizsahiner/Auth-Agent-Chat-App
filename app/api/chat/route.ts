import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { GenerateAIResponse } from "@/lib/agent";
import { saveMessage } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const { messages } = await request.json();
    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: "Invalid messages format" }),
        {
          status: 400,
        }
      );
    }

    // 1. User mesajını kaydet
    const lastUserMessage = messages[messages.length - 1];
    console.log("Saving message to DB:", lastUserMessage.content);
    const messageId = await saveMessage(
      session.user.id,
      lastUserMessage.content,
      "user"
    );
    console.log("Saved message id:", messageId);

    // 2. AI cevabını üret (stream geliyor)
    const result = await GenerateAIResponse(messages);
    const streamResponse = await result.toTextStreamResponse();

    // 3. Orijinal stream’i clone et ve content yakala
    const reader = streamResponse.body!.getReader();
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    let fullAIResponse = "";

    const stream = new ReadableStream({
      async start(controller) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          // Orijinal chunk'ı client’a gönder
          controller.enqueue(value);

          // İçerik yakalama
          const textChunk = decoder.decode(value, { stream: true });
          try {
            // data: {...}\n\n formatını parse et
            if (textChunk.startsWith("data: ")) {
              const jsonStr = textChunk.replace(/^data:\s*/, "").trim();
              if (jsonStr !== "[DONE]") {
                const parsed = JSON.parse(jsonStr);
                const delta = parsed?.choices?.[0]?.delta?.content;
                if (delta) {
                  fullAIResponse += delta;
                }
              }
            }
          } catch (err) {
            console.error("Parse error:", err);
          }
        }

        controller.close();

        // 4. Stream bitince AI mesajını DB’ye kaydet
        if (fullAIResponse.trim()) {
          try {
            await saveMessage(session.user.id, fullAIResponse, "assistant");
          } catch (dbErr) {
            console.error("Failed to save AI response:", dbErr);
          }
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process chat request" }),
      { status: 500 }
    );
  }
}

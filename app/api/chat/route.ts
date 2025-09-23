import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { GenerateAIResponse } from "@/lib/agent";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const {
      data: { session },
    } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { messages } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Invalid messages format" },
        { status: 400 }
      );
    }

    // Real AI response with Groq
    const result = await GenerateAIResponse(messages);
    
    // Return Vercel AI SDK streaming response
    return result.toTextStreamResponse();
  
  } catch (error) {
    console.error("Chat API error:", error);
    
    // Fallback to mock if AI fails
    const mockResponse = "Sorry, I'm having trouble connecting to the AI service. This is a fallback response.";
    
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        const words = mockResponse.split(' ');
        let wordIndex = 0;
        
        const pushWord = () => {
          if (wordIndex < words.length) {
            const word = words[wordIndex] + (wordIndex < words.length - 1 ? ' ' : '');
            const chunk = encoder.encode(`data: ${JSON.stringify({
              choices: [{ delta: { content: word } }]
            })}\n\n`);
            
            controller.enqueue(chunk);
            wordIndex++;
            setTimeout(pushWord, 50);
          } else {
            controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
            controller.close();
          }
        };
        
        setTimeout(pushWord, 100);
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  }
}
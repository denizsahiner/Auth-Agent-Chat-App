import { groq } from "@ai-sdk/groq";
import { streamText } from "ai";

export async function GenerateAIResponse(
  messages: Array<{ role: string; content: string }>
) {
  try {
    const result = await streamText({
      model: groq("llama-3.1-8b-instant"),
      messages: [
        {
          role: "system",
          content:
            "You are basic chatbot." +
            "You are AI assistant, be polite and friendly." +
            "Do not keep your messages too long.",
        },
        ...messages.map((msg) => ({
          role: msg.role as "user" | "assistant",
          content: msg.content,
        })),
      ],
    });
    return result;
  } catch (error) {
    console.error("AI Generation error:", error);
    throw new Error("Failed to generate AI response");
  }
}

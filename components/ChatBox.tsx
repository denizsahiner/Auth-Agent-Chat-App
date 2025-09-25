"use client";

import { useEffect, useRef, useState } from "react";
import MessageBubble from "./MessageBubble";
import { signOut } from "@/lib/auth";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

export default function ChatBox({ sessionUserId }: { sessionUserId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Scroll container ref
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom using container.scrollTo
  const scrollToBottom = () => {
    const container = messagesContainerRef.current;
    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
    }
  };

  useEffect(() => {
    loadMessageHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleLogout = async () => {
    const result = await signOut();
    if (result.success) window.location.href = "/";
  };

  const loadMessageHistory = async () => {
    try {
      const response = await fetch("/api/messages");
      if (!response.ok) throw new Error("Failed to load messages");
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() && isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage.trim(),
      role: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const messageContent = inputMessage.trim();
    setInputMessage("");
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Chat API error");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body reader");

      const decoder = new TextDecoder();
      let aiMessageContent = "";
      const aiMessageId = (Date.now() + 1).toString();

      setMessages((prev) => [
        ...prev,
        {
          id: aiMessageId,
          content: "",
          role: "assistant",
          timestamp: new Date(),
        },
      ]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim();
            if (dataStr === '[DONE]') continue;
            try {
              const parsed = JSON.parse(dataStr);
              const delta = parsed?.choices?.[0]?.delta?.content;
              if (delta) aiMessageContent += delta;
            } catch {}
          } else {
            aiMessageContent += chunk;
          }
        }

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMessageId ? { ...msg, content: aiMessageContent } : msg
          )
        );
      }

      await fetch("/api/saveMessage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: sessionUserId,
          content: aiMessageContent,
          role: "assistant",
        }),
      });
    } catch (error) {
      console.error(error);
      setError(error instanceof Error ? error.message : "An error occurred");
      setMessages((prev) => prev.filter((msg) => msg.id !== userMessage.id));
      setInputMessage(messageContent);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto ">
      <div className=" p-4 flex justify-between items-center rounded-2xl">
        <h1 className="text-2xl text-[#D3DAD9] ">AI Chat</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 text-sm bg-[#715A5A] text-white rounded-md hover:bg-red-900 transition-colors cursor-pointer"
        >
          Logout
        </button>
      </div>

      <div
        ref={messagesContainerRef}
        className="flex-1 p-4 space-y-4 overflow-y-auto scrollbar"
      >
        {messages.length === 0 ? (
          <div className=" text-center text-[#8B8994]">
            <p>Send message to get started.</p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))
        )}

        {error && (
          <div className="bg-red-900/30 border border-red-700/50 rounded-md p-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-red-300">Error: {error}</p>
              <button
                onClick={() => setError(null)}
                className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="p-4">
        <form onSubmit={handleSendMessage} className="flex space-x-4 ">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-[#44444E] border border-[#4A4855] text-[#D3DAD9] rounded-3xl placeholder-[#8B8994]"
          />
          <button
            type="submit"
            disabled={isLoading || !inputMessage.trim()}
            className="px-6 py-2 bg-[#D3DAD9] text-[#44444E] rounded-md hover:bg-[#5D88B3] focus:outline-none focus:ring-2 focus:ring-[#739EC9] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition-colors"
          >
            {isLoading ? "Sending..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
}

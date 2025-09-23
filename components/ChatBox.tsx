"use client";

import { useEffect, useRef, useState } from "react";
import MessageBubble from "./MessageBubble";
import { signOut } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}
export default function ChatBox() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    const result = await signOut();
    if (result.success) {
      router.push("/");
    }
  };
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
    setInputMessage("");
    setIsLoading(true);
    setIsTyping(true);
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

      <div className="flex-1 overflow-y-auto p-4 space-y-4 ">
        {messages.length === 0 ? (
          <div className=" text-center text-[#8B8994]">
            <p>Send message to get started.</p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))
        )}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-[#4A4855] text-[#D3DAD9] rounded-lg px-4 py-2 max-w-xs">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-[#739EC9] rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-[#739EC9] rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-[#739EC9] rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
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

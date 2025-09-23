import React from "react";

interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg text-base ${
          isUser
            ? "bg-[#44444E] text-white rounded-br-none"
            : "bg-[#4A4855] text-[#D3DAD9] rounded-bl-none"
        }`}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  );
}

"use client";

import React, { FormEvent, useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatWindowProps {
  messages: ChatMessage[];
  onSend: (content: string) => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  onSend,
}) => {
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  // auto-scroll to bottom on new message
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function submitDraft() {
    const text = draft.trim();
    if (!text) return;
    onSend(text);
    setDraft("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submitDraft();
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    submitDraft();
  }

  return (
    <Card>
      <CardContent className="flex flex-col h-[500px]">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 px-2">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`max-w-[80%] p-3 rounded-lg ${
                m.role === "user"
                  ? "self-end bg-indigo-100 text-right"
                  : "self-start bg-gray-100 text-left"
              }`}
            >
              {m.content}
            </div>
          ))}
          <div ref={endRef} />
        </div>

        {/* Input area */}
        <form onSubmit={handleSubmit} className="mt-4">
          <textarea
            className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            rows={3}
            placeholder="Type your message…"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}          // ← intercept Enter
          />
          <div className="flex justify-end mt-2">
            <Button type="submit">Send</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

// components/ChatWindow.tsx
"use client";

import React, { FormEvent, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { UIMessage } from "@ai-sdk/ui-utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

interface ChatWindowProps {
  messages: UIMessage[];
  inputValue: string;
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (e?: FormEvent) => void;
  isLoading: boolean;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  inputValue,
  onInputChange,
  onSubmit,
  isLoading,
}) => {
  const endRef = useRef<HTMLDivElement>(null);

  // auto-scroll on new messages
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <Card>
      <CardContent className="flex flex-col h-[500px]">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`
                flex mb-2
                ${msg.role === "user" ? "justify-end" : "justify-start"}
              `}
            >
              <div
                className={`
                  inline-block rounded-lg px-4 py-2
                  max-w-[70%]
                  ${msg.role === "user"
                    ? "bg-blue-100 text-right text-black"
                    : "bg-gray-100 text-left text-gray-900"}
                `}
              >
                {msg.parts.map((part, j) => {
                  if (part.type === "text") {
                    return (
                      <div key={j} className="prose max-w-none">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          rehypePlugins={[rehypeRaw]}
                        >
                          {part.text}
                        </ReactMarkdown>
                      </div>
                    );
                  }
                  if (part.type === "reasoning") {
                    if (!isLoading) return null;
                    const reasoning = part;
                    return (
                      <pre
                        key={j}
                        className="bg-gray-50 p-2 rounded text-sm font-mono overflow-auto"
                      >
                        {reasoning.details.map((detail, k) =>
                          detail.type === "text" ? (
                            <ReactMarkdown
                              key={k}
                              remarkPlugins={[remarkGfm]}
                              rehypePlugins={[rehypeRaw]}
                            >
                              {detail.text}
                            </ReactMarkdown>
                          ) : (
                            <span key={k}>&lt;redacted&gt;</span>
                          )
                        )}
                      </pre>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>

        {/* Input area */}
        <form onSubmit={onSubmit} className="mt-4 px-4">
          <textarea
            className="w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            rows={3}
            placeholder="Type your message…"
            value={inputValue}
            onChange={onInputChange}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
          />
          <div className="flex justify-end mt-2">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "…" : "Send"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

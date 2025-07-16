"use client";

import React, { FormEvent, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Send, Bot } from "lucide-react";
import type { UIMessage } from "@ai-sdk/ui-utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

interface ChatWindowProps {
  messages: UIMessage[];
  inputValue: string;
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: (e?: FormEvent) => void;
  status: string;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  inputValue,
  onInputChange,
  onSubmit,
  status,
}) => {
  const endRef = useRef<HTMLDivElement>(null);
  const isLoading = status === 'streaming' ? true : false;

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
    <div className="flex flex-col flex-1 h-full">
      <div className="flex-1 overflow-y-auto px-40 py-4 space-y-4">
        {/* Messages Box */}
       {status === "error" && (
         <div className="bg-red-100 border border-red-300 text-red-700 p-3 rounded-md flex items-center justify-between">
           <span>Something went wrong. Please try again</span>
           </div>
        )}
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <Bot className="h-12 w-12 mx-auto mb-4 opacity-50 block" />
            <div>Ready to chat? Just type anything and I’ll be here to help!</div>
          </div>
        ) : (
        messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`inline-block px-4 py-2 rounded-lg] ${
                msg.role === "user"
                  ? "bg-indigo-100 text-right text-black max-w-[50%]"
                  : "bg-white text-left text-gray-900 max-w-[80%]"
              }`}
            >
              {msg.parts.map((part, j) => {
                if (part.type === "text") {
                  return (
                    <div key={j} className="prose max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
                        {part.text}
                      </ReactMarkdown>
                    </div>
                  );
                }
                if (part.type === "reasoning" && isLoading) {
                  const reasoning = part;
                  return (
                    <pre
                      key={j}
                      className="bg-gray-50 p-2 rounded text-sm font-mono"
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
        )))}
        <div ref={endRef} />
      </div>

      {/* Input Box */}
      <form
        onSubmit={onSubmit}
        className="px-6 py-4 border-t border-gray-200 bg-white flex items-end space-x-3"
      >
        <textarea
          className="flex-1 rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
          rows={2}
          placeholder="Type your message…"
          value={inputValue}
          onChange={onInputChange}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
        />
        {status === 'submitted' && messages[messages.length - 1]?.role === "user" ? (
          <div className="flex justify-center">
            <div className="w-6 h-6 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
          </div>) :
          (<Button className="bg-gradient-to-r from-purple-500 to-pink-500" type="submit" disabled={isLoading}>
            <Send></Send>
          </Button>
        )}
      </form>
    </div>
  );
};
"use client";

import React, { useEffect, useState } from "react";
import { ModelSelector } from "@/components/model-selector";
import { ChatWindow, ChatMessage } from "@/components/chat-window";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Model {
  title: string;
  name: string;
  description: string;
}

export default function Page() {
  const [models, setModels] = useState<Model[]>([]);
  const [loadingModels, setLoadingModels] = useState(true);
  const [modelsError, setModelsError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // fetch models ONCE
  useEffect(() => {
    async function loadModels() {
      try {
        const res = await fetch("https://app.fireworks.ai/api/models/mini-playground");
        if (!res.ok) throw new Error(res.statusText);
        const data: Model[] = await res.json();
        setModels(data);
      } catch (err: any) {
        setModelsError(err.message);
      } finally {
        setLoadingModels(false);
      }
    }
    loadModels();
  }, []);

  // default to first model once list arrives
  useEffect(() => {
    if (!selectedModel && models.length > 0) {
      setSelectedModel(models[0].name);
    }
  }, [models, selectedModel]);

  async function handleSend(prompt: string) {
    // 1) Append the user’s message immediately
    setMessages((ms) => [
      ...ms,
      { role: "user" as const, content: prompt },
    ]);
  
    // 2) Kick off the proxy‐to‐Fireworks endpoint
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: selectedModel,  // your model.name
        prompt,
      }),
    });
  
    if (!res.ok) {
      console.error("Chat API error:", await res.text());
      // you might want to append an error message here
      return;
    }
  
    // 3) Read the SSE stream
    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let buf = "";
  
    // Start an empty assistant message
    setMessages((ms) => [
      ...ms,
      { role: "assistant" as const, content: "" },
    ]);
  
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
  
      // Decode incoming bytes and accumulate
      buf += decoder.decode(value, { stream: true });
      const parts = buf.split(/\r?\n/);
      buf = parts.pop()!; // leftover partial line
  
      for (const line of parts) {
        // Only lines that start with "data:"
        if (!line.startsWith("data:")) continue;
        const payload = line.replace(/^data:\s*/, "");
  
        if (payload === "[DONE]") {
          // Stream finished
          return;
        }
  
        // Parse the chunk JSON
        let chunk: any;
        try {
          chunk = JSON.parse(payload);
        } catch (err) {
          console.warn("Could not JSON.parse SSE payload:", payload);
          continue;
        }
  
        // Extract the new token (if any)
        const delta = chunk.choices?.[0]?.delta;
        const token = delta?.content;
        if (!token) continue;
  
        // Append the token to the last assistant message
        setMessages((ms) => {
          const last = ms[ms.length - 1];
          if (last.role !== "assistant") {
            // Just in case, start a new assistant message
            return [...ms, { role: "assistant", content: token }];
          }
          // Otherwise, mutate the last one
          const updated = { ...last, content: last.content + token };
          return [...ms.slice(0, -1), updated];
        });
      }
    }
  }
  
  
  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <ModelSelector
        models={models}
        loading={loadingModels}
        error={modelsError}
        selectedModel={selectedModel}
        onChange={setSelectedModel}
      />

      <ChatWindow
        messages={messages}
        onSend={handleSend}
      />
    </div>
  );
}

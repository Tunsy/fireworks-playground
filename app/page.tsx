"use client";

import React, { useEffect, useState } from "react";
import { ModelSelector } from "@/components/model-selector";
import { ChatWindow } from "@/components/chat-window";
import { useChat } from '@ai-sdk/react';


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
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    status,
  } = useChat({
    api: "/api/chat",
    body: { model: selectedModel },
  });

  // Fetch models on load
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

  // Default to first model once list arrives
  useEffect(() => {
    if (!selectedModel && models.length > 0) {
      setSelectedModel(models[0].name);
    }
  }, [models, selectedModel]);
  
  return (
    <div className="flex h-screen">
      {/* LEFT COLUMN */}
      <aside className="w-132 border-r border-gray-200 px-8 py-6 overflow-auto flex flex-col justify-between">
        <div>
          <div className="px-6 pt-2 pb-8 border-gray-200">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-500 to-pink-500 bg-clip-text text-transparent leading-[1.1]">Model Playground</h1>
          </div>
          <ModelSelector
            models={models}
            loading={loadingModels}
            error={modelsError}
            selectedModel={selectedModel}
            onChange={setSelectedModel}
          />
        </div>
        <div className="px-4 py-4 text-center text-xs text-gray-500">
          Made by Jonathan Nguyen
        </div>
      </aside>

      {/* RIGHT COLUMN */}
      <main className="flex-1 flex flex-col bg-gray-50 h-full">
        <ChatWindow
          messages={messages}
          inputValue={input}
          onInputChange={handleInputChange}
          onSubmit={handleSubmit}
          status={status}
        />
      </main>
    </div>
  );
}
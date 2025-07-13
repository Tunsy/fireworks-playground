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
    isLoading: isSending,
  } = useChat({
    api: "/api/chat",
    body: { model: selectedModel }, // passed along every request
  });

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
        inputValue={input}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
        isLoading={isSending}
      />
    </div>
  );
}

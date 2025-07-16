"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

interface Model {
  title: string;
  name: string;
  description: string;
}

interface ModelSelectorProps {
  models: Model[];
  loading: boolean;
  error: string | null;
  selectedModel: string;
  onChange: (modelId: string) => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  models,
  loading,
  error,
  selectedModel,
  onChange,
}) => {

  if (error) {
    return (
      <Card className="mb-4">
        <CardContent className="text-red-500">Error: {error}</CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-4 gap-2">
      <CardHeader>
        <CardTitle className="text-2xl bold">Model Selection</CardTitle>
      </CardHeader>
      <CardContent>
        { loading ? <p className="text-gray-600">Loading models...</p>: 
          <Select
            className="rounded-md border border-gray-200 bg-white px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            value={selectedModel}
            onValueChange={onChange}
          >
            <div className="text-gray-600 pb-3">Select from a list of Fireworks models</div>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a model" />
            </SelectTrigger>
            <SelectContent>
              {models.map((model) => (
                <SelectItem key={model.name} value={model.name}>
                  <div className="flex flex-col items-start">
                    <span className="font-medium">{model.title}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      </CardContent>
    </Card>
  );
};

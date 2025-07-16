// app/api/chat/route.ts
import { NextRequest } from "next/server";
import { createFireworks } from '@ai-sdk/fireworks'
import { streamText, wrapLanguageModel, extractReasoningMiddleware  } from 'ai';

export const runtime = "edge";

const fireworks = createFireworks({
  apiKey: process.env.FIREWORKS_API_KEY ?? '',
});


export async function POST(request: NextRequest) {
  const { model, messages } = await request.json();

  if (!fireworks) {
    return new Response("FIREWORKS_API_KEY not set", { status: 500 });
  }

  const enhancedModel = wrapLanguageModel({
    model: fireworks(model),
    middleware: extractReasoningMiddleware({ tagName: 'think' }),
  });

  const result = streamText({
    model: enhancedModel,
    messages,
  });

  return result.toDataStreamResponse({
    sendReasoning: false,
  });
}

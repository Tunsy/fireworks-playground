// app/api/chat/route.ts
import { NextRequest } from "next/server";
import OpenAI from "openai";

export const runtime = "edge";

// initialize the SDK to point at Fireworks’ inference endpoint
const openai = new OpenAI({
  apiKey: process.env.FIREWORKS_API_KEY,
  baseURL: "https://api.fireworks.ai/inference/v1",
});

export async function POST(request: NextRequest) {
  const { model, prompt } = await request.json();

  if (!openai.apiKey) {
    return new Response("FIREWORKS_API_KEY not set", { status: 500 });
  }

  // kick off a streaming chat completion
  const stream = await openai.chat.completions.create({
    model,
    messages: [{ role: "user", content: prompt }],
    stream: true,
  });

  // for (let chunk of stream):
  //   print(chunk.choices[0].text)
  // console.log(prompt);
  // console.log(stream);
  // debugger;

  // for await (const event of stream) {
  //   console.log(event);
  // }

  // pipe the SDK’s ReadableStream right back to the client
  // Wrap it as a real text/event-stream
  const encoder = new TextEncoder();
  const sseStream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          // chunk is the JSON object
          const payload = JSON.stringify(chunk);
          controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
        }
        // signal done
        controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
      } catch (err) {
        controller.error(err);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(sseStream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}

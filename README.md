# Fireworks Model Playground

A simple Next.js + React + Tailwind interface for experimenting with Fireworks AI models in a chat-style playground. Users can pick from a list of serverless models, send prompts, and see streaming responses in real time.

See the project live at https://fireworks-playground.vercel.app/


## How to run it locally

1. **Clone the repo**  
   ```bash
   git clone git@github.com:<your-username>/fireworks-playground.git
   cd fireworks-playground

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install

3. **Setup API KEY**
   ```bash  
    FIREWORKS_API_KEY=<your-api-key>
4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev

Open http://localhost:3000 in your browser.


## Notes on design decisions
Next.js App Router with use client for interactive components.

Tailwind CSS (with the Typography plugin) for utility-first styling and automatic prose formatting.

Shadcn/UI components (Card, Button, Select) for a consistent look without heavy dependencies.

@ai-sdk/react’s useChat hook under the hood, proxying through our own /api/chat route which uses the OpenAI SDK pointed at Fireworks.

react-markdown to render formatted HTML


## Potential improvements
Model info panel: show model metadata (token limits, cost per token, etc.).

History & persistence: save chat history to local storage or a backend for reopening past sessions.

Reasoning: properly implement rendering of reasoning and chain of thought process for certain models.
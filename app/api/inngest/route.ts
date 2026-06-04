import { serve } from "inngest/next";
import { inngest } from "../../../inngest/client";
import { helloWorld } from "@/inngest/functions/helloWorld";
import { generateScreens } from "@/inngest/functions/generateScreens";

// AI screen generation steps (gpt-4o + tool calls) can run long.
// Without this, each Inngest step inherits Vercel's short default timeout,
// gets killed mid-generation, then retried — which is why generation hangs.
// Vercel caps this to the plan's max (Hobby 60s, Pro up to 300s) automatically.
export const runtime = "nodejs";
export const maxDuration = 300;

// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    helloWorld,
    generateScreens
  ],
});
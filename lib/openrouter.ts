import { openai } from "@ai-sdk/openai";

// Validate API key exists
if (!process.env.OPENAI_API_KEY) {
  console.error("⚠️  OPENAI_API_KEY is not set in environment variables");
  console.error("   Please add OPENAI_API_KEY to your .env file");
  console.error("   Get your API key from: https://platform.openai.com/api-keys");
} else if (process.env.OPENAI_API_KEY.length < 20) {
  console.warn("⚠️  OPENAI_API_KEY appears to be invalid (too short)");
}

// Export OpenAI model factory function
// The API key is automatically read from OPENAI_API_KEY environment variable
// Usage: openaiClient("gpt-4o") or openaiClient("gpt-4o-mini")
export const openaiClient = openai;
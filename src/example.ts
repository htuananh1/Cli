/**
 * Example usage of AI Gateway - similar to the CLI but as a TypeScript script
 * This demonstrates the same functionality as the CLI in programmatic form
 */

import OpenAI from 'openai';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize the client
const client = new OpenAI({
  apiKey: process.env.AI_GATEWAY_API_KEY,
  baseURL: 'https://ai-gateway.vercel.sh/v1',
});

async function main() {
  // Make a chat completion request
  const response = await client.chat.completions.create({
    model: 'deepseek/deepseek-v3.2-exp',
    messages: [
      {
        role: 'user',
        content: 'Why is the sky blue?',
      },
    ],
  });

  // Print the response
  console.log(response.choices[0].message.content);
}

main().catch(console.error);

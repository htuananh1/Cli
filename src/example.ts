/**
 * Example: Using AI Gateway CLI programmatically
 */

import OpenAI from 'openai';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
  // Initialize client
  const client = new OpenAI({
    apiKey: process.env.AI_GATEWAY_API_KEY,
    baseURL: 'https://ai-gateway.vercel.sh/v1',
  });

  console.log('🤖 AI Gateway Example\n');

  // Example 1: Simple chat
  console.log('Example 1: Simple chat');
  const response1 = await client.chat.completions.create({
    model: 'deepseek/deepseek-v3.2-exp',
    messages: [
      {
        role: 'user',
        content: 'Say hello in one sentence',
      },
    ],
  });
  console.log('Response:', response1.choices[0].message.content);
  console.log();

  // Example 2: Streaming
  console.log('Example 2: Streaming response');
  const stream = await client.chat.completions.create({
    model: 'deepseek/deepseek-v3.2-exp',
    messages: [
      {
        role: 'user',
        content: 'Count from 1 to 5',
      },
    ],
    stream: true,
  });

  process.stdout.write('Response: ');
  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || '';
    process.stdout.write(content);
  }
  console.log('\n');

  // Example 3: With system prompt
  console.log('Example 3: With system prompt');
  const response3 = await client.chat.completions.create({
    model: 'deepseek/deepseek-v3.2-exp',
    messages: [
      {
        role: 'system',
        content: 'You are a helpful coding assistant. Always use code examples.',
      },
      {
        role: 'user',
        content: 'How do I reverse a string in JavaScript?',
      },
    ],
  });
  console.log('Response:', response3.choices[0].message.content);
  console.log();

  // Example 4: Multi-turn conversation
  console.log('Example 4: Multi-turn conversation');
  const conversation: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
    {
      role: 'user',
      content: 'My name is Alice',
    },
  ];

  const response4a = await client.chat.completions.create({
    model: 'deepseek/deepseek-v3.2-exp',
    messages: conversation,
  });
  
  console.log('User: My name is Alice');
  console.log('Assistant:', response4a.choices[0].message.content);

  // Add to conversation
  conversation.push({
    role: 'assistant',
    content: response4a.choices[0].message.content || '',
  });
  conversation.push({
    role: 'user',
    content: "What's my name?",
  });

  const response4b = await client.chat.completions.create({
    model: 'deepseek/deepseek-v3.2-exp',
    messages: conversation,
  });

  console.log("User: What's my name?");
  console.log('Assistant:', response4b.choices[0].message.content);
  console.log();

  console.log('✅ All examples completed!');
}

main().catch(console.error);

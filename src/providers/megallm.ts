import OpenAI from 'openai';
import { AIProvider } from './mock.js'; // Assuming we re-use the interface
import { ChatMessage } from '../ui/types.js';
import { ContextManager } from '../core/context.js';

export class MegaLLMProvider implements AIProvider {
    private client: OpenAI;
    private contextManager: ContextManager;

    constructor() {
        const apiKey = process.env.MEGALLM_API_KEY;
        if (!apiKey) {
            console.warn('MEGALLM_API_KEY is not set. Provider may fail.');
        }

        this.client = new OpenAI({
            baseURL: 'https://ai.megallm.io/v1',
            apiKey: apiKey
        });

        // 32k limit, reserve 4k for output
        this.contextManager = new ContextManager(32000, 4000);
    }

    async sendMessage(messages: ChatMessage[]): Promise<string> {
        // Ensure system prompt exists
        let currentMessages = [...messages];
        if (!currentMessages.some(m => m.role === 'system')) {
            const systemPrompt: ChatMessage = {
                id: 'system',
                role: 'system',
                content: `You are an expert software engineer and CLI coding assistant.
Your goal is to help the user write, debug, and understand code.
You are running inside a terminal environment.

GUIDELINES:
1. Be concise and direct.
2. When asked to modify code, you MUST provide a valid patch in Unified Diff format.
3. Wrap the diff in a code block with the language set to 'diff'.
4. Format the diff like this:
\`\`\`diff
--- src/file.ts
+++ src/file.ts
@@ -1,3 +1,3 @@
-original line
+new line
\`\`\`
5. Do not include line numbers or timestamps in the diff header, just the filenames (e.g., a/path/to/file b/path/to/file or just path/to/file).
6. Always check the user's request carefully.
`,
                timestamp: Date.now()
            };
            currentMessages.unshift(systemPrompt);
        }

        // Prune context
        const prunedMessages = this.contextManager.pruneMessages(currentMessages);

        // Convert to OpenAI format
        const apiMessages = prunedMessages.map(msg => ({
            role: msg.role as 'user' | 'assistant' | 'system',
            content: msg.content
        }));

        try {
            const response = await this.client.chat.completions.create({
                model: 'deepseek-ai/deepseek-v3.1-terminus',
                messages: apiMessages
            });

            return response.choices[0]?.message?.content || 'No response received.';
        } catch (error: any) {
            console.error('MegaLLM Error:', error);
            return `Error communicating with MegaLLM: ${error.message}`;
        }
    }
}

export const megallmProvider = new MegaLLMProvider();

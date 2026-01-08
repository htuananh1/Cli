import { ChatMessage } from '../ui/types.js';

export interface AIProvider {
    sendMessage(messages: ChatMessage[]): Promise<string>;
}

export const MockProvider: AIProvider = {
    async sendMessage(messages: ChatMessage[]): Promise<string> {
        const lastMsg = messages[messages.length - 1];
        if (lastMsg.content.includes('patch')) {
            return `Here is a patch for you:
\`\`\`diff
--- src/test.ts
+++ src/test.ts
@@ -1,1 +1,1 @@
-console.log('hello');
+console.log('hello world');
\`\`\`
`;
        }
        return "I am a mock AI assistant. Ask me to generate a patch!";
    }
};

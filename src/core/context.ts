import { get_encoding } from 'tiktoken';
import { ChatMessage } from '../ui/types.js';

export class ContextManager {
    private encoder;
    private maxTokens: number;
    private reservedResponseTokens: number;

    constructor(maxTokens: number = 32000, reservedResponseTokens: number = 2000) {
        this.encoder = get_encoding('cl100k_base');
        this.maxTokens = maxTokens;
        this.reservedResponseTokens = reservedResponseTokens;
    }

    public countTokens(text: string): number {
        return this.encoder.encode(text).length;
    }

    public pruneMessages(messages: ChatMessage[]): ChatMessage[] {
        if (messages.length === 0) return [];

        const systemMessage = messages.find(m => m.role === 'system');
        const lastUserMessage = messages[messages.length - 1];

        // Essential messages that must be kept
        const essentialMessages = [
            ...(systemMessage ? [systemMessage] : []),
            ...(lastUserMessage && lastUserMessage !== systemMessage ? [lastUserMessage] : [])
        ];

        // Ensure we don't duplicate if system message was the last message (unlikely but possible)
        const uniqueEssentialMessages = Array.from(new Set(essentialMessages));

        let currentTokens = uniqueEssentialMessages.reduce((acc, msg) => acc + this.countTokens(msg.content), 0);
        const availableTokens = this.maxTokens - this.reservedResponseTokens;

        if (currentTokens > availableTokens) {
            // Edge case: System prompt + last message is already too big.
            // We might need to truncate the last message, but for now, let's just warn or return what we have.
            // In a real scenario, we might truncate the content of the last message.
            console.warn('Warning: Essential messages exceed token limit. Truncation may occur.');
            return uniqueEssentialMessages;
        }

        // We want to keep as many recent messages as possible.
        // So we iterate backwards from the second-to-last message.
        const keptMessages: ChatMessage[] = [];

        // Filter out system and last message from the middle pool
        const middleMessages = messages.filter(m => m !== systemMessage && m !== lastUserMessage);

        for (let i = middleMessages.length - 1; i >= 0; i--) {
            const msg = middleMessages[i];
            const tokens = this.countTokens(msg.content);
            if (currentTokens + tokens <= availableTokens) {
                keptMessages.unshift(msg);
                currentTokens += tokens;
            } else {
                break; // Stop once we hit the limit
            }
        }

        // Reconstruct the final list in chronological order
        const result: ChatMessage[] = [];
        if (systemMessage) result.push(systemMessage);
        result.push(...keptMessages);
        if (lastUserMessage && lastUserMessage !== systemMessage) result.push(lastUserMessage);

        return result;
    }

    public dispose() {
        this.encoder.free();
    }
}

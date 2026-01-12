import { GoogleGenerativeAI } from '@google/generative-ai';
import { AIProvider } from './mock.js';
import { ChatMessage } from '../ui/types.js';

export class GeminiProvider implements AIProvider {
    private client: GoogleGenerativeAI;
    private model: any;

    constructor() {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.warn('GEMINI_API_KEY is not set. Provider may fail.');
        }

        this.client = new GoogleGenerativeAI(apiKey || '');
        this.model = this.client.getGenerativeModel({ model: 'gemini-pro' });
    }

    async sendMessage(messages: ChatMessage[]): Promise<string> {
        try {
            // Filter out system messages as Gemini handles them differently or we just prepend them
            // Gemini history structure: { role: 'user' | 'model', parts: [{ text: string }] }

            const history = messages
                .filter(msg => msg.role !== 'system') // We'll prepend system prompt to the first user message if needed, or rely on context
                .map(msg => ({
                    role: msg.role === 'assistant' ? 'model' : 'user',
                    parts: [{ text: msg.content }]
                }));

            // Extract system prompt if any
            const systemPrompt = messages.find(m => m.role === 'system');

            // If there's a system prompt, we might want to prepend it to the first message or use it in instruction
            // For simple chat, we'll start a chat session.

            // Note: startChat expects history to be previous messages. The last message is the new one to send.

            const lastMessage = history.pop();
            if (!lastMessage) return "No message to send.";

            const chat = this.model.startChat({
                history: history,
                generationConfig: {
                    maxOutputTokens: 4096,
                },
            });

            let msgToSend = lastMessage.parts[0].text;
            if (systemPrompt && history.length === 0) {
                // Prepend system prompt to the very first message if history was empty
                msgToSend = `${systemPrompt.content}\n\n${msgToSend}`;
            }

            const result = await chat.sendMessage(msgToSend);
            const response = await result.response;
            const text = response.text();

            return text;

        } catch (error: any) {
            console.error('Gemini Error:', error);
            return `Error communicating with Gemini: ${error.message}`;
        }
    }
}

export const geminiProvider = new GeminiProvider();

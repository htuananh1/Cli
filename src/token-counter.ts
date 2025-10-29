import { encoding_for_model, TiktokenModel } from 'tiktoken';
import OpenAI from 'openai';
import { Message } from './types';

export class TokenCounter {
  private encoding: any;
  private model: string;

  constructor(model: string = 'gpt-4') {
    this.model = model;
    try {
      // Map AI Gateway model names to tiktoken model names
      const tiktokenModel = this.mapToTiktokenModel(model);
      this.encoding = encoding_for_model(tiktokenModel);
    } catch (error) {
      // Fallback to cl100k_base encoding (used by GPT-4, GPT-3.5-turbo)
      this.encoding = encoding_for_model('gpt-4' as TiktokenModel);
    }
  }

  private mapToTiktokenModel(model: string): TiktokenModel {
    // Map various model names to tiktoken models
    if (model.includes('gpt-4')) return 'gpt-4' as TiktokenModel;
    if (model.includes('gpt-3.5')) return 'gpt-3.5-turbo' as TiktokenModel;
    // Default to gpt-4 for other models (most compatible)
    return 'gpt-4' as TiktokenModel;
  }

  countTokens(text: string): number {
    try {
      const tokens = this.encoding.encode(text);
      return tokens.length;
    } catch (error) {
      // Rough estimation: ~4 characters per token
      return Math.ceil(text.length / 4);
    }
  }

  countMessageTokens(message: Message): number {
    // Count tokens for a message (including role overhead)
    // OpenAI format: <|start|>{role}\n{content}<|end|>\n
    const roleTokens = 4; // Approximate overhead per message
    const contentTokens = this.countTokens(message.content);
    return roleTokens + contentTokens;
  }

  countMessagesTokens(messages: Message[]): number {
    let total = 0;
    for (const message of messages) {
      total += this.countMessageTokens(message);
    }
    // Add 3 tokens for priming (reply prefix)
    return total + 3;
  }

  estimateResponseTokens(messages: Message[], maxTokens?: number): { used: number; available: number; maxResponse: number } {
    const contextLimit = this.getModelContextLimit(this.model);
    const usedTokens = this.countMessagesTokens(messages);
    const availableTokens = contextLimit - usedTokens;
    const maxResponseTokens = maxTokens 
      ? Math.min(maxTokens, availableTokens)
      : Math.min(4096, availableTokens); // Default max response: 4096 tokens

    return {
      used: usedTokens,
      available: availableTokens,
      maxResponse: maxResponseTokens,
    };
  }

  getModelContextLimit(model: string): number {
    // Return context window size for different models
    if (model.includes('gpt-4-turbo') || model.includes('gpt-4-1106')) return 128000;
    if (model.includes('gpt-4-32k')) return 32768;
    if (model.includes('gpt-4')) return 8192;
    if (model.includes('gpt-3.5-turbo-16k')) return 16384;
    if (model.includes('gpt-3.5')) return 4096;
    if (model.includes('claude-3')) return 200000;
    if (model.includes('claude-2')) return 100000;
    if (model.includes('deepseek')) return 32768;
    if (model.includes('gemini')) return 32768;
    // Default: 8k context
    return 8192;
  }

  trimMessages(messages: Message[], maxTokens: number): Message[] {
    // Keep system message if present
    const systemMessages = messages.filter(m => m.role === 'system');
    const nonSystemMessages = messages.filter(m => m.role !== 'system');

    let trimmedMessages: Message[] = [...systemMessages];
    let currentTokens = this.countMessagesTokens(trimmedMessages);

    // Add messages from most recent, staying under maxTokens
    for (let i = nonSystemMessages.length - 1; i >= 0; i--) {
      const msg = nonSystemMessages[i];
      const msgTokens = this.countMessageTokens(msg);
      
      if (currentTokens + msgTokens <= maxTokens) {
        trimmedMessages.splice(systemMessages.length, 0, msg);
        currentTokens += msgTokens;
      } else {
        break;
      }
    }

    return trimmedMessages;
  }

  async summarizeOldMessages(messages: Message[], keepRecent: number = 10): Promise<Message[]> {
    // This is a placeholder for summarization logic
    // In a real implementation, you would use the AI to summarize old messages
    const systemMessages = messages.filter(m => m.role === 'system');
    const nonSystemMessages = messages.filter(m => m.role !== 'system');

    if (nonSystemMessages.length <= keepRecent) {
      return messages;
    }

    const oldMessages = nonSystemMessages.slice(0, -keepRecent);
    const recentMessages = nonSystemMessages.slice(-keepRecent);

    // Create a simple summary message
    const summaryContent = `[Previous conversation summary: ${oldMessages.length} messages exchanged]`;
    const summaryMessage: Message = {
      role: 'system',
      content: summaryContent,
      timestamp: Date.now(),
      tokens: this.countTokens(summaryContent),
    };

    return [...systemMessages, summaryMessage, ...recentMessages];
  }

  free(): void {
    if (this.encoding && this.encoding.free) {
      this.encoding.free();
    }
  }

  formatTokenCount(tokens: number): string {
    if (tokens < 1000) {
      return `${tokens} tokens`;
    } else if (tokens < 1000000) {
      return `${(tokens / 1000).toFixed(1)}K tokens`;
    } else {
      return `${(tokens / 1000000).toFixed(2)}M tokens`;
    }
  }
}

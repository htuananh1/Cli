import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import { Conversation, ConversationSummary, Message } from './types';

export class ConversationManager {
  private storageDir: string;

  constructor(storageDir?: string) {
    this.storageDir = storageDir || path.join(os.homedir(), '.ai-gateway', 'conversations');
    this.ensureStorageDir();
  }

  private ensureStorageDir(): void {
    if (!fs.existsSync(this.storageDir)) {
      fs.mkdirSync(this.storageDir, { recursive: true });
    }
  }

  private getConversationPath(id: string): string {
    return path.join(this.storageDir, `${id}.json`);
  }

  generateId(): string {
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async save(conversation: Conversation): Promise<void> {
    const filePath = this.getConversationPath(conversation.id);
    await fs.writeJSON(filePath, conversation, { spaces: 2 });
  }

  async load(id: string): Promise<Conversation | null> {
    try {
      const filePath = this.getConversationPath(id);
      if (!fs.existsSync(filePath)) {
        return null;
      }
      return await fs.readJSON(filePath);
    } catch (error) {
      console.error('Error loading conversation:', error);
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const filePath = this.getConversationPath(id);
      if (fs.existsSync(filePath)) {
        await fs.remove(filePath);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting conversation:', error);
      return false;
    }
  }

  async list(): Promise<ConversationSummary[]> {
    try {
      const files = await fs.readdir(this.storageDir);
      const conversations: ConversationSummary[] = [];

      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(this.storageDir, file);
          const conv: Conversation = await fs.readJSON(filePath);
          conversations.push({
            id: conv.id,
            name: conv.name,
            model: conv.model,
            messageCount: conv.messages.length,
            totalTokens: conv.totalTokens,
            createdAt: conv.createdAt,
            updatedAt: conv.updatedAt,
          });
        }
      }

      // Sort by updatedAt descending
      return conversations.sort((a, b) => b.updatedAt - a.updatedAt);
    } catch (error) {
      console.error('Error listing conversations:', error);
      return [];
    }
  }

  async create(name: string, model: string, systemPrompt?: string): Promise<Conversation> {
    const id = this.generateId();
    const now = Date.now();
    const messages: Message[] = [];

    if (systemPrompt) {
      messages.push({
        role: 'system',
        content: systemPrompt,
        timestamp: now,
      });
    }

    const conversation: Conversation = {
      id,
      name,
      model,
      messages,
      totalTokens: 0,
      createdAt: now,
      updatedAt: now,
    };

    await this.save(conversation);
    return conversation;
  }

  async addMessage(conversationId: string, message: Message): Promise<Conversation | null> {
    const conversation = await this.load(conversationId);
    if (!conversation) {
      return null;
    }

    message.timestamp = Date.now();
    conversation.messages.push(message);
    conversation.totalTokens += message.tokens || 0;
    conversation.updatedAt = Date.now();

    await this.save(conversation);
    return conversation;
  }

  async export(id: string, outputPath: string): Promise<boolean> {
    try {
      const conversation = await this.load(id);
      if (!conversation) {
        return false;
      }

      // Export as markdown
      let markdown = `# ${conversation.name}\n\n`;
      markdown += `**Model**: ${conversation.model}\n`;
      markdown += `**Created**: ${new Date(conversation.createdAt).toLocaleString()}\n`;
      markdown += `**Total Tokens**: ${conversation.totalTokens}\n`;
      markdown += `**Messages**: ${conversation.messages.length}\n\n`;
      markdown += `---\n\n`;

      for (const msg of conversation.messages) {
        if (msg.role === 'system') {
          markdown += `## System Prompt\n\n${msg.content}\n\n---\n\n`;
        } else if (msg.role === 'user') {
          markdown += `### 👤 User\n\n${msg.content}\n\n`;
        } else if (msg.role === 'assistant') {
          markdown += `### 🤖 Assistant\n\n${msg.content}\n\n`;
        }
        
        if (msg.timestamp) {
          markdown += `*${new Date(msg.timestamp).toLocaleString()}*`;
          if (msg.tokens) {
            markdown += ` | Tokens: ${msg.tokens}`;
          }
          markdown += '\n\n';
        }
        markdown += `---\n\n`;
      }

      await fs.writeFile(outputPath, markdown, 'utf-8');
      return true;
    } catch (error) {
      console.error('Error exporting conversation:', error);
      return false;
    }
  }
}

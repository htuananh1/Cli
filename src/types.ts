import OpenAI from 'openai';

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp?: number;
  tokens?: number;
}

export interface Conversation {
  id: string;
  name: string;
  model: string;
  messages: Message[];
  totalTokens: number;
  createdAt: number;
  updatedAt: number;
}

export interface ConversationSummary {
  id: string;
  name: string;
  model: string;
  messageCount: number;
  totalTokens: number;
  createdAt: number;
  updatedAt: number;
}

export interface ChatOptions {
  model: string;
  system?: string;
  temperature: number;
  maxTokens?: number;
  stream: boolean;
  json: boolean;
  conversationId?: string;
  maxContextTokens?: number;
}

export interface InteractiveOptions {
  model: string;
  system?: string;
  temperature: number;
  conversationId?: string;
  maxContextTokens?: number;
  autoSave?: boolean;
}

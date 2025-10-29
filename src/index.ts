#!/usr/bin/env node

import { Command } from 'commander';
import OpenAI from 'openai';
import chalk from 'chalk';
import ora from 'ora';
import * as readline from 'readline';
import * as dotenv from 'dotenv';
import { ConversationManager } from './conversation-manager';
import { TokenCounter } from './token-counter';
import { ChatOptions, InteractiveOptions, Message, Conversation } from './types';

// Load environment variables
dotenv.config();

class AIGatewayCLI {
  private client: OpenAI;
  private apiKey: string;
  private baseUrl: string;
  private conversationManager: ConversationManager;
  private tokenCounter: TokenCounter;

  constructor(apiKey?: string, baseUrl?: string) {
    this.apiKey = apiKey || process.env.AI_GATEWAY_API_KEY || '';
    this.baseUrl = baseUrl || process.env.AI_GATEWAY_BASE_URL || 'https://ai-gateway.vercel.sh/v1';

    if (!this.apiKey) {
      console.error(chalk.red('Error: AI_GATEWAY_API_KEY environment variable not set or API key not provided'));
      process.exit(1);
    }

    this.client = new OpenAI({
      apiKey: this.apiKey,
      baseURL: this.baseUrl,
    });

    this.conversationManager = new ConversationManager();
    this.tokenCounter = new TokenCounter();
  }

  async chat(prompt: string, options: ChatOptions): Promise<void> {
    let conversation: Conversation | null = null;
    
    // Load conversation if ID provided
    if (options.conversationId) {
      conversation = await this.conversationManager.load(options.conversationId);
      if (!conversation) {
        console.error(chalk.red(`Error: Conversation ${options.conversationId} not found`));
        process.exit(1);
      }
      // Update token counter with conversation model
      this.tokenCounter = new TokenCounter(conversation.model);
    } else {
      this.tokenCounter = new TokenCounter(options.model);
    }

    const messages: Message[] = [];

    // Load existing messages if conversation exists
    if (conversation) {
      messages.push(...conversation.messages);
    } else if (options.system) {
      messages.push({
        role: 'system',
        content: options.system,
      });
    }

    // Add user message
    const userMessage: Message = {
      role: 'user',
      content: prompt,
      timestamp: Date.now(),
    };
    userMessage.tokens = this.tokenCounter.countMessageTokens(userMessage);
    messages.push(userMessage);

    // Check token limits and trim if necessary
    const maxContextTokens = options.maxContextTokens || this.tokenCounter.getModelContextLimit(options.model) - 4096;
    const currentTokens = this.tokenCounter.countMessagesTokens(messages);
    
    let finalMessages = messages;
    if (currentTokens > maxContextTokens) {
      console.log(chalk.yellow(`⚠️  Token limit exceeded (${this.tokenCounter.formatTokenCount(currentTokens)} > ${this.tokenCounter.formatTokenCount(maxContextTokens)})`));
      console.log(chalk.yellow('   Trimming old messages...'));
      finalMessages = this.tokenCounter.trimMessages(messages, maxContextTokens);
    }

    // Convert to OpenAI format
    const openaiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = finalMessages.map(m => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const baseOptions = {
        model: conversation?.model || options.model,
        messages: openaiMessages,
        temperature: options.temperature,
      };

      const maxTokensOptions = options.maxTokens ? { max_tokens: options.maxTokens } : {};

      if (options.stream) {
        const stream = await this.client.chat.completions.create({
          ...baseOptions,
          ...maxTokensOptions,
          stream: true,
        });
        
        process.stdout.write(chalk.cyan('Response: '));
        let fullResponse = '';

        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || '';
          fullResponse += content;
          process.stdout.write(content);
        }
        console.log(); // New line after streaming

        // Save assistant response
        const assistantMessage: Message = {
          role: 'assistant',
          content: fullResponse,
          timestamp: Date.now(),
        };
        assistantMessage.tokens = this.tokenCounter.countMessageTokens(assistantMessage);

        if (conversation) {
          await this.conversationManager.addMessage(conversation.id, userMessage);
          await this.conversationManager.addMessage(conversation.id, assistantMessage);
          console.log(chalk.gray(`\n💾 Saved to conversation: ${conversation.name}`));
        }

        if (options.json) {
          console.log(chalk.gray('\nJSON Output:'));
          console.log(JSON.stringify({
            model: options.model,
            content: fullResponse,
            tokens: assistantMessage.tokens,
            stream: true,
          }, null, 2));
        }
      } else {
        const tokenInfo = this.tokenCounter.estimateResponseTokens(finalMessages, options.maxTokens);
        const spinner = ora(`Thinking... (${this.tokenCounter.formatTokenCount(tokenInfo.used)} used)`).start();
        
        const response = await this.client.chat.completions.create({
          ...baseOptions,
          ...maxTokensOptions,
          stream: false,
        });
        spinner.stop();

        const content = response.choices[0].message.content || '';
        const assistantMessage: Message = {
          role: 'assistant',
          content,
          timestamp: Date.now(),
        };
        assistantMessage.tokens = this.tokenCounter.countMessageTokens(assistantMessage);

        if (conversation) {
          await this.conversationManager.addMessage(conversation.id, userMessage);
          await this.conversationManager.addMessage(conversation.id, assistantMessage);
        }

        if (options.json) {
          console.log(JSON.stringify({
            model: response.model,
            content,
            usage: {
              prompt_tokens: response.usage?.prompt_tokens,
              completion_tokens: response.usage?.completion_tokens,
              total_tokens: response.usage?.total_tokens,
            },
            finish_reason: response.choices[0].finish_reason,
            conversationId: conversation?.id,
          }, null, 2));
        } else {
          console.log(chalk.cyan('Response:'), content);
          console.log();
          console.log(chalk.gray(`Model: ${response.model}`));
          console.log(chalk.gray(`Tokens: ${response.usage?.total_tokens} (prompt: ${response.usage?.prompt_tokens}, completion: ${response.usage?.completion_tokens})`));
          
          if (conversation) {
            console.log(chalk.gray(`💾 Saved to: ${conversation.name} (${conversation.messages.length} messages, ${this.tokenCounter.formatTokenCount(conversation.totalTokens)})`));
          }
        }
      }
    } catch (error: any) {
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
  }

  async interactive(options: InteractiveOptions): Promise<void> {
    let conversation: Conversation | null = null;
    
    // Load or create conversation
    if (options.conversationId) {
      conversation = await this.conversationManager.load(options.conversationId);
      if (!conversation) {
        console.error(chalk.red(`Error: Conversation ${options.conversationId} not found`));
        process.exit(1);
      }
      console.log(chalk.green(`📂 Loaded conversation: ${conversation.name}`));
      console.log(chalk.gray(`   ${conversation.messages.length} messages, ${this.tokenCounter.formatTokenCount(conversation.totalTokens)}`));
    } else if (options.autoSave) {
      const name = `Chat ${new Date().toLocaleString()}`;
      conversation = await this.conversationManager.create(name, options.model, options.system);
      console.log(chalk.green(`💾 Created new conversation: ${conversation.name}`));
      console.log(chalk.gray(`   ID: ${conversation.id}`));
    }

    const model = conversation?.model || options.model;
    this.tokenCounter = new TokenCounter(model);

    console.log(chalk.green(`\nAI Gateway Interactive Chat (Model: ${model})`));
    console.log(chalk.gray("Commands: 'exit/quit' to end, 'clear' to clear history, 'save' to save conversation, 'tokens' to show token usage\n"));

    const messages: Message[] = conversation ? [...conversation.messages] : [];
    
    if (!conversation && options.system) {
      messages.push({
        role: 'system',
        content: options.system,
        timestamp: Date.now(),
      });
    }

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const askQuestion = (): Promise<string> => {
      return new Promise((resolve) => {
        rl.question(chalk.yellow('You: '), (answer) => {
          resolve(answer);
        });
      });
    };

    while (true) {
      try {
        const userInput = await askQuestion();

        if (!userInput.trim()) {
          continue;
        }

        // Handle special commands
        if (userInput.toLowerCase() === 'exit' || userInput.toLowerCase() === 'quit') {
          console.log(chalk.green('Goodbye!'));
          rl.close();
          break;
        }

        if (userInput.toLowerCase() === 'clear') {
          messages.length = 0;
          if (options.system) {
            messages.push({
              role: 'system',
              content: options.system,
              timestamp: Date.now(),
            });
          }
          console.log(chalk.gray('Chat history cleared.\n'));
          continue;
        }

        if (userInput.toLowerCase() === 'save') {
          if (!conversation) {
            const name = `Chat ${new Date().toLocaleString()}`;
            conversation = await this.conversationManager.create(name, model);
            // Add all existing messages
            for (const msg of messages) {
              conversation.messages.push(msg);
            }
            await this.conversationManager.save(conversation);
          }
          console.log(chalk.green(`💾 Saved conversation: ${conversation.name}`));
          console.log(chalk.gray(`   ID: ${conversation.id}`));
          continue;
        }

        if (userInput.toLowerCase() === 'tokens') {
          const totalTokens = this.tokenCounter.countMessagesTokens(messages);
          const limit = this.tokenCounter.getModelContextLimit(model);
          const percentage = ((totalTokens / limit) * 100).toFixed(1);
          
          console.log(chalk.cyan('\n📊 Token Usage:'));
          console.log(chalk.gray(`   Current: ${this.tokenCounter.formatTokenCount(totalTokens)}`));
          console.log(chalk.gray(`   Limit: ${this.tokenCounter.formatTokenCount(limit)}`));
          console.log(chalk.gray(`   Used: ${percentage}%`));
          console.log(chalk.gray(`   Messages: ${messages.length}\n`));
          continue;
        }

        // Add user message
        const userMessage: Message = {
          role: 'user',
          content: userInput,
          timestamp: Date.now(),
        };
        userMessage.tokens = this.tokenCounter.countMessageTokens(userMessage);
        messages.push(userMessage);

        // Check token limits
        const maxContextTokens = options.maxContextTokens || this.tokenCounter.getModelContextLimit(model) - 4096;
        const currentTokens = this.tokenCounter.countMessagesTokens(messages);
        
        let finalMessages = messages;
        if (currentTokens > maxContextTokens) {
          console.log(chalk.yellow(`⚠️  Token limit reached (${this.tokenCounter.formatTokenCount(currentTokens)}). Trimming old messages...\n`));
          finalMessages = this.tokenCounter.trimMessages(messages, maxContextTokens);
        }

        // Convert to OpenAI format
        const openaiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = finalMessages.map(m => ({
          role: m.role,
          content: m.content,
        }));

        const stream = await this.client.chat.completions.create({
          model,
          messages: openaiMessages,
          temperature: options.temperature,
          stream: true,
        });

        process.stdout.write(chalk.cyan('Assistant: '));
        let fullResponse = '';

        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || '';
          fullResponse += content;
          process.stdout.write(content);
        }
        console.log('\n');

        const assistantMessage: Message = {
          role: 'assistant',
          content: fullResponse,
          timestamp: Date.now(),
        };
        assistantMessage.tokens = this.tokenCounter.countMessageTokens(assistantMessage);
        messages.push(assistantMessage);

        // Auto-save if conversation exists
        if (conversation) {
          await this.conversationManager.addMessage(conversation.id, userMessage);
          await this.conversationManager.addMessage(conversation.id, assistantMessage);
        }

      } catch (error: any) {
        if (error.message.includes('canceled')) {
          console.log(chalk.green('\nGoodbye!'));
          rl.close();
          break;
        }
        console.error(chalk.red('\nError:'), error.message);
      }
    }

    process.on('SIGINT', () => {
      console.log(chalk.green('\nGoodbye!'));
      rl.close();
      process.exit(0);
    });
  }

  async listConversations(): Promise<void> {
    const conversations = await this.conversationManager.list();
    
    if (conversations.length === 0) {
      console.log(chalk.yellow('No saved conversations found.'));
      return;
    }

    console.log(chalk.green(`\n📚 Saved Conversations (${conversations.length}):\n`));
    
    for (const conv of conversations) {
      const date = new Date(conv.updatedAt).toLocaleString();
      console.log(chalk.cyan(`  ${conv.name}`));
      console.log(chalk.gray(`    ID: ${conv.id}`));
      console.log(chalk.gray(`    Model: ${conv.model} | Messages: ${conv.messageCount} | Tokens: ${this.tokenCounter.formatTokenCount(conv.totalTokens)}`));
      console.log(chalk.gray(`    Updated: ${date}\n`));
    }
  }

  async showConversation(id: string): Promise<void> {
    const conversation = await this.conversationManager.load(id);
    
    if (!conversation) {
      console.error(chalk.red(`Error: Conversation ${id} not found`));
      process.exit(1);
    }

    console.log(chalk.green(`\n📖 ${conversation.name}\n`));
    console.log(chalk.gray(`ID: ${conversation.id}`));
    console.log(chalk.gray(`Model: ${conversation.model}`));
    console.log(chalk.gray(`Messages: ${conversation.messages.length}`));
    console.log(chalk.gray(`Total Tokens: ${this.tokenCounter.formatTokenCount(conversation.totalTokens)}`));
    console.log(chalk.gray(`Created: ${new Date(conversation.createdAt).toLocaleString()}`));
    console.log(chalk.gray(`Updated: ${new Date(conversation.updatedAt).toLocaleString()}`));
    console.log(chalk.gray(`\n${'─'.repeat(60)}\n`));

    for (const msg of conversation.messages) {
      if (msg.role === 'system') {
        console.log(chalk.magenta('🔧 System:'), msg.content);
      } else if (msg.role === 'user') {
        console.log(chalk.yellow('\n👤 User:'), msg.content);
      } else if (msg.role === 'assistant') {
        console.log(chalk.cyan('\n🤖 Assistant:'), msg.content);
      }
      
      if (msg.timestamp) {
        const time = new Date(msg.timestamp).toLocaleTimeString();
        const tokenInfo = msg.tokens ? ` | ${msg.tokens} tokens` : '';
        console.log(chalk.gray(`   ${time}${tokenInfo}`));
      }
      console.log(chalk.gray(`   ${'─'.repeat(60)}`));
    }
  }

  async deleteConversation(id: string): Promise<void> {
    const success = await this.conversationManager.delete(id);
    
    if (success) {
      console.log(chalk.green(`✅ Deleted conversation: ${id}`));
    } else {
      console.error(chalk.red(`Error: Conversation ${id} not found`));
      process.exit(1);
    }
  }

  async exportConversation(id: string, outputPath: string): Promise<void> {
    const success = await this.conversationManager.export(id, outputPath);
    
    if (success) {
      console.log(chalk.green(`✅ Exported conversation to: ${outputPath}`));
    } else {
      console.error(chalk.red(`Error: Failed to export conversation ${id}`));
      process.exit(1);
    }
  }

  listModels(): void {
    console.log(chalk.green('Popular AI Gateway Models:'));
    const models = [
      'deepseek/deepseek-v3.2-exp',
      'openai/gpt-4-turbo',
      'openai/gpt-4',
      'openai/gpt-3.5-turbo',
      'anthropic/claude-3-opus',
      'anthropic/claude-3-sonnet',
      'anthropic/claude-3-haiku',
      'google/gemini-pro',
      'meta-llama/llama-3-70b',
      'mistralai/mixtral-8x7b',
    ];

    models.forEach((model) => {
      const contextLimit = this.tokenCounter.getModelContextLimit(model);
      console.log(chalk.cyan(`  - ${model}`) + chalk.gray(` (${this.tokenCounter.formatTokenCount(contextLimit)})`));
    });
  }
}

// CLI Setup
const program = new Command();

program
  .name('ai-gateway')
  .description('AI Gateway CLI - Interact with AI models through the AI Gateway')
  .version('2.0.0')
  .option('--api-key <key>', 'API key (overrides AI_GATEWAY_API_KEY env var)')
  .option('--base-url <url>', 'Base URL for AI Gateway');

program
  .command('chat <prompt>')
  .description('Send a single chat message')
  .option('-m, --model <model>', 'Model to use', 'deepseek/deepseek-v3.2-exp')
  .option('-s, --system <prompt>', 'System prompt')
  .option('-t, --temperature <number>', 'Temperature for sampling', '0.7')
  .option('--max-tokens <number>', 'Maximum tokens to generate')
  .option('--max-context-tokens <number>', 'Maximum tokens for context')
  .option('--stream', 'Stream the response')
  .option('--json', 'Output response as JSON')
  .option('-c, --conversation-id <id>', 'Continue from existing conversation')
  .action(async (prompt: string, cmdOptions: any) => {
    const globalOptions = program.opts();
    const cli = new AIGatewayCLI(globalOptions.apiKey, globalOptions.baseUrl);
    
    const options: ChatOptions = {
      model: cmdOptions.model,
      system: cmdOptions.system,
      temperature: parseFloat(cmdOptions.temperature),
      maxTokens: cmdOptions.maxTokens ? parseInt(cmdOptions.maxTokens) : undefined,
      maxContextTokens: cmdOptions.maxContextTokens ? parseInt(cmdOptions.maxContextTokens) : undefined,
      stream: cmdOptions.stream || false,
      json: cmdOptions.json || false,
      conversationId: cmdOptions.conversationId,
    };

    await cli.chat(prompt, options);
  });

program
  .command('interactive')
  .description('Start an interactive chat session')
  .option('-m, --model <model>', 'Model to use', 'deepseek/deepseek-v3.2-exp')
  .option('-s, --system <prompt>', 'System prompt')
  .option('-t, --temperature <number>', 'Temperature for sampling', '0.7')
  .option('-c, --conversation-id <id>', 'Continue from existing conversation')
  .option('--max-context-tokens <number>', 'Maximum tokens for context')
  .option('--auto-save', 'Automatically save conversation')
  .action(async (cmdOptions: any) => {
    const globalOptions = program.opts();
    const cli = new AIGatewayCLI(globalOptions.apiKey, globalOptions.baseUrl);
    
    const options: InteractiveOptions = {
      model: cmdOptions.model,
      system: cmdOptions.system,
      temperature: parseFloat(cmdOptions.temperature),
      conversationId: cmdOptions.conversationId,
      maxContextTokens: cmdOptions.maxContextTokens ? parseInt(cmdOptions.maxContextTokens) : undefined,
      autoSave: cmdOptions.autoSave || false,
    };

    await cli.interactive(options);
  });

program
  .command('conversations')
  .alias('convs')
  .description('List all saved conversations')
  .action(async () => {
    const globalOptions = program.opts();
    const cli = new AIGatewayCLI(globalOptions.apiKey, globalOptions.baseUrl);
    await cli.listConversations();
  });

program
  .command('show <conversation-id>')
  .description('Show a conversation')
  .action(async (id: string) => {
    const globalOptions = program.opts();
    const cli = new AIGatewayCLI(globalOptions.apiKey, globalOptions.baseUrl);
    await cli.showConversation(id);
  });

program
  .command('delete <conversation-id>')
  .alias('rm')
  .description('Delete a conversation')
  .action(async (id: string) => {
    const globalOptions = program.opts();
    const cli = new AIGatewayCLI(globalOptions.apiKey, globalOptions.baseUrl);
    await cli.deleteConversation(id);
  });

program
  .command('export <conversation-id> <output-path>')
  .description('Export a conversation to markdown')
  .action(async (id: string, outputPath: string) => {
    const globalOptions = program.opts();
    const cli = new AIGatewayCLI(globalOptions.apiKey, globalOptions.baseUrl);
    await cli.exportConversation(id, outputPath);
  });

program
  .command('list-models')
  .description('List available models with context limits')
  .action(() => {
    const globalOptions = program.opts();
    const cli = new AIGatewayCLI(globalOptions.apiKey, globalOptions.baseUrl);
    cli.listModels();
  });

// Show help if no command provided
if (process.argv.length === 2) {
  program.help();
}

program.parse(process.argv);

#!/usr/bin/env node

import { Command } from 'commander';
import OpenAI from 'openai';
import chalk from 'chalk';
import * as readline from 'readline';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

interface Config {
  apiKey: string;
  baseUrl: string;
  model: string;
  temperature: number;
  systemPrompt?: string;
}

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

class GeminiStyleCLI {
  private client: OpenAI;
  private config: Config;
  private conversationHistory: Message[] = [];

  constructor(config: Config) {
    this.config = config;
    
    if (!config.apiKey) {
      console.error(chalk.red('Error: AI_GATEWAY_API_KEY environment variable not set'));
      console.error(chalk.gray('Set it with: export AI_GATEWAY_API_KEY="your-key"'));
      process.exit(1);
    }

    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseUrl,
    });

    // Add system prompt if provided
    if (config.systemPrompt) {
      this.conversationHistory.push({
        role: 'system',
        content: config.systemPrompt,
      });
    }
  }

  async chat(userMessage: string, stream: boolean = true): Promise<string> {
    // Add user message to history
    this.conversationHistory.push({
      role: 'user',
      content: userMessage,
    });

    try {
      if (stream) {
        const response = await this.client.chat.completions.create({
          model: this.config.model,
          messages: this.conversationHistory,
          temperature: this.config.temperature,
          stream: true,
        });

        let fullResponse = '';
        for await (const chunk of response) {
          const content = chunk.choices[0]?.delta?.content || '';
          fullResponse += content;
          process.stdout.write(content);
        }
        console.log(); // New line after streaming

        // Add assistant response to history
        this.conversationHistory.push({
          role: 'assistant',
          content: fullResponse,
        });

        return fullResponse;
      } else {
        const response = await this.client.chat.completions.create({
          model: this.config.model,
          messages: this.conversationHistory,
          temperature: this.config.temperature,
          stream: false,
        });

        const content = response.choices[0].message.content || '';
        
        // Add assistant response to history
        this.conversationHistory.push({
          role: 'assistant',
          content: content,
        });

        return content;
      }
    } catch (error: any) {
      console.error(chalk.red('\nError:'), error.message);
      throw error;
    }
  }

  async chatWithFile(userMessage: string, filePath: string): Promise<string> {
    try {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const fullMessage = `${userMessage}\n\nFile content (${path.basename(filePath)}):\n\`\`\`\n${fileContent}\n\`\`\``;
      return await this.chat(fullMessage);
    } catch (error: any) {
      console.error(chalk.red('Error reading file:'), error.message);
      throw error;
    }
  }

  clearHistory(): void {
    this.conversationHistory = [];
    if (this.config.systemPrompt) {
      this.conversationHistory.push({
        role: 'system',
        content: this.config.systemPrompt,
      });
    }
  }

  getHistory(): Message[] {
    return this.conversationHistory;
  }

  showStats(): void {
    const messageCount = this.conversationHistory.filter(m => m.role !== 'system').length;
    const userMessages = this.conversationHistory.filter(m => m.role === 'user').length;
    const assistantMessages = this.conversationHistory.filter(m => m.role === 'assistant').length;
    
    console.log(chalk.cyan('\n📊 Conversation Stats:'));
    console.log(chalk.gray(`   Messages: ${messageCount}`));
    console.log(chalk.gray(`   User: ${userMessages} | Assistant: ${assistantMessages}`));
    console.log(chalk.gray(`   Model: ${this.config.model}`));
    console.log();
  }

  async repl(): Promise<void> {
    console.log(chalk.green('╔════════════════════════════════════════════════════════════╗'));
    console.log(chalk.green('║            AI Gateway CLI - Interactive Mode                ║'));
    console.log(chalk.green('╚════════════════════════════════════════════════════════════╝'));
    console.log();
    console.log(chalk.cyan(`Model: ${this.config.model}`));
    console.log(chalk.gray(`Temperature: ${this.config.temperature}`));
    console.log();
    console.log(chalk.yellow('Commands:'));
    console.log(chalk.gray('  /clear     - Clear conversation history'));
    console.log(chalk.gray('  /stats     - Show conversation statistics'));
    console.log(chalk.gray('  /file      - Chat with file content'));
    console.log(chalk.gray('  /model     - Change model'));
    console.log(chalk.gray('  /temp      - Change temperature'));
    console.log(chalk.gray('  /exit      - Exit (or Ctrl+C)'));
    console.log(chalk.gray('  /help      - Show this help'));
    console.log();
    console.log(chalk.gray('Just type your message and press Enter to chat!'));
    console.log(chalk.gray('─'.repeat(60)));
    console.log();

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: chalk.yellow('You> '),
    });

    rl.prompt();

    rl.on('line', async (line: string) => {
      const input = line.trim();

      if (!input) {
        rl.prompt();
        return;
      }

      // Handle commands
      if (input.startsWith('/')) {
        const [command, ...args] = input.slice(1).split(' ');
        
        switch (command.toLowerCase()) {
          case 'exit':
          case 'quit':
            console.log(chalk.green('\n👋 Goodbye!'));
            rl.close();
            process.exit(0);
            break;

          case 'clear':
            this.clearHistory();
            console.log(chalk.gray('✓ Conversation history cleared\n'));
            break;

          case 'stats':
            this.showStats();
            break;

          case 'file':
            const filePath = args.join(' ').trim();
            if (!filePath) {
              console.log(chalk.red('Usage: /file <path> <message>'));
              console.log(chalk.gray('Example: /file ./code.ts Review this code'));
            } else {
              const parts = filePath.split(' ');
              const file = parts[0];
              const message = parts.slice(1).join(' ') || 'Analyze this file';
              
              console.log(chalk.cyan('\nAssistant> '));
              try {
                await this.chatWithFile(message, file);
              } catch (error) {
                // Error already logged
              }
              console.log();
            }
            break;

          case 'model':
            const newModel = args.join(' ').trim();
            if (!newModel) {
              console.log(chalk.yellow(`Current model: ${this.config.model}`));
              console.log(chalk.gray('\nAvailable models:'));
              console.log(chalk.gray('  - deepseek/deepseek-v3.2-exp'));
              console.log(chalk.gray('  - openai/gpt-4-turbo'));
              console.log(chalk.gray('  - openai/gpt-4'));
              console.log(chalk.gray('  - anthropic/claude-3-opus'));
              console.log(chalk.gray('  - anthropic/claude-3-sonnet'));
            } else {
              this.config.model = newModel;
              console.log(chalk.green(`✓ Model changed to: ${newModel}\n`));
            }
            break;

          case 'temp':
          case 'temperature':
            const temp = parseFloat(args[0]);
            if (isNaN(temp)) {
              console.log(chalk.yellow(`Current temperature: ${this.config.temperature}`));
              console.log(chalk.gray('Usage: /temp <0.0-2.0>'));
            } else {
              this.config.temperature = Math.max(0, Math.min(2, temp));
              console.log(chalk.green(`✓ Temperature set to: ${this.config.temperature}\n`));
            }
            break;

          case 'help':
            console.log(chalk.yellow('\nCommands:'));
            console.log(chalk.gray('  /clear     - Clear conversation history'));
            console.log(chalk.gray('  /stats     - Show conversation statistics'));
            console.log(chalk.gray('  /file      - Chat with file content'));
            console.log(chalk.gray('  /model     - Change model'));
            console.log(chalk.gray('  /temp      - Change temperature'));
            console.log(chalk.gray('  /exit      - Exit'));
            console.log(chalk.gray('  /help      - Show this help\n'));
            break;

          default:
            console.log(chalk.red(`Unknown command: /${command}`));
            console.log(chalk.gray('Type /help for available commands\n'));
        }

        rl.prompt();
        return;
      }

      // Regular chat
      try {
        console.log(chalk.cyan('\nAssistant> '));
        await this.chat(input);
        console.log();
      } catch (error) {
        // Error already logged
      }

      rl.prompt();
    });

    rl.on('close', () => {
      console.log(chalk.green('\n👋 Goodbye!'));
      process.exit(0);
    });

    process.on('SIGINT', () => {
      console.log(chalk.green('\n\n👋 Goodbye!'));
      rl.close();
      process.exit(0);
    });
  }
}

// Main CLI
const program = new Command();

program
  .name('ai-gateway')
  .description('AI Gateway CLI - Talk to AI models with unlimited context')
  .version('2.1.0');

// Default interactive mode (like gemini-cli)
program
  .argument('[message]', 'Message to send (starts interactive mode if not provided)')
  .option('-m, --model <model>', 'Model to use', 'deepseek/deepseek-v3.2-exp')
  .option('-t, --temperature <number>', 'Temperature (0.0-2.0)', '0.7')
  .option('-s, --system <prompt>', 'System prompt')
  .option('-f, --file <path>', 'Include file content')
  .option('--api-key <key>', 'API key (overrides AI_GATEWAY_API_KEY env var)')
  .option('--base-url <url>', 'Base URL for AI Gateway', 'https://ai-gateway.vercel.sh/v1')
  .action(async (message: string | undefined, options: any) => {
    const config: Config = {
      apiKey: options.apiKey || process.env.AI_GATEWAY_API_KEY || '',
      baseUrl: options.baseUrl,
      model: options.model,
      temperature: parseFloat(options.temperature),
      systemPrompt: options.system,
    };

    const cli = new GeminiStyleCLI(config);

    // If message provided, one-shot mode
    if (message) {
      try {
        console.log(chalk.cyan('Assistant> '));
        
        if (options.file) {
          await cli.chatWithFile(message, options.file);
        } else {
          await cli.chat(message);
        }
        
        console.log();
      } catch (error) {
        process.exit(1);
      }
    } else {
      // Interactive REPL mode
      await cli.repl();
    }
  });

program.parse();

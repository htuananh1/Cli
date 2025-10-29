#!/usr/bin/env node

import { Command } from 'commander';
import OpenAI from 'openai';
import chalk from 'chalk';
import ora from 'ora';
import * as readline from 'readline';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

dotenv.config();

const DEFAULT_SYSTEM_PROMPT = `You are the AI Gateway CLI assistant. Maintain awareness of the full conversation history and respond with thoughtful, contextual answers. Reference earlier discussion when it is relevant, provide concise summaries of your reasoning, and format code or commands clearly. When the user speaks Vietnamese, reply in Vietnamese unless instructed otherwise.`;

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
  private execAsync = promisify(exec);
  private readonly bubbleWidth = 72;

  constructor(config: Config) {
    this.config = config;

    if (!this.config.systemPrompt) {
      this.config.systemPrompt = DEFAULT_SYSTEM_PROMPT;
    }

    if (!config.apiKey) {
      console.error(chalk.red('Error: AI_GATEWAY_API_KEY environment variable not set'));
      console.error(chalk.gray('Set it with: export AI_GATEWAY_API_KEY="your-key"'));
      process.exit(1);
    }

    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseUrl,
    });

    this.setSystemPrompt(this.config.systemPrompt);
  }

  private setSystemPrompt(prompt: string | undefined): void {
    if (!prompt) {
      return;
    }

    this.config.systemPrompt = prompt;

    if (this.conversationHistory.length > 0 && this.conversationHistory[0].role === 'system') {
      this.conversationHistory[0].content = prompt;
    } else {
      this.conversationHistory.unshift({
        role: 'system',
        content: prompt,
      });
    }
  }

  private wrapContent(text: string, width: number): string[] {
    const result: string[] = [];
    const paragraphs = text.split(/\r?\n/);

    paragraphs.forEach((paragraph, index) => {
      if (paragraph.trim() === '') {
        if (result[result.length - 1] !== '') {
          result.push('');
        } else if (result.length === 0) {
          result.push('');
        }
      } else {
        let line = '';
        const words = paragraph.split(/\s+/);

        for (const word of words) {
          if (!word) {
            continue;
          }

          const candidate = line ? `${line} ${word}` : word;
          if (this.stripAnsi(candidate).length <= width) {
            line = candidate;
          } else {
            if (line) {
              result.push(line);
              line = '';
            }

            if (this.stripAnsi(word).length > width) {
              let remaining = word;
              while (this.stripAnsi(remaining).length > width) {
                result.push(remaining.slice(0, width));
                remaining = remaining.slice(width);
              }
              line = remaining;
            } else {
              line = word;
            }
          }
        }

        if (line) {
          result.push(line);
        }
      }

      if (index < paragraphs.length - 1 && result[result.length - 1] !== '') {
        result.push('');
      }
    });

    return result.length > 0 ? result : [''];
  }

  private renderMessageBubble(role: Message['role'] | 'context', content: string, options?: { title?: string }): void {
    const label = options?.title || this.getRoleLabel(role);
    const color = this.getRoleColor(role);
    const lines = this.wrapContent(content, this.bubbleWidth);
    const maxWidth = Math.max(this.stripAnsi(label).length, ...lines.map(line => this.stripAnsi(line).length));
    const horizontal = '─'.repeat(maxWidth + 2);

    console.log();
    console.log(color(`╭─ ${label.padEnd(maxWidth, ' ')} ╮`));
    for (const line of lines) {
      const padding = ' '.repeat(maxWidth - this.stripAnsi(line).length);
      console.log(color(`│ ${line}${padding} │`));
    }
    console.log(color(`╰─${horizontal}─╯`));
  }

  private getRoleLabel(role: Message['role'] | 'context'): string {
    switch (role) {
      case 'user':
        return 'You';
      case 'assistant':
        return 'Assistant';
      case 'system':
        return 'System Prompt';
      case 'context':
      default:
        return 'Context';
    }
  }

  private getRoleColor(role: Message['role'] | 'context'): chalk.Chalk {
    switch (role) {
      case 'user':
        return chalk.hex('#FFB300');
      case 'assistant':
        return chalk.hex('#7E57C2');
      case 'system':
      case 'context':
        return chalk.hex('#26A69A');
      default:
        return chalk.cyan;
    }
  }

  private renderHeader(): void {
    console.log(chalk.hex('#7E57C2').bold('\n╭──────────────────────────────────────────────╮'));
    console.log(chalk.hex('#7E57C2').bold('│           AI Gateway · Gemini Mode           │'));
    console.log(chalk.hex('#7E57C2').bold('╰──────────────────────────────────────────────╯'));
    console.log(chalk.gray(`Model: ${this.config.model}  ·  Temperature: ${this.config.temperature}`));
    if (this.config.systemPrompt) {
      this.displayMessage('system', this.config.systemPrompt);
    }
    console.log(chalk.gray('Type /help for commands. Use Ctrl+C to exit.'));
  }

  private renderCommandReference(): void {
    this.printPanel(
      'Commands',
      [
        chalk.gray('/clear       Clear conversation history'),
        chalk.gray('/stats       Show conversation statistics'),
        chalk.gray('/file        Chat with file content'),
        chalk.gray('/read        Preview a file with line numbers'),
        chalk.gray('/write       Overwrite a file with new content'),
        chalk.gray('/append      Append text to a file'),
        chalk.gray('/shell       Run a shell command'),
        chalk.gray('/model       Change model'),
        chalk.gray('/temp        Change temperature'),
        chalk.gray('/prompt      View or update system prompt'),
        chalk.gray('/exit        Exit'),
        chalk.gray('/help        Show this help'),
      ],
      chalk.hex('#3949AB'),
    );
  }

  renderSessionHeader(includeCommands: boolean = false): void {
    this.renderHeader();
    if (includeCommands) {
      this.renderCommandReference();
    }
  }

  displayMessage(role: Message['role'] | 'context', content: string, title?: string): void {
    this.renderMessageBubble(role, content, title ? { title } : undefined);
  }

  async chat(userMessage: string, stream: boolean = true): Promise<string> {
    const userEntry: Message = {
      role: 'user',
      content: userMessage,
    };

    this.conversationHistory.push(userEntry);

    const spinner = ora({ text: chalk.gray('Thinking...'), spinner: 'dots' }).start();

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
        }

        spinner.stop();

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

        spinner.stop();

        this.conversationHistory.push({
          role: 'assistant',
          content: content,
        });

        return content;
      }
    } catch (error: any) {
      spinner.stop();
      this.conversationHistory.pop();
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
    this.setSystemPrompt(this.config.systemPrompt);
  }

  getHistory(): Message[] {
    return this.conversationHistory;
  }

  showStats(): void {
    const messageCount = this.conversationHistory.filter(m => m.role !== 'system').length;
    const userMessages = this.conversationHistory.filter(m => m.role === 'user').length;
    const assistantMessages = this.conversationHistory.filter(m => m.role === 'assistant').length;

    const summary = [
      `Total messages: ${messageCount}`,
      `You vs Assistant: ${userMessages} | ${assistantMessages}`,
      `Model: ${this.config.model}`,
    ].join('\n');

    this.displayMessage('context', summary, 'Conversation Stats');
  }

  private stripAnsi(text: string): string {
    return text.replace(/\u001b\[[0-9;?]*[ -\/]*[@-~]/g, '');
  }

  private parseArgs(line: string): string[] {
    const args: string[] = [];
    let current = '';
    let quote: string | null = null;
    let escape = false;

    const pushCurrent = () => {
      if (current.length > 0) {
        args.push(current);
        current = '';
      }
    };

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (escape) {
        current += char;
        escape = false;
        continue;
      }

      if (char === '\\' && quote) {
        escape = true;
        continue;
      }

      if (quote) {
        if (char === quote) {
          quote = null;
          continue;
        }

        current += char;
        continue;
      }

      if (char === '"' || char === '\'' || char === '`') {
        if (current.length > 0) {
          pushCurrent();
        }
        quote = char;
        continue;
      }

      if (/\s/.test(char)) {
        pushCurrent();
        continue;
      }

      current += char;
    }

    if (current.length > 0) {
      pushCurrent();
    }

    return args;
  }

  private printPanel(title: string, body: string | string[], color: chalk.Chalk = chalk.cyan): void {
    const lines = Array.isArray(body) ? body : body.split('\n');
    const contentWidth = Math.max(
      ...lines.map(line => this.stripAnsi(line).length),
      this.stripAnsi(title).length,
    );
    const horizontal = '═'.repeat(contentWidth + 4);
    console.log(color(`\n╔${horizontal}╗`));
    const titleText = chalk.bold(title.padEnd(contentWidth, ' '));
    console.log(color(`║  ${titleText}  ║`));
    console.log(color(`╠${horizontal}╣`));
    for (const line of lines) {
      const strippedLength = this.stripAnsi(line).length;
      const padding = ' '.repeat(contentWidth - strippedLength);
      console.log(color(`║  ${line}${padding}  ║`));
    }
    console.log(color(`╚${horizontal}╝`));
    console.log();
  }

  private async executeShellCommand(command: string): Promise<void> {
    const spinner = ora({ text: chalk.gray(`Running: ${command}`), spinner: 'dots' }).start();
    try {
      const { stdout, stderr } = await this.execAsync(command, { maxBuffer: 10 * 1024 * 1024 });
      spinner.stop();

      if (stdout.trim()) {
        this.printPanel('Shell Output', stdout.trim().split('\n'), chalk.green);
      } else {
        this.printPanel('Shell Output', ['(no output)'], chalk.green);
      }

      if (stderr.trim()) {
        this.printPanel('Shell Errors', stderr.trim().split('\n'), chalk.red);
      }
    } catch (error: any) {
      spinner.stop();
      const message = error.stderr || error.message || 'Unknown error';
      this.printPanel('Shell Error', message.toString().trim().split('\n'), chalk.red);
    }
  }

  private async displayFileContent(filePath: string): Promise<void> {
    const spinner = ora({ text: chalk.gray(`Reading ${filePath}`), spinner: 'dots' }).start();
    try {
      const absolute = path.resolve(filePath);
      const stats = await fs.promises.stat(absolute);
      if (!stats.isFile()) {
        throw new Error('The specified path is not a file');
      }

      const content = await fs.promises.readFile(absolute, 'utf-8');
      spinner.stop();
      const lines = content.split('\n').map((line, index) => {
        const lineNumber = chalk.gray(`${index + 1}`.padStart(4, ' '));
        return `${lineNumber} ${line}`;
      });
      this.printPanel(`File: ${path.relative(process.cwd(), absolute)}`, lines.length ? lines : ['(empty file)']);
    } catch (error: any) {
      spinner.stop();
      this.printPanel('File Read Error', error.message.split('\n'), chalk.red);
    }
  }

  private async writeFileContent(filePath: string, content: string, append: boolean = false): Promise<void> {
    const absolute = path.resolve(filePath);
    const action = append ? 'Appending to' : 'Writing to';
    const spinner = ora({ text: chalk.gray(`${action} ${absolute}`), spinner: 'dots' }).start();
    try {
      await fs.promises.mkdir(path.dirname(absolute), { recursive: true });
      if (append) {
        await fs.promises.appendFile(absolute, content);
      } else {
        await fs.promises.writeFile(absolute, content);
      }
      spinner.stop();
      this.printPanel('File Saved', [`${append ? 'Appended' : 'Wrote'} ${content.length} characters`, `Path: ${path.relative(process.cwd(), absolute)}`], chalk.green);
    } catch (error: any) {
      spinner.stop();
      this.printPanel('File Write Error', error.message.split('\n'), chalk.red);
    }
  }

  async repl(): Promise<void> {
    console.clear();
    this.renderSessionHeader(true);

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: chalk.yellow('You> '),
    });

    const promptUser = () => {
      rl.setPrompt(chalk.yellow('You> '));
      rl.prompt();
    };

    promptUser();

    rl.on('line', async (line: string) => {
      const input = line.trim();

      if (!input) {
        promptUser();
        return;
      }

      if (input.startsWith('/')) {
        const [command, ...args] = this.parseArgs(input.slice(1));

        if (!command) {
          console.log(chalk.red('Please provide a command after "/".'));
          promptUser();
          return;
        }

        switch (command.toLowerCase()) {
          case 'exit':
          case 'quit':
            console.log(chalk.green('\n👋 Goodbye!'));
            rl.close();
            process.exit(0);
            break;

          case 'clear':
            this.clearHistory();
            console.clear();
            this.renderSessionHeader(true);
            console.log(chalk.gray('✓ Conversation history cleared'));
            break;

          case 'stats':
            this.showStats();
            break;

          case 'file': {
            if (args.length === 0) {
              console.log(chalk.red('Usage: /file <path> <message>'));
              console.log(chalk.gray('Example: /file ./code.ts Review this code'));
            } else {
              const file = args[0];
              const message = args.slice(1).join(' ') || 'Analyze this file';
              const resolved = path.resolve(file);
              this.displayMessage('user', `${message}\n\n📎 ${resolved}`);
              try {
                const assistantReply = await this.chatWithFile(message, file);
                this.displayMessage('assistant', assistantReply);
              } catch (error) {
                // Error already logged
              }
            }
            break;
          }

          case 'read': {
            const target = args[0];
            if (!target) {
              console.log(chalk.red('Usage: /read <file>'));
            } else {
              await this.displayFileContent(target);
            }
            break;
          }

          case 'write': {
            const [target, ...contentParts] = args;
            if (!target || contentParts.length === 0) {
              console.log(chalk.red('Usage: /write <file> <content>'));
              console.log(chalk.gray('Tip: surround multi-word paths with quotes.'));
            } else {
              await this.writeFileContent(target, contentParts.join(' '), false);
            }
            break;
          }

          case 'append': {
            const [target, ...contentParts] = args;
            if (!target || contentParts.length === 0) {
              console.log(chalk.red('Usage: /append <file> <content>'));
              console.log(chalk.gray('Tip: surround multi-word paths with quotes.'));
            } else {
              await this.writeFileContent(target, `${contentParts.join(' ')}\n`, true);
            }
            break;
          }

          case 'shell': {
            const command = args.join(' ').trim();
            if (!command) {
              console.log(chalk.red('Usage: /shell <command>'));
              console.log(chalk.gray('Example: /shell ls -la'));
            } else {
              await this.executeShellCommand(command);
            }
            break;
          }

          case 'model': {
            const newModel = args.join(' ').trim();
            if (!newModel) {
              console.log(chalk.yellow(`Current model: ${this.config.model}`));
              console.log(chalk.gray('\nAvailable models:'));
              console.log(chalk.cyan('  DeepSeek:'));
              console.log(chalk.gray('    - deepseek/deepseek-v3.2-exp'));
              console.log(chalk.cyan('  OpenAI:'));
              console.log(chalk.gray('    - openai/gpt-5'));
              console.log(chalk.gray('    - openai/gpt-5-codex'));
              console.log(chalk.gray('    - openai/gpt-4-turbo'));
              console.log(chalk.gray('    - openai/gpt-4'));
              console.log(chalk.gray('    - openai/gpt-3.5-turbo'));
              console.log(chalk.cyan('  Anthropic:'));
              console.log(chalk.gray('    - anthropic/claude-sonnet-4.5'));
              console.log(chalk.gray('    - anthropic/claude-haiku-4.5'));
              console.log(chalk.gray('    - anthropic/claude-3-opus'));
              console.log(chalk.gray('    - anthropic/claude-3-sonnet'));
              console.log(chalk.gray('    - anthropic/claude-3-haiku'));
              console.log(chalk.cyan('  Google:'));
              console.log(chalk.gray('    - google/gemini-2.5-pro'));
              console.log(chalk.gray('    - google/gemini-2.5-flash'));
              console.log(chalk.gray('    - google/gemini-pro'));
            } else {
              this.config.model = newModel;
              console.log(chalk.green(`✓ Model changed to: ${newModel}`));
            }
            break;
          }

          case 'temp':
          case 'temperature': {
            const temp = parseFloat(args[0]);
            if (isNaN(temp)) {
              console.log(chalk.yellow(`Current temperature: ${this.config.temperature}`));
              console.log(chalk.gray('Usage: /temp <0.0-2.0>'));
            } else {
              this.config.temperature = Math.max(0, Math.min(2, temp));
              console.log(chalk.green(`✓ Temperature set to: ${this.config.temperature}`));
            }
            break;
          }

          case 'prompt': {
            if (args.length === 0) {
              this.displayMessage('system', this.config.systemPrompt || '(not set)');
            } else if (args[0].toLowerCase() === 'reset') {
              this.setSystemPrompt(DEFAULT_SYSTEM_PROMPT);
              console.log(chalk.green('✓ System prompt reset to default.'));
              this.displayMessage('system', this.config.systemPrompt || '');
            } else {
              const newPrompt = args.join(' ');
              this.setSystemPrompt(newPrompt);
              console.log(chalk.green('✓ System prompt updated.'));
              this.displayMessage('system', newPrompt);
            }
            break;
          }

          case 'help':
            this.renderCommandReference();
            break;

          default:
            console.log(chalk.red(`Unknown command: /${command}`));
            console.log(chalk.gray('Type /help for available commands.'));
        }

        promptUser();
        return;
      }

      this.displayMessage('user', input);
      try {
        const assistantReply = await this.chat(input);
        this.displayMessage('assistant', assistantReply);
      } catch (error) {
        // Error already logged
      }

      promptUser();
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
        console.clear();
        cli.renderSessionHeader(false);

        if (options.file) {
          const resolved = path.resolve(options.file);
          cli.displayMessage('user', `${message}\n\n📎 ${resolved}`);
          const assistantReply = await cli.chatWithFile(message, options.file);
          cli.displayMessage('assistant', assistantReply);
        } else {
          cli.displayMessage('user', message);
          const assistantReply = await cli.chat(message);
          cli.displayMessage('assistant', assistantReply);
        }
      } catch (error) {
        process.exit(1);
      }
    } else {
      // Interactive REPL mode
      await cli.repl();
    }
  });

program.parse();

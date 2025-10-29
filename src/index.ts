#!/usr/bin/env node

import { Command } from 'commander';
import OpenAI from 'openai';
import chalk from 'chalk';
import ora from 'ora';
import * as readline from 'readline';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface ChatOptions {
  model: string;
  system?: string;
  temperature: number;
  maxTokens?: number;
  stream: boolean;
  json: boolean;
}

interface InteractiveOptions {
  model: string;
  system?: string;
  temperature: number;
}

class AIGatewayCLI {
  private client: OpenAI;
  private apiKey: string;
  private baseUrl: string;

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
  }

  async chat(prompt: string, options: ChatOptions): Promise<void> {
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];

    if (options.system) {
      messages.push({
        role: 'system',
        content: options.system,
      });
    }

    messages.push({
      role: 'user',
      content: prompt,
    });

    try {
      const baseOptions = {
        model: options.model,
        messages,
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

        if (options.json) {
          console.log(chalk.gray('\nJSON Output:'));
          console.log(JSON.stringify({
            model: options.model,
            content: fullResponse,
            stream: true,
          }, null, 2));
        }
      } else {
        const spinner = ora('Thinking...').start();
        const response = await this.client.chat.completions.create({
          ...baseOptions,
          ...maxTokensOptions,
          stream: false,
        });
        spinner.stop();

        const content = response.choices[0].message.content || '';

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
          }, null, 2));
        } else {
          console.log(chalk.cyan('Response:'), content);
          console.log();
          console.log(chalk.gray(`Model: ${response.model}`));
          console.log(chalk.gray(`Tokens used: ${response.usage?.total_tokens} (prompt: ${response.usage?.prompt_tokens}, completion: ${response.usage?.completion_tokens})`));
        }
      }
    } catch (error: any) {
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
  }

  async interactive(options: InteractiveOptions): Promise<void> {
    console.log(chalk.green(`AI Gateway Interactive Chat (Model: ${options.model})`));
    console.log(chalk.gray("Type 'exit' or 'quit' to end the session, 'clear' to clear history\n"));

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [];
    
    if (options.system) {
      messages.push({
        role: 'system',
        content: options.system,
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
            });
          }
          console.log(chalk.gray('Chat history cleared.\n'));
          continue;
        }

        messages.push({
          role: 'user',
          content: userInput,
        });

        const stream = await this.client.chat.completions.create({
          model: options.model,
          messages,
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

        messages.push({
          role: 'assistant',
          content: fullResponse,
        });
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
      console.log(chalk.cyan(`  - ${model}`));
    });
  }
}

// CLI Setup
const program = new Command();

program
  .name('ai-gateway')
  .description('AI Gateway CLI - Interact with AI models through the AI Gateway')
  .version('1.0.0')
  .option('--api-key <key>', 'API key (overrides AI_GATEWAY_API_KEY env var)')
  .option('--base-url <url>', 'Base URL for AI Gateway');

program
  .command('chat <prompt>')
  .description('Send a single chat message')
  .option('-m, --model <model>', 'Model to use', 'deepseek/deepseek-v3.2-exp')
  .option('-s, --system <prompt>', 'System prompt')
  .option('-t, --temperature <number>', 'Temperature for sampling', '0.7')
  .option('--max-tokens <number>', 'Maximum tokens to generate')
  .option('--stream', 'Stream the response')
  .option('--json', 'Output response as JSON')
  .action(async (prompt: string, cmdOptions: any) => {
    const globalOptions = program.opts();
    const cli = new AIGatewayCLI(globalOptions.apiKey, globalOptions.baseUrl);
    
    const options: ChatOptions = {
      model: cmdOptions.model,
      system: cmdOptions.system,
      temperature: parseFloat(cmdOptions.temperature),
      maxTokens: cmdOptions.maxTokens ? parseInt(cmdOptions.maxTokens) : undefined,
      stream: cmdOptions.stream || false,
      json: cmdOptions.json || false,
    };

    await cli.chat(prompt, options);
  });

program
  .command('interactive')
  .description('Start an interactive chat session')
  .option('-m, --model <model>', 'Model to use', 'deepseek/deepseek-v3.2-exp')
  .option('-s, --system <prompt>', 'System prompt')
  .option('-t, --temperature <number>', 'Temperature for sampling', '0.7')
  .action(async (cmdOptions: any) => {
    const globalOptions = program.opts();
    const cli = new AIGatewayCLI(globalOptions.apiKey, globalOptions.baseUrl);
    
    const options: InteractiveOptions = {
      model: cmdOptions.model,
      system: cmdOptions.system,
      temperature: parseFloat(cmdOptions.temperature),
    };

    await cli.interactive(options);
  });

program
  .command('list-models')
  .description('List available models')
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

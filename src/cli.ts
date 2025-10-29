#!/usr/bin/env node

import { Command } from 'commander';
import OpenAI from 'openai';
import chalk from 'chalk';
import ora from 'ora';
import * as readline from 'readline';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import inquirer from 'inquirer';
import chalkAnimation from 'chalk-animation';
import gradient from 'gradient-string';
import figlet from 'figlet';
import boxen from 'boxen';
import * as cliProgress from 'cli-progress';
import * as emoji from 'node-emoji';
import { glob } from 'glob';
import * as mime from 'mime-types';
import simpleGit, { SimpleGit } from 'simple-git';
import * as Diff from 'diff';
import { ConfigManager, AICodeConfig } from './config';
import { ContextManager } from './context';
import { EditManager } from './edits';

dotenv.config();

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

class AICodeCLI {
  private client: OpenAI | null = null;
  private config: AICodeConfig & { baseUrl?: string; systemPrompt?: string };
  private conversationHistory: Message[] = [];
  private execAsync = promisify(exec);
  private commandHistory: string[] = [];
  private currentDirectory: string = process.cwd();
  private progressBar: cliProgress.SingleBar | null = null;
  private configManager: ConfigManager;
  private contextManager: ContextManager;
  private editManager: EditManager;
  private git: SimpleGit;

  constructor(config: Partial<AICodeConfig & { baseUrl?: string; systemPrompt?: string }>) {
    this.configManager = new ConfigManager();
    this.contextManager = new ContextManager();
    this.editManager = new EditManager();
    this.git = simpleGit(process.cwd());
    this.config = config as any;
  }

  async initialize(): Promise<void> {
    // Load config from file if exists
    const fileConfig = await this.configManager.load();
    if (fileConfig) {
      this.config = { ...fileConfig, ...this.config };
    }

    // Get API key from config, env, or options
    const apiKey = this.config.apiKey || process.env.AI_GATEWAY_API_KEY || process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      console.error(chalk.red('Error: API key not found'));
      console.error(chalk.gray('Set it with: export AI_GATEWAY_API_KEY="your-key"'));
      console.error(chalk.gray('Or run: ai-code init'));
      process.exit(1);
    }

    this.config.apiKey = apiKey;
    this.config.baseUrl = this.config.baseUrl || 'https://ai-gateway.vercel.sh/v1';
    this.config.model = this.config.model || 'deepseek/deepseek-v3.2-exp';
    this.config.temperature = this.config.temperature ?? 0.7;

    this.client = new OpenAI({
      apiKey: this.config.apiKey,
      baseURL: this.config.baseUrl,
    });

    if (this.config.systemPrompt) {
      this.conversationHistory.push({
        role: 'system',
        content: this.config.systemPrompt,
      });
    }

    // Load pending edits
    await this.editManager.loadPending();
  }

  async chat(userMessage: string, stream: boolean = true): Promise<string> {
    if (!this.client) await this.initialize();

    this.conversationHistory.push({
      role: 'user',
      content: userMessage,
    });

    try {
      if (stream) {
        const response = await this.client!.chat.completions.create({
          model: this.config.model!,
          messages: this.conversationHistory,
          temperature: this.config.temperature,
          max_tokens: this.config.maxTokens,
          stream: true,
        });

        let fullResponse = '';
        for await (const chunk of response) {
          const content = chunk.choices[0]?.delta?.content || '';
          fullResponse += content;
          process.stdout.write(content);
        }
        console.log();

        this.conversationHistory.push({
          role: 'assistant',
          content: fullResponse,
        });

        return fullResponse;
      } else {
        const response = await this.client!.chat.completions.create({
          model: this.config.model!,
          messages: this.conversationHistory,
          temperature: this.config.temperature,
          max_tokens: this.config.maxTokens,
          stream: false,
        });

        const content = response.choices[0].message.content || '';
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

  async chatWithFiles(userMessage: string, files: string[]): Promise<string> {
    const fileContents = await Promise.all(
      files.map(async (file) => {
        try {
          const content = await fs.promises.readFile(file, 'utf-8');
          return `File: ${file}\n\`\`\`\n${content}\n\`\`\``;
        } catch {
          return `File: ${file}\n(Error reading file)`;
        }
      })
    );

    const fullMessage = `${userMessage}\n\n${fileContents.join('\n\n')}`;
    return await this.chat(fullMessage);
  }

  async chatWithDirectory(userMessage: string, dir: string): Promise<string> {
    const files = await glob('**/*', { 
      cwd: dir,
      ignore: this.config.ignorePatterns || ['node_modules/**', 'dist/**', '.git/**'],
      nodir: true
    });

    const limitedFiles = files.slice(0, 20); // Limit to 20 files
    return await this.chatWithFiles(userMessage, limitedFiles.map(f => path.join(dir, f)));
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
    console.log(chalk.gray('─'.repeat(50)));
    console.log(`Messages: ${messageCount}`);
    console.log(`User: ${userMessages} | Assistant: ${assistantMessages}`);
    console.log(`Model: ${this.config.model}`);
    console.log(`Temperature: ${this.config.temperature}`);
    console.log(chalk.gray('─'.repeat(50)));
    console.log();
  }

  private stripAnsi(text: string): string {
    return text.replace(/\u001b\[[0-9;?]*[ -\/]*[@-~]/g, '');
  }

  private getThemedText(text: string, color: string): string {
    return (chalk as any)[color](text);
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

  async repl(): Promise<void> {
    await this.initialize();

    this.printPanel('AI Code CLI - Interactive Mode', [
      this.getThemedText(`Model: ${this.config.model}`, 'gray'),
      this.getThemedText(`Temperature: ${this.config.temperature}`, 'gray'),
    ], chalk.green);

    this.printPanel('Commands', [
      this.getThemedText('💬 Chat', 'cyan'),
      this.getThemedText('Type a message to chat with AI', 'gray'),
      this.getThemedText('', 'gray'),
      this.getThemedText('⚙️ System Settings (/)', 'cyan'),
      this.getThemedText('/clear       Clear conversation history', 'gray'),
      this.getThemedText('/stats       Show conversation statistics', 'gray'),
      this.getThemedText('/model       Change model', 'gray'),
      this.getThemedText('/temp        Change temperature', 'gray'),
      this.getThemedText('/config      Show configuration', 'gray'),
      this.getThemedText('/exit        Exit', 'gray'),
      this.getThemedText('/help        Show this help', 'gray'),
    ]);

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

          case 'model':
            if (args.length === 0) {
              console.log(chalk.yellow(`Current model: ${this.config.model}`));
            } else {
              this.config.model = args.join(' ');
              console.log(chalk.green(`✓ Model changed to: ${this.config.model}\n`));
            }
            break;

          case 'temp':
          case 'temperature':
            if (args.length === 0) {
              console.log(chalk.yellow(`Current temperature: ${this.config.temperature}`));
            } else {
              const temp = parseFloat(args[0]);
              if (!isNaN(temp)) {
                this.config.temperature = Math.max(0, Math.min(2, temp));
                console.log(chalk.green(`✓ Temperature set to: ${this.config.temperature}\n`));
              }
            }
            break;

          case 'config':
            await this.configManager.show();
            break;

          case 'help':
            this.printPanel('Available Commands', [
              '/clear       Clear conversation history',
              '/stats       Show conversation statistics',
              '/model       Change model',
              '/temp        Change temperature',
              '/config      Show configuration',
              '/exit        Exit',
              '/help        Show this help',
            ]);
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
  .name('ai-code')
  .description('AI Code CLI - Cursor-like CLI tool for AI coding assistant')
  .version('1.0.0');

// Init command
program
  .command('init')
  .description('Initialize configuration')
  .action(async () => {
    const configManager = new ConfigManager();
    await configManager.init();
  });

// Config command
program
  .command('config')
  .description('Manage configuration')
  .option('--model <model>', 'Set default model')
  .option('--show', 'Show current configuration')
  .action(async (options) => {
    const configManager = new ConfigManager();
    
    if (options.show) {
      await configManager.show();
    } else if (options.model) {
      await configManager.update('model', options.model);
      console.log(chalk.green(`✓ Model set to: ${options.model}`));
    } else {
      await configManager.show();
    }
  });

// Chat command (default)
program
  .argument('[message]', 'Message to send')
  .option('-m, --model <model>', 'Model to use')
  .option('-t, --temperature <number>', 'Temperature (0.0-2.0)', '0.7')
  .option('-s, --system <prompt>', 'System prompt')
  .option('-f, --file <path>', 'Include file content (can be used multiple times)', (val: string, prev: string[] | undefined) => {
    prev = prev || [];
    prev.push(val);
    return prev;
  })
  .option('--dir <directory>', 'Include directory content')
  .option('--api-key <key>', 'API key')
  .option('--base-url <url>', 'Base URL', 'https://ai-gateway.vercel.sh/v1')
  .action(async (message: string | undefined, options: any) => {
    const cli = new AICodeCLI({
      model: options.model,
      temperature: parseFloat(options.temperature),
      systemPrompt: options.system,
      apiKey: options.apiKey,
      baseUrl: options.baseUrl,
    });

    await cli.initialize();

    if (message) {
      try {
        console.log(chalk.cyan('Assistant> '));
        
        if (options.dir) {
          await cli.chatWithDirectory(message, options.dir);
        } else if (options.file && options.file.length > 0) {
          await cli.chatWithFiles(message, options.file);
        } else {
          await cli.chat(message);
        }
        
        console.log();
      } catch (error) {
        process.exit(1);
      }
    } else {
      await cli.repl();
    }
  });

// Create command
program
  .command('create')
  .description('Create new file with AI')
  .argument('<prompt>', 'Description of what to create')
  .option('-o, --output <path>', 'Output file path')
  .action(async (prompt: string, options: any) => {
    const cli = new AICodeCLI({});
    await cli.initialize();

    const spinner = ora('Generating code...').start();
    try {
      const response = await cli.chat(`Create code for: ${prompt}. Provide complete, production-ready code.`, false);
      spinner.stop();

      // Extract code blocks if present
      const codeMatch = response.match(/```[\s\S]*?\n([\s\S]*?)```/);
      const code = codeMatch ? codeMatch[1].trim() : response;

      const outputPath = options.output || 'generated.js';
      await fs.promises.writeFile(outputPath, code, 'utf-8');
      console.log(chalk.green(`✓ File created: ${outputPath}`));
    } catch (error) {
      spinner.stop();
      console.error(chalk.red('Error generating code'));
      process.exit(1);
    }
  });

// Edit command
program
  .command('edit')
  .description('Edit file with AI')
  .argument('<file>', 'File to edit')
  .argument('[instruction]', 'What to change')
  .option('--preview', 'Preview changes before applying')
  .action(async (file: string, instruction: string | undefined, options: any) => {
    const cli = new AICodeCLI({});
    await cli.initialize();
    const editManager = new EditManager();

    if (!await fs.promises.access(file).then(() => true).catch(() => false)) {
      console.error(chalk.red(`File not found: ${file}`));
      process.exit(1);
    }

    const originalContent = await fs.promises.readFile(file, 'utf-8');
    const prompt = instruction || 'Improve and refactor this code';

    const spinner = ora('Generating edits...').start();
    try {
      const response = await cli.chat(`File content:\n\`\`\`\n${originalContent}\n\`\`\`\n\n${prompt}. Provide the complete modified code.`, false);
      spinner.stop();

      // Extract code blocks
      const codeMatch = response.match(/```[\s\S]*?\n([\s\S]*?)```/);
      const newContent = codeMatch ? codeMatch[1].trim() : response;

      const config = await cli['configManager'].load();
      if (options.preview || config?.previewChanges !== false) {
        await editManager.preview(file, newContent);
      } else {
        await fs.promises.writeFile(file, newContent, 'utf-8');
        console.log(chalk.green(`✓ File edited: ${file}`));
      }
    } catch (error) {
      spinner.stop();
      console.error(chalk.red('Error editing file'));
      process.exit(1);
    }
  });

// Apply command
program
  .command('apply')
  .description('Apply pending changes')
  .action(async () => {
    const editManager = new EditManager();
    await editManager.apply();
  });

// Reject command
program
  .command('reject')
  .description('Reject pending changes')
  .action(async () => {
    const editManager = new EditManager();
    await editManager.reject();
  });

// Review command
program
  .command('review')
  .description('Review code')
  .argument('<file>', 'File to review')
  .option('--branch <branch>', 'Review branch changes')
  .action(async (file: string, options: any) => {
    const cli = new AICodeCLI({});
    await cli.initialize();

    let content = '';
    if (options.branch) {
      // Review git branch
      const git = simpleGit(process.cwd());
      const diff = await git.diff([options.branch]);
      content = diff;
    } else {
      content = await fs.promises.readFile(file, 'utf-8');
    }

    const spinner = ora('Reviewing code...').start();
    try {
      const response = await cli.chat(`Please review this code thoroughly:\n\`\`\`\n${content}\n\`\`\`\n\nProvide detailed feedback on: code quality, potential bugs, best practices, performance, and suggestions for improvement.`, false);
      spinner.stop();
      console.log(chalk.cyan('\n📝 Code Review:'));
      console.log(chalk.gray('─'.repeat(70)));
      console.log(response);
      console.log(chalk.gray('─'.repeat(70)));
      console.log();
    } catch (error) {
      spinner.stop();
      console.error(chalk.red('Error reviewing code'));
      process.exit(1);
    }
  });

// Security command
program
  .command('security')
  .description('Security audit')
  .argument('[targetPath]', 'File or directory to audit', '.')
  .action(async (targetPath: string) => {
    const cli = new AICodeCLI({});
    await cli.initialize();

    const files = await glob('**/*.{js,ts,jsx,tsx,py,java,go,rs}', {
      cwd: targetPath,
      ignore: ['node_modules/**', 'dist/**', '.git/**'],
      nodir: true
    });

    const spinner = ora(`Auditing ${files.length} files...`).start();
    const contents = await Promise.all(
      files.slice(0, 10).map(async (f) => ({
        path: f,
        content: await fs.promises.readFile(path.join(targetPath, f), 'utf-8').catch(() => '')
      }))
    );

    try {
      const filesText = contents.map(c => `File: ${c.path}\n\`\`\`\n${c.content}\n\`\`\``).join('\n\n');
      const response = await cli.chat(`Perform a security audit on these files:\n\n${filesText}\n\nCheck for: vulnerabilities, security best practices, injection attacks, authentication issues, data leaks, and other security concerns.`, false);
      spinner.stop();
      console.log(chalk.cyan('\n🔒 Security Audit:'));
      console.log(chalk.gray('─'.repeat(70)));
      console.log(response);
      console.log(chalk.gray('─'.repeat(70)));
      console.log();
    } catch (error) {
      spinner.stop();
      console.error(chalk.red('Error performing security audit'));
      process.exit(1);
    }
  });

// Analyze command
program
  .command('analyze')
  .description('Analyze code')
  .argument('[targetPath]', 'File or directory to analyze', '.')
  .option('--performance', 'Performance analysis')
  .action(async (targetPath: string, options: any) => {
    const cli = new AICodeCLI({});
    await cli.initialize();

    const files = await glob('**/*.{js,ts,jsx,tsx}', {
      cwd: targetPath,
      ignore: ['node_modules/**', 'dist/**', '.git/**'],
      nodir: true
    });

    const spinner = ora(`Analyzing ${files.length} files...`).start();
    const contents = await Promise.all(
      files.slice(0, 10).map(async (f) => ({
        path: f,
        content: await fs.promises.readFile(path.join(targetPath, f), 'utf-8').catch(() => '')
      }))
    );

    try {
      const filesText = contents.map(c => `File: ${c.path}\n\`\`\`\n${c.content}\n\`\`\``).join('\n\n');
      const analysisType = options.performance ? 'performance' : 'general code structure';
      const response = await cli.chat(`Analyze these files for ${analysisType}:\n\n${filesText}\n\nProvide detailed analysis with recommendations.`, false);
      spinner.stop();
      console.log(chalk.cyan('\n📊 Analysis:'));
      console.log(chalk.gray('─'.repeat(70)));
      console.log(response);
      console.log(chalk.gray('─'.repeat(70)));
      console.log();
    } catch (error) {
      spinner.stop();
      console.error(chalk.red('Error analyzing code'));
      process.exit(1);
    }
  });

// Debug command
program
  .command('debug')
  .description('Debug code')
  .argument('<error>', 'Error message or description')
  .option('-f, --file <path>', 'File to debug')
  .action(async (error: string, options: any) => {
    const cli = new AICodeCLI({});
    await cli.initialize();

    let fileContent = '';
    if (options.file) {
      fileContent = await fs.promises.readFile(options.file, 'utf-8');
    }

    const spinner = ora('Debugging...').start();
    try {
      const prompt = fileContent 
        ? `File:\n\`\`\`\n${fileContent}\n\`\`\`\n\nError: ${error}\n\nDebug this error and provide a fix.`
        : `Debug this error: ${error}\n\nProvide a solution.`;
      
      const response = await cli.chat(prompt, false);
      spinner.stop();
      console.log(chalk.cyan('\n🐛 Debug Analysis:'));
      console.log(chalk.gray('─'.repeat(70)));
      console.log(response);
      console.log(chalk.gray('─'.repeat(70)));
      console.log();
    } catch (err) {
      spinner.stop();
      console.error(chalk.red('Error debugging'));
      process.exit(1);
    }
  });

// Test command
program
  .command('test')
  .description('Generate tests')
  .argument('<file>', 'File to test')
  .option('--framework <framework>', 'Test framework (jest, mocha, etc.)')
  .action(async (file: string, options: any) => {
    const cli = new AICodeCLI({});
    await cli.initialize();

    const content = await fs.promises.readFile(file, 'utf-8');
    const framework = options.framework || 'jest';

    const spinner = ora('Generating tests...').start();
    try {
      const response = await cli.chat(`Generate comprehensive ${framework} tests for this code:\n\`\`\`\n${content}\n\`\`\`\n\nProvide complete test suite.`, false);
      spinner.stop();

      const codeMatch = response.match(/```[\s\S]*?\n([\s\S]*?)```/);
      const testCode = codeMatch ? codeMatch[1].trim() : response;

      const testFile = file.replace(/\.[^.]+$/, `.test.${file.split('.').pop()}`);
      await fs.promises.writeFile(testFile, testCode, 'utf-8');
      console.log(chalk.green(`✓ Tests generated: ${testFile}`));
    } catch (error) {
      spinner.stop();
      console.error(chalk.red('Error generating tests'));
      process.exit(1);
    }
  });

// Fix-tests command
program
  .command('fix-tests')
  .description('Fix failing tests')
  .argument('<testfile>', 'Test file to fix')
  .action(async (testfile: string) => {
    const cli = new AICodeCLI({});
    await cli.initialize();

    const testContent = await fs.promises.readFile(testfile, 'utf-8');

    const spinner = ora('Fixing tests...').start();
    try {
      const response = await cli.chat(`Fix the failing tests in this file:\n\`\`\`\n${testContent}\n\`\`\`\n\nProvide the corrected test code.`, false);
      spinner.stop();

      const codeMatch = response.match(/```[\s\S]*?\n([\s\S]*?)```/);
      const fixedCode = codeMatch ? codeMatch[1].trim() : response;

      await fs.promises.writeFile(testfile, fixedCode, 'utf-8');
      console.log(chalk.green(`✓ Tests fixed: ${testfile}`));
    } catch (error) {
      spinner.stop();
      console.error(chalk.red('Error fixing tests'));
      process.exit(1);
    }
  });

// Docs command
program
  .command('docs')
  .description('Generate documentation')
  .argument('<file>', 'File to document')
  .action(async (file: string) => {
    const cli = new AICodeCLI({});
    await cli.initialize();

    const content = await fs.promises.readFile(file, 'utf-8');

    const spinner = ora('Generating documentation...').start();
    try {
      const response = await cli.chat(`Generate comprehensive documentation for this code:\n\`\`\`\n${content}\n\`\`\`\n\nInclude: purpose, usage examples, API reference, parameters, return values.`, false);
      spinner.stop();

      const docFile = file.replace(/\.[^.]+$/, '.md');
      await fs.promises.writeFile(docFile, response, 'utf-8');
      console.log(chalk.green(`✓ Documentation generated: ${docFile}`));
    } catch (error) {
      spinner.stop();
      console.error(chalk.red('Error generating documentation'));
      process.exit(1);
    }
  });

// Readme command
program
  .command('readme')
  .description('Generate README')
  .option('--project <path>', 'Project directory', '.')
  .action(async (options: any) => {
    const cli = new AICodeCLI({});
    await cli.initialize();

    const packageJsonPath = path.join(options.project, 'package.json');
    let projectInfo = '';
    try {
      const pkg = await fs.promises.readFile(packageJsonPath, 'utf-8');
      projectInfo = `Package.json:\n\`\`\`json\n${pkg}\n\`\`\`\n\n`;
    } catch {
      // No package.json
    }

    const spinner = ora('Generating README...').start();
    try {
      const response = await cli.chat(`${projectInfo}Generate a comprehensive README.md for this project. Include: description, installation, usage, features, examples, and contribution guidelines.`, false);
      spinner.stop();

      await fs.promises.writeFile(path.join(options.project, 'README.md'), response, 'utf-8');
      console.log(chalk.green(`✓ README generated: README.md`));
    } catch (error) {
      spinner.stop();
      console.error(chalk.red('Error generating README'));
      process.exit(1);
    }
  });

// Comment command
program
  .command('comment')
  .description('Add inline comments')
  .argument('<file>', 'File to comment')
  .action(async (file: string) => {
    const cli = new AICodeCLI({});
    await cli.initialize();

    const content = await fs.promises.readFile(file, 'utf-8');

    const spinner = ora('Adding comments...').start();
    try {
      const response = await cli.chat(`Add comprehensive inline comments to this code:\n\`\`\`\n${content}\n\`\`\`\n\nExplain complex logic, document functions, and clarify intent.`, false);
      spinner.stop();

      const codeMatch = response.match(/```[\s\S]*?\n([\s\S]*?)```/);
      const commentedCode = codeMatch ? codeMatch[1].trim() : response;

      await fs.promises.writeFile(file, commentedCode, 'utf-8');
      console.log(chalk.green(`✓ Comments added to: ${file}`));
    } catch (error) {
      spinner.stop();
      console.error(chalk.red('Error adding comments'));
      process.exit(1);
    }
  });

// Context commands
program
  .command('context')
  .description('Manage context')
  .argument('<action>', 'Action: add, list, clear, save, load')
  .argument('[value]', 'Value for action')
  .action(async (action: string, value: string) => {
    const contextManager = new ContextManager();

    switch (action) {
      case 'add':
        if (!value) {
          console.error(chalk.red('Usage: ai-code context add <pattern>'));
          process.exit(1);
        }
        await contextManager.add(value);
        break;

      case 'list':
        await contextManager.list();
        break;

      case 'clear':
        await contextManager.clear();
        break;

      case 'save':
        if (!value) {
          console.error(chalk.red('Usage: ai-code context save <session-name>'));
          process.exit(1);
        }
        await contextManager.saveSession(value);
        break;

      case 'load':
        if (!value) {
          console.error(chalk.red('Usage: ai-code context load <session-name>'));
          process.exit(1);
        }
        await contextManager.loadSession(value);
        break;

      default:
        console.error(chalk.red(`Unknown action: ${action}`));
        console.log(chalk.gray('Available actions: add, list, clear, save, load'));
        process.exit(1);
    }
  });

// Commit command
program
  .command('commit')
  .description('Generate commit message')
  .action(async () => {
    const cli = new AICodeCLI({});
    await cli.initialize();
    const git = simpleGit(process.cwd());

    const spinner = ora('Analyzing changes...').start();
    try {
      const diff = await git.diff(['--staged']);
      const status = await git.status();

      if (status.staged.length === 0) {
        spinner.stop();
        console.log(chalk.yellow('No staged changes'));
        return;
      }

      const response = await cli.chat(`Analyze these git changes and generate a clear, concise commit message:\n\`\`\`\n${diff}\n\`\`\`\n\nFollow conventional commit format.`, false);
      spinner.stop();

      console.log(chalk.cyan('\n📝 Suggested Commit Message:'));
      console.log(chalk.gray('─'.repeat(70)));
      console.log(response);
      console.log(chalk.gray('─'.repeat(70)));
      console.log();
    } catch (error) {
      spinner.stop();
      console.error(chalk.red('Error generating commit message'));
      process.exit(1);
    }
  });

// PR description command
program
  .command('pr-description')
  .description('Generate PR description')
  .action(async () => {
    const cli = new AICodeCLI({});
    await cli.initialize();
    const git = simpleGit(process.cwd());

    const spinner = ora('Analyzing branch...').start();
    try {
      const branches = await git.branch();
      const diff = await git.diff(['main...HEAD']);

      const response = await cli.chat(`Analyze these changes and generate a PR description:\n\`\`\`\n${diff}\n\`\`\`\n\nInclude: summary, changes made, testing notes.`, false);
      spinner.stop();

      console.log(chalk.cyan('\n📋 PR Description:'));
      console.log(chalk.gray('─'.repeat(70)));
      console.log(response);
      console.log(chalk.gray('─'.repeat(70)));
      console.log();
    } catch (error) {
      spinner.stop();
      console.error(chalk.red('Error generating PR description'));
      process.exit(1);
    }
  });

// Diff command
program
  .command('diff')
  .description('Compare files or git changes')
  .argument('[file1]', 'First file or --staged')
  .argument('[file2]', 'Second file')
  .argument('[prompt]', 'What to explain about the diff')
  .action(async (file1: string, file2: string, prompt: string) => {
    const cli = new AICodeCLI({});
    await cli.initialize();

    let diffText = '';
    if (file1 === '--staged') {
      const git = simpleGit(process.cwd());
      diffText = await git.diff(['--staged']);
    } else if (file1 && file2) {
      const content1 = await fs.promises.readFile(file1, 'utf-8');
      const content2 = await fs.promises.readFile(file2, 'utf-8');
      diffText = Diff.createPatch(file1, content1, content2);
    } else {
      console.error(chalk.red('Usage: ai-code diff <file1> <file2> [prompt] or ai-code diff --staged [prompt]'));
      process.exit(1);
    }

    const spinner = ora('Analyzing diff...').start();
    try {
      const question = prompt || 'Explain the differences';
      const response = await cli.chat(`Analyze this diff:\n\`\`\`\n${diffText}\n\`\`\`\n\n${question}.`, false);
      spinner.stop();

      console.log(chalk.cyan('\n📊 Diff Analysis:'));
      console.log(chalk.gray('─'.repeat(70)));
      console.log(response);
      console.log(chalk.gray('─'.repeat(70)));
      console.log();
    } catch (error) {
      spinner.stop();
      console.error(chalk.red('Error analyzing diff'));
      process.exit(1);
    }
  });

// Chat command (interactive session)
program
  .command('chat')
  .description('Start interactive chat session')
  .option('start', 'Start session (default)', true)
  .action(async () => {
    const cli = new AICodeCLI({});
    await cli.repl();
  });

program.parse();

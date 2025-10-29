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

dotenv.config();

interface Config {
  apiKey: string;
  baseUrl: string;
  model: string;
  temperature: number;
  systemPrompt?: string;
  theme?: 'default' | 'dark' | 'light' | 'rainbow';
  showEmojis?: boolean;
  enableAnimations?: boolean;
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
  private commandHistory: string[] = [];
  private currentDirectory: string = process.cwd();
  private progressBar: cliProgress.SingleBar | null = null;

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

    this.printPanel('Conversation Stats', [
      `Messages: ${messageCount}`,
      `User: ${userMessages} | Assistant: ${assistantMessages}`,
      `Model: ${this.config.model}`,
    ]);
  }

  private stripAnsi(text: string): string {
    return text.replace(/\u001b\[[0-9;?]*[ -\/]*[@-~]/g, '');
  }

  private getThemedText(text: string, color: string): string {
    if (!this.config.enableAnimations) {
      return (chalk as any)[color](text);
    }

    switch (this.config.theme) {
      case 'rainbow':
        return gradient.rainbow(text);
      case 'dark':
        return (chalk as any)[color](text);
      case 'light':
        return (chalk as any)[color](text);
      default:
        return (chalk as any)[color](text);
    }
  }

  private async showWelcomeAnimation(): Promise<void> {
    if (!this.config.enableAnimations) return;

    const title = figlet.textSync('AI Gateway', { font: 'Standard' });
    const rainbowTitle = gradient.rainbow(title);
    
    console.clear();
    console.log(rainbowTitle);
    
    const subtitle = this.getThemedText('Interactive AI Assistant with Full System Access', 'cyan');
    console.log(subtitle);
    console.log();
  }

  private async showProgressBar(total: number, label: string = 'Processing'): Promise<void> {
    this.progressBar = new cliProgress.SingleBar({
      format: `${label} |{bar}| {percentage}% | {value}/{total} | ETA: {eta}s`,
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591',
      hideCursor: true
    });
    
    this.progressBar.start(total, 0);
  }

  private updateProgressBar(value: number): void {
    if (this.progressBar) {
      this.progressBar.update(value);
    }
  }

  private stopProgressBar(): void {
    if (this.progressBar) {
      this.progressBar.stop();
      this.progressBar = null;
    }
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

  private async executeShellCommand(command: string, interactive: boolean = false): Promise<void> {
    // Add to command history
    this.commandHistory.push(command);
    
    if (interactive) {
      await this.executeInteractiveShellCommand(command);
      return;
    }

    const spinner = ora({ 
      text: this.getThemedText(`Running: ${command}`, 'gray'), 
      spinner: 'dots' 
    }).start();
    
    try {
      const { stdout, stderr } = await this.execAsync(command, { 
        maxBuffer: 10 * 1024 * 1024,
        cwd: this.currentDirectory 
      });
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

  private async executeInteractiveShellCommand(command: string): Promise<void> {
    return new Promise((resolve) => {
      const [cmd, ...args] = command.split(' ');
      const child = spawn(cmd, args, {
        stdio: 'inherit',
        cwd: this.currentDirectory,
        shell: true
      });

      child.on('close', (code) => {
        console.log(`\n${this.getThemedText(`Command exited with code: ${code}`, 'gray')}`);
        resolve();
      });

      child.on('error', (error) => {
        console.error(`\n${this.getThemedText(`Error: ${error.message}`, 'red')}`);
        resolve();
      });
    });
  }

  private async displayFileContent(filePath: string, startLine: number = 1, endLine?: number): Promise<void> {
    const spinner = ora({ 
      text: this.getThemedText(`Reading ${filePath}`, 'gray'), 
      spinner: 'dots' 
    }).start();
    
    try {
      const absolute = path.resolve(filePath);
      const stats = await fs.promises.stat(absolute);
      if (!stats.isFile()) {
        throw new Error('The specified path is not a file');
      }

      const content = await fs.promises.readFile(absolute, 'utf-8');
      spinner.stop();
      
      const lines = content.split('\n');
      const start = Math.max(0, startLine - 1);
      const end = endLine ? Math.min(lines.length, endLine) : lines.length;
      const selectedLines = lines.slice(start, end);
      
      const formattedLines = selectedLines.map((line, index) => {
        const lineNumber = this.getThemedText(`${start + index + 1}`.padStart(4, ' '), 'gray');
        const syntaxHighlighted = this.syntaxHighlight(line, path.extname(filePath));
        return `${lineNumber} ${syntaxHighlighted}`;
      });
      
      const fileInfo = [
        `Path: ${path.relative(process.cwd(), absolute)}`,
        `Size: ${this.formatFileSize(stats.size)}`,
        `Lines: ${start + 1}-${end} of ${lines.length}`,
        `Modified: ${stats.mtime.toLocaleString()}`
      ];
      
      this.printPanel(`File: ${path.basename(absolute)}`, fileInfo, chalk.blue);
      this.printPanel('Content', formattedLines.length ? formattedLines : ['(empty file)']);
    } catch (error: any) {
      spinner.stop();
      this.printPanel('File Read Error', error.message.split('\n'), chalk.red);
    }
  }

  private async listDirectory(dirPath: string = '.'): Promise<void> {
    const spinner = ora({ 
      text: this.getThemedText(`Listing ${dirPath}`, 'gray'), 
      spinner: 'dots' 
    }).start();
    
    try {
      const absolute = path.resolve(dirPath);
      const items = await fs.promises.readdir(absolute, { withFileTypes: true });
      
      const files: string[] = [];
      const directories: string[] = [];
      
      for (const item of items) {
        const itemPath = path.join(absolute, item.name);
        const stats = await fs.promises.stat(itemPath);
        
        const icon = item.isDirectory() ? '📁' : this.getFileIcon(item.name);
        const size = item.isDirectory() ? '' : this.formatFileSize(stats.size);
        const modified = stats.mtime.toLocaleDateString();
        
        const info = `${icon} ${item.name.padEnd(30)} ${size.padStart(10)} ${modified}`;
        
        if (item.isDirectory()) {
          directories.push(info);
        } else {
          files.push(info);
        }
      }
      
      spinner.stop();
      
      const allItems = [...directories.sort(), ...files.sort()];
      const header = [
        `Directory: ${path.relative(process.cwd(), absolute)}`,
        `Items: ${allItems.length} (${directories.length} directories, ${files.length} files)`
      ];
      
      this.printPanel('Directory Listing', header, chalk.blue);
      this.printPanel('Contents', allItems.length ? allItems : ['(empty directory)']);
    } catch (error: any) {
      spinner.stop();
      this.printPanel('Directory List Error', error.message.split('\n'), chalk.red);
    }
  }

  private getFileIcon(filename: string): string {
    const ext = path.extname(filename).toLowerCase();
    const iconMap: { [key: string]: string } = {
      '.js': '📄',
      '.ts': '📄',
      '.json': '📄',
      '.md': '📝',
      '.txt': '📝',
      '.py': '🐍',
      '.java': '☕',
      '.cpp': '⚙️',
      '.c': '⚙️',
      '.html': '🌐',
      '.css': '🎨',
      '.png': '🖼️',
      '.jpg': '🖼️',
      '.jpeg': '🖼️',
      '.gif': '🖼️',
      '.pdf': '📕',
      '.zip': '📦',
      '.tar': '📦',
      '.gz': '📦'
    };
    return iconMap[ext] || '📄';
  }

  private formatFileSize(bytes: number): string {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  }

  private syntaxHighlight(line: string, extension: string): string {
    // Basic syntax highlighting
    if (extension === '.js' || extension === '.ts') {
      return line
        .replace(/(['"`])((?:\\.|(?!\1)[^\\])*)\1/g, chalk.yellow('$1$2$1'))
        .replace(/\b(function|const|let|var|if|else|for|while|return|class|import|export)\b/g, chalk.blue('$1'))
        .replace(/\b(true|false|null|undefined)\b/g, chalk.magenta('$1'))
        .replace(/\b(\d+)\b/g, chalk.green('$1'));
    }
    return line;
  }

  private async findFiles(pattern: string): Promise<void> {
    const spinner = ora({ 
      text: this.getThemedText(`Searching for: ${pattern}`, 'gray'), 
      spinner: 'dots' 
    }).start();
    
    try {
      const files = await glob(pattern, { cwd: this.currentDirectory });
      
      spinner.stop();
      
      if (files.length === 0) {
        this.printPanel('Search Results', ['No files found matching the pattern'], chalk.yellow);
      } else {
        const formattedFiles = files.map(file => {
          const icon = this.getFileIcon(file);
          return `${icon} ${file}`;
        });
        
        this.printPanel(`Search Results (${files.length} files)`, formattedFiles, chalk.green);
      }
    } catch (error: any) {
      spinner.stop();
      this.printPanel('Search Error', error.message.split('\n'), chalk.red);
    }
  }

  private async deleteFileOrDirectory(target: string): Promise<void> {
    const absolute = path.resolve(this.currentDirectory, target);
    
    try {
      const stats = await fs.promises.stat(absolute);
      const isDir = stats.isDirectory();
      
      // Confirm deletion
      const { confirm } = await inquirer.prompt([{
        type: 'confirm',
        name: 'confirm',
        message: `Are you sure you want to delete this ${isDir ? 'directory' : 'file'}?`,
        default: false
      }]);
      
      if (!confirm) {
        console.log(chalk.yellow('Deletion cancelled'));
        return;
      }
      
      const spinner = ora({ 
        text: this.getThemedText(`Deleting ${isDir ? 'directory' : 'file'}...`, 'gray'), 
        spinner: 'dots' 
      }).start();
      
      if (isDir) {
        await fs.promises.rmdir(absolute, { recursive: true });
      } else {
        await fs.promises.unlink(absolute);
      }
      
      spinner.stop();
      console.log(chalk.green(`✓ ${isDir ? 'Directory' : 'File'} deleted successfully`));
    } catch (error: any) {
      this.printPanel('Delete Error', error.message.split('\n'), chalk.red);
    }
  }

  private showCommandHistory(): void {
    if (this.commandHistory.length === 0) {
      this.printPanel('Command History', ['No commands in history'], chalk.yellow);
      return;
    }
    
    const history = this.commandHistory.slice(-20).map((cmd, index) => {
      const num = (this.commandHistory.length - 20 + index + 1).toString().padStart(3, ' ');
      return `${num}. ${cmd}`;
    });
    
    this.printPanel('Command History (Last 20)', history, chalk.blue);
  }

  private showConfiguration(): void {
    const config = [
      `Model: ${this.config.model}`,
      `Temperature: ${this.config.temperature}`,
      `Theme: ${this.config.theme || 'default'}`,
      `Show Emojis: ${this.config.showEmojis ? 'Yes' : 'No'}`,
      `Animations: ${this.config.enableAnimations ? 'Yes' : 'No'}`,
      `Base URL: ${this.config.baseUrl}`,
      `Current Directory: ${this.currentDirectory}`,
      `API Key: ${this.config.apiKey ? '***' + this.config.apiKey.slice(-4) : 'Not set'}`
    ];
    
    this.printPanel('Configuration', config, chalk.cyan);
  }

  private async editFile(filePath: string): Promise<void> {
    const absolute = path.resolve(this.currentDirectory, filePath);
    
    try {
      // Check if file exists
      let content = '';
      try {
        content = await fs.promises.readFile(absolute, 'utf-8');
      } catch (error) {
        // File doesn't exist, create new one
        console.log(chalk.yellow(`File ${filePath} doesn't exist. Creating new file.`));
      }

      const lines = content.split('\n');
      let currentLine = 0;
      let editing = true;

      console.log(chalk.cyan(`\nEditing: ${filePath}`));
      console.log(chalk.gray('Commands: :q (quit), :w (save), :n (next line), :p (prev line), :l (list), :d (delete line)'));
      console.log(chalk.gray('Type text to edit current line, or use commands above\n'));

      while (editing) {
        const displayLine = Math.max(0, Math.min(currentLine, lines.length - 1));
        const lineContent = lines[displayLine] || '';
        
        console.log(chalk.blue(`Line ${displayLine + 1}: `) + this.syntaxHighlight(lineContent, path.extname(filePath)));
        
        const { input } = await inquirer.prompt([{
          type: 'input',
          name: 'input',
          message: '>',
          prefix: ''
        }]);

        const command = input.trim();

        if (command.startsWith(':')) {
          const cmd = command.slice(1);
          switch (cmd) {
            case 'q':
              editing = false;
              break;
            case 'w':
              await fs.promises.writeFile(absolute, lines.join('\n'));
              console.log(chalk.green('✓ File saved'));
              break;
            case 'n':
              currentLine = Math.min(currentLine + 1, lines.length);
              break;
            case 'p':
              currentLine = Math.max(currentLine - 1, 0);
              break;
            case 'l':
              const start = Math.max(0, currentLine - 5);
              const end = Math.min(lines.length, currentLine + 6);
              for (let i = start; i < end; i++) {
                const marker = i === currentLine ? '→' : ' ';
                const lineNum = (i + 1).toString().padStart(3, ' ');
                console.log(chalk.gray(`${marker} ${lineNum}: `) + this.syntaxHighlight(lines[i] || '', path.extname(filePath)));
              }
              break;
            case 'd':
              if (lines.length > 0) {
                lines.splice(currentLine, 1);
                if (currentLine >= lines.length) currentLine = Math.max(0, lines.length - 1);
                console.log(chalk.red('Line deleted'));
              }
              break;
            default:
              console.log(chalk.red('Unknown command'));
          }
        } else if (command) {
          // Edit current line
          if (currentLine >= lines.length) {
            // Add new line
            lines.push(command);
            currentLine = lines.length;
          } else {
            // Edit existing line
            lines[currentLine] = command;
            currentLine = Math.min(currentLine + 1, lines.length);
          }
        }
      }

      // Ask if user wants to save
      const { save } = await inquirer.prompt([{
        type: 'confirm',
        name: 'save',
        message: 'Save changes?',
        default: true
      }]);

      if (save) {
        await fs.promises.writeFile(absolute, lines.join('\n'));
        console.log(chalk.green('✓ File saved'));
      } else {
        console.log(chalk.yellow('Changes discarded'));
      }

    } catch (error: any) {
      this.printPanel('Edit Error', error.message.split('\n'), chalk.red);
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
    await this.showWelcomeAnimation();
    
    this.printPanel('AI Gateway CLI - Interactive Mode', [
      this.getThemedText(`Model: ${this.config.model}`, 'gray'),
      this.getThemedText(`Temperature: ${this.config.temperature}`, 'gray'),
      this.getThemedText(`Theme: ${this.config.theme || 'default'}`, 'gray'),
      this.getThemedText(`Directory: ${this.currentDirectory}`, 'gray'),
    ], chalk.green);

    this.printPanel('Commands', [
      this.getThemedText('/clear       Clear conversation history', 'gray'),
      this.getThemedText('/stats       Show conversation statistics', 'gray'),
      this.getThemedText('/file        Chat with file content', 'gray'),
      this.getThemedText('/read        Preview a file with line numbers', 'gray'),
      this.getThemedText('/edit        Interactive file editor', 'gray'),
      this.getThemedText('/write       Overwrite a file with new content', 'gray'),
      this.getThemedText('/append      Append text to a file', 'gray'),
      this.getThemedText('/delete      Delete a file or directory', 'gray'),
      this.getThemedText('/shell       Run a shell command', 'gray'),
      this.getThemedText('/interactive Run interactive shell command', 'gray'),
      this.getThemedText('/ls          List directory contents', 'gray'),
      this.getThemedText('/cd          Change directory', 'gray'),
      this.getThemedText('/pwd         Show current directory', 'gray'),
      this.getThemedText('/find        Search for files', 'gray'),
      this.getThemedText('/history     Show command history', 'gray'),
      this.getThemedText('/model       Change model', 'gray'),
      this.getThemedText('/temp        Change temperature', 'gray'),
      this.getThemedText('/theme       Change UI theme', 'gray'),
      this.getThemedText('/config      Show configuration', 'gray'),
      this.getThemedText('/exit        Exit (or Ctrl+C)', 'gray'),
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

      // Handle commands
      if (input.startsWith('/')) {
        const [command, ...args] = this.parseArgs(input.slice(1));

        if (!command) {
          console.log(chalk.red('Please provide a command after "/".'));
          rl.prompt();
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
            console.log(chalk.gray('✓ Conversation history cleared\n'));
            break;

          case 'stats':
            this.showStats();
            break;

          case 'file':
            if (args.length === 0) {
              console.log(chalk.red('Usage: /file <path> <message>'));
              console.log(chalk.gray('Example: /file ./code.ts Review this code'));
            } else {
              const file = args[0];
              const message = args.slice(1).join(' ') || 'Analyze this file';

              console.log(chalk.cyan('\nAssistant> '));
              try {
                await this.chatWithFile(message, file);
              } catch (error) {
                // Error already logged
              }
              console.log();
            }
            break;

          case 'read': {
            const target = args[0];
            if (!target) {
              console.log(chalk.red('Usage: /read <file> [start_line] [end_line]'));
              console.log(chalk.gray('Example: /read file.js 10 20'));
            } else {
              const startLine = args[1] ? parseInt(args[1]) : 1;
              const endLine = args[2] ? parseInt(args[2]) : undefined;
              await this.displayFileContent(target, startLine, endLine);
            }
            break;
          }

          case 'edit': {
            const target = args[0];
            if (!target) {
              console.log(chalk.red('Usage: /edit <file>'));
            } else {
              await this.editFile(target);
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
              await this.executeShellCommand(command, false);
            }
            break;
          }

          case 'interactive': {
            const command = args.join(' ').trim();
            if (!command) {
              console.log(chalk.red('Usage: /interactive <command>'));
              console.log(chalk.gray('Example: /interactive vim file.txt'));
            } else {
              await this.executeShellCommand(command, true);
            }
            break;
          }

          case 'ls': {
            const dir = args[0] || '.';
            await this.listDirectory(dir);
            break;
          }

          case 'cd': {
            const newDir = args[0];
            if (!newDir) {
              console.log(chalk.yellow(`Current directory: ${this.currentDirectory}`));
            } else {
              try {
                const absolute = path.resolve(this.currentDirectory, newDir);
                const stats = await fs.promises.stat(absolute);
                if (stats.isDirectory()) {
                  this.currentDirectory = absolute;
                  console.log(chalk.green(`✓ Changed to: ${this.currentDirectory}`));
                } else {
                  console.log(chalk.red('Error: Not a directory'));
                }
              } catch (error: any) {
                console.log(chalk.red(`Error: ${error.message}`));
              }
            }
            break;
          }

          case 'pwd': {
            console.log(chalk.cyan(`Current directory: ${this.currentDirectory}`));
            break;
          }

          case 'find': {
            const pattern = args[0];
            if (!pattern) {
              console.log(chalk.red('Usage: /find <pattern>'));
              console.log(chalk.gray('Example: /find "*.js"'));
            } else {
              await this.findFiles(pattern);
            }
            break;
          }

          case 'delete': {
            const target = args[0];
            if (!target) {
              console.log(chalk.red('Usage: /delete <file_or_directory>'));
            } else {
              await this.deleteFileOrDirectory(target);
            }
            break;
          }

          case 'history': {
            this.showCommandHistory();
            break;
          }

          case 'theme': {
            const newTheme = args[0];
            if (!newTheme) {
              console.log(chalk.yellow(`Current theme: ${this.config.theme || 'default'}`));
              console.log(chalk.gray('Available themes: default, dark, light, rainbow'));
            } else {
              if (['default', 'dark', 'light', 'rainbow'].includes(newTheme)) {
                this.config.theme = newTheme as any;
                console.log(chalk.green(`✓ Theme changed to: ${newTheme}`));
              } else {
                console.log(chalk.red('Invalid theme. Available: default, dark, light, rainbow'));
              }
            }
            break;
          }

          case 'config': {
            this.showConfiguration();
            break;
          }

          case 'model':
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
            this.printPanel('Commands', [
              this.getThemedText('/clear       Clear conversation history', 'gray'),
              this.getThemedText('/stats       Show conversation statistics', 'gray'),
              this.getThemedText('/file        Chat with file content', 'gray'),
              this.getThemedText('/read        Preview a file with line numbers', 'gray'),
              this.getThemedText('/edit        Interactive file editor', 'gray'),
              this.getThemedText('/write       Overwrite a file with new content', 'gray'),
              this.getThemedText('/append      Append text to a file', 'gray'),
              this.getThemedText('/delete      Delete a file or directory', 'gray'),
              this.getThemedText('/shell       Run a shell command', 'gray'),
              this.getThemedText('/interactive Run interactive shell command', 'gray'),
              this.getThemedText('/ls          List directory contents', 'gray'),
              this.getThemedText('/cd          Change directory', 'gray'),
              this.getThemedText('/pwd         Show current directory', 'gray'),
              this.getThemedText('/find        Search for files', 'gray'),
              this.getThemedText('/history     Show command history', 'gray'),
              this.getThemedText('/model       Change model', 'gray'),
              this.getThemedText('/temp        Change temperature', 'gray'),
              this.getThemedText('/theme       Change UI theme', 'gray'),
              this.getThemedText('/config      Show configuration', 'gray'),
              this.getThemedText('/exit        Exit', 'gray'),
              this.getThemedText('/help        Show this help', 'gray'),
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
  .option('--theme <theme>', 'UI theme (default, dark, light, rainbow)', 'default')
  .option('--no-emojis', 'Disable emojis')
  .option('--no-animations', 'Disable animations')
  .action(async (message: string | undefined, options: any) => {
    const config: Config = {
      apiKey: options.apiKey || process.env.AI_GATEWAY_API_KEY || '',
      baseUrl: options.baseUrl,
      model: options.model,
      temperature: parseFloat(options.temperature),
      systemPrompt: options.system,
      theme: options.theme,
      showEmojis: options.emojis !== false,
      enableAnimations: options.animations !== false,
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

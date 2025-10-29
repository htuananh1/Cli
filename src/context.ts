import * as fs from 'fs-extra';
import * as path from 'path';
import { glob } from 'glob';
import chalk from 'chalk';

export class ContextManager {
  private contextPath: string;
  private sessionsPath: string;

  constructor() {
    this.contextPath = path.join(process.cwd(), '.ai-code-context.json');
    this.sessionsPath = path.join(process.cwd(), '.ai-code-sessions');
  }

  async load(): Promise<string[]> {
    try {
      if (await fs.pathExists(this.contextPath)) {
        return await fs.readJson(this.contextPath);
      }
      return [];
    } catch {
      return [];
    }
  }

  async save(files: string[]): Promise<void> {
    await fs.writeJson(this.contextPath, files, { spaces: 2 });
  }

  async add(pattern: string): Promise<void> {
    const files = await this.load();
    const matches = await glob(pattern);
    
    for (const match of matches) {
      if (!files.includes(match)) {
        files.push(match);
      }
    }

    await this.save(files);
    console.log(chalk.green(`✓ Added ${matches.length} file(s) to context`));
  }

  async remove(pattern: string): Promise<void> {
    const files = await this.load();
    const filtered = files.filter(f => !f.includes(pattern));
    await this.save(filtered);
    console.log(chalk.green(`✓ Removed files matching pattern: ${pattern}`));
  }

  async list(): Promise<void> {
    const files = await this.load();
    if (files.length === 0) {
      console.log(chalk.yellow('No files in context'));
      return;
    }

    console.log(chalk.cyan('\nContext Files:'));
    console.log(chalk.gray('─'.repeat(50)));
    files.forEach((file, index) => {
      console.log(`${index + 1}. ${file}`);
    });
    console.log(chalk.gray('─'.repeat(50)));
    console.log(`Total: ${files.length} file(s)\n`);
  }

  async clear(): Promise<void> {
    await this.save([]);
    console.log(chalk.green('✓ Context cleared'));
  }

  async saveSession(name: string): Promise<void> {
    const files = await this.load();
    await fs.ensureDir(this.sessionsPath);
    const sessionPath = path.join(this.sessionsPath, `${name}.json`);
    await fs.writeJson(sessionPath, { files, timestamp: Date.now() }, { spaces: 2 });
    console.log(chalk.green(`✓ Session saved: ${name}`));
  }

  async loadSession(name: string): Promise<void> {
    const sessionPath = path.join(this.sessionsPath, `${name}.json`);
    if (!(await fs.pathExists(sessionPath))) {
      console.log(chalk.red(`Session not found: ${name}`));
      return;
    }

    const session = await fs.readJson(sessionPath);
    await this.save(session.files);
    console.log(chalk.green(`✓ Session loaded: ${name}`));
  }

  async listSessions(): Promise<void> {
    await fs.ensureDir(this.sessionsPath);
    const files = await fs.readdir(this.sessionsPath);
    const sessions = files
      .filter(f => f.endsWith('.json'))
      .map(f => f.replace('.json', ''));

    if (sessions.length === 0) {
      console.log(chalk.yellow('No saved sessions'));
      return;
    }

    console.log(chalk.cyan('\nSaved Sessions:'));
    console.log(chalk.gray('─'.repeat(50)));
    for (const session of sessions) {
      const sessionPath = path.join(this.sessionsPath, `${session}.json`);
      const data = await fs.readJson(sessionPath);
      const date = new Date(data.timestamp).toLocaleString();
      console.log(`${session} (${data.files.length} files) - ${date}`);
    }
    console.log(chalk.gray('─'.repeat(50)));
    console.log();
  }
}

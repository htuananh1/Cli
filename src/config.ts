import * as fs from 'fs-extra';
import * as path from 'path';
import { cosmiconfig } from 'cosmiconfig';
import chalk from 'chalk';

export interface AICodeConfig {
  model?: string;
  apiKey?: string;
  temperature?: number;
  maxTokens?: number;
  defaultFiles?: string[];
  ignorePatterns?: string[];
  autoSave?: boolean;
  previewChanges?: boolean;
  plugins?: string[];
  shortcuts?: Record<string, string>;
  exclude?: string[];
}

const configName = 'aicoderc';
const configSearch = cosmiconfig(configName);

export class ConfigManager {
  private configPath: string;

  constructor() {
    this.configPath = path.join(process.cwd(), `.${configName}.json`);
  }

  async load(): Promise<AICodeConfig | null> {
    try {
      const result = await configSearch.search();
      if (result?.config) {
        return result.config as AICodeConfig;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  async save(config: AICodeConfig): Promise<void> {
    await fs.writeJson(this.configPath, config, { spaces: 2 });
  }

  async init(): Promise<AICodeConfig> {
    const existing = await this.load();
    
    const questions = [
      {
        type: 'input',
        name: 'apiKey',
        message: 'Enter your AI Gateway API Key:',
        default: existing?.apiKey || process.env.AI_GATEWAY_API_KEY || '',
        validate: (val: string) => val.length > 0 || 'API key is required'
      },
      {
        type: 'list',
        name: 'model',
        message: 'Select default AI model:',
        choices: [
          'anthropic/claude-sonnet-4.5',
          'anthropic/claude-haiku-4.5',
          'openai/gpt-5',
          'openai/gpt-5-codex',
          'openai/gpt-4-turbo',
          'openai/gpt-4',
          'deepseek/deepseek-v3.2-exp',
          'google/gemini-2.5-pro',
          'google/gemini-2.5-flash'
        ],
        default: existing?.model || 'deepseek/deepseek-v3.2-exp'
      },
      {
        type: 'input',
        name: 'temperature',
        message: 'Default temperature (0.0-2.0):',
        default: existing?.temperature?.toString() || '0.7',
        validate: (val: string) => {
          const num = parseFloat(val);
          return (!isNaN(num) && num >= 0 && num <= 2) || 'Must be between 0.0 and 2.0';
        }
      },
      {
        type: 'input',
        name: 'maxTokens',
        message: 'Max tokens (leave empty for no limit):',
        default: existing?.maxTokens?.toString() || '4000'
      },
      {
        type: 'confirm',
        name: 'previewChanges',
        message: 'Preview changes before applying?',
        default: existing?.previewChanges !== false
      },
      {
        type: 'confirm',
        name: 'autoSave',
        message: 'Auto-save changes?',
        default: existing?.autoSave !== false
      }
    ];

    const inquirer = require('inquirer');
    const answers = await inquirer.prompt(questions);

    const config: AICodeConfig = {
      ...existing,
      ...answers,
      temperature: parseFloat(answers.temperature),
      maxTokens: answers.maxTokens ? parseInt(answers.maxTokens) : undefined,
      ignorePatterns: existing?.ignorePatterns || ['node_modules', 'dist', '*.min.js', '.git'],
      defaultFiles: existing?.defaultFiles || ['package.json', 'tsconfig.json'],
      exclude: existing?.exclude || []
    };

    await this.save(config);
    console.log(chalk.green(`✓ Configuration saved to ${this.configPath}`));
    return config;
  }

  async update(key: string, value: any): Promise<void> {
    const config = await this.load() || {};
    (config as any)[key] = value;
    await this.save(config);
  }

  async show(): Promise<void> {
    const config = await this.load();
    if (!config) {
      console.log(chalk.yellow('No configuration found. Run `ai-code init` to create one.'));
      return;
    }

    console.log(chalk.cyan('\nCurrent Configuration:'));
    console.log(chalk.gray('─'.repeat(50)));
    
    const maskApiKey = (key: string | undefined) => {
      if (!key) return 'Not set';
      return '***' + key.slice(-4);
    };

    console.log(`Model: ${config.model || 'Not set'}`);
    console.log(`API Key: ${maskApiKey(config.apiKey)}`);
    console.log(`Temperature: ${config.temperature ?? 0.7}`);
    console.log(`Max Tokens: ${config.maxTokens || 'No limit'}`);
    console.log(`Preview Changes: ${config.previewChanges !== false ? 'Yes' : 'No'}`);
    console.log(`Auto Save: ${config.autoSave !== false ? 'Yes' : 'No'}`);
    console.log(`Default Files: ${config.defaultFiles?.join(', ') || 'None'}`);
    console.log(`Ignore Patterns: ${config.ignorePatterns?.join(', ') || 'None'}`);
    console.log(chalk.gray('─'.repeat(50)));
    console.log();
  }
}
